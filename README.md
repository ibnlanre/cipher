# @ibnlanre/cipher

[![TypeScript][typescript-badge]][typescript]
[![code style: prettier][prettier-badge]][prettier]
![version][version-badge]

AES encryption and decryption of strings, numbers, booleans, and any nesting of
arrays and objects of them. Each value is encrypted on its own, so an object
stays an object whose values are ciphertext.

Runs in browsers, Web Workers, Node 20+, Deno and Bun with no Node polyfills:
the whole package is about 17 KB (7 KB gzipped), built on
[@noble/ciphers](https://github.com/paulmillr/noble-ciphers).

---

## Install

To use, you'll need to install Node and Yarn or npm

- NPM

  ```bash
  npm i @ibnlanre/cipher
  ```

- YARN

  ```bash
  yarn add @ibnlanre/cipher
  ```

## Import

- ES6 Import

  ```javascript
  import Cipher from "@ibnlanre/cipher";
  ```

- Named import

  ```javascript
  import { Cipher } from "@ibnlanre/cipher";
  ```

- NodeJS Require

  ```javascript
  const Cipher = require("@ibnlanre/cipher");
  // `.default` and `.Cipher` are the same class
  ```

## Usage

- Instantiate

  ```javascript
  const encryption_key = Cipher.generateRandomKey(256);
  const initialization_vector = Cipher.generateRandomKey(128);

  const cipher = new Cipher({
    initialization_vector,
    algorithm: "aes-256-cbc",
    output_decoding: "base64",
    input_encoding: "utf-8",
    encryption_key,
  });
  ```

- Destructure

  ```javascript
  const { encrypt, decrypt } = cipher;
  ```

- Utilize

  ```javascript
  const formData = { example: "fooBar" };
  const encryptedData = encrypt(formData);
  const decryptedData = decrypt(encryptedData);
  ```

## Algorithms

`aes-{128,192,256}-{cbc,ecb,cfb,cfb8,cfb1,ofb,ctr}`, plus `aes128`, `aes192`
and `aes256` (CBC). The key must be 16, 24 or 32 characters (UTF-8 bytes) for
128, 192 and 256 bits; the IV must be 16 characters, and is ignored for ECB.

## Upgrading from 2.x

Ciphertext is byte-for-byte identical to 2.x for the same key, IV and input,
so data encrypted by either version decrypts with the other. The test suite
checks 528 vectors recorded from 2.3.0 across every algorithm.

- **No Node polyfills.** 2.x bundled browser shims for `crypto` and `buffer`
  (about 1.7 MB); 3.x needs only the platform's `TextEncoder` and
  `crypto.getRandomValues`.
- **A wrong key or IV length throws** in the constructor. 2.x only logged it
  and failed later, on the first `encrypt`.
- **GCM is removed.** 2.x could encrypt with it but never decrypt (it kept no
  auth tag), so it was never usable.
- **Encodings** are `utf-8`/`utf8`, `base64`, `base64url`, `hex`, `latin1`/
  `binary`, `ascii` and `ucs2`/`utf16le`.
- A named `Cipher` export sits beside the default one.
- **About 3× faster** than 2.3.0 at decrypting messages of many small values:
  the key is expanded once per cipher, and values that cannot be JSON skip
  `JSON.parse`.

## Changelog

- **3.0.1:** `require("@ibnlanre/cipher")` is the class again, as in 2.x
  (3.0.0 returned `{ Cipher, default }`). ECB and CBC reuse the expanded key,
  and plain strings skip `JSON.parse`: about 3× faster decryption.
- **3.0.0:** Node polyfills replaced by @noble/ciphers; see above.

## Maintainers

- [Ridwan Olanrewaju][ridwan_olanrewaju]
- [Babatunde Adekunle][babatunde_adekunle]

[ridwan_olanrewaju]: https://github.com/~ibnlanre
[babatunde_adekunle]: https://github.com/adeTunes
[prettier]: https://github.com/prettier/prettier
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-f8bc45.svg
[typescript]: http://www.typescriptlang.org/
[typescript-badge]: https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg
[version-badge]: https://img.shields.io/badge/version-3.0.1-orange
