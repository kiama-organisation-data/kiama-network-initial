import mongoose from "mongoose"

const shema: any = mongoose.Schema

export interface ICollaborator extends mongoose.Document {
    collaborator: string;
    project: string;
    role: string;
    task: Array<string>;
}

const collaboratorsShema = new shema({
    collaborator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    role: {
        type: String,
        required: true
    },
    task: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }]
}, { _id: true, timestamps: true })

const Collaborators = mongoose.model<ICollaborator>('Collaborator', collaboratorsShema)

export default Collaborators