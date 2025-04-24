import dotenv from "dotenv";
import { redisClient } from "../../config/redis-client.js";
import { createDraft, getDrafts } from "../../controllers/draft-email-controller.js";
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

dotenv.config();
console.log("GMAIL API KEY", process.env.AUTHEMAILACCESSTOKENREDIS);

async function getAccessToken(req) {
  console.log("accesstoken ke baath", `${process.env.AUTHEMAILACCESSTOKENREDIS}:${req.session.user.userId}:${req.session.regEmail}`)
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
    listGmailLabels: async (_, __, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await getAllLabels(accessToken);
    },
    getEmailLabelStats: async (_, __, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await getEmailLabelStatsFn(accessToken);
    },

    getGmailMessage: async (_, { id }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await getSpecificMessage(accessToken, id);
    },
    listGmailMessages: async (_, { input }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await getListMessages(accessToken, input);
    },
    getGmailThread: async (_, { id }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await getSpecificMessageThread(accessToken, id);
    },
    listGmailThreads: async (_, { input }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await getMessageThreads(accessToken, input);
    },
    listGmailDrafts: async (_, { input }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await getDrafts(accessToken, input);
    },
    searchGmailMessages: async (_, { input }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await searchGmailMessages(accessToken, input);
    },
    searchGmailThreads: async (_, { input }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await searchGmailThreads(accessToken, input);
    },
  },

  Mutation: {
    // Label
    createGmailLabel: async (_, { input }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      console.log("inpurt", input);
      console.log(input.name);
      return await createLabel(accessToken, input.name);
    },

    deleteGmailLabel: async (_, { id }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await deleteLabel(accessToken, id);
    },

    updateGmailLabel: async (_, { id, input }, { req, res, user }) => {
      const accessToken = await getAccessToken(req);
      return await updateLabel(accessToken, id, input.name);
    },

    batchUpdateGmailLabels: async (
      _,
      { messageIds, addLabelIds, removeLabelIdsLabelIds },
      { req, res, user }
    ) => {
      const accessToken = await getAccessToken(req);
      return await batchModifyMessagesLabel(
        accessToken,
        messageIds,
        addLabelIds,
        removeLabelIdsLabelIds
      );
    },

    // Message
    trashGmailMessage: async (_, { id }, { req, res, user }) => {
      const accessToken = getAccessToken(req);
      return await moveMessageToTrash(accessToken, id);
    },

    untrashGmailMessage: async (_, { id }, { req, res, user }) => {
      const accessToken = getAccessToken(req);
      return await untrashMessage(accessToken, id);
    },

    deleteGmailMessage: async (_, { id }, { req, res, user }) => {
      const accessToken = getAccessToken(req);
      return await deleteSingleMessage(accessToken, id);
    },

    //     // Threads
    //     trashGmailThread: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.trashThread(id),

    //     untrashGmailThread: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.untrashThread(id),

    //     deleteGmailThread: (_, { id }, { req, res, user }) =>
    //       dataSources.gmailAPI.deleteThread(id),

        // Drafts
        createGmailDraft:async (_, { input }, { req, res, user }) =>
          createDraft(input),

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
  },
};
