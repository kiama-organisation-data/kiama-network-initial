import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ICountrie extends mongoose.Document {
    name: string
}

const countriesShema = new shema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: false
    },
    currency: {
        "code": {
            type: String,
            required: false
        },
        "symbol": {
            type: String,
            required: false
        },
        "name": {
            type: String,
            required: false
        }
    },
    language: {
        "code": {
            type: String,
            required: false
        },
        "name": {
            type: String,
            required: false
        }
    },
}, { _id: true, timestamps: true })

const Countries = mongoose.model<ICountrie>('Countrie', countriesShema)

export default Countries