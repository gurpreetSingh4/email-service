async function moveMessageToTrash(accessToken, messageId) {
    try {
        const response = await axios.post(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`,
            {},
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error moving message to trash:', error.response.data);
        throw new Error('Failed to move message to trash');
    }
}

async function untrashMessage(accessToken, messageId) {
    try {
        const response = await axios.post(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/untrash`,
            {},
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error untrashing message:', error.response.data);
        throw new Error('Failed to untrash message');
    }
}

async function deleteSingleMessage(accessToken, messageId) {
    try {
        await axios.delete(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return true;
    } catch (error) {
        logger.error('Error deleting message:', error.response.data);
        throw new Error('Failed to delete message');
    }
}

async function batchDeleteMessages(accessToken, messageIds) {
    try {
        await axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete', {
            ids: messageIds, //ids: ["17b2de0a5a7f0", "17b2de0a5a8d3"]
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return true;
    } catch (error) {
        logger.error('Error deleting messages:', error.response.data);
        throw new Error('Failed to delete messages');
    }
}

async function getListMessages(accessToken) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error fetching messages:', error.response.data);
        throw new Error('Failed to fetch messages');
    }
}
// {
//     "messages": [
//       { "id": "17b2de0a5a7f0", "threadId": "17b2de0a5a7e9" },
//       { "id": "17b2de0a5a8d3", "threadId": "17b2de0a5a8c1" }
//     ]
//   }

async function getSpecificMessage(accessToken, messageId) {
    try {
        const response = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;

        
          
    } catch (error) {
        logger.error('Error fetching message:', error.response.data);
        throw new Error('Failed to fetch message');
    }
}

async function getListOfUnreadMessages(accessToken) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error fetching unread messages:', error.response.data);
        throw new Error('Failed to fetch unread messages');
    }
}

async function getListOfReadMessages(accessToken) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:read`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error fetching read messages:', error.response.data);
        throw new Error('Failed to fetch read messages');
    }
}

async function getListOfStarredMessages(accessToken) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:starred`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error fetching starred messages:', error.response.data);
        throw new Error('Failed to fetch starred messages');
    }
}

async function getMessageAttachments(accessToken, messageId) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error fetching attachments:', error.response.data);
        throw new Error('Failed to fetch attachments');
    }
}

async function getMessageAttachment(accessToken, messageId, attachmentId) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error fetching attachment:', error.response.data);
        throw new Error('Failed to fetch attachment');
    }
}

async function getMessageThreads(accessToken) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
        // return response.data.threads || []; // Return the array of threads
    } catch (error) {
        logger.error('Error fetching threads:', error.response.data);
        throw new Error('Failed to fetch threads');
    }
}

async function getSpecificMessageThread(accessToken, threadId) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error fetching thread:', error.response.data);
        throw new Error('Failed to fetch thread');
    }
}
async function getThreadMessages(accessToken, threadId) {
    try {
        const response = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}/messages`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error fetching thread messages:', error.response.data);
        throw new Error('Failed to fetch thread messages');
    }
}

async function moveMessageThreadToTrash(accessToken, threadId) {
    try {
        const response = await axios.post(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}/trash`,
            {},
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error moving thread to trash:', error.response.data);
        throw new Error('Failed to move thread to trash');
    }
}