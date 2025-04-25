import dotenv from "dotenv";
import { redisClient } from "../../config/redis-client.js";
import {
  createDraft,
  getDrafts,
} from "../../controllers/draft-email-controller.js";
import {
  batchModifyMessagesLabel,
  createLabel,
  deleteLabel,
  getAllLabels,
  getEmailLabelStatsFn,
  updateLabel,
} from "../../controllers/label-email-controller.js";
import {
  deleteSingleMessage,
  getListMessages,
  getMessageThreads,
  getSpecificMessage,
  getSpecificMessageThread,
  moveMessageToTrash,
  searchGmailMessages,
  searchGmailThreads,
  untrashMessage,
} from "../../controllers/message-email-controller.js";
import { userInfo, usersDataInfo } from "../../controllers/user-email-controller.js";
import { getGmailClient } from "../../lib/gmail-client.js";

dotenv.config();
console.log("GMAIL API KEY", process.env.AUTHEMAILACCESSTOKENREDIS);

async function getAccessToken(req) {
  console.log(
    "accesstoken ke baath",
    `${process.env.AUTHEMAILACCESSTOKENREDIS}:${req.session.user.userId}:${req.session.regEmail}`
  );
  const accessToken = await redisClient.get(
    `${process.env.AUTHEMAILACCESSTOKENREDIS}:${req.session.user.userId}:${req.session.regEmail}`
  );
  if (!accessToken) {
    throw new Error("Access token not found in Redis");
  }
  return accessToken;
}

