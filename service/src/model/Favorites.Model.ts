import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IFavorite extends mongoose.Document {
    label: string;
    description: string;
    userId: string;
    type: string;
    collections: Array<string>;
}

const favoritesShema = new shema({
    label: String,
    description: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["post", "event", "challenge", "project", "group", "channel", "page", "channelPost"],
        required: true
    },
    collections: {
        type: Array,
        required: false
    }
}, { _id: true, timestamps: true })

const Favorites = mongoose.model<IFavorite>('Favorite', favoritesShema)

export default Favorites