import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IReport extends mongoose.Document {
    reportBy: string;
    title: string;
    content: string;
    description: string;
    type: Array<string>;
    userToReport: string;
    status: string;
    isVerified: boolean;
}

const reportsShema = new shema({
    reportBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: [{
        type: String,
        required: true,
        enum: ["spam", "inappropriate", "fake", "nudity", "violence", "other"],
    }],
    userToReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, { _id: true, timestamps: true })

const Reports = mongoose.model<IReport>('Report', reportsShema)

export default Reports