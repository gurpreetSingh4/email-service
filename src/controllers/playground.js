import axios from "axios";
import fs from "fs";
import { logger } from "../utils/logger.js";



// {
        //     "id": "17b2de0a5a7f0",
        //     "threadId": "17b2de0a5a7e9",
        //     "labelIds": ["INBOX"],
        //     "snippet": "This is a test email...",
        //     "payload": {
        //       "headers": [
        //         { "name": "From", "value": "sender@example.com" },
        //         { "name": "To", "value": "recipient@example.com" }
        //       ]
        //     }
        //   }

export async function play(accessToken) {
  // const mailResponse = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
  //             headers: { Authorization: `Bearer ${accessToken}` }
  //         });
  // console.log(JSON.stringify(mail.data, null, 2));

  // const messageId = "195ed993d657d306"; // Replace with an actual ID
  // const emailResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
  //     headers: { Authorization: `Bearer ${accessToken}` }
  // });

  // fs.writeFile(`email_${messageId}.json`, JSON.stringify(emailResponse.data, null, 2),(err) => {
  //     if (err) {
  //         console.error('Error writing to file', err);
  //     } else {
  //         console.log('Data successfully saved to email.json');
  //     }
  // })
  // fs.writeFile(`mail.json`, JSON.stringify(mailResponse.data, null, 2),(err) => {
  //     if (err) {
  //         console.error('Error writing to file', err);
  //     } else {
  //         console.log('Data successfully saved to email.json');
  //     }
  // })

  // const fileContent = `
  // === Mail Data ===
  // ${JSON.stringify(mailResponse.data, null, 2)}

  // === Email Data ===
  // ${JSON.stringify(emailResponse.data, null, 2)}
  // `;

  // // Write to a text file
  // fs.writeFile('gmailData1.json', fileContent, (err) => {
  //     if (err) {
  //         console.error('Error writing to file', err);
  //     } else {
  //         console.log('Data successfully saved to gmailData.txt');
  //     }
  // });

  const userId = "sainigurpreet601@gmail.com"; // or Gmail user's email ID

  // Create an email in RFC 2822 format (MIME)
  const email = `To: recipient@example.com
Subject: Test Draft
Content-Type: text/plain; charset="UTF-8"

This is a test draft email.`;

  // Convert email to Base64 URL-safe encoding
  const encodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // URL-safe Base64 encoding

  const requestBody = {
    message: {
      raw: encodedEmail,
    },
  };



 
  
  

  
}


function jsonResponse(data) {
    fs.writeFile(`res.json`, JSON.stringify(data, null, 2),(err) => {
            if (err) {
                console.error('Error writing to file', err);
            } else {
                console.log('Data successfully saved to res.json');
            }
        })
}













async function importMessage(accessToken, rawEmail) {


    // const rawEmail = Buffer.from(
    //     `From: bookings@globetrek.com\r\n` +
    //     `To: customer@example.com\r\n` +
    //     `Subject: Your Flight Confirmation\r\n` +
    //     `MIME-Version: 1.0\r\n` +
    //     `Content-Type: text/plain; charset="UTF-8"\r\n` +
    //     `Content-Transfer-Encoding: 7bit\r\n\r\n` +
    //     `Dear Customer, your flight is confirmed!`
    //   ).toString("base64");
    try {
        const requestBody = {
            raw: rawEmail,
            labelIds: ["INBOX"],
            neverMarkSpam: true,
        };

        const response = await axios.post(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/import`,
            requestBody,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error importing message:', error.response.data);
        throw new Error('Failed to import message');
    }
}

async function importMessageLarge(accessToken, rawEmail) {
    try {
        const requestBody = {
            raw: rawEmail,
            labelIds: ["INBOX"],
            neverMarkSpam: true,
        };

        const response = await axios.post(
            `https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/import`,
            requestBody,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error importing message:', error.response.data);
        throw new Error('Failed to import message');
    }
}

async function insertMessage(accessToken, rawEmail) {
    try {
        const requestBody = {
            raw: rawEmail,
            labelIds: ["INBOX"], //optional
            neverMarkSpam: true,
        };

        const response = await axios.post(
            `https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/insert`,
            requestBody,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error inserting message:', error.response.data);
        throw new Error('Failed to insert message');
    }
}












