import { describe, expect, test } from "bun:test";
import { pushCategoryOf, toggleMutedCategory, wantsPush } from "./categories";
import { CHAT_PUSH_WINDOW_MS, chatPushDecision } from "./chat-throttle";
import { chatPayload, notificationPayload, PUSH_BODY_MAX, safeAppUrl } from "./payload";
import { deviceLabel, isGoneStatus, MAX_SUBSCRIPTIONS_PER_USER, subscriptionsToEvict } from "./subscriptions";
import { installMode, isIOSDevice, isIOSSafari, pushSupport, type BrowserFacts } from "./support";

describe("push categories", () => {
  test("each pushed notification type has its preference", () => {
    expect(pushCategoryOf("CALL_UP")).toBe("callUps");
    expect(pushCategoryOf("EVENT_REMINDER")).toBe("callUps");
    expect(pushCategoryOf("MAN_OF_THE_MATCH")).toBe("motm");
    expect(pushCategoryOf("CARPOOL")).toBe("carpool");
    expect(pushCategoryOf("MESSAGE")).toBe("messages");
    expect(pushCategoryOf("JOIN_REQUEST")).toBe("club");
    expect(pushCategoryOf("JOINED_TEAM")).toBe("club");
    expect(pushCategoryOf("NEW_POLL")).toBe("club");
  });

  test("in-app only types never push", () => {
    expect(pushCategoryOf("LEFT_TEAM")).toBeNull();
    expect(pushCategoryOf("INJURY_REPORTED")).toBeNull();
    expect(pushCategoryOf("FINANCE_DUE")).toBeNull();
  });

  test("a muted category is not pushed, the others are", () => {
    expect(wantsPush("carpool", [])).toBe(true);
    expect(wantsPush("carpool", ["carpool"])).toBe(false);
    expect(wantsPush("callUps", ["carpool"])).toBe(true);
  });

  test("toggling keeps a clean list (no duplicates, unknown values dropped)", () => {
    expect(toggleMutedCategory([], "messages", false)).toEqual(["messages"]);
    expect(toggleMutedCategory(["messages"], "messages", false)).toEqual(["messages"]);
    expect(toggleMutedCategory(["messages", "old"], "messages", true)).toEqual([]);
  });
});

describe("push payloads", () => {
  test("a notification keeps its title, text and page, tagged per kind and page", () => {
    const payload = notificationPayload({
      type: "CALL_UP",
      title: "Convocation",
      message: "Tu es convoqué : Match, samedi 15h00.",
      url: "/app/events/e1",
    });
    expect(payload).toEqual({
      title: "Convocation",
      body: "Tu es convoqué : Match, samedi 15h00.",
      url: "/app/events/e1",
      tag: "call_up:/app/events/e1",
    });
    expect(Object.keys(payload).sort()).toEqual(["body", "tag", "title", "url"]);
  });

  test("only app paths are opened", () => {
    expect(safeAppUrl("https://evil.example/app")).toBe("/app");
    expect(safeAppUrl("//evil.example")).toBe("/app");
    expect(safeAppUrl("/application")).toBe("/app");
    expect(safeAppUrl(undefined)).toBe("/app");
    expect(safeAppUrl("/app/polls")).toBe("/app/polls");
  });

  test("long texts are cut", () => {
    const payload = notificationPayload({ type: "NEW_POLL", title: "Nouveau sondage", message: "x".repeat(500) });
    expect(payload.body.length).toBe(PUSH_BODY_MAX);
    expect(payload.body.endsWith("…")).toBe(true);
    expect(payload.url).toBe("/app");
  });

  test("chat: sender as title in private, channel name + sender in groups, grouped count", () => {
    const base = { conversationId: "c1", conversationName: "Seniors A", senderName: "Karim", content: "On se retrouve à 14h ?" };
    expect(chatPayload({ ...base, conversationType: "PRIVATE", count: 1 })).toEqual({
      title: "Karim",
      body: "On se retrouve à 14h ?",
      url: "/app/chat?c=c1",
      tag: "chat:c1",
    });
    const grouped = chatPayload({ ...base, conversationType: "TEAM", count: 3 });
    expect(grouped.title).toBe("Seniors A");
    expect(grouped.body).toBe("3 nouveaux messages. Dernier : Karim : On se retrouve à 14h ?");
    expect(grouped.tag).toBe("chat:c1");
  });
});

