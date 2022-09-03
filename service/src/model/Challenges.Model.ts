import mongoose from "mongoose"
import { IChallengePost } from "./Challenges.Post.Model"

const shema: any = mongoose.Schema

export interface IChallenge extends mongoose.Document {
    title: string;
    image: {
        publicId: string,
        url: string,
    };
    video: {
        publicId: string,
        url: string,
    };
    description: string;
    sourceUrl: string;
    category: string;
    tags: Array<string>;
    creator: string;
    views: number;
    comments: Array<object>;
    status: string;
    uniqueKey: string;
    publicKey: string;
    privateKey: string;
    nbShares: number;
    gift: Array<object>;
    challengeWinner: Array<object>;
    usersIdentifiers: Array<string>;
    duration: number;
    startDate: Date;
    endDate: Date;
    challengePosts: Array<IChallengePost>;
    medals: Array<string>;
    withMedals: Boolean;
    typeChallenge: string;
    maxParticipants: number;
    minParticipants: number;
    isPrivate: Boolean;
    isActive: Boolean;
    isDeleted: Boolean;
    isVerified: Boolean;
    isPublished: Boolean;
}

const challengesShema = new shema({
    title: {
        type: String,
        required: true
    },
    image: {
        publicId: String,
        url: String,
    },
    video: {
        publicId: String,
        url: String,
    },
    description: String,
    sourceUrl: {
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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CatChallenge',
        required: true
    },
    status: {
        type: String,
        default: "active",
        enum: ["active", "pending", "closed"]
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usersIdentifiers: {
        type: Array,
        default: []
    },
    tags: {
        type: Array,
        default: []
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
    gift: [
        // gift for the winner 1st place, 2nd place, 3rd place
        {
            label: {
                type: String,
                required: true
            },
            value: {
                type: Number,
                required: true
            },
        },
    ],
    challengeWinner: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    duration: {
        type: Number,
        default: 0
    },
    dateStart: {
        type: Date,
        default: Date.now
    },
    dateEnd: {
        type: Date,
        default: Date.now
    },
    challengePosts: {
        type: Array,
        default: []
    },
    typeChallenge: {
        type: String,
        default: "none",
        enum: ["none", "gift", "prize", "free", "paid"]
    },
    withMedals: {
        type: Boolean,
        default: false
    },
    medals: {
        type: Array,
        default: []
    },
    maxParticipants: {
        type: Number,
        default: 0
    },
    minParticipants: {
        type: Number,
        default: 0
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { _id: true, timestamps: true })

const Challenges = mongoose.model<IChallenge>('Challenge', challengesShema)

export default Challenges