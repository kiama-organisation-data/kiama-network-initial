import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface INotification extends mongoose.Document {
    user: string
    read: boolean
    notification: string
    type: string
    link: string
    icon: string
    content: string
}

const notificationsShema = new shema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    content: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
}, { _id: true, timestamps: true })

const Notifications = mongoose.model<INotification>('Notification', notificationsShema)

export default Notifications