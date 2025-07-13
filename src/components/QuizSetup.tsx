import React, { useState } from 'react';
import { QuizConfig } from '../App';

interface QuizSetupProps {
  onStartQuiz: (config: QuizConfig) => void;
  totalQuestions: number;
  error?: string | null;
  onShowSettings: () => void;
  hasApiSettings: boolean;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ onStartQuiz, totalQuestions, error, onShowSettings, hasApiSettings }) => {
  const [selectedTopicValue, setSelectedTopicValue] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const [useLLM, setUseLLM] = useState(false);

  const predefinedTopics = [
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'kubernetes', label: 'Kubernetes' },
    { value: 'flights', label: 'Aviation & Flights' },
    { value: 'aws', label: 'Amazon Web Services' },
    { value: 'geopolitics', label: 'Geopolitics' },
    { value: 'programming', label: 'Programming' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'custom', label: 'Custom Topic' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Beginner' },
    { value: 'medium', label: 'Intermediate' },
    { value: 'hard', label: 'Advanced' },
  ];

  const handleTopicSelect = (topicValue: string) => {
    setSelectedTopicValue(topicValue);
  };

  const handleCustomTopicChange = (value: string) => {
    setCustomTopic(value);
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
  };

  const handleStartQuiz = () => {
    // Get the full topic name - combine predefined topic with custom theme if both exist
    const selectedTopicLabel = selectedTopicValue ? 
      predefinedTopics.find(t => t.value === selectedTopicValue)?.label || selectedTopicValue : 
      '';
    
    let topic = '';
    if (selectedTopicValue === 'custom') {
      // For custom topic selection, use only the custom input
      topic = customTopic.trim();
    } else if (selectedTopicLabel && customTopic.trim()) {
      // Combine predefined topic with custom subtopic: "Kubernetes - volumes"
      topic = `${selectedTopicLabel} - ${customTopic.trim()}`;
    } else if (customTopic.trim()) {
      // Only custom topic (when no predefined topic selected)
      topic = customTopic.trim();
    } else if (selectedTopicLabel && selectedTopicValue !== 'custom') {
      // Only predefined topic
      topic = selectedTopicLabel;
    }
    
    console.log('QuizSetup: Starting AI quiz with topic:', topic, 'selectedTopicValue:', selectedTopicValue, 'selectedTopicLabel:', selectedTopicLabel, 'customTopic:', customTopic);
    
    if (topic && selectedDifficulty) {
      const config: QuizConfig = {
        topic,
        difficulty: selectedDifficulty,
      };
      
      console.log('QuizSetup: Final config:', config);
      onStartQuiz(config);
    }
  };

  const isStartEnabled = (customTopic.trim() || (selectedTopicValue && selectedTopicValue !== 'custom')) && selectedDifficulty;

  return (
    <div className="quiz-setup">
      <div className="setup-header">
        <h2>Setup Your Quiz</h2>
        <button className="settings-btn" onClick={onShowSettings}>
          ⚙️ API Settings
        </button>
      </div>
      
      <div className="form-group">
        <label htmlFor="topic-select">Choose a Topic:</label>
        <select
          id="topic-select"
          value={selectedTopicValue}
          onChange={(e) => handleTopicSelect(e.target.value)}
        >
          <option value="">Select a topic...</option>
          {predefinedTopics.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="custom-topic">
          {selectedTopicValue === 'custom' ? 'Enter your custom topic:' : 
           selectedTopicValue ? 'Add a specific theme/subtopic:' : 
           'Or enter a custom topic:'}
        </label>
        <input
          type="text"
          id="custom-topic"
          placeholder={
            selectedTopicValue === 'custom' 
              ? "e.g., Machine Learning, Ancient Rome, Photography..." 
              : selectedTopicValue 
                ? `e.g., volumes, networking, security...` 
                : "Enter your own topic..."
          }
          value={customTopic}
          onChange={(e) => handleCustomTopicChange(e.target.value)}
        />
        {selectedTopicValue === 'custom' && customTopic.trim() && (
          <p className="help-text">
            Final topic: <strong>{customTopic.trim()}</strong>
          </p>
        )}
        {selectedTopicValue && selectedTopicValue !== 'custom' && customTopic.trim() && (
          <p className="help-text">
            Final topic: <strong>{predefinedTopics.find(t => t.value === selectedTopicValue)?.label} - {customTopic.trim()}</strong>
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Difficulty Level:</label>
        <div className="difficulty-buttons">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              className={`difficulty-btn ${selectedDifficulty === diff.value ? 'selected' : ''}`}
              onClick={() => handleDifficultySelect(diff.value as 'easy' | 'medium' | 'hard')}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!hasApiSettings && (
        <div className="api-setup-notice">
          <p>🤖 <strong>AI-Powered Quiz Generation</strong></p>
          <p>This app uses AI to create personalized questions on any topic. Click "⚙️ API Settings" to configure your OpenAI or Claude API key to get started!</p>
        </div>
      )}

      <div className="single-button-container">
        <button
          className={`primary-btn ai-btn ${!hasApiSettings ? 'disabled-notice' : ''}`}
          disabled={!isStartEnabled || !hasApiSettings}
          onClick={handleStartQuiz}
          title={!hasApiSettings ? "Configure API settings first" : "Generate personalized questions with AI"}
        >
          🚀 Generate Quiz with AI
        </button>
      </div>
    </div>
  );
};

export default QuizSetup;