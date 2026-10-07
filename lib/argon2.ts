import { hash, verify, type Options } from "@node-rs/argon2";

// OWASP recommended argon2id parameters.
const options: Options = { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 };

/** Password hashing used by better-auth (see `auth.ts`) and for one-time codes. */
export function hashPassword(password: string) {
  return hash(password, options);
}

export function verifyPassword({ password, hash: hashed }: { password: string; hash: string }) {
  return verify(hashed, password, options);
}
