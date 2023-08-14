declare type CipherMode = "cbc" | "cfb" | "ctr" | "ecb" | "gcm" | "ofb";
declare type CipherBlockSize = "128" | "192" | "256";
declare type CipherTypes<B extends CipherBlockSize> = `aes-${B}`;
declare type CipherAlgorithm<T extends CipherTypes<CipherBlockSize>, M extends CipherMode> = `${T}-${M}`;
declare type CipherConstructor = {
    encryption_key: string;
    initialization_vector: string;
    input_encoding?: BufferEncoding;
    output_decoding?: BufferEncoding;
    algorithm?: CipherAlgorithm<CipherTypes<CipherBlockSize>, CipherMode>;
};
declare type CipherText = string | number | boolean | Array<CipherText> | {
    [key: string]: CipherText;
};
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
declare class Cipher {
    encrypt: (withPlainText: CipherText, encoding?: BufferEncoding) => CipherText;
    decrypt: (withCipherText: CipherText, decoding?: BufferEncoding) => CipherText;
    static generateRandomKey(bits?: CipherBlockSize | number, encoding?: BufferEncoding): string;
    private checkKeyLength;
    private checkInitializationVectorLength;
    constructor({ encryption_key, initialization_vector, input_encoding, output_decoding, algorithm, }: CipherConstructor);
}

export { Cipher as default };
