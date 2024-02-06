import type { CipherAlgorithm } from "./CipherAlgorithm";
import type { CipherBlockSize } from "./CipherBlockSize";
import type { CipherMode } from "./CipherMode";
import type { CipherTypes } from "./CipherTypes";

export type CipherAlgorithmTypes = CipherAlgorithm<
  CipherTypes<CipherBlockSize>,
  CipherMode
>;
