import gql from "graphql-tag";

export const emailTypeDefs = gql`
  # type Query{
  #   sayHello: String!
  # }

  # ===================
  # ENUMS
  # ===================

  enum GmailMessageFormat {
    FULL
    METADATA
    MINIMAL
    RAW
  }

  # ===================
  # INPUT TYPES
  # ===================

  input GmailLabelInput {
    name: String!
    labelListVisibility: String
    messageListVisibility: String
  }

  input GmailLabelUpdateInput {
    addLabelIds: [String!]
    removeLabelIds: [String!]
  }

  input GmailMessageQueryInput {
    labelIds: [String]
    query: String
    maxResults: Int
    pageToken: String
    format: GmailMessageFormat = FULL
  }

  input GmailThreadQueryInput {
    labelIds: [String]
    query: String
    maxResults: Int
    pageToken: String
    format: GmailMessageFormat = FULL
  }

  input GmailDraftInput {
    to: [String!]!
    cc: [String]
    bcc: [String]
    subject: String!
    body: String!
  }

  input GmailSendDraftInput {
    draftId: String!
  }

  input GmailAdvancedSearchInput {
    from: String
    to: String
    subject: String
    hasAttachment: Boolean
    isRead: Boolean
    after: String
    before: String
    labelIds: [String]
    query: String
    maxResults: Int
    pageToken: String
  }

  input GmailWatchInput {
    topicName: String!
    labelIds: [String]
    labelFilterAction: String
  }

  input SaveDraftInput {
    subject: String
    body: String
    recipients: [String!]!
  }

  input SendEmailInput {
    subject: String!
    body: String!
    recipients: [String!]!
  }

  # ===================
  # OBJECT TYPES
  # ===================

  type GmailLabel {
    id: String!
    name: String!
    type: String!
    messageListVisibility: String
    labelListVisibility: String
  }

  type LabelStats {
    labelId: String!
    name: String!
    total: Int!
    unread: Int!
    color: String!
  }

  type EmailLabelStatsResponse {
    labels: [GmailLabel!]!
    stats: [LabelStats!]!
  }

  type GmailMessage {
    id: String!
    threadId: String!
    labelIds: [String]
    snippet: String
    historyId: String
    internalDate: String
    payload: GmailPayload
  }

  type GmailPayload {
    mimeType: String
    headers: [GmailHeader]
    body: GmailBody
    parts: [GmailPayload]
  }

  type GmailHeader {
    name: String!
    value: String!
  }

  type GmailBody {
    size: Int
    data: String
  }

  type GmailThread {
    id: String!
    snippet: String
    messages: [GmailMessage]
  }

  type GmailDraft {
    id: String!
    message: GmailMessage
  }

  type GmailWatchResponse {
    historyId: String
    expiration: String
  }

  type User {
    id: ID!
    email: String!
    name: String!
    avatar: String
  }

  type Label {
    id: ID!
    name: String!
  }

  type EmailSender {
    name: String
    email: String
  }

  type EmailLabel {
    id: ID!
    name: String!
  }

  type PartialEmailStarInfo {
    id: ID!
    isStarred: Boolean!
  }

  type PartialEmailMoveInfo {
    id: ID!
    folder: String!
  }

  type PartialEmailLabelsInfo {
    id: ID!
    labels: [EmailLabel!]!
  }

  type Email {
    id: ID!
    subject: String!
    sender: EmailSender
    recipients: [String!]!
    body: String
    date: String
    isStarred: Boolean
    folder: String
    labels: [EmailLabel!]!
  }

  type Draft {
    id: ID!
    subject: String
    body: String
    recipients: [String!]!
    folder: String
  }

  type SentEmailInfo {
    id: ID!
    subject: String!
    body: String!
    recipients: [String!]!
    date: String
    folder: String
  }
  # ===================
  # PAGINATION
  # ===================

  type GmailMessageList {
    messages: [GmailMessage]!
    nextPageToken: String
    resultSizeEstimate: Int
  }

  type GmailThreadList {
    threads: [GmailThread]!
    nextPageToken: String
    resultSizeEstimate: Int
  }

  type GmailDraftList {
    drafts: [GmailDraft]!
    nextPageToken: String
  }

  # ===================
  # QUERIES
  # ===================

  type Query {
    # listGmailLabels: [GmailLabel]!
    # getGmailMessage(id: String!): GmailMessage
    # listGmailMessages(input: GmailMessageQueryInput): GmailMessageList
    # getGmailThread(id: String!): GmailThread
    # listGmailThreads(input: GmailThreadQueryInput): GmailThreadList
    # listGmailDrafts(maxResults: Int, pageToken: String): GmailDraftList
    # searchGmailMessages(input: GmailAdvancedSearchInput!): GmailMessageList
    # searchGmailThreads(input: GmailAdvancedSearchInput!): GmailThreadList

    getEmailLabelStats: EmailLabelStatsResponse!
    emails(folder: String!): [Email!]!
    labels: [Label!]!
    email(id: ID!): Email
    drafts: [Draft!]!
    searchEmails(query: String!): [Email!]!
    currentUser: User
    users: [User!]!
  }

  # ===================
  # MUTATIONS
  # ===================

  type Mutation {
    #   # Label
    # createGmailLabel(input: GmailLabelInput!): GmailLabel
    # deleteGmailLabel(id: String!): Boolean
    # updateGmailLabel(id: String!, input: GmailLabelInput!): GmailLabel
    # batchUpdateGmailLabels(
    #   messageIds: [String!]!
    #   addLabelIds: [String]
    #   removeLabelIdsLabelIds: [String]
    # ): Boolean

    # Message Operations
    # trashGmailMessage(id: String!): GmailMessage
    # untrashGmailMessage(id: String!): GmailMessage
    # deleteGmailMessage(id: String!): Boolean

    #   # Thread Operations
    #   trashGmailThread(id: String!): GmailThread
    #   untrashGmailThread(id: String!): GmailThread
    #   deleteGmailThread(id: String!): Boolean

    #   # Drafts
    # createGmailDraft(input: GmailDraftInput!): GmailDraft
    #   deleteGmailDraft(id: String!): Boolean
    #   sendGmailDraft(input: GmailSendDraftInput!): GmailMessage
    #   updateGmailDraft(id: String!, input: GmailDraftInput!): GmailDraft

    #   # Batch Operations
    #   batchTrashGmailMessages(ids: [String!]!): [GmailMessage]
    #   batchUntrashGmailMessages(ids: [String!]!): [GmailMessage]
    #   batchDeleteGmailMessages(ids: [String!]!): Boolean

    #   batchTrashGmailThreads(ids: [String!]!): [GmailThread]
    #   batchUntrashGmailThreads(ids: [String!]!): [GmailThread]
    #   batchDeleteGmailThreads(ids: [String!]!): Boolean

    #   # Mark as Read / Unread
    #   markMessageAsRead(id: String!): GmailMessage
    #   markMessageAsUnread(id: String!): GmailMessage
    #   markThreadAsRead(id: String!): GmailThread
    #   markThreadAsUnread(id: String!): GmailThread

    #   # Clear Trash / Spam Folders
    #   emptyTrash: Boolean
    #   emptySpam: Boolean

    #   # Apply / Remove Labels
    #   modifyGmailMessageLabels(
    #     id: String!
    #     input: GmailLabelUpdateInput!
    #   ): GmailMessage
    #   modifyGmailThreadLabels(
    #     id: String!
    #     input: GmailLabelUpdateInput!
    #   ): GmailThread

    #   # Gmail Watch / PubSub Subscription Setup
    #   setupGmailWatch(input: GmailWatchInput!): GmailWatchResponse
    #   stopGmailWatch: Boolean

    createLabel(name: String!): Label!
    deleteLabel(id: ID!): Boolean!

    updateEmailStarred(id: ID!, isStarred: Boolean!): PartialEmailStarInfo!
    moveEmail(id: ID!, folder: String!): PartialEmailMoveInfo!
    applyLabel(emailId: ID!, labelId: ID!): PartialEmailLabelsInfo!
    removeLabel(emailId: ID!, labelId: ID!): PartialEmailLabelsInfo!

    saveDraft(input: SaveDraftInput!): Draft!
    sendEmail(input: SendEmailInput!): SentEmailInfo!
    switchUser(userId: ID!): User!
  }
`;
