import { describe, expect, it } from "vitest";

import Cipher, { type CipherAlgorithmTypes, type Encoding } from "../src/index";
import fixture from "./v2.3.0-vectors.json";

/**
 * Golden vectors recorded from @ibnlanre/cipher 2.3.0 (Node crypto via
 * polyfills). 3.x must produce byte-identical ciphertext and read it back.
 */
const sizes: Record<string, number> = { "128": 16, "192": 24, "256": 32 };

function cipherFor(algorithm: CipherAlgorithmTypes, output_decoding: Encoding) {
  const bits = /(128|192|256)/.exec(algorithm)?.[1] ?? "256";
  return new Cipher({
    algorithm,
    encryption_key: fixture.key.slice(0, sizes[bits]),
    initialization_vector: algorithm.endsWith("ecb") ? "" : fixture.iv,
    output_decoding,
  });
}

describe("2.3.0 compatibility", () => {
  for (const vector of fixture.vectors) {
    const label = `${vector.algorithm} ${vector.output_decoding} ${vector.name}`;
    const { decrypt, encrypt } = cipherFor(
      vector.algorithm as CipherAlgorithmTypes,
      vector.output_decoding as Encoding
    );

    it(`encrypts ${label}`, () => {
      expect(encrypt(vector.input)).toEqual(vector.encrypted);
    });

    it(`decrypts ${label}`, () => {
      expect(decrypt(vector.encrypted)).toEqual(vector.decrypted);
    });
  }

  const { decrypt } = cipherFor("aes-256-cbc", "base64");
  for (const { decrypted, input } of fixture.decryptOnly) {
    it(`decrypt passes ${JSON.stringify(input)} through as 2.3.0 did`, () => {
      expect(decrypt(input)).toEqual(decrypted);
    });
  }
});

describe("constructor", () => {
  it("rejects a key of the wrong length", () => {
    expect(() => new Cipher({ encryption_key: "short", initialization_vector: fixture.iv })).toThrow(
      /32 characters/
    );
  });

  it("rejects an IV of the wrong length", () => {
    expect(() => new Cipher({ encryption_key: fixture.key, initialization_vector: "short" })).toThrow(
      /16 characters/
    );
  });

  it("ignores an IV for ECB", () => {
    const { decrypt, encrypt } = new Cipher({
      algorithm: "aes-256-ecb",
      encryption_key: fixture.key,
      initialization_vector: fixture.iv,
    });
    expect(decrypt(encrypt("ok"))).toBe("ok");
  });

  it("generates hex keys of the length each size needs", () => {
    expect(Cipher.generateRandomKey("128")).toMatch(/^[0-9a-f]{16}$/);
    expect(Cipher.generateRandomKey("256")).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe("tampered ciphertext", () => {
  const { decrypt, encrypt } = cipherFor("aes-256-cbc", "base64");

  it("is returned unchanged when its padding is wrong", () => {
    const bytes = Buffer.from(encrypt("password") as string, "base64");
    bytes[bytes.length - 1] ^= 0xff;
    const tampered = bytes.toString("base64");
    expect(decrypt(tampered)).toBe(tampered);
  });
});
