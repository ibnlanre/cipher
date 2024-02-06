import { Buffer } from "buffer";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import type {
  CipherAlgorithmTypes,
  CipherBlockSize,
  CipherConstructor,
} from "@/types";

import MODES from "./modes";

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
  algorithm: CipherAlgorithmTypes = "aes-256-cbc";
  output_decoding: BufferEncoding = "base64";
  input_encoding: BufferEncoding = "utf-8";
  encryption_key: string = "";
  initialization_vector: string = "";

  static generateRandomKey(
    bits: CipherBlockSize | number = "256",
    encoding: BufferEncoding = "hex"
  ) {
    const generatedBytes = randomBytes(Number(bits) / 16);
    return generatedBytes.toString(encoding);
  }

  private checkKeyLength(
    algorithm: CipherAlgorithmTypes = this.algorithm,
    encryption_key: string
  ) {
    return Buffer.from(encryption_key).length === MODES[algorithm].key / 8;
  }

  private checkInitializationVectorLength(
    algorithm: CipherAlgorithmTypes = this.algorithm,
    initialization_vector: string
  ) {
    return initialization_vector.length === MODES[algorithm].iv;
  }

  private traverse<T>(
    data: T,
    encoding: BufferEncoding,
    actor: <T>(data: T, encoding: BufferEncoding) => T
  ): T {
    if (Array.isArray(data)) {
      const result: T[] = [];
      for (const value of data) {
        result.push(this.traverse(value, encoding, actor));
      }
      return result as T;
    } else if (typeof data === "object" && data) {
      const result = {} as T;
      for (const key in data as T) {
        const value = data[key];
        result[key] = this.traverse(value, encoding, actor);
      }
    }

    return actor(data, encoding) as T;
  }

  private encryptData<T>(encryptedText: T, encoding: BufferEncoding): T {
    const cipher = createCipheriv(
      this.algorithm,
      this.encryption_key,
      this.initialization_vector
    );

    const throwable = ["object", "boolean", "symbol", "number", "function"];

    const stringifiedText = throwable.includes(typeof encryptedText)
      ? JSON.stringify(encryptedText)
      : (encryptedText as unknown as string);

    return Buffer.concat([
      cipher.update(Buffer.from(stringifiedText, encoding)),
      cipher.final(),
    ]).toString(encoding) as T;
  }

  public encrypt<T>(
    withPlainText: T,
    encoding: BufferEncoding = this.input_encoding
  ): T {
    let encryptedText = "";

    try {
      encryptedText = JSON.parse(JSON.stringify(withPlainText));
    } catch (e) {
      throw new Error("passed data should be serializable");
    }

    return this.traverse(encryptedText, encoding, this.encryptData) as T;
  }

  private decryptData<T>(
    withCipherText: T,
    decoding: BufferEncoding = this.output_decoding
  ): T {
    if (typeof withCipherText === "string" && !withCipherText.trim().length) {
      return withCipherText;
    }

    try {
      const cipher = createDecipheriv(
        this.algorithm,
        this.encryption_key,
        this.initialization_vector
      );

      const decryptedData = Buffer.concat([
        cipher.update(Buffer.from(withCipherText as string, decoding)),
        cipher.final(),
      ]).toString();

      try {
        return JSON.parse(decryptedData) as T;
      } catch {
        return decryptedData as T;
      }
    } catch {
      return withCipherText;
    }
  }

  public decrypt = <T>(
    withCipherText: T,
    decoding: BufferEncoding = this.output_decoding
  ) => {
    let decryptedText = "";

    try {
      decryptedText = JSON.parse(JSON.stringify(withCipherText));
    } catch (e) {
      throw new Error("cipher data should be serializable");
    }

    return this.traverse(decryptedText, decoding, this.decryptData) as T;
  };

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

      this.encryption_key = encryption_key;
      this.initialization_vector = initialization_vector;
      this.algorithm = algorithm;
      this.input_encoding = input_encoding;
      this.output_decoding = output_decoding;
    } catch (error: any) {
      console.log(error.message);
    }
  }
}

export default Cipher;
