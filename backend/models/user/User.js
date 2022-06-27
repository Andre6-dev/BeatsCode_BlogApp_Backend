const mongoose = require('mongoose');

// create schema

const userSchema = new mongoose.Schema({
    firstName: {
        required: [true, "First name is required"],
        type: String,
    },
    lastName: {
        required: [true, "Last name is required"],
        type: String,
    },
    profilePhoto: {
        type: String,
        default: 'https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/1401467111255-TM3V8CHFU2O92OGASHQO/tumblr_n6adpeNPvI1qg8i80o3_1280.jpg',
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    bio: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    postCount: {
        type: Number,
        default: 0,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum:['Admin', 'Guest', 'Blogger']
    },
    isFollowing: {
        type: Boolean,
        default: false,
    },
    isUnFollowing: {
        type: Boolean,
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    accountVerificationToken: String,
    accountVerificationTokenExpires: Date,
    /*It only contains the user ids*/
    viewedBy: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
    },
    followers: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
    },
    following: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
    },

    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpired: Date,

    active: {
        type: Boolean,
        default: false,
    }
}, {
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    timestamps: true,
})

// COMPILE SCHEMA INTO MODEL
const User = mongoose.model('User', userSchema);

/*We need to use our User into our Controller*/
module.exports = User;