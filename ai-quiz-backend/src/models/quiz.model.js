import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question_id: { type: Number, required: true },
    question_text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correct_answer: { type: String, required: true },
    explanation: { type: String } // Field to store the AI-generated explanation
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sourceType: {
        type: String,
        enum: ['PDF', 'NCERT'],
        required: true
    },
    sourceName: { // e.g., PDF filename or "NCERT Class X - Science - Chapter 1"
        type: String,
        required: true
    }
}, { timestamps: true });

export const Quiz = mongoose.model('Quiz', quizSchema);