import Cipher from "../dist/index.js";
import { it, expect, describe } from "@jest/globals";

const crypto = new Cipher({
  encryption_key: "uEKBcN7kMKayW6SF8d0BtaJq60Musbp0",
  initialization_vector: "hA7wB3e4v87ihj60",
  algorithm: "aes-256-cbc",
  input_encoding: "utf-8",
  output_decoding: "base64",
});

const formDataSnapshot = {
  email: "test@example.com",
  password: "_testPassword",
  auth_type: "password",
};
const formData = Object.assign({}, formDataSnapshot);

const encryptedData = crypto.encrypt(formData);
const encryptedDataSnapshot = {
  email: "k1VvT7q1xiBfP0TT7d62eHQFS1vpvkFyLKmlNJMhHCw=",
  password: "wGbS3e5hbrOfuWn1Lhb+sA==",
  auth_type: "Z4vS7PUJromKcwyPa3cNfg==",
};

describe("Encryption", () => {
  it("should encrypt the data", () => {
    expect(encryptedData).toMatchObject(encryptedDataSnapshot);
  });

  it("should be a pure function", () => {
    expect(formData).toMatchObject(formDataSnapshot);
  });
});

describe("Decryption", () => {
  it("should decrypt the data", () => {
    const decryptedData = crypto.decrypt(encryptedData);
    expect(decryptedData).toMatchObject(formData);
  });

  it("should be a pure function", () => {
    expect(encryptedData).toMatchObject(encryptedDataSnapshot);
  });

});
