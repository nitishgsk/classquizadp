import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    overall_feedback: { type: String }
});

const testResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    answers: [{
        question_id: Number,
        selected_answer: String,
        is_correct: Boolean
    }],
    analysis: analysisSchema
}, { timestamps: true });

export const TestResult = mongoose.model('TestResult', testResultSchema);