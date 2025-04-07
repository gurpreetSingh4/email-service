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



async function getMessageThreads(accessToken, pageToken = null) {
    try {
        const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/threads`);
        
        // If a pageToken exists, add it as a query parameter
        if (pageToken) {
            url.searchParams.append('pageToken', pageToken);
        }

        const response = await axios.get(url.toString(), {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return {
            threads: response.data.threads || [], // List of threads
            nextPageToken: response.data.nextPageToken || null, // Pagination token
        };
    } catch (error) {
        console.error('Error fetching threads:', error.response?.data || error.message);
        throw new Error('Failed to fetch threads');
    }
}

async function fetchAllThreads(accessToken) {
    let pageToken = null;
    let allThreads = [];

    do {
        const { threads, nextPageToken } = await getMessageThreads(accessToken, pageToken);
        allThreads.push(...threads); // Store threads
        pageToken = nextPageToken; // Update for the next request
    } while (pageToken); // Continue fetching if there's a next page

    return allThreads;
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



