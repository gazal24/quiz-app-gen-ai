import React, { useState, useEffect } from 'react';
import './App.css';
import QuizSetup from './components/QuizSetup';
import QuizQuestion from './components/QuizQuestion';
import QuizResults from './components/QuizResults';
import ApiSettings from './components/ApiSettings';
import { LLMSettings, getSettings } from './utils/settings';
import { ReactComponent as Logo } from './assets/logo.svg';

export interface QuizConfig {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Question {
  question: string;
  options: string[];
  correct: number;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<'setup' | 'quiz' | 'results' | 'loading'>('setup');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [llmSettings, setLlmSettings] = useState<LLMSettings | null>(null);

  useEffect(() => {
    // Load settings on app startup
    const savedSettings = getSettings();
    if (savedSettings) {
      setLlmSettings(savedSettings);
    }
  }, []);

  const handleStartQuiz = async (config: QuizConfig) => {
    console.log('App: Starting AI-powered quiz with config:', config);
    setCurrentScreen('loading');
    setError(null);
    
    try {
      const { generateQuestionsWithLLM } = await import('./utils/questionBank');
      
      console.log('App: Calling generateQuestionsWithLLM with topic:', config.topic);
      const generatedQuestions = await generateQuestionsWithLLM(config.topic, config.difficulty, totalQuestions);
      
      setQuizConfig(config);
      setQuestions(generatedQuestions);
      setCurrentQuestion(0);
      setScore(0);
      setCurrentScreen('quiz');
    } catch (error) {
      console.error('Failed to generate questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
      setCurrentScreen('setup');
    }
  };

  const handleAnswerQuestion = (selectedOption: number) => {
    if (selectedOption === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentScreen('results');
    }
  };

  const handleRestartQuiz = () => {
    setCurrentScreen('setup');
    setQuizConfig(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setError(null);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleSettingsSaved = (settings: LLMSettings) => {
    setLlmSettings(settings);
    setShowSettings(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo-container">
          <Logo className="app-logo" />
          <h1>Quiz Generator AI</h1>
        </div>
      </header>

      <main className="app-main">
        {currentScreen === 'setup' && (
          <QuizSetup 
            onStartQuiz={handleStartQuiz} 
            totalQuestions={totalQuestions} 
            error={error}
            onShowSettings={handleShowSettings}
            hasApiSettings={!!llmSettings}
          />
        )}

        {currentScreen === 'loading' && (
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <h2>Generating Questions...</h2>
            <p>Please wait while we create your personalized quiz</p>
          </div>
        )}

        {currentScreen === 'quiz' && quizConfig && questions.length > 0 && (
          <QuizQuestion
            question={questions[currentQuestion]}
            currentQuestionNumber={currentQuestion + 1}
            totalQuestions={totalQuestions}
            topic={quizConfig.topic}
            difficulty={quizConfig.difficulty}
            onAnswerSelected={handleAnswerQuestion}
            onNextQuestion={handleNextQuestion}
          />
        )}

        {currentScreen === 'results' && (
          <QuizResults
            score={score}
            totalQuestions={totalQuestions}
            onRestartQuiz={handleRestartQuiz}
          />
        )}

        {showSettings && (
          <ApiSettings 
            onClose={handleCloseSettings}
            onSettingsSaved={handleSettingsSaved}
          />
        )}
      </main>
    </div>
  );
}

export default App;
