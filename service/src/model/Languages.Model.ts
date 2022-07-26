import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ILanguage extends mongoose.Document {
    key: string
    value: Object
}

const languagesShema = new shema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: Object,
        required: false
    },
}, { _id: true, timestamps: true })

const Languages = mongoose.model<ILanguage>('Language', languagesShema)

export default Languages

