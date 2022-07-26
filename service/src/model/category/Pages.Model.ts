import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ICatPage extends mongoose.Document {
    name: string;
    description: string;
    status: string;
}

const catpagesShema = new shema({
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

const CatPages = mongoose.model<ICatPage>('CatPage', catpagesShema)

export default CatPages