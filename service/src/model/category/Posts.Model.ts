import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ICatPost extends mongoose.Document {
    name: string;
    description: string;
    status: string;
}

const catpostsShema = new shema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { _id: true, timestamps: true })

const CatPosts = mongoose.model<ICatPost>('CatPost', catpostsShema)

export default CatPosts