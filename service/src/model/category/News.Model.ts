import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ICatNew extends mongoose.Document {
    name: string;
    description: string;
    status: string;
}

const catnewsShema = new shema({
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

const CatNews = mongoose.model<ICatNew>('CatNew', catnewsShema)

export default CatNews