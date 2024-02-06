import type { CipherMode } from "crypto";
import type { CipherBlockSize } from "./CipherBlockSize";
import type { CipherTypes } from "./CipherTypes";

export type CipherAlgorithm<
  T extends CipherTypes<CipherBlockSize>,
  M extends CipherMode
> = `${T}-${M}`;
