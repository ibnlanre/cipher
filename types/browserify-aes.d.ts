import Buffer from "safe-buffer";
import Transfrom from "cipher-base"

declare module "browserify-aes/browser" {
  class Cipher {
    update(data: Buffer): Buffer;
    update(
      data: string,
      input_encoding: "utf8" | "ascii" | "binary" | "latin1"
    ): Buffer;
    update(
      data: Buffer,
      input_encoding: any,
      output_encoding: "binary" | "latin1" | "base64" | "hex"
    ): string;
    update(
      data: string,
      input_encoding: "utf8" | "ascii" | "binary" | "latin1",
      output_encoding: "binary" | "latin1" | "base64" | "hex"
    ): string;
    final(): Buffer;
    final(output_encoding: string): string;
    setAutoPadding(auto_padding: boolean): void;
  }

  export function createCipher(
    algorithm: string,
    password: string | Buffer
  ): InstanceType<Cipher>;

  export function createCipheriv(
    algorithm: string,
    key: string | Buffer,
    iv: string | Buffer
  ): InstanceType<Cipher>;

  class Decipher extends Transform {
    update(data: Buffer): Buffer;
    update(
      data: string,
      input_encoding: "binary" | "latin1" | "base64" | "hex"
    ): Buffer;
    update(
      data: Buffer,
      input_encoding: any,
      output_encoding: "utf8" | "ascii" | "binary" | "latin1"
    ): string;
    update(
      data: string,
      input_encoding: "binary" | "latin1" | "base64" | "hex",
      output_encoding: "utf8" | "ascii" | "binary" | "latin1"
    ): string;
    final(): Buffer;
    final(output_encoding: string): string;
    setAutoPadding(auto_padding: boolean): void;
  }

  export function createDecipher(
    algorithm: string,
    password: string | Buffer
  ): Decipher;

  export function createDecipheriv(
    algorithm: string,
    key: string | Buffer,
    iv: string | Buffer
  ): Decipher;

  export const listCiphers = Array<string>;
}
