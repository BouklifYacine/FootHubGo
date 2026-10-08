import { describe, expect, test } from "bun:test";
import { IOS_INSTALL_STEP, MAX_TOUR_STEPS, TOURS, buildTour, sideFor, tourKey } from "./tours";

const everything = (anchor: string) => anchor;

describe("onboarding tours", () => {
  test("each tour has at most 6 steps", () => {
    expect(TOURS.coach.length).toBeLessThanOrEqual(MAX_TOUR_STEPS);
    expect(TOURS.player.length).toBeLessThanOrEqual(MAX_TOUR_STEPS);
  });

  test("steps whose element is missing are dropped", () => {
    const steps = buildTour("player", { sectionCount: 1, find: (anchor) => (anchor === "callup-answer" ? null : anchor) });
    expect(steps.map((step) => step.anchor)).not.toContain("callup-answer");
    expect(steps).toHaveLength(5);
  });

  test("the section switcher comes first for members of several sections, still 6 steps max", () => {
    const steps = buildTour("coach", { sectionCount: 2, find: everything });
    expect(steps[0].anchor).toBe("section-switcher");
    expect(steps).toHaveLength(MAX_TOUR_STEPS);
    expect(steps.at(-1)?.anchor).toBe("nav-more");
  });

  test("no section step with one section", () => {
    expect(buildTour("coach", { sectionCount: 1, find: everything })[0].anchor).toBe("home-next-event");
  });

  test("bubbles of the bottom tabs open above them on mobile", () => {
    expect(sideFor("nav-agenda", true)).toBe("top");
    expect(sideFor("nav-agenda", false)).toBeUndefined();
  });

  test("iPhone Safari players: the home screen hint replaces the bell step, new tour key", () => {
    const steps = buildTour("player", { sectionCount: 1, find: everything, iosInstallHint: true });
    expect(steps).toHaveLength(MAX_TOUR_STEPS);
    expect(steps.find((step) => step.anchor === "notification-bell")?.title).toBe(IOS_INSTALL_STEP.title);
    expect(tourKey("player", true)).toBe("player-v2");
    expect(tourKey("player", false)).toBe("player-v1");
    expect(tourKey("coach", true)).toBe("coach-v1");
  });

  test("the hint never makes a tour longer than 6 steps, even with several sections", () => {
    const steps = buildTour("player", { sectionCount: 3, find: everything, iosInstallHint: true });
    expect(steps.length).toBeLessThanOrEqual(MAX_TOUR_STEPS);
    expect(steps.map((step) => step.title)).toContain(IOS_INSTALL_STEP.title);
  });

  test("coaches never get the hint", () => {
    const steps = buildTour("coach", { sectionCount: 1, find: everything, iosInstallHint: true });
    expect(steps.map((step) => step.title)).not.toContain(IOS_INSTALL_STEP.title);
  });
});
