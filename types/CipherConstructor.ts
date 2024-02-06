import { CipherAlgorithmTypes } from "./CipherAlgorithmTypes";

export type CipherConstructor = {
  encryption_key: string;
  initialization_vector: string;
  input_encoding?: BufferEncoding;
  output_decoding?: BufferEncoding;
  algorithm?: CipherAlgorithmTypes;
};
