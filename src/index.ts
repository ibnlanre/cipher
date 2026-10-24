import { aes } from "./aes";
import { type Encoding, fromBytes, toBytes } from "./encoding";
import MODES, { type CipherAlgorithmTypes } from "./modes";

export type { CipherAlgorithmTypes, Encoding };

export type CipherConstructor = {
  encryption_key: string;
  initialization_vector: string;
  /** Encoding of plaintext strings when encrypting. Default `utf-8`. */
  input_encoding?: Encoding;
  /** Encoding of ciphertext strings. Default `base64`. */
  output_decoding?: Encoding;
  algorithm?: CipherAlgorithmTypes;
};

export type CipherBlockSize = "128" | "192" | "256";

const SERIALISED = new Set(["bigint", "boolean", "function", "number", "object", "symbol"]);

/**
 * Whether `JSON.parse` could accept `text`: JSON starts, after whitespace, with
 * one of these. Checking first skips a thrown parse for every plain string.
 */
const JSON_START = /^[\s]*[[{"\-0-9tfn]/;

/** Walk arrays and plain objects, applying `leaf` to every value inside. */
function walk(value: unknown, leaf: (value: unknown) => unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => walk(item, leaf));
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) out[key] = walk(item, leaf);
    return out;
  }
  return leaf(value);
}

/**
 * AES encryption and decryption of strings, numbers, booleans and any nesting
 * of arrays and objects of them. Each leaf value is encrypted on its own, so
 * an object stays an object whose values are ciphertext.
 *
 * Output is identical to 2.x for the same key, IV and input.
 *
 * @example
 * const cipher = new Cipher({
 *   encryption_key: Cipher.generateRandomKey("256"),
 *   initialization_vector: Cipher.generateRandomKey("128"),
 * });
 *
 * const encrypted = cipher.encrypt({ foo: "bar", baz: ["quz"] });
 * const decrypted = cipher.decrypt(encrypted);
 */
class Cipher {
  /**
   * A random key as a hex string: `bits / 8` characters, which is the key
   * length (in characters) that `bits`-bit AES expects; `"128"` gives an IV.
   */
  static generateRandomKey(bits: CipherBlockSize | number = "256", encoding: Encoding = "hex"): string {
    const bytes = new Uint8Array(Number(bits) / 16);
    globalThis.crypto.getRandomValues(bytes);
    return fromBytes(bytes, encoding);
  }

  readonly algorithm: CipherAlgorithmTypes;
  readonly input_encoding: Encoding;
  readonly output_decoding: Encoding;

  /** Encrypt every leaf value. Strings are encrypted as-is; other leaves as JSON. */
  readonly encrypt: <T>(withPlainText: T, encoding?: Encoding) => T;

  /**
   * Decrypt every leaf value. A leaf that is not ciphertext (or not a string)
   * is returned unchanged, so decrypting plaintext is harmless. Decrypted text
   * that is valid JSON is parsed.
   */
  readonly decrypt: <T>(withCipherText: T, decoding?: Encoding) => T;

  constructor({
    algorithm = "aes-256-cbc",
    encryption_key,
    initialization_vector,
    input_encoding = "utf-8",
    output_decoding = "base64",
  }: CipherConstructor) {
    const spec = MODES[algorithm];
    if (!spec) throw new Error(`Unsupported algorithm "${algorithm}"`);

    const key = toBytes(encryption_key, "utf-8");
    if (key.length !== spec.key / 8) {
      throw new Error(
        `Encryption key must be ${spec.key / 8} characters in length for ${algorithm}; ` +
          `the key passed is ${key.length}.`
      );
    }

    // ECB takes no IV; one passed anyway is ignored, as it was in 2.x.
    const iv = spec.iv ? toBytes(initialization_vector, "utf-8") : new Uint8Array(0);
    if (iv.length !== spec.iv) {
      throw new Error(
        `Initialization vector must be ${spec.iv} characters in length for ${algorithm}; ` +
          `the vector passed is ${iv.length}.`
      );
    }

    this.algorithm = algorithm;
    this.input_encoding = input_encoding;
    this.output_decoding = output_decoding;

    const cipher = aes(spec.mode, key, iv);

    this.encrypt = <T>(withPlainText: T, encoding: Encoding = input_encoding): T => {
      let plain: unknown;
      try {
        plain = JSON.parse(JSON.stringify(withPlainText));
      } catch {
        throw new Error("passed data should be serializable");
      }

      return walk(plain, (leaf) => {
        const text = SERIALISED.has(typeof leaf) ? JSON.stringify(leaf) : (leaf as string);
        return fromBytes(cipher.encrypt(toBytes(text, encoding)), output_decoding);
      }) as T;
    };

    this.decrypt = <T>(withCipherText: T, decoding: Encoding = output_decoding): T => {
      let data: unknown;
      try {
        data = JSON.parse(JSON.stringify(withCipherText));
      } catch {
        throw new Error("cipher data should be serializable");
      }

      return walk(data, (leaf) => {
        if (typeof leaf !== "string" || !leaf.trim().length) return leaf;
        try {
          const text = fromBytes(cipher.decrypt(toBytes(leaf, decoding)), "utf-8");
          if (!JSON_START.test(text)) return text;
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        } catch {
          return leaf;
        }
      }) as T;
    };
  }
}

export { Cipher };
export default Cipher;
