import { compare, genSalt, hash } from "bcrypt";
import { Schema, model, Document } from "mongoose";

export interface IWallet extends Document {
  userId: Schema.Types.ObjectId;
  kiamaAmount: number;
  kiamaPoints: number;
  name: string;
  password: string;
  secretKey: string;
  blocked: boolean;
  valid: boolean;
  suspended: boolean;
  serialNumber: number;
  detailsOfTransaction: object;
  addTokmpOrKmc(
    coinOrPoints: string,
    unit: number,
    details: object
  ): Promise<any>;
  deductKmcOrKmp(
    coinOrPoints: string,
    unit: number,
    details: object
  ): Promise<string>;
  validatePassword(password: string): Promise<boolean>;
}

/**
 * @key kiamaAmount is used to store total amount of kiama-coins(kmc) a user has in his/her account
 * @key kiamaPoints are points earned on completion of specific task or are distrubuted to users
 * by a channel or whatsoever.(kmp)
 * KiamaPionts on getting to 500 sum to a single unit of kwc.
 * KiamaPoints can be used for activation many petty things and features
 */

const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kiamaAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    kiamaPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    secretKey: {
      type: String,
      required: true,
      unique: true,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    valid: {
      type: Boolean,
      default: false,
    },
    suspended: {
      type: Boolean,
      default: false,
    },
    serialNumber: {
      type: String,
      required: true,
    },
    detailsOfTransaction: [
      {
        type: Object,
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

walletSchema.methods.validatePassword = async function (
  password: string
): Promise<Boolean> {
  return await compare(password, this.password);
};

walletSchema.methods.addTokmpOrKmc = async function (
  coinOrPoints: string,
  unit: number,
  details: object
): Promise<string> {
  let kmpOrkmc: string = "kmp";
  let error = "";
  let value = "";
  if (coinOrPoints == "coin") {
    kmpOrkmc = "kmc";
  } else if (unit > 10) error = "user's can't be rewarded more than 10 kmp";

  if (this.blocked) error = "this user's wallet has been banned";
  if (this.suspended) error = "this user's wallet has been suspended";

  if (error.length === 0) {
    if (kmpOrkmc === "kmp") this.kiamaPoints += +unit;
    if (kmpOrkmc === "kmc") this.kiamaAmount += +unit;

    this.detailsOfTransaction.push(details);

    await this.save();
    value = "success";
  } else {
    value = error;
  }
  return value;
};

walletSchema.methods.deductKmcOrKmp = async function (
  coinOrPoints: string,
  unit: number,
  details: object
): Promise<string> {
  let kmpOrkmc: string = "kmp";
  let error: string = "";
  let move: Boolean = true;
  let value: string = "success";

  if (coinOrPoints == "coin") {
    if (unit > this.kiamaAmount) {
      error = "you don't have enough kmc";
      move = false;
    }
    kmpOrkmc = "kmc";
  } else {
    if (unit > this.kiamaPoints) {
      error = "you don't have enough kmp";
      move = false;
    }
  }

  if (!move) {
    value = error;
  } else {
    if (kmpOrkmc === "kmc") this.kiamaAmount = this.kiamaAmount - +unit;
    if (kmpOrkmc === "kmp") this.kiamaPoints = this.kiamaPoints - +unit;
  }
  this.detailsOfTransaction.push(details);
  this.save();
  return value;
};

export default model<IWallet>("Wallet", walletSchema);
