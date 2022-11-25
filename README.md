# @ibnlanre/cipher

[![TypeScript][typescript-badge]][typescript]
[![code style: prettier][prettier-badge]][prettier]
![version][version-badge]

```markdown
for AES encryption or decryption
```

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

- NodeJS Require

  ```javascript
  const Cipher = require("@ibnlanre/cipher");
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

## Maintainer

- [Ridwan Olanrewaju][homepage]

[homepage]: https://github.com/~ibnlanre
[prettier]: https://github.com/prettier/prettier
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-f8bc45.svg
[typescript]: http://www.typescriptlang.org/
[typescript-badge]: https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg
[version-badge]: https://img.shields.io/badge/version-1.0.4-orange
