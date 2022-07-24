import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IBug extends mongoose.Document {
    title: string
    description: string
    status: string
    pageError: string
    priority: string
    image: string
    user: string
    response: string
    reportBy: string
    isViewed: boolean
    isResolved: boolean
    type: string
}

const bugsShema = new shema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    pageError: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true,
        enum: ["low", "medium", "high"]
    },
    image: {
        type: String,
        required: true
    },
    response: {
        type: String,
        default: ""
    },
    reportBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isViewed: {
        type: Boolean,
        default: false
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        required: true,
        default: "open",
        enum: ["open", "close"]
    },
    type: {
        type: String,
        required: true,
        enum: ["bug", "feature", "other"]
    }

}, { _id: true, timestamps: true })

const Bugs = mongoose.model<IBug>('Bug', bugsShema)

export default Bugs