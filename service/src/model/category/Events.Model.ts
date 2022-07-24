import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ICatEvent extends mongoose.Document {
    name: string;
    description: string;
    status: string;
}

const cateventsShema = new shema({
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

const CatEvents = mongoose.model<ICatEvent>('CatEvent', cateventsShema)

export default CatEvents