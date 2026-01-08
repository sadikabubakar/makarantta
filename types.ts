
export interface SentencePair {
  original: string;
  hausa: string;
}

export interface WordAnalysis {
  word: string;
  pronunciation?: string;
  meanings: string[];
  context?: string;
}

export interface AcademicWord {
  word: string;
  hausaMeanings: string[];
  example: string;
  exampleHausa: string;
}

export interface AcademicSentence {
  sentence: string;
  hausa: string;
  explanation: string;
}

export enum AppTab {
  HOME = 'home',
  SENTENCE_STUDY = 'sentence_study',
  WORD_BY_WORD = 'word_by_word',
  VOCAB_100 = 'vocab_100',
  SENTENCES_50 = 'sentences_50',
  HISTORY = 'history',
  VIRTUAL_SCHOOL = 'virtual_school',
  WISDOM_HUB = 'wisdom_hub'
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: AppTab;
  input?: string;
  data: any;
}

export interface LessonPart {
  english: string;
  hausa: string;
}

export interface LessonContent {
  title: string;
  introduction: string;
  parts: LessonPart[];
  conclusion: string;
}

export interface ExamQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface WisdomItem {
  text: string;
  explanation: string;
}

export interface Subject {
  name: string;
  topics: string[];
}
