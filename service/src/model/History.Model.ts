import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IHistory extends mongoose.Document {
    userId: string
    actions: string
    type: string
}

const historysShema = new shema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    actions: {
        type: Array,
        required: true
    },
    type: {
        type: String,
        enum: ["friend", "group"],
        required: true
    }
}, { _id: true, timestamps: true })

const Historys = mongoose.model<IHistory>('History', historysShema)

export default Historys