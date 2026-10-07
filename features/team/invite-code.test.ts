import { describe, expect, test } from "bun:test";
import {
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
  formatInviteCode,
  generateInviteCode,
  isInviteCodeFormat,
  normalizeInviteCode,
} from "./invite-code";

describe("generateInviteCode", () => {
  test("12 characters from the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode();
      expect(code).toHaveLength(INVITE_CODE_LENGTH);
      expect(isInviteCodeFormat(code)).toBe(true);
      expect(code).not.toMatch(/[01ILO]/);
    }
  });

  test("codes are not repeated", () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generateInviteCode()));
    expect(codes.size).toBe(1000);
  });

  test("drops biased bytes instead of folding them with a modulo", () => {
    // 248..255 would favour the first characters: they must be skipped.
    let call = 0;
    const random = (size: number) => {
      call += 1;
      return new Uint8Array(size).fill(call === 1 ? 250 : 0);
    };
    expect(generateInviteCode(random)).toBe(INVITE_CODE_ALPHABET[0].repeat(INVITE_CODE_LENGTH));
    expect(call).toBe(2);
  });
});

describe("normalizeInviteCode / isInviteCodeFormat / formatInviteCode", () => {
  test("accepts what users type", () => {
    expect(normalizeInviteCode(" abcd-efgh jkmn ")).toBe("ABCDEFGHJKMN");
    expect(isInviteCodeFormat(normalizeInviteCode("abcd-efgh-jkmn"))).toBe(true);
  });

  test("rejects old 6-digit codes and look-alike characters", () => {
    expect(isInviteCodeFormat("123456")).toBe(false);
    expect(isInviteCodeFormat("ABCDEFGHJKM0")).toBe(false);
    expect(isInviteCodeFormat("ABCDEFGHJKMNP")).toBe(false);
  });

  test("formats by groups of four", () => {
    expect(formatInviteCode("ABCDEFGHJKMN")).toBe("ABCD-EFGH-JKMN");
  });
});
