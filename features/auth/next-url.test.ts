import { describe, expect, test } from "bun:test";
import { safeNextPath, withNext } from "./next-url";

describe("safeNextPath", () => {
  test("keeps the paths of the site", () => {
    expect(safeNextPath("/join/ABCD2345EFGH")).toBe("/join/ABCD2345EFGH");
    expect(safeNextPath("/app/events?view=calendar")).toBe("/app/events?view=calendar");
  });

  test("refuses other origins and junk", () => {
    expect(safeNextPath("//evil.com")).toBe("/app");
    expect(safeNextPath("/\\evil.com")).toBe("/app");
    expect(safeNextPath("https://evil.com")).toBe("/app");
    expect(safeNextPath("javascript:alert(1)")).toBe("/app");
    expect(safeNextPath("/app\n/x")).toBe("/app");
    expect(safeNextPath(undefined)).toBe("/app");
    expect(safeNextPath(["/a"])).toBe("/app");
  });
});

describe("withNext", () => {
  test("adds the destination only when it is not the default one", () => {
    expect(withNext("/sign-up", "/app")).toBe("/sign-up");
    expect(withNext("/sign-up", "/join/ABCD")).toBe("/sign-up?next=%2Fjoin%2FABCD");
  });
});
