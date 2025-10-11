import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function VoiceTrigger({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  // Modularized response logic
  const handleTranscript = () => {
    setTranscript("Summarize Murang'a soil health");
    setTimeout(handleResponse, 1500);
  };

  const handleResponse = () => {
    const mockResponse = `Between October 1st and 2nd, Murang'a experienced a 17% rise in erosion index and a 9% drop in vegetation health. Moisture levels declined slightly. Recommend monitoring for runoff and initiating early vegetation recovery protocols.`;
    setResponse(mockResponse);
    setIsListening(false);

    if (onCommand) {
      onCommand("Murang'a");
    }
  };

  const simulateVoiceCommand = () => {
    setIsListening(true);
    setTranscript('');
    setResponse('');
    setTimeout(handleTranscript, 1000);
  };

  return (
    <div className="voice-trigger">
      <h3>🗣️ SpiritVoice Assistant</h3>

      <button
        aria-label="Trigger voice command to summarize Murang'a soil health"
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={simulateVoiceCommand}
        disabled={isListening}
      >
        {isListening ? '🎤 Listening...' : '🎤 "Summarize Murang\'a soil health"'}
      </button>

      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> "{transcript}"
        </div>
      )}

      {response && (
        <div className="voice-response">
          <strong>SpiritVoice:</strong> "{response}"
        </div>
      )}
    </div>
  );
}

// ✅ Prop validation for safer integration
VoiceTrigger.propTypes = {
  onCommand: PropTypes.func.isRequired,
};