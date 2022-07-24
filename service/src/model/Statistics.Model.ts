import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IStatistic extends mongoose.Document {

}

const statisticsShema = new shema({

}, { _id: true, timestamps: true })

const Statistics = mongoose.model<IStatistic>('Statistic', statisticsShema)

export default Statistics