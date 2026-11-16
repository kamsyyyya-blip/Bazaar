import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const COST = 1 << 17;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 256 * 1024 * 1024;

function derive(password: string, salt: Buffer, cost: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: cost, r: BLOCK_SIZE, p: PARALLELISM, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, COST);
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELISM}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, costText, blockText, parallelText, saltText, hashText, extra] = stored.split("$");
  if (algorithm !== "scrypt" || extra !== undefined || !saltText || !hashText) return false;

  const cost = Number(costText);
  const blockSize = Number(blockText);
  const parallelism = Number(parallelText);
  if (!Number.isInteger(cost) || cost < 1 << 13 || cost > COST || blockSize !== BLOCK_SIZE || parallelism !== PARALLELISM) {
    return false;
  }
  if (!/^[a-f0-9]{32}$/.test(saltText) || !/^[a-f0-9]{128}$/.test(hashText)) return false;

  const expected = Buffer.from(hashText, "hex");
  const actual = await derive(password, Buffer.from(saltText, "hex"), cost);
  return timingSafeEqual(actual, expected);
}
