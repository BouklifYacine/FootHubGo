// lib/argon2.ts
import { hash, verify, type Options } from "@node-rs/argon2";

const opts: Options = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

// Hashage générique
export async function hashElement(element: string) {
  return await hash(element, opts);
}

// ✅ Fonction pour better-auth - signature corrigée
export async function HashPassword( password: string ) {
  return await hash(password, opts);
}

// Vérification générique
export async function VerifierElement(code: string, hash: string) {
  return await verify(hash, code, opts);
}

// ✅ Fonction pour better-auth - signature corrigée
export async function verifyPassword(data: { password: string; hash: string }) {
  return await verify(data.hash, data.password, opts);
}
