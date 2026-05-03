import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the absolute path to the Python script
const pythonScriptPath = path.join(__dirname, '../../pdf_extractor.py');

async function extractTextFromPdf(filePath) {
  return new Promise((resolve, reject) => {
    // Spawn a new Python process
    const pythonProcess = spawn('python', [pythonScriptPath, filePath]);

    let extractedText = '';
    let errorOutput = '';

    // Listen for data from the Python script's standard output
    pythonProcess.stdout.on('data', (data) => {
      extractedText += data.toString();
    });

    // Listen for errors
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle the process exit
    pythonProcess.on('close', (code) => {
      // Clean up the temporary file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (code === 0) {
        // Success
        resolve(extractedText);
      } else {
        // Failure
        console.error(`Python script exited with code ${code}: ${errorOutput}`);
        reject(new Error("Failed to extract text from PDF using Python script."));
      }
    });
  });
}

export { extractTextFromPdf };