import React, { useState, useEffect } from 'react';
import { LLMSettings, getSettings, saveSettings, validateApiKey } from '../utils/settings';

interface ApiSettingsProps {
  onClose: () => void;
  onSettingsSaved: (settings: LLMSettings) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ onClose, onSettingsSaved }) => {
  const [provider, setProvider] = useState<'openai' | 'claude'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Load existing settings
    const existingSettings = getSettings();
    if (existingSettings) {
      setProvider(existingSettings.provider);
      setApiKey(existingSettings.apiKey);
      setModel(existingSettings.model || '');
    }
  }, []);

  useEffect(() => {
    setIsValid(validateApiKey(provider, apiKey));
    setTestResult(null);
  }, [provider, apiKey]);

  const getDefaultModel = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'gpt-4o-mini';
      case 'claude':
        return 'claude-3-haiku-20240307';
      default:
        return '';
    }
  };

  const handleProviderChange = (newProvider: 'openai' | 'claude') => {
    setProvider(newProvider);
    setModel(getDefaultModel(newProvider));
    setApiKey('');
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!isValid) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      // Simple test to validate the API key works
      const testSettings: LLMSettings = {
        provider,
        apiKey,
        model: model || getDefaultModel(provider)
      };

      const response = await testApiConnection(testSettings);
      setTestResult({ success: true, message: 'Connection successful!' });
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!isValid) return;

    const settings: LLMSettings = {
      provider,
      apiKey,
      model: model || getDefaultModel(provider)
    };

    saveSettings(settings);
    onSettingsSaved(settings);
    onClose();
  };

  const providerOptions = [
    {
      value: 'openai',
      label: 'OpenAI (GPT)',
      description: 'ChatGPT models including GPT-3.5, GPT-4, and GPT-4o',
      models: ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o']
    },
    {
      value: 'claude',
      label: 'Anthropic (Claude)',
      description: 'Claude 3 models for advanced reasoning',
      models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
    }
  ];

  const selectedProvider = providerOptions.find(p => p.value === provider);

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>🤖 AI Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="form-group">
            <label>Choose AI Provider:</label>
            <div className="provider-selection">
              {providerOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`provider-card ${provider === option.value ? 'selected' : ''}`}
                  onClick={() => handleProviderChange(option.value as 'openai' | 'claude')}
                >
                  <div className="provider-header">
                    <h3>{option.label}</h3>
                  </div>
                  <p className="provider-description">{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="api-key">
              API Key for {selectedProvider?.label}:
            </label>
            <div className="api-key-input">
              <input
                type={showKey ? 'text' : 'password'}
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${selectedProvider?.label} API key...`}
                className={isValid ? 'valid' : ''}
              />
              <button 
                type="button" 
                className="show-key-btn"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="api-key-help">
              <p>
                Get your API key from:{' '}
                {provider === 'openai' ? (
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                    OpenAI Platform
                  </a>
                ) : (
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                    Anthropic Console
                  </a>
                )}
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="model">Model (optional):</label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {selectedProvider?.models.map(modelName => (
                <option key={modelName} value={modelName}>
                  {modelName}
                </option>
              ))}
            </select>
          </div>

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              {testResult.message}
            </div>
          )}

          <div className="settings-actions">
            <button
              className="test-btn"
              onClick={testConnection}
              disabled={!isValid || isTesting}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              className="primary-btn"
              onClick={handleSave}
              disabled={!isValid}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple API connection test
async function testApiConnection(settings: LLMSettings): Promise<boolean> {
  const testPrompt = "Say 'Hello' in JSON format: {\"message\": \"Hello\"}";
  
  try {
    if (settings.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error?.message || 'Authentication failed'}`);
      }
    } else if (settings.provider === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: settings.model || 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: testPrompt }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error?.message || 'Authentication failed'}`);
      }
    }

    return true;
  } catch (error) {
    console.error('API test failed:', error);
    throw error;
  }
}

export default ApiSettings;