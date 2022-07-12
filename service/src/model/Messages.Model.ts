import mongoose, { Schema, model } from "mongoose";

export interface IPrmsg extends mongoose.Document {
  message: object;
  reply: object;
  users: Array<any>;
  sender: Schema.Types.ObjectId;
  messageFormat: string;
  reaction: string;
  seen: Boolean;
  forwarded: Boolean;
}

export interface IGrmsg extends mongoose.Document {
  message: object;
  reply: object;
  sender: Schema.Types.ObjectId;
  messageFormat: string;
  reaction: string;
  seen: Boolean;
  forwarded: Boolean;
  groupId: Schema.Types.ObjectId;
}

export interface IGroup extends mongoose.Document {
  name: string;
  description: string;
  members: Array<any>;
  admin: object;
  image: object;
  isImage: Boolean;
  size: number;
  removeMember(params: string): Promise<any>;
}

/**
 * @param privateMsgSchema is on a test and might differ in the future
 * @param groupMsgSchema is on a test and might differ in the future
 * @method reaction will be an object in the future storing both type of reaction and user id
 */

const privateMsgSchema = new Schema(
  {
    message: {
      text: {
        type: String,
        min: 1,
      },
      audio: {
        publicId: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      image: {
        publicId: {
          type: String || null,
        },
        url: {
          type: String || null,
        },
      },
    },
    reply: {
      text: {
        type: String,
        min: 1,
      },
      // from: Schema.Types.ObjectId,
      from: String,
    },
    users: {
      type: Array,
      required: true,
    },
    sender: {
      // type: Schema.Types.ObjectId,
      type: String,
      ref: "User",
    },
    messageFormat: {
      type: String,
      required: true,
    },
    reaction: {
      type: String,
      default: "none", //it has three possible outcomes ["laughing", "angry", "love"]
    },
    seen: {
      type: Boolean,
      default: false,
    },
    forwarded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const groupMsgSchema = new Schema(
  {
    message: {
      text: {
        type: String,
        min: 1,
      },
      audio: {
        publicId: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      image: {
        publicId: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    },
    reply: {
      text: {
        type: String,
        min: 1,
      },
      audio: {
        publicId: {
          type: String || null,
        },
        url: {
          type: String || null,
        },
      },
      image: {
        publicId: {
          type: String || null,
        },
        url: {
          type: String || null,
        },
      },
      messageFormat: String,
      from: Schema.Types.ObjectId,
      // from: String,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    messageFormat: {
      type: String,
      required: true,
    },
    reaction: {
      type: String,
      default: "none", //it has three possible outcomes ["laughing", "angry", "love"]
    },
    seen: {
      type: Boolean,
      default: false,
    },
    forwared: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "group",
    },
  },
  { timestamps: true }
);

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: [2, "please provide a name for the group"],
    },
    description: {
      type: String,
      required: true,
      min: [5, "description of groups can't be less than 5 words"],
    },
    image: {
      publicId: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    members: {
      type: Array,
      min: 1,
      ref: "User",
    },
    admin: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
    isImage: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

groupSchema.methods.removeMember = async function (
  params: string
): Promise<any> {
  for (let i = 0; i < this.members.length; i++) {
    if (this.members[i] === params) {
      this.members[i] = null;
      this.size = this.size - 1;
      await this.save();
    }
  }
  return true;
};

export const privateMsgModel = model<IPrmsg>("privateMsg", privateMsgSchema);
export const groupMsgModel = model<IGrmsg>("groupMsg", groupMsgSchema);
export const groupModel = model<IGroup>("group", groupSchema);
