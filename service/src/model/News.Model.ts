import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface INew extends mongoose.Document {
    title: string
    content: string
    image: string
    category: string
    dateNews: Date
    publisher: string
    comments: Array<any>
    likes: Array<any>
    approvedBy: Array<any>
    disapprovedBy: Array<any>
    isVerified: boolean
    hours: number
    location: string
}

const newsShema = new shema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    dateNews: {
        type: Date,
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CatNew"
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    approvedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    disapprovedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isVerified: {
        type: Boolean,
        default: false
    },
    hours: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        default: " "
    }
}, { _id: true, timestamps: true })

const News = mongoose.model<INew>('New', newsShema)

export default News