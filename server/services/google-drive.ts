import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

export class GoogleDriveService {
    private drive: any;

    constructor() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            console.warn('[GoogleDriveService] OAuth2 credentials not fully configured. Using MOCK mode.');
            this.drive = null;
            return;
        }

        try {
            const oauth2Client = new google.auth.OAuth2(
                clientId,
                clientSecret,
                'http://localhost:5050'
            );

            oauth2Client.setCredentials({
                refresh_token: refreshToken
            });

            this.drive = google.drive({ version: 'v3', auth: oauth2Client });
        } catch (error) {
            console.error('[GoogleDriveService] Failed to initialize Google Auth:', error);
            this.drive = null;
        }
    }

    /**
     * Creates a folder for an order.
     */
    async createOrderFolder(orderNumber: string): Promise<string | undefined> {
        if (!this.drive) {
            console.log('[GoogleDriveService] MOCK: creating folder for', orderNumber);
            return 'mock-folder-id';
        }

        const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

        try {
            const fileMetadata = {
                name: `Order_${orderNumber}`,
                mimeType: 'application/vnd.google-apps.folder',
                parents: parentFolderId ? [parentFolderId] : undefined,
            };

            const folder = await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });

            return folder.data.id || undefined;
        } catch (error) {
            console.error('Error creating Google Drive folder:', error);
            throw error;
        }
    }

    /**
     * Uploads a file buffer to a specific folder.
     */
    async uploadFile(folderId: string, fileName: string, fileBuffer: Buffer): Promise<string | undefined> {
        if (!this.drive) return 'mock-file-id';

        try {
            const fileMetadata = {
                name: fileName,
                parents: [folderId],
            };

            const media = {
                mimeType: 'video/mp4', // Assuming mp4 for videos
                body: Readable.from(fileBuffer),
            };

            const file = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink',
            });

            // Make the file readable by anyone with the link
            await this.drive.permissions.create({
                fileId: file.data.id!,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            // Get the updated link
            const result = await this.drive.files.get({
                fileId: file.data.id!,
                fields: 'webViewLink',
            });

            return result.data.webViewLink || undefined;
        } catch (error) {
            console.error('Error uploading to Google Drive:', error);
            throw error;
        }
    }

    /**
     * Formats a direct download link from a webViewLink if possible, 
     * though webViewLink is usually enough for customers.
     */
    getShareableLink(fileId: string): string {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
}

export const googleDriveService = new GoogleDriveService();
