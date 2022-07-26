import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { array } from "@hapi/joi";

const shema: any = mongoose.Schema;

export interface IUser extends mongoose.Document {
  name: {
    first: string;
    last: string;
  };
  username: string;
  avatar: string;
  email: string;
  password: string;
  role: string;
  personalAbility: Array<any>;
  status: string;
  birthday: Date;
  gender: string;
  groups: Array<any>;
  pages: Array<any>;
  channels: Array<any>;
  encryptPassword(password: string): Promise<string>;
  validatePassword(password: string): Promise<boolean>;
}

const usersShema = new shema(
  {
    name: {
      first: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        lowercase: true,
      },
      last: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[a-zA-Z0-9]+$/, "Username must contain only letters, numbers and special catactere"],
      minlength: [3, "Username is too short"],
      maxlength: [20, "Username is too long"],
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
    isAdmin: { type: Boolean, required: true, default: false },
    personalAbility: {
      type: Array,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "suspended", "deleted", "deactivated"],
    },
    birthday: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['female', 'male', 'custom', 'prefer not to say'] // To check
    },
    groups: {
      type: Array,
    },
    pages: {
      type: Array,
    },
    channels: {
      type: Array,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
  { _id: true, timestamps: true }
);

usersShema.virtual("fullName").get(function (this: IUser) {
  return this.name.first + this.name.last;
});

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
