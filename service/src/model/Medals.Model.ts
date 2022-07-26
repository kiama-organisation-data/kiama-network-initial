import mongoose from "mongoose"
import { type } from "os"

const shema: any = mongoose.Schema

export interface IMedal extends mongoose.Document {
    label: string
    image: string
    description: string
    type: string
    value: number
    createdBy: string
}

const medalsShema = new shema({
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { _id: true, timestamps: true })

const Medals = mongoose.model<IMedal>('Medal', medalsShema)

export default Medals