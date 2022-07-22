import mongoose from "mongoose"
import { IVote } from "./Votes.Model"

const shema: any = mongoose.Schema

export interface IChallengePost extends mongoose.Document {
    challengeId: string;
    title: string;
    description: string;
    sourceUrl: string;
    category: string;
    tags: Array<string>;
    image: string;
    video: string;
    postBy: string;
    views: number;
    comments: Array<object>;
    status: string;
    uniqueKey: string;
    publicKey: string;
    privateKey: string;
    nbShares: number;
    votes: Array<IVote>;
    pageIsLiked: boolean;
    rank: number;
}

const challengepostsShema = new shema({
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    sourceUrl: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    comments: {
        type: Array,
        default: []
    },
    postBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: String,
        required: true
    },
    uniqueKey: {
        type: String,
        required: true,
        unique: true
    },
    publicKey: {
        type: String,
        unique: true
    },
    nbShares: {
        type: Number,
        default: 0
    },
    votes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vote'
        }
    ],
    status: {
        type: String,
        default: "active",
        enum: ["active", "pending", "closed"]
    },
    pageIsLiked: {
        type: Boolean,
        default: false
    },
    rank: {
        type: Number,
        default: 0
    }
}, { _id: true, timestamps: true })

const ChallengePosts = mongoose.model<IChallengePost>('ChallengePost', challengepostsShema)

export default ChallengePosts