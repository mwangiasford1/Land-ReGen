import React, { useState } from 'react';

export default function VoiceTrigger({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const simulateVoiceCommand = () => {
    setIsListening(true);
    setTranscript('');
    setResponse('');

    // Simulate listening
    setTimeout(() => {
      setTranscript('Summarize Murang\'a soil health');
      
      setTimeout(() => {
        const mockResponse = `Between October 1st and 2nd, Murang'a experienced a 17% rise in erosion index and a 9% drop in vegetation health. Moisture levels declined slightly. Recommend monitoring for runoff and initiating early vegetation recovery protocols.`;
        setResponse(mockResponse);
        setIsListening(false);
        
        // Trigger data reload
        if (onCommand) {
          onCommand('Murang\'a');
        }
      }, 1500);
    }, 1000);
  };

  return (
    <div className="voice-trigger">
      <h3>🗣️ SpiritVoice Assistant</h3>
      
      <button 
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