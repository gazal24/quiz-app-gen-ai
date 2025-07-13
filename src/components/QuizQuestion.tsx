import React, { useState } from 'react';
import { Question } from '../App';

interface QuizQuestionProps {
  question: Question;
  currentQuestionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
  onAnswerSelected: (selectedOption: number) => void;
  onNextQuestion: () => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  currentQuestionNumber,
  totalQuestions,
  topic,
  difficulty,
  onAnswerSelected,
  onNextQuestion,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (optionIndex: number) => {
    if (selectedOption !== null) return; // Prevent multiple selections
    
    setSelectedOption(optionIndex);
    setShowResult(true);
    onAnswerSelected(optionIndex);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowResult(false);
    onNextQuestion();
  };

  const getOptionClassName = (optionIndex: number) => {
    if (!showResult) {
      return 'option-btn';
    }
    
    if (optionIndex === question.correct) {
      return 'option-btn correct';
    }
    
    if (optionIndex === selectedOption && selectedOption !== question.correct) {
      return 'option-btn incorrect';
    }
    
    return 'option-btn';
  };

  return (
    <div className="quiz-question">
      <div className="quiz-header">
        <div className="quiz-info">
          <span className="topic">{topic}</span> | <span className="difficulty">{difficulty}</span>
        </div>
        <div className="question-counter">
          Question {currentQuestionNumber} of {totalQuestions}
        </div>
      </div>

      <div className="question-container">
        <h3 className="question-text">{question.question}</h3>
        
        <div className="options-container">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={getOptionClassName(index)}
              onClick={() => handleOptionClick(index)}
              disabled={showResult}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-controls">
        <button
          className="primary-btn"
          disabled={!showResult}
          onClick={handleNextQuestion}
        >
          {currentQuestionNumber === totalQuestions ? 'See Results' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default QuizQuestion;