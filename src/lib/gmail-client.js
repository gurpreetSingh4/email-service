import { google } from 'googleapis';

// Function to create Gmail client for a user
export function getGmailClient(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });
  return gmail;
}