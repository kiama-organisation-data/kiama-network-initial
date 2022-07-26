import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IOrientation extends mongoose.Document {
    name: string
    description: string
    image: string
    createdBy: string
    category: string
    comments: Array<string>
    likedBy: Array<string>
}

const orientationsShema = new shema({
    name: {
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: Array,
    },
    likedBy: [

        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

}, { _id: true, timestamps: true })

const Orientations = mongoose.model<IOrientation>('Orientation', orientationsShema)

export default Orientations