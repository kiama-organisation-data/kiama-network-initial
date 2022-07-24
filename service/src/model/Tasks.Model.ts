import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ITask extends mongoose.Document {
    title: string;
    description: string;
    status: string;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    dueDate: Date;
    assignedTo: string[];
    isCompleted: boolean;
    isDeleted: boolean;
    project: string;
    tags: string[];
    comments: string[];
    likes: string[];
}

const tasksShema = new shema({
    title: {
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    assignedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    isCompleted: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    tags: [
        {
            type: String,
        },
    ],
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
}, { _id: true, timestamps: true })

const Tasks = mongoose.model<ITask>('Task', tasksShema)

export default Tasks