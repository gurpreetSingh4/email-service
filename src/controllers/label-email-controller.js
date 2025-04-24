import axios from "axios";
import { logger } from "../utils/logger.js";
// Assuming you have a logger utility

export async function getAllLabels(accessToken) {
  try {
    const response = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/labels",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.labels; // Return the array of labels
  } catch (error) {
    logger.error("Error fetching labels:", error.response.data);
    throw new Error("Failed to fetch labels");
  }
}

export async function getEmailLabelStatsFn(accessToken) {
  
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  try {
    const response = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/labels",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const labels = response.data.labels;
    const stats = await Promise.all(
      labels.map(async (label, index) => {
        const labelRes = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/labels/${label.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = labelRes.data;
        return {
          labelId: data.id,
          name: data.name,
          total: data.messagesTotal,
          unread: data.messagesUnread,
          color: COLORS[index % COLORS.length],
        };
      })
    );
    return {
      labels: labels.map((label) => ({
        id: label.id,
        name: label.name,
        type: label.type,
      })),
      stats,
    };
  } catch (error) {
    logger.error("Error fetching labels:", error.response.data);
    throw new Error("Failed to fetch labels");
  }
}

export async function createLabel(accessToken, labelName) {
    try {
      const response = await axios.post(
        "https://gmail.googleapis.com/gmail/v1/users/me/labels",
        {
          name: labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error("Error creating label:", error.response.data);
      throw new Error("Failed to create label");
    }
  }
// {
//     "id": "Label_12345",
//     "name": "MyLabel",
//     "labelListVisibility": "labelShow",
//     "messageListVisibility": "show",
//     "type": "user"
//   }

export async function deleteLabel(accessToken, labelId) {
  try {
    await axios.delete(
      `https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    logger.error("Error deleting label:", error.response.data);
    throw new Error("Failed to delete label");
  }
}

async function getSpecificLabel(accessToken, labelId) {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching label:", error.response.data);
    throw new Error("Failed to fetch label");
  }
}
// {
//     "id": "Label_123456",
//     "name": "Urgent",
//     "messageListVisibility": "show",
//     "labelListVisibility": "labelShow",
//     "type": "user"
//   }

export async function updateLabel(accessToken, labelId, newLabelName) {
  try {
    const response = await axios.put(
      `https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`,
      {
        name: newLabelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error updating label:", error.response.data);
    throw new Error("Failed to update label");
  }
}

export async function batchModifyMessagesLabel(
  accessToken,
  messageIds,
  addLabelIds=[],
  removeLabelIds=[],
) {
  try {
    await axios.post(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify",
      {
        ids: messageIds,
        addLabelIds: addLabelIds,
        removeLabelIds: removeLabelIds,
        // ids: ["17b2de0a5a7f0", "17b2de0a5a8d3"],
        // addLabelIds: ["Label_123456"],
        // removeLabelIds: ["INBOX"]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    logger.error("Error modifying messages:", error.response.data);
    throw new Error("Failed to modify messages");
  }
}

async function applyLabelToEmail(accessToken, messageId, labelId) {
  try {
    const requestBody = {
      addLabelIds: [labelId],
    };

    const response = await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      requestBody,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error applying label to email:", error.response.data);
    throw new Error("Failed to apply label to email");
  }
}
