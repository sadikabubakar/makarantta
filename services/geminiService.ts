
import { GoogleGenAI, Type } from "@google/genai";
import { SentencePair, WordAnalysis, AcademicWord, AcademicSentence, LessonContent, ExamQuestion, WisdomItem, Subject, LessonPart } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const FAST_MODEL = 'gemini-3-flash-preview';

export const geminiService = {
  async getSentenceBySentence(text: string, sourceLang: 'English' | 'Arabic'): Promise<SentencePair[]> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Translate the following ${sourceLang} text to Hausa sentence-by-sentence. 
      Return strictly a JSON array of objects: [{"original": "...", "hausa": "..."}]. 
      Text: "${text}"`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  },

  async getWordByWordAnalysis(text: string, sourceLang: 'English' | 'Arabic'): Promise<WordAnalysis[]> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Analyze this ${sourceLang} text word-by-word. For each word, provide original, Hausa meanings, and context in Hausa. 
      Return strictly a JSON array: [{"word": "...", "meanings": ["..."], "context": "..."}]. 
      Text: "${text}"`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  },

  async get100AcademicWords(): Promise<AcademicWord[]> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Generate a list of exactly 100 essential academic English words for students. For each word, provide Hausa meanings, an English example, and Hausa translation. Return strictly a JSON array of objects: [{"word": "...", "hausaMeanings": ["..."], "example": "...", "exampleHausa": "..."}].`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  },

  async get50AcademicSentences(): Promise<AcademicSentence[]> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Generate exactly 50 advanced academic English sentences. Keep the sentences clear and avoid unnecessary complexity. For each, provide Hausa translation and a short Hausa explanation of usage. Return strictly a JSON array: [{"sentence": "...", "hausa": "...", "explanation": "..."}].`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  },

  async generateLesson(level: string, grade: string, subject: string, topic: string, length: 'Short' | 'Long'): Promise<LessonContent> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Act as an expert teacher for ${level} school, ${grade}. 
      Teach a highly educational lesson on "${topic}" in "${subject}". 
      CRITICAL: Use ONLY short, simple, and clear English sentences. Avoid long and complex sentence structures so that students can learn English easily.
      STRUCTURE: The entire lesson MUST be sentence-by-sentence. Every single English sentence must be followed by its Hausa translation.
      Return strictly as a JSON object: 
      {
        "title": "...", 
        "introduction": "Intro sentence English and Hausa combined (Keep it short)", 
        "parts": [{"english": "1 or 2 very short, simple English sentences", "hausa": "The exact Hausa translation"}, ...], 
        "conclusion": "Summary in short English and Hausa"
      }. Provide at least 10-12 parts if ${length === 'Long' ? 'extremely long' : 'comprehensive'}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  },

  async generateFullSubjectLesson(level: string, grade: string, subject: Subject): Promise<LessonContent> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Act as a Head Teacher for ${level} school, ${grade}. 
      Generate a comprehensive 'Full Subject Course Content' for "${subject.name}". 
      You MUST provide an educational summary for EVERY topic listed: ${subject.topics.join(', ')}.
      IMPORTANT: Use very short, concise, and easy-to-understand English sentences for each summary. 
      Avoid long paragraphs. Aim for clarity and simplicity.
      STRUCTURE: English sentence followed by Hausa translation.
      Return strictly as a JSON object: 
      {
        "title": "Full Subject Study: ${subject.name}", 
        "introduction": "Brief welcome message in simple English and Hausa", 
        "parts": [{"english": "A brief, 2-sentence summary of the topic using simple English", "hausa": "The Hausa translation"}, ...], 
        "conclusion": "Brief final thoughts in simple English and Hausa"
      }.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  },

  async continueLesson(currentLesson: LessonContent): Promise<LessonContent> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Continue the lesson titled "${currentLesson.title}". 
      Provide the NEXT sequential parts using strictly short, simple English sentences for better student understanding. 
      Return ONLY the new parts in this format: 
      {
        "parts": [{"english": "short simple sentence", "hausa": "..."}],
        "conclusion": "..."
      }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"parts": []}');
  },

  async generateExam(lessonContent: string, count: number = 30): Promise<ExamQuestion[]> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Generate exactly ${count} multiple-choice questions based on the provided content. 
      Keep questions and options short and clear.
      Content: "${lessonContent}"
      Return strictly as a JSON array of objects: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "..."}].`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  },

  async generateFullSubjectExam(subjectName: string, topics: string[]): Promise<ExamQuestion[]> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Act as an Examination Officer. Generate a 'Final Subject Exam' for "${subjectName}". 
      Cover these topics: ${topics.join(', ')}.
      Use short, simple language in the questions.
      Generate exactly 50 multiple-choice questions.
      Return strictly as a JSON array of objects: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "..."}].`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  },

  async getWisdomContent(type: string): Promise<WisdomItem[]> {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Provide 20 examples of ${type} with simple Hausa explanations. Return strictly JSON array.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  }
};
