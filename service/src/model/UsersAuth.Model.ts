import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { array } from "@hapi/joi"


const shema: any = mongoose.Schema

export interface IUser extends mongoose.Document {
    name: string;
    username: string;
    avatar: string;
    email: string;
    password: string;
    role: string;
    ability: string;
    status: string;
    encryptPassword(password: string): Promise<string>;
    validatePassword(password: string): Promise<boolean>;
}
const abilityShema = new shema({
    action: {
        type: Object,
        required: false,
        enum: ['create', 'read', 'update', 'delete', 'manage'],
    },
    subject: {
        type: Object,
        required: false,
        enum: ['ACL', 'all'],
    }
})

const usersShema = new shema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        lowercase: true,
    },
    username: {
        type: String,
        trim: true,
        lowercase: true,
    },
    avatar: {
        type: String,
        default: "avatar.jpg",
        required: false
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
        required: true,
        min: [6, 'Password must be at least 6 characters'],
    },
    role: {
        type: String,
        required: true,
        enum: ['superadmin', 'admin']
    },
    ability: [abilityShema],
    status: {
        type: String,
        default: "active",
        enum: ['active', 'inactive']
    }
}, { _id: true, timestamps: true })

// if ability is not defined, it will be set to default value
usersShema.pre('save', function (this: any, next: any) {
    // if role is admin, it will be set to default value
    if (this.role === 'admin') {
        this.ability = [
            {
                action: 'read',
                subject: 'ACL'
            },
            {
                action: 'read',
                subject: 'all'
            },
            {
                action: 'edit',
                subject: 'all'
            },
            {
                action: 'add',
                subject: 'all'
            },
            {
                action: 'delete',
                subject: 'all'
            },
            {
                action: 'update',
                subject: 'all'
            }
        ]
    } else {
        if (this.role === 'superadmin') {
            this.ability = [{
                action: 'manage',
                subject: 'all'
            }]
        }
    }
    next()
})



usersShema.methods.encryptPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}
usersShema.methods.validatePassword = async function (password: string): Promise<Boolean> {
    return await bcrypt.compare(password, this.password)
}

const Users = mongoose.model<IUser>('User', usersShema)

export default Users