describe("chat push throttle", () => {
  test("first message pushes, the next ones in the window are counted, then grouped", () => {
    const first = chatPushDecision(undefined, 0);
    expect(first).toMatchObject({ send: true, count: 1 });
    const second = chatPushDecision(first.next, 10_000);
    expect(second.send).toBe(false);
    const third = chatPushDecision(second.next, 20_000);
    expect(third.send).toBe(false);
    const later = chatPushDecision(third.next, CHAT_PUSH_WINDOW_MS + 1);
    expect(later).toMatchObject({ send: true, count: 3 });
    expect(later.next).toEqual({ lastPushAt: CHAT_PUSH_WINDOW_MS + 1, pending: 0 });
  });

  test("a quiet conversation pushes every message", () => {
    const first = chatPushDecision(undefined, 0);
    expect(chatPushDecision(first.next, CHAT_PUSH_WINDOW_MS)).toMatchObject({ send: true, count: 1 });
  });
});

describe("push subscriptions", () => {
  const subs = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ id: `s${i}`, endpoint: `https://push.example/${i}`, lastUsedAt: new Date(2026, 0, i + 1) }));

  test("under the limit nothing is evicted", () => {
    expect(subscriptionsToEvict(subs(MAX_SUBSCRIPTIONS_PER_USER - 1), "https://push.example/new")).toEqual([]);
  });

  test("at the limit the least recently used device goes", () => {
    const existing = subs(MAX_SUBSCRIPTIONS_PER_USER).reverse();
    expect(subscriptionsToEvict(existing, "https://push.example/new")).toEqual(["s0"]);
  });

  test("re-subscribing a known device evicts nothing", () => {
    expect(subscriptionsToEvict(subs(MAX_SUBSCRIPTIONS_PER_USER), "https://push.example/3")).toEqual([]);
  });

  test("device label: browser and OS only", () => {
    expect(deviceLabel("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/141.0 Mobile Safari/537.36")).toBe("Chrome · Android");
    expect(deviceLabel("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1")).toBe("Safari · iOS");
    expect(deviceLabel(null)).toBeNull();
  });

  test("404 and 410 mean the subscription is gone", () => {
    expect(isGoneStatus(410)).toBe(true);
    expect(isGoneStatus(404)).toBe(true);
    expect(isGoneStatus(429)).toBe(false);
  });
});

describe("browser support", () => {
  const facts: BrowserFacts = {
    hasServiceWorker: true,
    hasPushManager: true,
    hasNotification: true,
    isIOS: false,
    standalone: false,
    permission: "default",
    configured: true,
    subscribed: false,
  };

  test("states", () => {
    expect(pushSupport(facts)).toBe("disabled");
    expect(pushSupport({ ...facts, permission: "granted", subscribed: true })).toBe("enabled");
    expect(pushSupport({ ...facts, permission: "denied" })).toBe("denied");
    expect(pushSupport({ ...facts, hasPushManager: false })).toBe("unsupported");
    expect(pushSupport({ ...facts, configured: false })).toBe("unconfigured");
  });

  test("iOS needs the home screen app", () => {
    expect(pushSupport({ ...facts, isIOS: true, hasPushManager: false })).toBe("ios-needs-install");
    expect(pushSupport({ ...facts, isIOS: true, standalone: true })).toBe("disabled");
  });

  test("iOS detection, iPadOS included", () => {
    const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";
    const ipad = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15";
    expect(isIOSDevice(iphone, 5)).toBe(true);
    expect(isIOSDevice(ipad, 5)).toBe(true);
    expect(isIOSDevice(ipad, 0)).toBe(false);
    expect(isIOSSafari(iphone.replace("Version/18.0", "CriOS/141.0"), 5)).toBe(false);
  });

  test("install modes", () => {
    expect(installMode({ standalone: true, canPrompt: true, isIOS: false })).toBe("installed");
    expect(installMode({ standalone: false, canPrompt: true, isIOS: false })).toBe("prompt");
    expect(installMode({ standalone: false, canPrompt: false, isIOS: true })).toBe("ios");
    expect(installMode({ standalone: false, canPrompt: false, isIOS: false })).toBe("manual");
  });
});
