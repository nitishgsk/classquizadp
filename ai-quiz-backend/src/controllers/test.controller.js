import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Quiz } from '../models/quiz.model.js';
import { TestResult } from '../models/testResult.model.js';
import { analyzeResultsWithAI, generateAnswerExplanations } from '../services/groq.service.js';

const submitTest = asyncHandler(async (req, res) => {
    const { quizId, answers: studentAnswers } = req.body; // [{question_id, selected_answer}]
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    if (!quiz.questions[0].explanation) {
        const explanations = await generateAnswerExplanations(quiz.questions);
        explanations.forEach(exp => {
            const questionToUpdate = quiz.questions.find(q => q.question_id === exp.question_id);
            if (questionToUpdate) {
                questionToUpdate.explanation = exp.explanation;
            }
        });
        await quiz.save();
    }
    
    let score = 0;
    const detailedAnswers = [];
    const questionsForAnalysis = [];

    quiz.questions.forEach(q => {
        const studentSubmission = studentAnswers.find(sa => sa.question_id === q.question_id);
        const isCorrect = studentSubmission && studentSubmission.selected_answer === q.correct_answer;
        
        if (isCorrect) score++;

        detailedAnswers.push({
            question_id: q.question_id,
            selected_answer: studentSubmission?.selected_answer || "Not Answered",
            is_correct: isCorrect
        });
        
        questionsForAnalysis.push({
            question: q.question_text,
            correct_answer: q.correct_answer,
        });
    });

    const analysis = await analyzeResultsWithAI(questionsForAnalysis, studentAnswers);

    const testResult = await TestResult.create({
        student: studentId,
        quiz: quizId,
        score,
        totalQuestions: quiz.questions.length,
        answers: detailedAnswers,
        analysis
    });

    return res.status(201).json(new ApiResponse(201, testResult, "Test submitted and analyzed successfully"));
});

const getMyResults = asyncHandler(async(req, res) => {
    const results = await TestResult.find({ student: req.user._id })
        .populate('quiz', 'title sourceType sourceName')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, results, "Test results fetched successfully"));
});

const getResultById = asyncHandler(async(req, res) => {
    const { resultId } = req.params;
    const result = await TestResult.findOne({ _id: resultId, student: req.user._id })
        .populate({
            path: 'quiz',
            select: 'questions title'
        });

    if(!result) throw new ApiError(404, "Test result not found or you do not have permission to view it");

    return res.status(200).json(new ApiResponse(200, result, "Test result fetched successfully"));
});

export { submitTest, getMyResults, getResultById };