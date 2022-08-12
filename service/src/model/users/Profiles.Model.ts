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
    "widowed",
    "none"
}
// enum typeUser {
//     "user", "company", "organization", "institution", "school", "university", "government", "ngo", "church", "other"
// }
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
    followersType: string;
    followingType: string;
    // typeUser: typeUser;
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

const profilesShema = new shema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        about: String,
        bio: String,
        // typeUser: {
        //     type: String,
        //     enum: typeUser,
        //     default: typeUser.user
        // },
        relationship_status: {
            type: String,
            enum: relationship,
            default: relationship.none
        },
        religion: { type: String, enum: religions },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        followersType: {
            type: String,
            enum: ["public", "private"],
            default: "public"
        },
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        followingType: {
            type: String,
            enum: ["public", "private"],
            default: "public"
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        city: {
            type: String,
            required: false,

        },
        country: {
            to: {
                type: String,
                required: false,

            },
            from: {
                type: String,
                required: false,

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
        },
        organization: {
            type: String,
            required: false,
        },
        job: {
            type: String,
            required: false,
        },
        languages: [
            {
                type: String,
                required: false,
            },
        ],
        interests: [
            {
                type: String,
                required: false,

            },
        ],
        music: [
            {
                type: String,
                required: false,

            },
        ],
        books: [
            {
                type: String,
                required: false,

            },
        ],
        movies: [
            {
                type: String,
                required: false,

            },
        ],
        websites: [
            {
                type: String,
                required: false,

            },
        ],
        skills: [
            {
                type: String,
                required: false,

            },
        ],
        experience: [
            {
                title: {
                    type: String,
                    required: false,

                },
                company: {
                    type: String,
                    required: false,

                },
                location: {
                    type: String,
                    required: false,

                },
                from: {
                    type: Date,
                    required: false,

                },
                to: {
                    type: Date,
                    required: false,

                },
                current: {
                    type: Boolean,
                    default: false,
                },
                description: {
                    type: String,
                    required: false,

                },
            },
        ],
        education: [
            {
                school: {
                    type: String,
                    required: false,

                },
                degree: {
                    type: String,
                    required: false,

                },
                fieldofstudy: {
                    type: String,
                    required: false,

                },
                from: {
                    type: Date,
                    required: false,

                },
                to: {
                    type: Date,
                    required: false,

                },
                current: {
                    type: Boolean,
                    default: false,
                },
                description: {
                    type: String,
                    required: false,

                },
            },
        ],
        social: {
            youtube: {
                type: String,
                required: false,

            },
            twitter: {
                type: String,
                required: false,

            },
            facebook: {
                type: String,
                required: false,

            },
            linkedin: {
                type: String,
                required: false,

            },
            instagram: {
                type: String,
                required: false,

            },
        },
    },
    { id: false },
    {
        toJSON: { virtuals: true }
    }, { _id: true, timestamps: true }
)

// profilesShema.virtual("followersCount").get(function (this: { followers: IProfile[] }) {
//     return this.followers.length;
// });

// profilesShema.virtual("followingCount").get(function (this: { following: IProfile[] }) {
//     return this.following.length;
// });


const Profiles = mongoose.model<IProfile>('Profile', profilesShema)

export default Profiles