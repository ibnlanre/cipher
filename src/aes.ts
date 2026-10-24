import { cfb, ctr, unsafe } from "@noble/ciphers/aes.js";

import type { ModeName } from "./modes";

type Transform = (data: Uint8Array) => Uint8Array;

/**
 * Raw AES on one 16-byte block, for the modes noble lacks. noble's mode
 * instances refuse a second call, so this uses its block primitive with the
 * key expanded once; the block is copied because that primitive works in place.
 */
function blockEncrypter(key: Uint8Array): Transform {
  const expanded = unsafe.expandKeyLE(key);
  return (block) => unsafe.encryptBlock(expanded, Uint8Array.from(block));
}

/** PKCS#7: always pad, a whole extra block when the input is aligned. */
function pad(data: Uint8Array): Uint8Array {
  const fill = 16 - (data.length % 16);
  const out = new Uint8Array(data.length + fill);
  out.set(data);
  out.fill(fill, data.length);
  return out;
}

/** Strip PKCS#7 padding, throwing where Node would ("bad decrypt"). */
function unpad(data: Uint8Array): Uint8Array {
  const fill = data[data.length - 1];
  if (!data.length || fill < 1 || fill > 16) throw new Error("bad decrypt");
  for (let i = data.length - fill; i < data.length; i++) if (data[i] !== fill) throw new Error("bad decrypt");
  return data.subarray(0, data.length - fill);
}

function wholeBlocks(data: Uint8Array): void {
  if (!data.length || data.length % 16) throw new Error("wrong final block length");
}

/**
 * ECB and CBC over noble's block primitive, with the key expanded once per
 * cipher. noble's own `ecb`/`cbc` expand it on every call, which dominated the
 * cost of decrypting a message of thousands of small values.
 */
function blockModes(key: Uint8Array, iv: Uint8Array | null): { decrypt: Transform; encrypt: Transform } {
  const encKey = unsafe.expandKeyLE(key);
  const decKey = unsafe.expandKeyDecLE(key);
  return {
    decrypt: (data) => {
      wholeBlocks(data);
      const out = Uint8Array.from(data);
      for (let offset = out.length - 16; offset >= 0; offset -= 16) {
        const block = out.subarray(offset, offset + 16);
        unsafe.decryptBlock(decKey, block);
        if (!iv) continue;
        const previous = offset ? data.subarray(offset - 16, offset) : iv;
        for (let i = 0; i < 16; i++) block[i] ^= previous[i];
      }
      return unpad(out);
    },
    encrypt: (data) => {
      const out = pad(data);
      let previous = iv;
      for (let offset = 0; offset < out.length; offset += 16) {
        const block = out.subarray(offset, offset + 16);
        if (previous) for (let i = 0; i < 16; i++) block[i] ^= previous[i];
        unsafe.encryptBlock(encKey, block);
        if (iv) previous = block;
      }
      return out;
    },
  };
}

/** OFB: keystream is the IV, encrypted again and again. Same both ways. */
function ofb(key: Uint8Array, iv: Uint8Array): Transform {
  return (data) => {
    const encryptBlock = blockEncrypter(key);
    const out = new Uint8Array(data.length);
    let register: Uint8Array = Uint8Array.from(iv);
    for (let offset = 0; offset < data.length; offset += 16) {
      register = encryptBlock(register);
      for (let i = 0; i < 16 && offset + i < data.length; i++) out[offset + i] = data[offset + i] ^ register[i];
    }
    return out;
  };
}

/** CFB-8: one byte per step, the shift register takes the ciphertext byte. */
function cfb8(key: Uint8Array, iv: Uint8Array, decrypting: boolean): Transform {
  return (data) => {
    const encryptBlock = blockEncrypter(key);
    const out = new Uint8Array(data.length);
    const register = Uint8Array.from(iv);
    for (let i = 0; i < data.length; i++) {
      const keystream = encryptBlock(register)[0];
      out[i] = data[i] ^ keystream;
      const cipherByte = decrypting ? data[i] : out[i];
      register.copyWithin(0, 1);
      register[15] = cipherByte;
    }
    return out;
  };
}

/** CFB-1: one bit per step, most significant bit first. */
function cfb1(key: Uint8Array, iv: Uint8Array, decrypting: boolean): Transform {
  return (data) => {
    const encryptBlock = blockEncrypter(key);
    const out = new Uint8Array(data.length);
    const register = Uint8Array.from(iv);
    for (let i = 0; i < data.length; i++) {
      let byte = 0;
      for (let bit = 7; bit >= 0; bit--) {
        const keystreamBit = encryptBlock(register)[0] >> 7;
        const inputBit = (data[i] >> bit) & 1;
        const outputBit = inputBit ^ keystreamBit;
        byte |= outputBit << bit;
        const cipherBit = decrypting ? inputBit : outputBit;
        for (let j = 0; j < 15; j++) register[j] = ((register[j] << 1) | (register[j + 1] >> 7)) & 0xff;
        register[15] = ((register[15] << 1) | cipherBit) & 0xff;
      }
      out[i] = byte;
    }
    return out;
  };
}

/**
 * Encrypt and decrypt for one mode. ECB and CBC use PKCS#7 padding (Node's
 * default); the stream modes need none. Decrypting bytes that are not valid
 * ciphertext throws for the padded modes, as Node does.
 */
export function aes(mode: ModeName, key: Uint8Array, iv: Uint8Array): { decrypt: Transform; encrypt: Transform } {
  switch (mode) {
    case "ecb":
      return blockModes(key, null);
    case "cbc":
      return blockModes(key, iv);
    case "cfb":
      return { decrypt: (d) => cfb(key, iv).decrypt(d), encrypt: (d) => cfb(key, iv).encrypt(d) };
    case "ctr":
      return { decrypt: (d) => ctr(key, iv).decrypt(d), encrypt: (d) => ctr(key, iv).encrypt(d) };
    case "ofb":
      return { decrypt: ofb(key, iv), encrypt: ofb(key, iv) };
    case "cfb8":
      return { decrypt: cfb8(key, iv, true), encrypt: cfb8(key, iv, false) };
    case "cfb1":
      return { decrypt: cfb1(key, iv, true), encrypt: cfb1(key, iv, false) };
  }
}
