import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IStatistic extends mongoose.Document {
    name: string
}

const statisticsShema = new shema({
    name: {
        type: String,
        required: true
    }
}, { _id: true, timestamps: true })

const Statistics = mongoose.model<IStatistic>('Statistic', statisticsShema)

export default Statistics