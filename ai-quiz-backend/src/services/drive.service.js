import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { Writable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYFILEPATH = path.join(__dirname, '../../google-credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const GDRIVE_NCERT_FOLDER_ID = process.env.GDRIVE_NCERT_FOLDER_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Fetches a PDF file from Google Drive by its ID and returns its content as a Buffer.
 */
async function getPdfBufferFromDrive(fileId) {
    try {
        const fileRes = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        return new Promise((resolve, reject) => {
            const chunks = [];
            fileRes.data
                .on('data', (chunk) => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', (err) => reject(err));
        });
    } catch (error) {
        console.error('Error fetching PDF from Google Drive:', error);
        throw new Error("Could not retrieve the NCERT chapter from the library.");
    }
}

/**
 * Lists files/folders within a specific Google Drive folder.
 */
async function listFolderContents(folderId = GDRIVE_NCERT_FOLDER_ID) {
    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType)',
            orderBy: 'name',
        });
        return res.data.files;
    } catch (error) {
        console.error('Error listing Drive folder contents:', error);
        throw new Error('Could not list contents from the library.');
    }
}

export { getPdfBufferFromDrive, listFolderContents };