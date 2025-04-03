import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()
    

console.log("JWT_SECRET", process.env.JWT_SECRET)
export const generateToken = async(user)=>{
    const payLoad = {
        userId: user._id,
        email: user.email,
        role: user.role
    }
    const jwtToken = jwt.sign(
        payLoad,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME
        }
    )
    return jwtToken
}