import { google } from 'googleapis';
import readline from 'readline';
import 'dotenv/config';

// Scopes for full Drive access to handle folders and files
const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * ℹ️ HOW TO USE THIS SCRIPT:
 * 1. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are in your .env
 * 2. Run: npx tsx server/scripts/generate-token.ts
 * 3. Follow the instructions in the terminal.
 */

async function generateToken() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
        console.log('\nSteps to get them:');
        console.log('1. Go to Google Cloud Console > APIs & Services > Credentials');
        console.log('2. Create "OAuth 2.0 Client ID" for "Web Application"');
        console.log('3. Add "http://localhost:5050" to Authorised redirect URIs');
        process.exit(1);
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost:5050' // This must match exactly what is in your Google Console
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Required to get a refresh token
        scope: SCOPES,
        prompt: 'consent', // Force consent to ensure refresh token is returned
    });

    console.log('\n--- 🚀 GOOGLE TOKEN GENERATOR ---');
    console.log('1. Open this URL in your browser:\n');
    console.log('\x1b[36m%s\x1b[0m', authUrl);
    console.log('\n2. Authorize the app and you will be redirected to an error page (localhost:5050).');
    console.log('3. Copy the "code" parameter from the URL in the address bar.');
    console.log('   Example: http://localhost:5050/?code=4/0AfgeXvw...');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('\nPaste the code here: ', async (code) => {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            console.log('\n✅ SUCCESS! Add this to your .env file:\n');
            console.log('\x1b[32m%s\x1b[0m', `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
            console.log('\n(Note: Keep this token secret! It allows full access to your Drive.)');
        } catch (error) {
            console.error('\n❌ Error exchanging code for token:', error);
        } finally {
            rl.close();
        }
    });
}

generateToken();
