export type ModeName = "cbc" | "cfb" | "cfb1" | "cfb8" | "ctr" | "ecb" | "ofb";

type Mode = { iv: 0 | 16; key: 128 | 192 | 256; mode: ModeName };

const mode = (key: Mode["key"], name: ModeName): Mode => ({
  iv: name === "ecb" ? 0 : 16,
  key,
  mode: name,
});

/**
 * Supported algorithms, named as Node's `crypto` names them. GCM, listed in
 * 2.x, is not supported: 2.x never handled its authentication tag, so GCM
 * ciphertext could not be decrypted.
 */
const MODES = {
  "aes-128-ecb": mode(128, "ecb"),
  "aes-192-ecb": mode(192, "ecb"),
  "aes-256-ecb": mode(256, "ecb"),
  "aes-128-cbc": mode(128, "cbc"),
  "aes-192-cbc": mode(192, "cbc"),
  "aes-256-cbc": mode(256, "cbc"),
  aes128: mode(128, "cbc"),
  aes192: mode(192, "cbc"),
  aes256: mode(256, "cbc"),
  "aes-128-cfb": mode(128, "cfb"),
  "aes-192-cfb": mode(192, "cfb"),
  "aes-256-cfb": mode(256, "cfb"),
  "aes-128-cfb8": mode(128, "cfb8"),
  "aes-192-cfb8": mode(192, "cfb8"),
  "aes-256-cfb8": mode(256, "cfb8"),
  "aes-128-cfb1": mode(128, "cfb1"),
  "aes-192-cfb1": mode(192, "cfb1"),
  "aes-256-cfb1": mode(256, "cfb1"),
  "aes-128-ofb": mode(128, "ofb"),
  "aes-192-ofb": mode(192, "ofb"),
  "aes-256-ofb": mode(256, "ofb"),
  "aes-128-ctr": mode(128, "ctr"),
  "aes-192-ctr": mode(192, "ctr"),
  "aes-256-ctr": mode(256, "ctr"),
} as const satisfies Record<string, Mode>;

export type CipherAlgorithmTypes = keyof typeof MODES;

export default MODES;
