import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IVote extends mongoose.Document {
    voteBy: string;
    voteHours: string;
}

const votesShema = new shema({
    voteBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    voteHours: {
        type: String,
        required: true,
    },
}, { _id: true, timestamps: true })

const Votes = mongoose.model<IVote>('Vote', votesShema)

export default Votes