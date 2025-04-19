import mongoose from "mongoose"

const emailRefreshTokenSchema = new mongoose.Schema({
    refreshToken:{
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
},{
    timestamps: true
})

export const RefreshToken = mongoose.model("EmailRefreshToken", emailRefreshTokenSchema)