import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IFriendReq extends mongoose.Document {
    toUserId: string
    fromUserId: string
    status: string
}

const friendreqsShema = new shema({
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        required: true
    },
}, { _id: true, timestamps: true })

const FriendReqs = mongoose.model<IFriendReq>('FriendReq', friendreqsShema)

export default FriendReqs