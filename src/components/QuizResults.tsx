import React from 'react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestartQuiz: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ score, totalQuestions, onRestartQuiz }) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Excellent! 🎉";
    if (percentage >= 70) return "Great job! 👏";
    if (percentage >= 50) return "Good effort! 👍";
    return "Keep practicing! 💪";
  };

  const getPerformanceClass = () => {
    if (percentage >= 90) return "excellent";
    if (percentage >= 70) return "great";
    if (percentage >= 50) return "good";
    return "needs-improvement";
  };

  return (
    <div className="quiz-results">
      <h2>Quiz Complete!</h2>
      
      <div className="results-container">
        <div className={`performance-indicator ${getPerformanceClass()}`}>
          <div className="performance-message">{getPerformanceMessage()}</div>
        </div>
        
        <div className="score-display">
          <span className="score">{score}</span>
          <span className="separator"> / </span>
          <span className="total">{totalQuestions}</span>
        </div>
        
        <div className="score-percentage">
          <span className="percentage">{percentage}%</span>
        </div>
        
        <div className="score-breakdown">
          <div className="breakdown-item">
            <span className="label">Correct:</span>
            <span className="value correct">{score}</span>
          </div>
          <div className="breakdown-item">
            <span className="label">Incorrect:</span>
            <span className="value incorrect">{totalQuestions - score}</span>
          </div>
        </div>
        
        <button className="primary-btn" onClick={onRestartQuiz}>
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResults;