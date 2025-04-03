async function getGmailProfile(accessToken) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/profile`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data
    } catch (error) {
        console.error("Error fetching profile:", error.response ? error.response.data : error.message);
    }
}

    //     {"emailAddress": "gurpreetyarasingh@gmail.com",
    //     "messagesTotal": 2445,
    //     "threadsTotal": 2374,
    //     "historyId": "590000"}
    //   





async function getHistory(accessToken, userId, startHistoryId) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/${userId}/history`,
            {
                params: { startHistoryId },
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        jsonResponse(response.data);
        // Lists the history of all changes to the given mailbox.
    } catch (error) {
        console.error("Error fetching history:", error.response ? error.response.data : error.message);
    }
}
// {
//     "history": [
//       {
//         "id": "1234567891",
//         "messages": [
//           { "id": "176fcabf2a3c3ab2", "threadId": "176fcabf2a3c3ab2" }
//         ],
//         "messagesAdded": [
//           { "message": { "id": "176fcabf2a3c3ab2", "threadId": "176fcabf2a3c3ab2" } }
//         ]
//       }
//     ],
//     "historyId": "1234567891"
//   }

async function getHistoryList(accessToken, userId) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/${userId}/history`,  // ✅ Corrected endpoint
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data
    } catch (error) {
        console.error("Error fetching history list:", error.response ? error.response.data : error.message);
    }
}

// {
//     "history": [
//       {
//         "id": "1234567891",
//         "messagesAdded": [
//           {
//             "message": { "id": "176fcabf2a3c3ab2", "threadId": "176fcabf2a3c3ab2" }
//           }
//         ],
//         "messagesDeleted": [
//           {
//             "message": { "id": "176fcabf2a3c3ab3", "threadId": "176fcabf2a3c3ab3" }
//           }
//         ],
//         "labelsAdded": [
//           {
//             "message": { "id": "176fcabf2a3c3ab4" },
//             "labelIds": ["IMPORTANT"]
//           }
//         ],
//         "labelsRemoved": [
//           {
//             "message": { "id": "176fcabf2a3c3ab5" },
//             "labelIds": ["SPAM"]
//           }
//         ]
//       }
//     ],
//     "historyId": "1234567891"
//   }
  