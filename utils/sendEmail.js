require("dotenv").config();
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const fs = require("fs");
const readline = require("readline");

// Load credentials from environment variables
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const TOKEN_PATH = "token.json";

// Environment variables for OAuth client credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Validate the environment variables
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error("Error: Missing required environment variables.");
  process.exit(1);
}

// Authorize function using environment variables
function authorize(callback) {
  const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // Check if we have previously stored a token
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

// Function to get a new token if needed
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log("Token stored to", TOKEN_PATH);
      callback(oAuth2Client);
    });
  });
}

// Function to send email
async function sendEmail({ to, subject, message }) {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });
  const email = createEmail(to, subject, message);
  const rawMessage = createBase64EncodedEmail(email);

  try {
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });
    console.log("Email sent:", response.data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Create an email in the correct format
function createEmail(to, subject, message) {
  return [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    "",
    message,
  ].join("\n");
}

// Base64 encode the email content
function createBase64EncodedEmail(email) {
  return Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // Remove any trailing '=' characters from the Base64 encoding
}

// Export the sendEmail function
module.exports = sendEmail;
