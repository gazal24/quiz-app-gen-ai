import { Question } from '../App';
import { llmService } from '../services/llmService';

export const generateQuestionsWithLLM = async (
  topic: string, 
  difficulty: string, 
  count: number
): Promise<Question[]> => {
  console.log('QuestionBank: generateQuestionsWithLLM called with topic:', topic, 'difficulty:', difficulty, 'count:', count);
  return await llmService.generateQuestions(topic, difficulty as 'easy' | 'medium' | 'hard', count);
};