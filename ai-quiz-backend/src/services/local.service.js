import fs from 'fs/promises';
import path from 'path';

// Base directory for local NCERT books
const BASE_DIR = path.join(process.cwd(), 'ncert_books');

/**
 * Lists files/folders within a specific local directory.
 * Mimics the Google Drive response structure for the frontend.
 */
async function listFolderContents(folderPath = '') {
    const fullPath = path.join(BASE_DIR, folderPath);
    try {
        // Ensure the base directory exists
        await fs.mkdir(BASE_DIR, { recursive: true });
        
        const items = await fs.readdir(fullPath, { withFileTypes: true });
        
        return items.map(item => {
            const itemPath = path.join(folderPath, item.name);
            const isDirectory = item.isDirectory();
            return {
                id: itemPath, // We use the relative path as the ID
                name: item.name,
                mimeType: isDirectory ? 'application/vnd.google-apps.folder' : 'application/pdf'
            };
        });
    } catch (error) {
        console.error('Error reading local folder contents:', error);
        throw new Error('Could not list contents from the local library. Ensure ncert_books folder exists.');
    }
}

/**
 * Returns the absolute path to the local PDF file.
 */
async function getLocalPdfPath(filePath) {
    return path.join(BASE_DIR, filePath);
}

export { listFolderContents, getLocalPdfPath };
