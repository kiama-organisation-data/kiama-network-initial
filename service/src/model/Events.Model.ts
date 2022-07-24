import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IEvent extends mongoose.Document {
    name: string
    description: string
    dateStart: Date
    dateEnd: Date
    hoursStart: string
    hoursEnd: string
    price: number
    images: string
    location: string
    type: Array<string>
    postedBy: string
    status: string
    comments: Array<string>
    likes: Array<string>
    attendedBy: Array<string>
    followers: Array<string>
    videos: Array<string>
    target: boolean
    isPrivate: boolean
    typeEvent: string
}

const eventsShema = new shema({
    name: {
        type: String,
        required: true
    },
    dateStart: {
        type: Date,
        required: true
    },
    dateEnd: {
        type: Date,
        required: true
    },
    hourStart: {
        type: String,
        required: true
    },
    hourEnd: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: [{
        type: String,
        required: true,
        enum: ["Event", "Workshop", "Seminar", "Conference"]
    }],
    status: {
        type: String,
        required: true,
        default: "Pending",
        enum: ["active", "Pending", "Confirmed", "Canceled"]
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    attendedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    images: [{
        type: String,
        required: false,
        default: null
    }],
    videos: [{
        type: String,
        required: false,
        default: null
    }],
    target: {
        type: String,
        required: false,
        enum: ["All", "Students", "Professionals", "Companies"]
    },
    isPrivate: {
        type: Boolean,
        required: false,
        default: false
    },
    typeEvent: {
        type: String,
        required: false,
        enum: ["free", "paid"]
    },
    price: {
        type: Number,
        required: false,
        default: null
    },
}, { _id: true, timestamps: true })

const Events = mongoose.model<IEvent>('Event', eventsShema)

export default Events