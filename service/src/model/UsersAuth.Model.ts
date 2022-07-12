import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { array } from "@hapi/joi";

const shema: any = mongoose.Schema;

export interface IUser extends mongoose.Document {
  name: string;
  username: string;
  avatar: string;
  email: string;
  password: string;
  role: string;
  personalAbility: Array<any>;
  status: string;
  groups: Array<any>;
  pages: Array<any>;
  encryptPassword(password: string): Promise<string>;
  validatePassword(password: string): Promise<boolean>;
}

const usersShema = new shema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: "avatar.jpg",
      required: false,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      min: [6, "Password must be at least 6 characters"],
    },
    role: {
      //ObjectId is a reference to a document in the roles collection
      type: shema.Types.ObjectId,
      ref: "Role",
    },
    personalAbility: {
      type: Array,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    groups: {
      type: Array,
    },
    pages: {
      type: Array,
    },
  },
  { _id: true, timestamps: true }
);

usersShema.methods.encryptPassword = async (
  password: string
): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
usersShema.methods.validatePassword = async function (
  password: string
): Promise<Boolean> {
  return await bcrypt.compare(password, this.password);
};

const Users = mongoose.model<IUser>("User", usersShema);

export default Users;
