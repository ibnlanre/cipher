import Cipher from "./index";

// CommonJS entry. 2.x set `module.exports` to the class itself, so both
// `require("@ibnlanre/cipher")` and its `.default` (and `.Cipher`) must be it.
module.exports = Object.assign(Cipher, { Cipher, default: Cipher });
