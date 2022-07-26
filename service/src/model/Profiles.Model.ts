import mongoose from "mongoose"

const shema: any = mongoose.Schema

enum relationship {
    "single",
    "in a relationship",
    "engaged",
    "married",
    "complicated",
    "separated",
    "divorced",
    "widowed"
}
enum typeUser {
    "user", "company", "organization", "institution", "school", "university", "government", "ngo", "church", "other"
}
enum religions {
    "christian",
    "islamic",
    "hindu",
    "buddhism",
    "other"
}

export interface IProfile extends mongoose.Document {
    user: string,
    about: string,
    followers: IProfile[];
    following: IProfile[];
    followingCount: number;
    followersCount: number;
    typeUser: typeUser;
    relationship: relationship;
    religion: religions;
    isVerified: boolean;
    city: string;
    country: {
        to: string,
        from: string
    };
    school: string;
    university: string;
    company: string;
    organization: string;
    job: string;
    languages: string[];
    interests: string[];
    music: string[];
    medals: string[];
    books: string[];
    movies: string[];
    websites: string[];
    skills: string[];
    experience: [
        {
            title: {
                type: String,
            },
            company: {
                type: String,
            },
            location: {
                type: String
            },
            from: {
                type: Date,
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
            },
            description: {
                type: String
            }
        }
    ],
    education: [
        {
            school: {
                type: String,
            },
            degree: {
                type: String,
            },
            fieldofstudy: {
                type: String,
            },
            from: {
                type: Date,
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
            },
            description: {
                type: String
            }
        }
    ],
    social: {
        youtube: String,
        twitter: String,
        facebook: String,
        linkedin: String,
        instagram: String
    },
}

const profilesShema = new shema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    about: String,
    bio: String,
    typeUser: {
        type: String,
        enum: typeUser,
    },
    relationship_status: {
        type: String,
        enum: relationship,
    },
    religion: { type: String, required: true, enum: religions },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    city: {
        type: String,
        required: false,
        default: null
    },
    country: {
        to: {
            type: String,
            required: false,
            default: null
        },
        from: {
            type: String,
            required: false,
            default: null
        }
    },
    medals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medal",
        },
    ],
    company: {
        type: String,
        required: false,
        default: null
    },
    organization: {
        type: String,
        required: false,
        default: null
    },
    job: {
        type: String,
        required: false,
        default: null
    },
    languages: [
        {
            type: String,
            required: false,
            default: null,
        },
    ],
    interests: [
        {
            type: String,
            required: false,
            default: null,
        },
    ],
    music: [
        {
            type: String,
            required: false,
            default: null,
        },
    ],
    books: [
        {
            type: String,
            required: false,
            default: null,
        },
    ],
    movies: [
        {
            type: String,
            required: false,
            default: null,
        },
    ],
    websites: [
        {
            type: String,
            required: false,
            default: null,
        },
    ],
    skills: [
        {
            type: String,
            required: false,
            default: null,
        },
    ],
    experience: [
        {
            title: {
                type: String,
                required: false,
                default: null,
            },
            company: {
                type: String,
                required: false,
                default: null,
            },
            location: {
                type: String,
                required: false,
                default: null,
            },
            from: {
                type: Date,
                required: false,
                default: null,
            },
            to: {
                type: Date,
                required: false,
                default: null,
            },
            current: {
                type: Boolean,
                default: false,
            },
            description: {
                type: String,
                required: false,
                default: null,
            },
        },
    ],
    education: [
        {
            school: {
                type: String,
                required: false,
                default: null,
            },
            degree: {
                type: String,
                required: false,
                default: null,
            },
            fieldofstudy: {
                type: String,
                required: false,
                default: null,
            },
            from: {
                type: Date,
                required: false,
                default: null,
            },
            to: {
                type: Date,
                required: false,
                default: null,
            },
            current: {
                type: Boolean,
                default: false,
            },
            description: {
                type: String,
                required: false,
                default: null,
            },
        },
    ],
    social: {
        youtube: {
            type: String,
            required: false,
            default: null,
        },
        twitter: {
            type: String,
            required: false,
            default: null,
        },
        facebook: {
            type: String,
            required: false,
            default: null,
        },
        linkedin: {
            type: String,
            required: false,
            default: null,
        },
        instagram: {
            type: String,
            required: false,
            default: null,
        },
    },
}, { _id: true, timestamps: true })

profilesShema.virtual("followersCount").get(function (this: { followers: IProfile[] }) {
    return this.followers.length;
});

profilesShema.virtual("followingCount").get(function (this: { following: IProfile[] }) {
    return this.following.length;
});


const Profiles = mongoose.model<IProfile>('Profile', profilesShema)

export default Profiles