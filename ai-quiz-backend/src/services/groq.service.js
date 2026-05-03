import { Groq } from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

function cleanJsonString(text) {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

/**
 * Generates a quiz using the Groq API.
 */
async function generateQuizFromText(knowledgeText, { numQuestions, difficulty, studentClass }) {
    const prompt = `
        You are an expert quiz creator. Based ONLY on the following "Knowledge Text", create a multiple-choice quiz.
        
        Instructions:
        1. Generate exactly ${numQuestions} questions.
        2. The difficulty should be "${difficulty}" for a student in Class ${studentClass}.
        3. Each question must have 4 options, with one clearly correct answer.
        4. Do NOT refer to the text in the questions (e.g., no "According to the text...").
        5. Return ONLY a valid JSON object with a single key "questions".
        6. The "questions" key should be a list of objects, where each object has:
           - "question_id": A unique integer (1, 2, 3...).
           - "question_text": The question string.
           - "options": A list of 4 strings.
           - "correct_answer": The string of the correct option.
        
        Knowledge Text:
        ---
        ${knowledgeText}
        ---
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.3
        });

        const quizJson = JSON.parse(completion.choices[0]?.message?.content);
        return quizJson;
    } catch (error) {
        console.error("Error generating quiz with Groq:", error);
        throw new Error("Failed to generate quiz from AI model.");
    }
}

async function generateAnswerExplanations(questions) {
    const prompt = `
        You are an expert teacher. For each of the following questions, provide a brief and clear explanation (1-2 sentences) for why the correct answer is right.
        
        Instructions:
        1.  Analyze each question and its correct answer.
        2.  Provide a concise explanation for each.
        3.  Return ONLY a valid JSON object with a single key "explanations".
        4.  The "explanations" key should be a list of objects, where each object has:
            - "question_id": The corresponding integer ID of the question.
            - "explanation": The string containing the explanation.

        Questions to Analyze:
        ---
        ${JSON.stringify(questions.map(q => ({ question_id: q.question_id, question_text: q.question_text, correct_answer: q.correct_answer })))}
        ---
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.3
        });

        const explanationJson = JSON.parse(completion.choices[0]?.message?.content);
        return explanationJson.explanations;
    } catch (error) {
        console.error("Error generating explanations with Groq:", error);
        throw new Error("Failed to generate explanations from AI model.");
    }
}

/**
 * Analyzes test results using the Groq API.
 */
async function analyzeResultsWithAI(questions, studentAnswers) {
    const prompt = `
        You are an expert educational tutor. Analyze the following quiz results for a student.
        
        Instructions:
        1. Review the list of questions, their correct answers, and the student's selected answers.
        2. Identify conceptual strengths based on correctly answered questions.
        3. Identify specific conceptual weaknesses based on incorrectly answered questions.
        4. Provide actionable recommendations for improvement based on the weaknesses.
        5. Provide a brief, encouraging overall feedback summary.
        6. Return ONLY a valid JSON object with the keys "strengths", "weaknesses", "recommendations", and "overall_feedback".
           - "strengths", "weaknesses", and "recommendations" should be lists of strings.
           - "overall_feedback" should be a single string.

        Quiz Data:
        ---
        Questions and Answers: ${JSON.stringify(questions)}
        Student's Submitted Answers: ${JSON.stringify(studentAnswers)}
        ---
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.3
        });

        const analysisJson = JSON.parse(completion.choices[0]?.message?.content);
        return analysisJson;
    } catch (error) {
        console.error("Error analyzing results with Groq:", error);
        throw new Error("Failed to generate analysis from AI model.");
    }
}

export { generateQuizFromText, analyzeResultsWithAI, generateAnswerExplanations };
