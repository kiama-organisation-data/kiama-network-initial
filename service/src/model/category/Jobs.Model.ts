import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ICatJob extends mongoose.Document {
    name: string;
    description: string;
    status: string;
}

const catjobsShema = new shema({
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

const CatJobs = mongoose.model<ICatJob>('CatJob', catjobsShema)

export default CatJobs