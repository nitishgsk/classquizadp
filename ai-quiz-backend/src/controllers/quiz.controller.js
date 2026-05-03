import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { listFolderContents, getLocalPdfPath } from '../services/local.service.js';
import { extractTextFromPdf } from '../services/pdf.service.js'; // Our Python-powered service
import { generateQuizFromText } from '../services/groq.service.js';
import { Quiz } from '../models/quiz.model.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const generatePdfQuiz = asyncHandler(async (req, res) => {
    if (!req.files || !req.files.pdf) {
        throw new ApiError(400, "PDF file is required");
    }
    const pdfFile = req.files.pdf;
    // The express-fileupload middleware gives us a temporary file path directly
    const knowledgeText = await extractTextFromPdf(pdfFile.tempFilePath);
    
    if (!knowledgeText) {
        throw new ApiError(500, "Could not extract text from PDF");
    }

    const { subject, pace, difficulty, studentClass, numQuestions } = req.body;
    const quizData = await generateQuizFromText(knowledgeText, { numQuestions, difficulty, studentClass });

    const quiz = await Quiz.create({
        title: `Quiz on ${pdfFile.name.replace('.pdf', '')}`,
        questions: quizData.questions,
        createdBy: req.user._id,
        sourceType: 'PDF',
        sourceName: pdfFile.name
    });

    return res.status(201).json(new ApiResponse(201, quiz, "Quiz generated successfully"));
});

const generateNcertQuiz = asyncHandler(async (req, res) => {
    const { chapterFile, numQuestions, difficulty, studentClass } = req.body;
    
    const chapterInfo = JSON.parse(chapterFile); // Contains name and id of the PDF file

    // 1. Get the absolute path to the local file
    const pdfFilePath = await getLocalPdfPath(chapterInfo.id);

    // 2. Use our existing Python-powered service to extract text from that local file
    const knowledgeText = await extractTextFromPdf(pdfFilePath);

    if (!knowledgeText) {
        throw new ApiError(500, "Could not extract text from the selected chapter PDF.");
    }

    const quizData = await generateQuizFromText(knowledgeText, { numQuestions, difficulty, studentClass });
    
    const quiz = await Quiz.create({
        title: chapterInfo.name.replace('.pdf', ''),
        questions: quizData.questions,
        createdBy: req.user._id,
        sourceType: 'NCERT',
        sourceName: chapterInfo.name
    });

    return res.status(201).json(new ApiResponse(201, quiz, "Quiz generated successfully"));
});


const getDriveContents = asyncHandler(async (req, res) => {
    const { folderId } = req.query;
    const contents = await listFolderContents(folderId);
    return res.status(200).json(new ApiResponse(200, contents, "Contents fetched successfully"));
});

const getQuizById = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).select('-questions.correct_answer -questions.explanation');
    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }
    return res.status(200).json(new ApiResponse(200, quiz, "Quiz fetched successfully"));
});

export { generatePdfQuiz, generateNcertQuiz, getQuizById, getDriveContents };