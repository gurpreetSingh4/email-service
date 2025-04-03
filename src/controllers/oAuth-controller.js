import axios from "axios"
import { logger } from "../utils/logger.js";
import { User } from "../models/User.js";
import { OAuthTokens } from "../models/OAuthTokens.js";
import { redisClient } from "../config/redis-client.js";
import crypto from "crypto"
import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})


const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(token, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    decryptToken(Buffer.concat([iv, encrypted]).toString('hex'))
    return Buffer.concat([iv, encrypted]).toString('hex');
}

function decryptToken(encryptedToken) {
    const encryptedBuffer = Buffer.from(encryptedToken, 'hex');
    const iv = encryptedBuffer.subarray(0, 16);
    const encryptedData = encryptedBuffer.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf-8'); 
}

export function getGoogleOAuthUrl(){
    const options= {
        redirect_uri:process.env.GOOGLE_REDIRECT_URL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        response_type: 'code',
        scope: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.insert',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.labels',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/gmail.metadata',
            'https://www.googleapis.com/auth/gmail.settings.basic',
            'https://mail.google.com/',
        ].join(' '),
        access_type: 'offline',  // Required to get refresh token
        prompt: 'consent'
    }
    const queryString = new URLSearchParams(options).toString();
    return `${process.env.OAUTH_ROOT_URL}?${queryString}`;
}

async function getTokens(code){
    try{
        const tokenResponse = await axios.post(process.env.TOKEN_ENDPOINT, null, {
            params: {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URL ,
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const { access_token, expires_in, refresh_token, scope, token_type, id_token } = tokenResponse.data;
        return { access_token, expires_at: Date.now() + expires_in * 1000, refresh_token, scope, token_type, id_token };
    }catch(error){
        logger.error('Error exchanging code for tokens:', error.response.data);
        res.status(500).json({
             message: 'Failed to exchange code for oauth tokens',
             success: false
        });
    }
}

async function getUserInfo(accessToken){
    try{
        // *****************************************
        // play(accessToken)
        // *****************************************
        const { data } = await axios.get(process.env.USER_INFO_ENDPOINT, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return data;
    }catch(error){
        logger.error('Error fetching user info:', error.response.data);
        res.status(500).json({
            message: 'Error fetching user info',
            success: false
        });
    }
}

export async function refreshAccessToken(refreshToken){
    const isRefreshTokenValid = await OAuthTokens.findOne({ refresh_token: refreshToken })
    if(!isRefreshTokenValid){
        logger.warn("Invalid refresh token")
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
        })
    }
    const decryptedRefreshToken = decryptToken(refreshToken)
    try{
        const { data } = await axios.post(process.env.TOKEN_ENDPOINT, new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: decryptedRefreshToken,
            grant_type: 'refresh_token'
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, expires_in } = data;
        const userId = isRefreshTokenValid.user
        await redisClient.set(`oAuthAccessToken:${userId}`, access_token, 'EX', expires_in * 1000 - Date.now());
        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully"
        })
    }catch(error){
        logger.error('Error during Oauth refresh token:', error.response.data);
        res.status(500).json({
            message: 'Error during Oauth refresh token',
            success: false
        });
    }
}

export const finalizeOAuth = async (req, res) => {
    logger.info("Finalize OAuth end point hit...")
    try{
        const { code } = req.query;
        if(!code){
            logger.warn("Authorization code not provided")
            return res.status(400).json({
                success: false,
                message: "Authorization code not provided"
            })
        }
        const tokens = await getTokens(code)
        if(!tokens){
            logger.warn("Failed to get tokens")
            return res.status(500).json({
                success: false,
                message: "Failed to get tokens"
            })
        }
        console.log(tokens.access_token)
        console.log(req.session)
        return res.json(tokens.access_token)

        // const userInfo = await getUserInfo(tokens.access_token)
        // if(!userInfo){
        //     logger.warn("Failed to get user info")
        //     return res.status(500).json({
        //         success: false,
        //         message: "Failed to get user info"
        //     })
        // }
        // console.log("User info", {userInfo})
        // const {sub, name, email, picture} = userInfo // sub is the unique identifier for the user in Google
        // const isUserExist = await User.findOne({email})
        // if(isUserExist){
        //     logger.info("User already exists")
        //     await redisClient.set(`oAuthAccessToken:${isUserExist._id}`, tokens.access_token, 'EX', tokens.expires_at - Date.now());
        //     return res.status(200).json({
        //         success: true,
        //         message: "User already exists and access token is updated",
        //         user: isUserExist._id
        //     })
        // }
        // const newUser = new User({
        //     name,
        //     email,
        //     password: 'null',  // password is not required for OAuth users  **************** pending *******
        //     oAuthSub: sub,
        //     profilePicture: picture
        // })
        // await newUser.save()
        // logger.info("User registered successfully", newUser._id)

        // const { refresh_token, scope, id_token} = tokens
        // const encryptedRefreshToken = encryptToken(refresh_token)
        // const newTokensData = new OAuthTokens({
        //     user: newUser._id,
        //     id_token,
        //     refresh_token: encryptedRefreshToken,
        //     scope
        // })
        // await newTokensData.save()
        // await redisClient.set(`oAuthAccessToken:${newUser._id}`, tokens.access_token, 'EX', tokens.expires_at - Date.now());
        // logger.info("Tokens saved successfully", newTokensData._id)

        // res.status(200).json({
        //     success: true,
        //     message: "OAuth flow completed successfully",
        //     user: newUser._id
        // })
    }catch(error){
        logger.error("Error finalizing OAuth", error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

