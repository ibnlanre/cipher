// @ts-ignore
import { randomBytes } from "crypto";
import { createCipheriv, createDecipheriv } from "browserify-aes/browser.js";
import { Buffer } from "buffer/";

import MODES from "./modes";

type CipherMode =
  | "cbc" // Cyber Block Chaining (CBC) Mode
  | "cfb" // Cyber Feedback (CFB) Mode
  | "ctr" // Counter (CTR) Mode
  | "ecb" // Electronic Codebook (ECB) Mode
  | "gcm" //  Galois/Counter (GCM) Mode
  | "ofb"; // Output Feedback (OFB) Mode

type CipherBlockSize = "128" | "192" | "256";
type CipherTypes<B extends CipherBlockSize> = `aes-${B}`;

type CipherAlgorithm<
  T extends CipherTypes<CipherBlockSize>,
  M extends CipherMode
> = `${T}-${M}`;

type CipherConstructor = {
  encryption_key: string;
  initialization_vector: string;
  input_encoding?: BufferEncoding;
  output_decoding?: BufferEncoding;
  algorithm?: CipherAlgorithm<CipherTypes<CipherBlockSize>, CipherMode>;
};

type CipherText =
  | string
  | number
  | boolean
  | Array<CipherText>
  | { [key: string]: CipherText };

/**
 * @example
 * const encryption_key = Cipher.generateRandomKey("256");
 * const initialization_vector = Cipher.generateRandomKey("128");
 *
 * const cipher = new Cipher({
 *   initialization_vector,
 *   algorithm: "aes-256-cbc",
 *   output_decoding: "base64",
 *   input_encoding: "utf-8",
 *   encryption_key,
 * });
 *
 * const formData = { foo: "bar", baz: ["quz"] }
 * const encryptedData = cipher.encrypt(formData);
 * const decryptedData = cipher.decrypt(encryptedData)
 */
class Cipher {
  public encrypt!: (
    withPlainText: CipherText,
    encoding?: BufferEncoding
  ) => CipherText;

  public decrypt!: (
    withCipherText: CipherText,
    decoding?: BufferEncoding
  ) => CipherText;

  static generateRandomKey(
    bits: CipherBlockSize | number = "256",
    encoding: BufferEncoding = "hex"
  ) {
    const generatedBytes = randomBytes(Number(bits) / 16);
    return generatedBytes.toString(encoding);
  }

  private checkKeyLength(
    algorithm: CipherConstructor["algorithm"],
    encryption_key: string
  ) {
    return (
      Buffer.from(encryption_key).length ===
      MODES[algorithm ?? "aes-256-cbc"].key / 8
    );
  }

  private checkInitializationVectorLength(
    algorithm: CipherConstructor["algorithm"],
    initialization_vector: string
  ) {
    return (
      initialization_vector.length === MODES[algorithm ?? "aes-256-cbc"].iv
    );
  }

  constructor({
    encryption_key,
    initialization_vector,
    input_encoding = "utf-8",
    output_decoding = "base64",
    algorithm = "aes-256-cbc",
  }: CipherConstructor) {
    try {
      if (!this.checkKeyLength(algorithm, encryption_key)) {
        throw new Error(
          `Encryption key must be ${
            MODES[algorithm].key / 8
          } characters in length for ${algorithm} type.` +
            `\n` +
            `Whereas, the encryption key passed is ${encryption_key.length} characters in length`
        );
      }

      if (
        !this.checkInitializationVectorLength(algorithm, initialization_vector)
      ) {
        throw new Error(
          `initialization vector must be ${MODES[algorithm].iv} characters in length for ${algorithm} type` +
            `\n` +
            `Whereas, the initialization vector passed is ${initialization_vector.length} characters in length`
        );
      }

      this.encrypt = function (
        withPlainText: CipherText,
        encoding: BufferEncoding = input_encoding
      ): CipherText {
        let _withPlainText = "";

        try {
          _withPlainText = JSON.parse(JSON.stringify(withPlainText));
        } catch (e) {
          throw new Error("passed data should be serializable");
        }

        function do_encrypt_data(_withPlainText: CipherText): CipherText {
          function do_encrypt(_withPlainText: string) {
            const cipher = createCipheriv(
              algorithm,
              encryption_key,
              initialization_vector
            );
            return Buffer.concat([
              cipher.update(Buffer.from(_withPlainText, encoding)),
              cipher.final(),
            ]).toString(output_decoding);
          }

          if (Array.isArray(_withPlainText))
            return _withPlainText.map((value) => do_encrypt_data(value));
          else if (typeof _withPlainText === "object") {
            for (const key of Object.keys(_withPlainText))
              _withPlainText[key] = do_encrypt_data(_withPlainText[key]);
            return _withPlainText;
          }
          return do_encrypt(JSON.stringify(_withPlainText));
        }

        return do_encrypt_data(_withPlainText);
      };

      this.decrypt = function (
        withCipherText: CipherText,
        decoding: BufferEncoding = output_decoding
      ) {
        let _withCipherText = "";

        try {
          _withCipherText = JSON.parse(JSON.stringify(withCipherText));
        } catch (e) {
          throw new Error("cipher data should be serializable");
        }

        function do_decrypt_data(_withCipherText: CipherText): CipherText {
          function do_decrypt(_withCipherText: string) {
            if (
              typeof _withCipherText === "string" &&
              !_withCipherText.trim().length
            )
              return _withCipherText;
            try {
              const cipher = createDecipheriv(
                algorithm,
                encryption_key,
                initialization_vector
              );
              return JSON.parse(
                Buffer.concat([
                  cipher.update(Buffer.from(_withCipherText, decoding)),
                  cipher.final(),
                ]).toString()
              );
            } catch (err) {
              return _withCipherText.toString();
            }
          }

          if (Array.isArray(_withCipherText))
            return _withCipherText.map((value) => do_decrypt_data(value));
          else if (typeof _withCipherText === "object") {
            for (const key of Object.keys(_withCipherText))
              _withCipherText[key] = do_decrypt_data(_withCipherText[key]);
            return _withCipherText;
          }
          return do_decrypt(_withCipherText.toString());
        }
        return do_decrypt_data(_withCipherText);
      };
    } catch (error: any) {
      console.log(error.message);
    }
  }
}

export default Cipher