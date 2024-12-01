'use client';
import React, { useState } from 'react';

const CameraComponent = ({localVideoTrack, videoRef}) => {
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const toggleCamera = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    }
  };

  return (
    <div className='w-full h-full'>
      <div className='w-full h-[90%]'>
        <video ref={videoRef} autoPlay playsInline className='w-full h-full p-4'></video>
      </div>
      <div className='h-[10%] flex justify-center items-center border-top-2 border-white'>
        <button onClick={toggleCamera} className='px-4 py-2 bg-blue-500'>
          {cameraEnabled ? 'Desactivar Cámara' : 'Activar Cámara'}
        </button>
      </div>
    </div>
  );
};

export default CameraComponent;
