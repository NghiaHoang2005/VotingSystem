// Minimal Paillier implementation for Frontend (Encryption only)

export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exponent = exponent / 2n;
    base = (base * base) % modulus;
  }
  return result;
}

export function getRandomBigIntInRange(min: bigint, max: bigint): bigint {
  const range = max - min;
  const bits = range.toString(2).length;
  const bytes = Math.ceil(bits / 8);
  const buffer = new Uint8Array(bytes);
  let randomVal: bigint;
  do {
    crypto.getRandomValues(buffer);
    let hex = '0x';
    for (let i = 0; i < buffer.length; i++) {
      hex += buffer[i].toString(16).padStart(2, '0');
    }
    randomVal = BigInt(hex);
    const mask = (1n << BigInt(bits)) - 1n;
    randomVal = randomVal & mask;
  } while (randomVal > range);
  return min + randomVal;
}

export function encrypt(m: bigint, nStr: string): string {
  const n = BigInt(nStr);
  const nSq = n * n;
  const g = n + 1n;
  
  let r = getRandomBigIntInRange(2n, n - 1n);

  let gm = modPow(g, m, nSq);
  let rn = modPow(r, n, nSq);
  
  let c = (gm * rn) % nSq;
  return c.toString();
}
