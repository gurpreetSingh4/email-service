import axios from "axios";
import { logger } from "../utils/logger.js";

export async function getSpecificMessage(accessToken, messageId) {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("Response from getSpecificMessage", response.data);
    return response.data; // Return the first message from the response
  } catch (error) {
    logger.error("Error fetching message:", error.response.data);
    throw new Error("Failed to fetch message");
  }
}

export async function getListMessages(accessToken, input = {}) {
  try {
    const params = {};
    if (input.labelIds && input.labelIds.length) params.labelIds = labelIds;
    if (input.query) params.query = query;
    if (input.maxResults) params.maxResults = maxResults;
    if (input.pageToken) params.pageToken = pageToken;

    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching messages:", error.response.data);
    throw new Error("Failed to fetch messages");
  }
}

export async function getSpecificMessageThread(accessToken, threadId) {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching thread:", error.response.data);
    throw new Error("Failed to fetch thread");
  }
}

export async function getMessageThreads(accessToken, input = {}) {
  try {
    const params = {};
    if (input.labelIds && input.labelIds.length) params.labelIds = labelIds;
    if (input.query) params.query = query;
    if (input.maxResults) params.maxResults = maxResults;
    if (input.pageToken) params.pageToken = pageToken;
    const url = new URL(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads`
    );

    const response = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });

    return response.data 
  } catch (error) {
    console.error(
      "Error fetching threads:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch threads");
  }
}

export async function searchGmailMessages(accessToken, input = {}) {
    try {
      const {
        from,
        to,
        subject,
        hasAttachment,
        isRead,
        after,
        before,
        labelIds,
        query,
        maxResults,
        pageToken,
      } = input;
  
      // Build Gmail search query
      let q = query || '';
  
      if (from) q += ` from:${from}`;
      if (to) q += ` to:${to}`;
      if (subject) q += ` subject:${subject}`;
      if (hasAttachment) q += ` has:attachment`;
      if (isRead === true) q += ` is:read`;
      else if (isRead === false) q += ` is:unread`;
      if (after) q += ` after:${after}`;     // Format: YYYY/MM/DD
      if (before) q += ` before:${before}`;  // Format: YYYY/MM/DD
  
      const params = { q: q.trim() };
  
      if (labelIds && labelIds.length) params.labelIds = labelIds;
      if (maxResults) params.maxResults = maxResults;
      if (pageToken) params.pageToken = pageToken;
  
      const response = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });
  
      return response.data 
    } catch (error) {
      console.error('Error searching Gmail messages:', error.response?.data || error.message);
      throw new Error('Failed to search Gmail messages');
    }
  }

  export async function searchGmailThreads(accessToken, input = {}) {
    try {
      const {
        from,
        to,
        subject,
        hasAttachment,
        isRead,
        after,
        before,
        labelIds,
        query,
        maxResults,
        pageToken,
      } = input;
  
      // Build Gmail query string
      let q = query || '';
  
      if (from) q += ` from:${from}`;
      if (to) q += ` to:${to}`;
      if (subject) q += ` subject:${subject}`;
      if (hasAttachment) q += ` has:attachment`;
      if (isRead === true) q += ` is:read`;
      else if (isRead === false) q += ` is:unread`;
      if (after) q += ` after:${after}`;     // Format: YYYY/MM/DD
      if (before) q += ` before:${before}`;  // Format: YYYY/MM/DD
  
      const params = { q: q.trim() };
  
      if (labelIds && labelIds.length) params.labelIds = labelIds;
      if (maxResults) params.maxResults = maxResults;
      if (pageToken) params.pageToken = pageToken;
  
      const response = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/threads', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });
  
      return {
        threads: response.data.threads || [],
        nextPageToken: response.data.nextPageToken || null,
        resultSizeEstimate: response.data.resultSizeEstimate || 0,
      };
    } catch (error) {
      console.error('Error searching Gmail threads:', error.response?.data || error.message);
      throw new Error('Failed to search Gmail threads');
    }
  }

export async function moveMessageToTrash(accessToken, messageId) {
  try {
    const response = await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error moving message to trash:", error.response.data);
    throw new Error("Failed to move message to trash");
  }
}

export async function untrashMessage(accessToken, messageId) {
  try {
    const response = await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/untrash`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error untrashing message:", error.response.data);
    throw new Error("Failed to untrash message");
  }
}

export async function deleteSingleMessage(accessToken, messageId) {
  try {
    await axios.delete(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    logger.error("Error deleting message:", error.response.data);
    throw new Error("Failed to delete message");
  }
}

async function batchDeleteMessages(accessToken, messageIds) {
  try {
    await axios.post(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete",
      {
        ids: messageIds, //ids: ["17b2de0a5a7f0", "17b2de0a5a8d3"]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    logger.error("Error deleting messages:", error.response.data);
    throw new Error("Failed to delete messages");
  }
}

// {
//     "messages": [
//       { "id": "17b2de0a5a7f0", "threadId": "17b2de0a5a7e9" },
//       { "id": "17b2de0a5a8d3", "threadId": "17b2de0a5a8c1" }
//     ]
//   }

async function getListOfUnreadMessages(accessToken) {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching unread messages:", error.response.data);
    throw new Error("Failed to fetch unread messages");
  }
}

async function getListOfReadMessages(accessToken) {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:read`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching read messages:", error.response.data);
    throw new Error("Failed to fetch read messages");
  }
}

async function getListOfStarredMessages(accessToken) {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:starred`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching starred messages:", error.response.data);
    throw new Error("Failed to fetch starred messages");
  }
}

async function fetchAllThreads(accessToken) {
  let pageToken = null;
  let allThreads = [];

  do {
    const { threads, nextPageToken } = await getMessageThreads(
      accessToken,
      pageToken
    );
    allThreads.push(...threads); // Store threads
    pageToken = nextPageToken; // Update for the next request
  } while (pageToken); // Continue fetching if there's a next page

  return allThreads;
}

async function moveMessageThreadToTrash(accessToken, threadId) {
  try {
    const response = await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}/trash`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error moving thread to trash:", error.response.data);
    throw new Error("Failed to move thread to trash");
  }
}
