import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const shema: any = mongoose.Schema;

export interface IUser extends mongoose.Document {
  name: {
    first: string;
    last: string;
  };
  provider: string;
  providerId: string;
  username: string;
  avatar: string;
  email: string;
  password: string;
  role: string;
  isAdmin: boolean;
  personalAbility: Array<any>;
  status: string;
  birthday: Date;
  gender: string;
  groups: Array<any>;
  pages: Array<any>;
  channels: Array<any>;
  shops: Array<any>;
  friends: Array<IUser>;
  friendRequests: Array<IUser>;
  collections: {
    shop: Array<any>;
  };
  cart: object;
  accountType: string;
  encryptPassword(password: string): Promise<string>;
  validatePassword(password: string): Promise<boolean>;
  addToCart(product: object): Promise<string | boolean>;
  removeFromCart(product: object): Promise<string>;
  clearCart: Function;
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
    provider: {
      type: String,
      trim: true,
      lowercase: true,
    },
    providerId: {
      type: String,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9]+$/,
        "Username must contain only letters, numbers and special catactere",
      ],
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
      enum: ["female", "male", "custom", "prefer not to say"], // To check
    },
    groups: {
      type: Array,
    },
    friends: [
      {
        type: shema.Types.ObjectId,
        ref: "User",
      },
    ],
    accountType: {
      type: String,
      enum: ["normal", "business", "organisation"],
      default: "normal",
    },
    collections: {
      shop: [
        {
          type: Schema.Types.ObjectId,
          ref: "Shop",
        },
      ],
    },
    cart: {
      items: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    pages: [{ type: Schema.Types.ObjectId, ref: "Page" }],
    channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
    jobPortals: [{ type: Schema.Types.ObjectId, ref: "Jobportal" }],
    shops: [{ type: Schema.Types.ObjectId, ref: "Shop" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
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

usersShema.methods.addToCart = function (
  product: any
): Promise<string | boolean> {
  const cartProductIndex = this.cart.items.findIndex((cp: any) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

usersShema.methods.removeFromCart = function (productId: any): Promise<string> {
  const updatedCartItems = this.cart.items.filter((item: any) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

usersShema.methods.clearCart = function (): Function {
  this.cart = { items: [] };
  return this.save();
};

const Users = mongoose.model<IUser>("User", usersShema);

export default Users;
