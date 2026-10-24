/**
 * Byte <-> string conversions matching Node's `Buffer.from(string, encoding)`
 * and `buffer.toString(encoding)`, so 3.x produces byte-identical output to
 * 2.x without bundling Node's `Buffer` polyfill.
 */
export type Encoding =
  | "ascii"
  | "base64"
  | "base64url"
  | "binary"
  | "hex"
  | "latin1"
  | "ucs-2"
  | "ucs2"
  | "utf-8"
  | "utf16le"
  | "utf-16le"
  | "utf8";

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Node decodes base64 and base64url leniently with either alphabet. */
const DECODE = new Map<string, number>();
[...BASE64].forEach((char, index) => DECODE.set(char, index));
DECODE.set("-", 62);
DECODE.set("_", 63);

function normalise(encoding: string): Encoding {
  const lower = encoding.toLowerCase() as Encoding;
  switch (lower) {
    case "ascii":
    case "base64":
    case "base64url":
    case "hex":
    case "latin1":
    case "binary":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
    case "utf8":
    case "utf-8":
      return lower;
    default:
      throw new Error(`Unsupported encoding "${encoding}"`);
  }
}

/** Lenient like Node: skips characters outside the alphabet, stops at "=". */
function decodeBase64(text: string): Uint8Array {
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of text) {
    if (char === "=") break;
    const value = DECODE.get(char);
    if (value === undefined) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

function encodeBase64(bytes: Uint8Array, alphabet: string, pad: boolean): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += alphabet[a >> 2];
    out += alphabet[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? (pad ? "=" : "") : alphabet[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? (pad ? "=" : "") : alphabet[c & 63];
  }
  return out;
}

/** Lenient like Node: stops at the first character pair that is not hex. */
function decodeHex(text: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i + 1 < text.length; i += 2) {
    const byte = Number.parseInt(text.slice(i, i + 2), 16);
    if (Number.isNaN(byte) || !/^[0-9a-fA-F]{2}$/.test(text.slice(i, i + 2))) break;
    out.push(byte);
  }
  return Uint8Array.from(out);
}

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder("utf-8");

export function toBytes(text: string, encoding: string): Uint8Array {
  switch (normalise(encoding)) {
    case "utf8":
    case "utf-8":
      return utf8Encoder.encode(text);
    case "base64":
    case "base64url":
      return decodeBase64(text);
    case "hex":
      return decodeHex(text);
    case "latin1":
    case "binary":
      return Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff);
    case "ascii":
      return Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff);
    default: {
      const out = new Uint8Array(text.length * 2);
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        out[i * 2] = code & 0xff;
        out[i * 2 + 1] = code >> 8;
      }
      return out;
    }
  }
}

export function fromBytes(bytes: Uint8Array, encoding: string): string {
  switch (normalise(encoding)) {
    case "utf8":
    case "utf-8":
      return utf8Decoder.decode(bytes);
    case "base64":
      return encodeBase64(bytes, BASE64, true);
    case "base64url":
      return encodeBase64(bytes, BASE64URL, false);
    case "hex":
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    case "latin1":
    case "binary":
      return String.fromCharCode(...bytes);
    case "ascii":
      return String.fromCharCode(...Array.from(bytes, (byte) => byte & 0x7f));
    default: {
      let out = "";
      for (let i = 0; i + 1 < bytes.length; i += 2) out += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
      return out;
    }
  }
}