export const graphQlEmailResolvers = {
  Query: {
    
   

    // listGmailLabels: async (_, __, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await getAllLabels(accessToken);
    // },

    // getGmailMessage: async (_, { id }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await getSpecificMessage(accessToken, id);
    // },
    // listGmailMessages: async (_, { input }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await getListMessages(accessToken, input);
    // },
    // getGmailThread: async (_, { id }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await getSpecificMessageThread(accessToken, id);
    // },
    // listGmailThreads: async (_, { input }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await getMessageThreads(accessToken, input);
    // },
    // listGmailDrafts: async (_, { input }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await getDrafts(accessToken, input);
    // },
    // searchGmailMessages: async (_, { input }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await searchGmailMessages(accessToken, input);
    // },
    // searchGmailThreads: async (_, { input }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await searchGmailThreads(accessToken, input);
    // },




    getEmailLabelStats: async (_, __, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await getEmailLabelStatsFn(accessToken);
    },


    currentUser: async (_, __, { req, res, user }) => {
      return await userInfo(req);
    },

    users: async (_, __, {req, res, user}) => {
      return await usersDataInfo(req)
    },

    emails: async (_, { folder }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      const q =
        {
          inbox: "in:inbox",
          sent: "in:sent",
          drafts: "in:drafts",
          trash: "in:trash",
        }[folder] || "";

      const response = await gmail.users.messages.list({
        userId: "me",
        q,
        maxResults: 50,
      });

      const messages = response.data.messages || [];

      const emails = await Promise.all(
        messages.map(async (msg) => {
          const fullMessage = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
          });
          return {
            id: fullMessage.data.id,
            subject:
              fullMessage.data.payload?.headers?.find(
                (h) => h.name === "Subject"
              )?.value || "",
            sender: {
              name:
                fullMessage.data.payload?.headers?.find(
                  (h) => h.name === "From"
                )?.value || "",
              email:
                fullMessage.data.payload?.headers?.find(
                  (h) => h.name === "From"
                )?.value || "",
            },
            recipients: [],
            body: Buffer.from(
              fullMessage.data.payload?.body?.data || "",
              "base64"
            ).toString("utf-8"),
            date: fullMessage.data.internalDate,
            isStarred: fullMessage.data.labelIds?.includes("STARRED") || false,
            folder,
            labels: (fullMessage.data.labelIds || []).map((labelId) => ({
              id: labelId,
              name: labelId,
            })),
          };
        })
      );

      return emails;
    },

    // Fetch labels from Gmail
    labels: async (_, __, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      const response = await gmail.users.labels.list({ userId: "me" });
      const labels = response.data.labels || [];

      return labels.map((label) => ({
        id: label.id,
        name: label.name,
      }));
    },

     // Fetch single email by ID
     email: async (_, { id }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      const fullMessage = await gmail.users.messages.get({ userId: 'me', id });

      return {
        id: fullMessage.data.id,
        subject: fullMessage.data.payload?.headers?.find((h) => h.name === 'Subject')?.value || '',
        sender: {
          name: fullMessage.data.payload?.headers?.find((h) => h.name === 'From')?.value || '',
          email: fullMessage.data.payload?.headers?.find((h) => h.name === 'From')?.value || '',
        },
        recipients: [],
        body: Buffer.from(fullMessage.data.payload?.body?.data || '', 'base64').toString('utf-8'),
        date: fullMessage.data.internalDate,
        isStarred: fullMessage.data.labelIds?.includes('STARRED') || false,
        folder: '',
        labels: (fullMessage.data.labelIds || []).map((labelId) => ({ id: labelId, name: labelId })),
      };
    },
    searchEmails: async (
      _,
      { query },
      { req, res, user }
    ) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);
    
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 20, // You can change this limit
      });
    
      const messages = response.data.messages || [];
    
      const emails = await Promise.all(
        messages.map(async (msg) => {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
          });
    
          return {
            id: fullMessage.data.id,
            subject: fullMessage.data.payload?.headers?.find((h) => h.name === 'Subject')?.value || '',
            sender: {
              name: fullMessage.data.payload?.headers?.find((h) => h.name === 'From')?.value || '',
              email: fullMessage.data.payload?.headers?.find((h) => h.name === 'From')?.value || '',
            },
            body: Buffer.from(
              fullMessage.data.payload?.body?.data || '',
              'base64'
            ).toString('utf-8'),
            date: fullMessage.data.internalDate,
          };
        })
      );
    
      return emails;
    },

    drafts: async (_, __, { req, res, user }) => {
    
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);
    
      // 1. List all drafts
      const listResponse = await gmail.users.drafts.list({
        userId: 'me',
        maxResults: 50, // you can increase limit
      });
    
      const drafts = listResponse.data.drafts || [];
    
      // 2. Fetch full draft details
      const fullDrafts = await Promise.all(
        drafts.map(async (draftItem) => {
          const draftResponse = await gmail.users.drafts.get({
            userId: 'me',
            id: draftItem.id,
          });
    
          const draft = draftResponse.data;
    
          // Extracting fields
          const headers = draft.message?.payload?.headers || [];
          const subject = headers.find((h) => h.name === 'Subject')?.value || '';
          const to = headers.find((h) => h.name === 'To')?.value || '';
    
          const body =
            Buffer.from(
              draft.message?.payload?.body?.data || '',
              'base64'
            ).toString('utf-8') || '';
    
          return {
            id: draft.id,
            subject,
            body,
            recipients: to ? to.split(',').map((email) => email.trim()) : [],
          };
        })
      );
    
      return fullDrafts;
    },
    
    


  },

  Mutation: {
    // Label
    // createGmailLabel: async (_, { input }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   console.log("inpurt", input);
    //   console.log(input.name);
    //   return await createLabel(accessToken, input.name);
    // },

    // deleteGmailLabel: async (_, { id }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await deleteLabel(accessToken, id);
    // },

    // updateGmailLabel: async (_, { id, input }, { req, res, user }) => {
    //   const accessToken = await getAccessToken(req);
    //   return await updateLabel(accessToken, id, input.name);
    // },

    // batchUpdateGmailLabels: async (
    //   _,
    //   { messageIds, addLabelIds, removeLabelIdsLabelIds },
    //   { req, res, user }
    // ) => {
    //   const accessToken = await getAccessToken(req);
    //   return await batchModifyMessagesLabel(
    //     accessToken,
    //     messageIds,
    //     addLabelIds,
    //     removeLabelIdsLabelIds
    //   );
    // },

    // // Message
    // trashGmailMessage: async (_, { id }, { req, res, user }) => {
    //   const accessToken = getAccessToken(req);
    //   return await moveMessageToTrash(accessToken, id);
    // },

    // untrashGmailMessage: async (_, { id }, { req, res, user }) => {
    //   const accessToken = getAccessToken(req);
    //   return await untrashMessage(accessToken, id);
    // },

    // deleteGmailMessage: async (_, { id }, { req, res, user }) => {
    //   const accessToken = getAccessToken(req);
    //   return await deleteSingleMessage(accessToken, id);
    // },

    //     // Threads
    //     trashGmailThread: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.trashThread(id),

    //     untrashGmailThread: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.untrashThread(id),

    //     deleteGmailThread: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.deleteThread(id),

    // Drafts
    // createGmailDraft: async (_, { input }, { req, res, user }) =>
    //   createDraft(input),

    //     deleteGmailDraft: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.deleteDraft(id),

    //     sendGmailDraft: (_, { input }, { req, res, user }) =>
    //       dataSources.gmailAPI.sendDraft(input),

    //     updateGmailDraft: (_, { id, input }, { req, res, user }) =>
    //       dataSources.gmailAPI.updateDraft(id, input),

    //     // Batch Message Operations
    //     batchTrashGmailMessages: (_, { ids }, { req, res, user }) =>
    //       dataSources.gmailAPI.batchTrashMessages(ids),

    //     batchUntrashGmailMessages: (_, { ids }, { req, res, user }) =>
    //       dataSources.gmailAPI.batchUntrashMessages(ids),

    //     batchDeleteGmailMessages: (_, { ids }, { req, res, user }) =>
    //       dataSources.gmailAPI.batchDeleteMessages(ids),

    //     // Batch Thread Operations
    //     batchTrashGmailThreads: (_, { ids }, { req, res, user }) =>
    //       dataSources.gmailAPI.batchTrashThreads(ids),

    //     batchUntrashGmailThreads: (_, { ids }, { req, res, user }) =>
    //       dataSources.gmailAPI.batchUntrashThreads(ids),

    //     batchDeleteGmailThreads: (_, { ids }, { req, res, user }) =>
    //       dataSources.gmailAPI.batchDeleteThreads(ids),

    //     // Mark Read/Unread
    //     markMessageAsRead: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.markMessageAsRead(id),

    //     markMessageAsUnread: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.markMessageAsUnread(id),

    //     markThreadAsRead: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.markThreadAsRead(id),

    //     markThreadAsUnread: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.markThreadAsUnread(id),

    //     // Clear Trash/Spam
    //     emptyTrash: (_, __, { req, res, user }) =>
    //       dataSources.gmailAPI.emptyTrash(),

    //     emptySpam: (_, __, { req, res, user }) => dataSources.gmailAPI.emptySpam(),

    //     // Modify Labels
    //     modifyGmailMessageLabels: (_, { id, input }, { req, res, user }) =>
    //       dataSources.gmailAPI.modifyMessageLabels(id, input),

    //     modifyGmailThreadLabels: (_, { id, input }, { req, res, user }) =>
    //       dataSources.gmailAPI.modifyThreadLabels(id, input),

    //     // Watch
    //     setupGmailWatch: (_, { input }, { req, res, user }) =>
    //       dataSources.gmailAPI.setupWatch(input),

    //     stopGmailWatch: (_, __, { req, res, user }) =>
    //       dataSources.gmailAPI.stopWatch(),





    createLabel: async (_, { name }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      const response = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });

      return {
        id: response.data.id,
        name: response.data.name,
      };
    },

    deleteLabel: async (_, { id }, { req, res, user  }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      await gmail.users.labels.delete({
        userId: 'me',
        id,
      });

      return true;
    },

    updateEmailStarred: async (_, { id, isStarred }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      await gmail.users.messages.modify({
        userId: 'me',
        id,
        requestBody: {
          addLabelIds: isStarred ? ['STARRED'] : [],
          removeLabelIds: !isStarred ? ['STARRED'] : [],
        },
      });

      return { id, isStarred };
    },

    moveEmail: async (_, { id, folder }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      const labelMap = {
        trash: 'TRASH',
        spam: 'SPAM',
        drafts: 'DRAFT',
        sent: 'SENT',
      };

      await gmail.users.messages.modify({
        userId: 'me',
        id,
        requestBody: {
          addLabelIds: [labelMap[folder] || 'INBOX'],
        },
      });

      return { id, folder };
    },

    applyLabel: async (_, { emailId, labelId }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      await gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          addLabelIds: [labelId],
        },
      });

      return { id: emailId, labels: [{ id: labelId, name: labelId }] };
    },

    removeLabel: async (_, { emailId, labelId }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);

      await gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          removeLabelIds: [labelId],
        },
      });

      return { id: emailId, labels: [] };
    },

    saveDraft: async (
      _,
      { input },
      { req, res, user }
    ) => {
      if (!user || !user.id) {
        throw new Error('Not authenticated');
      }
    
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);
    
      // Build the raw email message format
      const emailLines = [
        `To: ${input.recipients.join(', ')}`,
        `Subject: ${input.subject || ''}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        input.body || '',
      ];
    
      const emailContent = emailLines.join('\n');
    
      const encodedMessage = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // Gmail API expects URL-safe Base64
    
      // Save the draft
      const draftResponse = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: encodedMessage,
          },
        },
      });
    
      const draft = draftResponse.data;
    
      // Extract subject and recipients back from what we sent
      return {
        id: draft.id,
        subject: input.subject || '',
        body: input.body || '',
        recipients: input.recipients,
        folder: 'drafts', // since it's a saved draft
      };
    },
    
    sendEmail: async (_, { input }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      const gmail = getGmailClient(accessToken);
    
      const message = [
        `To: ${input.recipients.join(', ')}`,
        `Subject: ${input.subject}`,
        '',
        input.body,
      ].join('\n');
    
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
    
      return {
        id: response.data.id,          // Added
        subject: input.subject,
        body: input.body,
        recipients: input.recipients,
        date: new Date().toISOString(), // Optional: or use Gmail sent timestamp if you want
        folder: 'sent',                 // Assuming the email is sent, set folder = 'sent'
      };
    }
    

  
  },
};
