import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ISetting extends mongoose.Document {
    
}

const settingsShema = new shema({

}, { _id: true, timestamps: true })

const Settings = mongoose.model<ISetting>('Setting', settingsShema)

export default Settings