import { describe, expect, test } from "bun:test";
import { loggableError } from "./errors";

describe("loggableError", () => {
  test("keeps only the name and code of Prisma errors (their message holds the query arguments)", () => {
    const error = Object.assign(new Error("Invalid `prisma.user.update()` invocation: { email: 'a@b.c' }"), {
      name: "PrismaClientValidationError",
      code: undefined,
    });
    const logged = loggableError(error);
    expect(logged).toEqual({ name: "PrismaClientValidationError", code: undefined });
    expect(JSON.stringify(logged)).not.toContain("a@b.c");
  });

  test("keeps the message of other errors", () => {
    expect(loggableError(new TypeError("boom"))).toMatchObject({ name: "TypeError", message: "boom" });
  });

  test("non-errors are reduced to their type", () => {
    expect(loggableError("secret")).toEqual({ error: "string" });
  });
});
