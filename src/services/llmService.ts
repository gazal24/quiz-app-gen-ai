import { Question } from '../App';
import { getSettings, LLMSettings } from '../utils/settings';

export interface LLMConfig {
  apiKey?: string;
  provider: 'openai' | 'claude';
  model?: string;
}

const DEFAULT_CONFIG: LLMConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini'
};

export class LLMService {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async generateQuestions(
    topic: string, 
    difficulty: 'easy' | 'medium' | 'hard', 
    count: number
  ): Promise<Question[]> {
    console.log('LLM Service: Starting question generation...', { topic, difficulty, count });
    
    // Get current settings from localStorage
    const settings = getSettings();
    console.log('LLM Service: Retrieved settings:', settings ? { provider: settings.provider, hasApiKey: !!settings.apiKey } : null);
    
    if (!settings || !settings.apiKey) {
      throw new Error('No API configuration found. Please configure your API settings first.');
    }

    // Update config with current settings
    this.config = {
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model
    };

    const prompt = this.createPrompt(topic, difficulty, count);
    console.log('LLM Service: Generated prompt:', prompt);
    
    try {
      console.log('LLM Service: Using provider:', this.config.provider);
      let result: Question[];
      
      switch (this.config.provider) {
        case 'openai':
          result = await this.generateWithOpenAI(prompt);
          break;
        case 'claude':
          result = await this.generateWithClaude(prompt);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }
      
      console.log('LLM Service: Successfully generated questions:', result.length);
      return result;
    } catch (error) {
      console.error('LLM Service: Error generating questions:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate questions. Please try again.');
    }
  }

  private createPrompt(topic: string, difficulty: string, count: number): string {
    const difficultyMapping = {
      'easy': 'beginner',
      'medium': 'intermediate', 
      'hard': 'advanced'
    };
    
    const difficultyLabel = difficultyMapping[difficulty as keyof typeof difficultyMapping] || difficulty;
    
    return `Generate ${count} multiple choice quiz questions about "${topic}" at ${difficultyLabel} difficulty level.

Requirements:
- Each question should have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Questions should be educational and factually accurate
- Difficulty should be appropriate for ${difficultyLabel} level learners
- Avoid ambiguous or trick questions
- For beginner level: focus on basic concepts and definitions
- For intermediate level: include practical applications and connections
- For advanced level: cover complex scenarios and edge cases

Please respond with a JSON array in this exact format:
[
  {
    "question": "What is the main concept of ${topic}?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  }
]

The "correct" field should be the index (0-3) of the correct answer.

Topic: ${topic}
Difficulty: ${difficultyLabel}
Number of questions: ${count}`;
  }

  private async generateWithOpenAI(prompt: string): Promise<Question[]> {
    console.log('OpenAI: Starting generation...');
    const apiKey = this.config.apiKey;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please configure your API settings.');
    }

    console.log('OpenAI: Making API request...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates educational quiz questions. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    console.log('OpenAI: Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI: API error response:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI: Received response data');
    const content = data.choices[0]?.message?.content;
    console.log('OpenAI: Extracted content:', content?.substring(0, 200) + '...');
    
    return this.parseQuestions(content);
  }

  private async generateWithClaude(prompt: string): Promise<Question[]> {
    const apiKey = this.config.apiKey;
    
    if (!apiKey) {
      throw new Error('Claude API key not found. Please configure your API settings.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    return this.parseQuestions(content);
  }


  private parseQuestions(content: string): Question[] {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      // Validate each question
      return questions.map((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== 'number') {
          throw new Error(`Invalid question format at index ${index}`);
        }
        
        if (q.correct < 0 || q.correct > 3) {
          throw new Error(`Invalid correct answer index at question ${index}`);
        }

        return {
          question: q.question,
          options: q.options,
          correct: q.correct
        };
      });
    } catch (error) {
      console.error('Failed to parse LLM response:', content);
      throw new Error('Failed to parse generated questions. Please try again.');
    }
  }
}

// Singleton instance
export const llmService = new LLMService();