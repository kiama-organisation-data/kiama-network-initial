import { compareSync, hashSync } from "bcrypt";
import { sign, verify } from "jsonwebtoken";

/**
 * @constant hashedParam
 * @constant hashParamJwt
 * stringToHash is the admin's username secret key is admin's id
 */

class ApiCryptoUtils {
  constructor() {}

  hashParam = async (stringToHash: string) => {
    const hashedParam = hashSync(stringToHash.trim().toLowerCase(), 12);
    return hashedParam;
  };

  hashParamJwt = async (stringToHash: string, secretKey: string) => {
    const hashedParam = sign(
      { email: stringToHash.trim().toLowerCase() },
      secretKey.toString(),
      {}
    );
    return hashedParam;
  };

  compareHashedParam = async (param: string, hashedParam: string) => {
    const isCorrect = compareSync(param.trim().toLowerCase(), hashedParam);
    return isCorrect;
  };

  decryptHashedParamJwt = async (hashedString: string, secret: string) => {
    const decryptedHash = verify(hashedString, secret.toString());
    return decryptedHash;
  };
}

export const apiCrypto = new ApiCryptoUtils();
