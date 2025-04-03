

async function createDraft(accessToken, draftEmailContent) {
    try {
        const email = `To: recipient@example.com
        Subject: Test Draft
        Content-Type: text/plain; charset="UTF-8"
        
        This is a test draft email.`;

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

      const response = await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/drafts`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating draft:",
        error.response ? error.response.data : error.message
      );
    }
  }
//   {
//     "id": "r5728504970831271250",
//     "message": {
//       "id": "195f13229dd5db68",
//       "threadId": "195f13229dd5db68",
//       "labelIds": [
//         "DRAFT"
//       ]
//     }
//   }

async function createDraftLarge(accessToken, draftEmailContent) {
    try {
        const encodedEmail = Buffer.from(draftEmailContent)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, ""); // URL-safe Base64 encoding

        const requestBody = {
            message: {
                raw: encodedEmail,
            },
        };

        const response = await axios.post(
            `https://gmail.googleapis.com/upload/gmail/v1/users/me/drafts`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data
    } catch (error) {
        console.error("Error creating draft:", error.response ? error.response.data : error.message);
    }
}
// jsonResponse(response.data);
// {
//     "id": "r-12345abcdef",   //daft ID
//     "message": {
//       "id": "12345abcdef",
//       "threadId": "67890ghijk"
//     }
//   }


async function getDrafts(accessToken) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/drafts`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;              
    } catch (error) {
        console.error("Error fetching drafts:", error.response ? error.response.data : error.message);
    }
}
// {
//     "drafts": [
//       { "id": "r-12345abcdef", "message": { "id": "12345abcdef" } },
//       { "id": "r-67890ghijk", "message": { "id": "67890ghijk" } }
//     ]
//   }

async function getDraft(accessToken, draftId) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching draft:", error.response ? error.response.data : error.message);
    }
}
// jsonResponse(response.data);
// {
//     "id": "r-12345abcdef",
//     "message": {
//       "id": "12345abcdef",
//       "threadId": "67890ghijk",
//       "raw": "BASE64_ENCODED_EMAIL"
//     }
//   }

async function deleteDraft(accessToken, draftId) {
    try {
        const response = await axios.delete(
            `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data
    } catch (error) {
        console.error("Error deleting draft:", error.response ? error.response.data : error.message);
    }
}

async function sendExistingDraft(accessToken, draftId) {
    try {
        const response = await axios.post(
            `https://gmail.googleapis.com/gmail/v1/users/me/drafts/send`,
            {id: draftId},
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data
    } catch (error) {
        console.error("Error sending existing draft:", error.response ? error.response.data : error.message);
    }
}
// jsonResponse(response.data);
// {
//     "id": "abcdef123456",
//     "threadId": "67890ghijk"
//   }
  
async function sendExistingDraftLarge(accessToken, draftId) {
    try {
        const response = await axios.post(
            `https://gmail.googleapis.com/upload/gmail/v1/users/me/drafts/send`,
            {id: draftId},
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data
    } catch (error) {
        console.error("Error sending existing draft:", error.response ? error.response.data : error.message);
    }
}
// jsonResponse(response.data);
// {
//     "id": "abcdef123456",
//     "threadId": "67890ghijk"
//   }

async function modifyDraftLabel(accessToken, draftId, requestBody) { //
    try {
        const requestBody = {
            addLabelIds: ["SENT"],
            removeLabelIds: ["DRAFT"],
        };

        const response = await axios.post(
            `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}/modify`,
            requestBody,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data
    } catch (error) {
        console.error("Error modifying draft:", error.response ? error.response.data : error.message);
    }
}

async function updateDraft(accessToken, draftId, newEmailBody) {
    try {
        const rawMessage = Buffer.from(
            `To: recipient@example.com\n` +  // Change recipient
            `Subject: Updated Subject\n\n` +  // Change subject
            newEmailBody // New email content
        ).toString("base64");

        const requestBody = {
            message: {
                raw: rawMessage
            }
        };

        const response = await axios.put(
            `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data
    } catch (error) {
        console.error("Error updating draft:", error.response ? error.response.data : error.message);
    }
}

async function updatedraftLarge(accessToken, draftId, emailContent) {
    try {
        const encodedEmail = Buffer.from(emailContent)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, ""); // URL-safe Base64 encoding

        const requestBody = {
            message: {
                raw: encodedEmail,
            },
        };

        const response = await axios.put(
            `https://gmail.googleapis.com/upload/gmail/v1/users/me/drafts/${draftId}`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        
    } catch (error) {
        console.error("Error updating draft:", error.response ? error.response.data : error.message);
    }
}
// jsonResponse(response.data);
// {
//     "id": "r-12345abcdef",
//     "message": { "id": "12345abcdef" }
//   }
