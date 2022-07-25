import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ISetting extends mongoose.Document {
    name: string
}

const settingsShema = new shema({
    name: {
        type: String,
        required: true
    }
}, { _id: true, timestamps: true })

const Settings = mongoose.model<ISetting>('Setting', settingsShema)

export default Settings