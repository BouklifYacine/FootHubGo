import { describe, expect, test } from "bun:test";
import { ownedAvatarKey } from "./s3";

const base = "https://bucket.fly.storage.tigris.dev/";

describe("ownedAvatarKey", () => {
  test("returns the key of the user's own avatar", () => {
    expect(ownedAvatarKey(`${base}avatars/u1/abc.png`, "u1", base)).toBe("avatars/u1/abc.png");
  });

  test("refuses another user's avatar", () => {
    expect(ownedAvatarKey(`${base}avatars/victim/abc.png`, "u1", base)).toBeNull();
    // Prefix trick: "u1" must be a whole folder name.
    expect(ownedAvatarKey(`${base}avatars/u10/abc.png`, "u1", base)).toBeNull();
  });

  test("refuses other folders, nested paths and traversal", () => {
    expect(ownedAvatarKey(`${base}other/u1/abc.png`, "u1", base)).toBeNull();
    expect(ownedAvatarKey(`${base}avatars/u1/`, "u1", base)).toBeNull();
    expect(ownedAvatarKey(`${base}avatars/u1/x/../../victim/a.png`, "u1", base)).toBeNull();
    expect(ownedAvatarKey(`${base}avatars/u1/%2E%2E%2Fvictim%2Fa.png`, "u1", base)).toBeNull();
  });

  test("refuses other hosts, including look-alikes", () => {
    expect(ownedAvatarKey("https://lh3.googleusercontent.com/avatars/u1/a.png", "u1", base)).toBeNull();
    expect(ownedAvatarKey("https://bucket.fly.storage.tigris.dev.evil.com/avatars/u1/a.png", "u1", base)).toBeNull();
    expect(ownedAvatarKey("http://bucket.fly.storage.tigris.dev/avatars/u1/a.png", "u1", base)).toBeNull();
  });

  test("null for empty or invalid input", () => {
    expect(ownedAvatarKey(null, "u1", base)).toBeNull();
    expect(ownedAvatarKey("not a url", "u1", base)).toBeNull();
    expect(ownedAvatarKey(`${base}avatars/u1/a.png`, "", base)).toBeNull();
  });
});
