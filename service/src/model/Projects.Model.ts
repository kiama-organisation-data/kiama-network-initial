import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface IProject extends mongoose.Document {
    creator: string;
    title: string;
    description: string;
    tags: string[];
    members: string[];
    link: string;
    image: string;
    status: string;
    tasks: string[];
    isPublic: boolean;
    isVerified: boolean;
    comments: string[];
    likes: string[];
}

const projectsShema = new shema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collaborator",
        },
    ],
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    ],
    isPublic: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Like",
        },
    ],
    tags: [
        {
            type: Array,
        },
    ],
}, { _id: true, timestamps: true })

const Projects = mongoose.model<IProject>('Project', projectsShema)

export default Projects