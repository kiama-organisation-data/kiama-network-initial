import mongoose, { Date } from "mongoose"

const shema: any = mongoose.Schema

export interface ISession extends mongoose.Document {
    user: string;
    isOnline: boolean;
    loggedAt: Date;
    devices: Array<string>;
    ip: string;
}

const sessionsShema = new shema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    isOnline: { type: Boolean, required: true, default: false },
    loggedAt: { type: Date, required: true, default: null },
    devices: [
        {
            deviceInfo: Object,
            locationInfo: Object,
            lastActive: Date,
            lastActiveAt: Date,
            plateform: String,
            browser: String,
            application: String,
        },
    ],
    ip: { type: String, required: false, default: null },
}, { _id: true, timestamps: true })

const Sessions = mongoose.model<ISession>('Session', sessionsShema)

export default Sessions