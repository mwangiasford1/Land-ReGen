import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateSummary } from '../services/summaryEngine';

const VoiceCommand = ({ onLocationCommand, onSummaryRequest, data, location, voiceSettings }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  const generateVoiceSummary = useCallback(() => {
    const summary = generateSummary(data, location);
    if (summary?.spokenSummary && 'speechSynthesis' in window && voiceSettings?.enabled) {
      const utterance = new SpeechSynthesisUtterance(summary.spokenSummary);
      utterance.rate = voiceSettings?.synthesis === 'assertive' ? 1.0 : 0.8;
      utterance.pitch = voiceSettings?.synthesis === 'friendly' ? 1.2 : 1.0;
      speechSynthesis.speak(utterance);
    }
    return summary;
  }, [data, location, voiceSettings]);

  const processCommand = useCallback((command) => {
    if (command.includes("murang'a") || command.includes('muranga')) {
      onLocationCommand("Murang'a");
    } else if (command.includes('kiambu')) {
      onLocationCommand('Kiambu');
    } else if (command.includes('thika')) {
      onLocationCommand('Thika');
    }

    if (command.includes('summarize') || command.includes('summary')) {
      const summary = generateVoiceSummary();
      onSummaryRequest(true, summary);
    }
  }, [onLocationCommand, onSummaryRequest, generateVoiceSummary]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        setTranscript(speechResult);
        processCommand(speechResult);
      };

      recognitionInstance.onend = () => setIsListening(false);
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [processCommand]);

  const startListening = () => {
    if (!voiceSettings?.enabled) {
      alert('Voice commands are disabled in settings');
      return;
    }

    setTranscript('');
    if (recognition && !voiceSettings?.simulationMode) {
      setIsListening(true);
      recognition.start();
    } else {
      simulateVoiceCommand();
    }
  };

  const simulateVoiceCommand = () => {
    setIsListening(true);
    setTimeout(() => {
      const commands = [
        "summarize murang'a soil health",
        'show kiambu data',
        'thika vegetation status',
      ];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setTranscript(randomCommand);
      processCommand(randomCommand);
      setIsListening(false);
    }, 2000);
  };

  return (
    <div className="voice-command">
      <h3>🎤 Voice Commands</h3>

      <button
        aria-label="Start voice command"
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={startListening}
        disabled={isListening}
      >
        {isListening ? '🎤 Listening...' : '🎤 Start Voice Command'}
      </button>

      {transcript && (
        <div className="transcript">
          <strong>Command:</strong> "{transcript}"
        </div>
      )}

      <div className="voice-help">
        <p>Try saying:</p>
        <ul>
          <li>"Summarize Murang'a soil health"</li>
          <li>"Show Kiambu data"</li>
          <li>"Thika vegetation status"</li>
        </ul>

        <button
          className="summary-btn"
          onClick={() => {
            const summary = generateVoiceSummary();
            onSummaryRequest(true, summary);
          }}
        >
          🔊 Generate Voice Summary
        </button>
      </div>
    </div>
  );
};

VoiceCommand.propTypes = {
  onLocationCommand: PropTypes.func.isRequired,
  onSummaryRequest: PropTypes.func.isRequired,
  data: PropTypes.any,
  location: PropTypes.string,
  voiceSettings: PropTypes.shape({
    enabled: PropTypes.bool,
    simulationMode: PropTypes.bool,
    synthesis: PropTypes.oneOf(['assertive', 'friendly']),
  }),
};

export default VoiceCommand;