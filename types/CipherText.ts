export type CipherText<T> = T extends Record<string, unknown>
  ? {
      [P in keyof T]: CipherText<T[P]>;
    }
  : T extends (infer R)[]
  ? CipherText<R>[]
  : string;
