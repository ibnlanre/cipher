import { describe, expect, it } from "vitest";
import Cipher from "../src/index";

const { encrypt, decrypt } = new Cipher({
  encryption_key: "uEKBcN7kMKayW6SF8d0BtaJq60Musbp0",
  initialization_vector: "hA7wB3e4v87ihj60",
  algorithm: "aes-256-cbc",
  input_encoding: "utf-8",
  output_decoding: "base64",
});

describe("Other JS Types", () => {
  it("should encrypt and decrypt without failure", () => {
    expect(decrypt(encrypt(true))).toBe(true);
  });
});

const formDataSnapshot = {
  auth_type: "password",
  email: "test@example.com",
  password: "_testPassword",
};
const formData = Object.assign({}, formDataSnapshot);

describe("Random Key Generation", () => {
  it("should return a string", () => {
    expect(typeof Cipher.generateRandomKey("256")).toBe("string");
  });

  it("should be of required length", () => {
    expect(Cipher.generateRandomKey("256").length).toBe(32);
  });
});

const encryptedData = encrypt(formData);
const encryptedDataSnapshot = {
  auth_type: "Z4vS7PUJromKcwyPa3cNfg==",
  email: "k1VvT7q1xiBfP0TT7d62eHQFS1vpvkFyLKmlNJMhHCw=",
  password: "wGbS3e5hbrOfuWn1Lhb+sA==",
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
    const decryptedData = decrypt(encryptedData);
    expect(decryptedData).toMatchObject(formData);
  });

  it("should be a pure function", () => {
    expect(encryptedData).toMatchObject(encryptedDataSnapshot);
  });
});

const nestedData = [
  {
    section_name: "Django",
    section_questions: [
      {
        question: "What product does Rolex make?",
        options: [
          {
            text: "Watches",
            correct: true,
          },
          {
            text: "Food",
            correct: false,
          },
        ],
      },
      {
        question: "What food do you like?",
        options: [
          {
            text: "Ogbono",
            correct: true,
          },
        ],
      },
    ],
  },
];

describe("Nested Data", () => {
  it("should decrypt nested data properly", () => {
    expect(decrypt(encrypt(nestedData))).toMatchObject(nestedData);
  });
});
