'use client';
import React, { useEffect, useState } from 'react';

const MicrophoneComponent = ({localAudioTrack}) => {

  const [isSpeaking, setIsSpeaking] = useState(false); // Para saber si se está escuchando
  const [micEnabled, setMicEnabled] = useState(true); // Estado para saber si el micrófono está habilitado

  useEffect(() => {
    if (localAudioTrack) {
      // Monitorear el estado del micrófono
      const checkAudioLevel = () => {
        const audioLevel = localAudioTrack.getVolumeLevel();
        setIsSpeaking(audioLevel > 0); // Si el nivel de audio es mayor que 0, se está hablando
      };

      const interval = setInterval(checkAudioLevel, 100); // Verificar cada 100 ms

      return () => clearInterval(interval);
    }
  }, [localAudioTrack]);

  const toggleMicrophone = () => {
    if (localAudioTrack) {
      micEnabled ? localAudioTrack.setEnabled(false) : localAudioTrack.setEnabled(true);
      setMicEnabled(!micEnabled); // Cambia el estado del micrófono
    }
  };

  return (
    <button 
      onClick={toggleMicrophone} 
      className={`rounded-lg px-4 py-2 ${isSpeaking ? 'border-2 border-green-500' : 'border-2 border-red-800'}`}
    >
      {micEnabled ? 'Desactivar Micrófono' : 'Activar Micrófono'}
    </button>
  );
};

export default MicrophoneComponent;