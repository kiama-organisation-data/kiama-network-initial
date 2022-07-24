import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ICatChallenge extends mongoose.Document {
    label: string;
    description: string;
    status: string;
}

const catchallengesShema = new shema({
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "active",
        enum: ["active", "closed"]
    },
}, { _id: true, timestamps: true })

const CatChallenges = mongoose.model<ICatChallenge>('CatChallenge', catchallengesShema)

export default CatChallenges