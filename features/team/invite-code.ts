/**
 * Invite codes (pure, tested). 12 characters from an alphabet without look-alikes
 * (no 0/O, 1/I/L): 31^12 ≈ 7.9e17 values (~59 bits), drawn from the Web Crypto RNG
 * (no Node import: the format helpers are also used by the browser).
 * Shown as XXXX-XXXX-XXXX; typed with or without dashes, spaces or lower case.
 */
export const INVITE_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const INVITE_CODE_LENGTH = 12;

/** Largest multiple of the alphabet size below 256: bytes above it are dropped (no modulo bias). */
const UNBIASED_LIMIT = 256 - (256 % INVITE_CODE_ALPHABET.length);

const cryptoRandom = (size: number) => crypto.getRandomValues(new Uint8Array(size));

export function generateInviteCode(random: (size: number) => Uint8Array = cryptoRandom): string {
  let code = "";
  while (code.length < INVITE_CODE_LENGTH) {
    for (const byte of random(INVITE_CODE_LENGTH * 2)) {
      if (byte >= UNBIASED_LIMIT) continue;
      code += INVITE_CODE_ALPHABET[byte % INVITE_CODE_ALPHABET.length];
      if (code.length === INVITE_CODE_LENGTH) break;
    }
  }
  return code;
}

/** What the user typed -> stored form ("abcd-efgh ijkm" -> "ABCDEFGHIJKM"). */
export function normalizeInviteCode(input: string) {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

export function isInviteCodeFormat(code: string) {
  return code.length === INVITE_CODE_LENGTH && [...code].every((char) => INVITE_CODE_ALPHABET.includes(char));
}

/** "ABCDEFGHJKMN" -> "ABCD-EFGH-JKMN" (display only). */
export function formatInviteCode(code: string) {
  return code.match(/.{1,4}/g)?.join("-") ?? code;
}
