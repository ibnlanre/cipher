import type { CipherBlockSize } from "./CipherBlockSize";

export type CipherTypes<B extends CipherBlockSize> = `aes-${B}`;
