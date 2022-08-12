import mongoose from "mongoose"
import Users from "./users/UsersAuth.Model"

const shema: any = mongoose.Schema

export interface IRole extends mongoose.Document {
    name: string;
    ability: Array<any>;
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
    }
})

const rolesShema = new shema({
    name: {
        type: String,
        required: true,
    },
    ability: [abilityShema],
}, { _id: true, timestamps: true })

// if ability is not defined, it will be set to default value
rolesShema.pre('save', function (this: any, next: any) {
    // if name is admin, it will be set to default value
    if (this.name === 'admin') {
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
        if (this.name === 'superadmin') {
            this.ability = [{
                action: 'manage',
                subject: 'all'
            }]
        } else {
            // if ability is not defined, it will be set to default value
            if (!this.ability) {
                this.ability = [
                    {
                        action: 'read',
                        subject: 'ACL'
                    },
                ]
            }
        }
    }
    next()
})


const Roles = mongoose.model<IRole>('Role', rolesShema)

export default Roles