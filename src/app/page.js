'use client'
import { useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

export default function Home() {
  const APP_ID = "4d69db44bde34c09a76dd24e382261e2"; // Reemplaza con tu App ID de Agora
  const CHANNEL = "testChannel";
  const TOKEN = null; // Usa un token si tu proyecto requiere autenticación
  const RTCUID = Math.floor(Math.random() * 2032);

  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [joined, setJoined] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);  // Inicialmente muteado
  const [videoMuted, setVideoMuted] = useState(true);  // Inicialmente deshabilitado
  const [clientReady, setClientReady] = useState(false);  // Estado para verificar si el cliente está listo
  const [remoteUsers, setRemoteUsers] = useState([]); // Para almacenar los usuarios remotos

  const localPlayerRef = useRef(null);
  const remotePlayerRef = useRef(null);

  // Función para unirse al canal
  const joinChannel = async () => {
    try {
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      await agoraClient.join(APP_ID, CHANNEL, TOKEN, RTCUID);
      console.log("Conectado a Agora");

      // Crear las pistas de video y audio
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      // No publicamos las pistas aún, ya que están deshabilitadas por defecto
      videoTrack.setEnabled(false);  // Desactivar la cámara al unirse
      audioTrack.setMuted(true);  // Inhabilitar el micrófono al unirse

      // Publicar las pistas de video y audio
      await agoraClient.publish([videoTrack, audioTrack]);

      // Asignamos las pistas locales
      videoTrack.play(localPlayerRef.current);
      audioTrack.play();

      // Solo después de esto, registrar los eventos
      agoraClient.on("user-published", handleUserPublished);
      agoraClient.on("user-unpublished", handleUserUnpublished);

      setClient(agoraClient);
      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);
      setJoined(true);
      setClientReady(true);  // Ahora el cliente está listo
    } catch (error) {
      console.error("Error al conectarse con Agora:", error);
    }
  };

  // Función para alternar el audio
  const toggleAudio = () => {
    if (!clientReady || !localAudioTrack) {
      console.error("El cliente aún no está listo o no se ha inicializado la pista de audio.");
      return;
    }

    if (audioMuted) {
      localAudioTrack.setMuted(false); // Desmutea el micrófono
    } else {
      localAudioTrack.setMuted(true); // Mutea el micrófono
    }
    setAudioMuted(!audioMuted);
  };

  // Función para alternar el video
  const toggleVideo = () => {
    if (!clientReady || !localVideoTrack) {
      console.error("El cliente aún no está listo o no se ha inicializado la pista de video.");
      return;
    }

    if (videoMuted) {
      localVideoTrack.setEnabled(true); // Habilita la cámara
    } else {
      localVideoTrack.setEnabled(false); // Deshabilita la cámara
    }
    setVideoMuted(!videoMuted);
  };

  // Función para manejar usuarios remotos
  const handleUserPublished = async (user, mediaType) => {
    // Verifica si el cliente está listo antes de manejar los usuarios remotos
    if (!clientReady) {
      console.log("Cliente no está listo, esperando...");
      return; // Salir si el cliente no está listo
    }

    console.log("Usuario publicado:", user, "Tipo de medio:", mediaType);

    setRemoteUsers((prevUsers) => [...prevUsers, user]);

    console.log('Usuarios ingresados: ', remoteUsers.length);
    // Suscribirse a las pistas de los usuarios remotos
    try {
      await client.subscribe(user, mediaType);

      // Manejar video remoto
      if (mediaType === "video") {
        const remotePlayerContainer = document.createElement("div");
        remotePlayerContainer.id = `remote-player-${user.uid}`;
        remotePlayerContainer.className = "video-container remote-video";
        remotePlayerRef.current.appendChild(remotePlayerContainer);

        // Reproducir el video remoto en el contenedor creado
        user.videoTrack.play(remotePlayerContainer);
      }

      // Manejar audio remoto
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    } catch (error) {
      console.error("Error al suscribir al usuario remoto:", error);
    }
  };

  // Función para manejar la salida de un usuario
  const handleUserUnpublished = (user) => {
    const remotePlayerContainer = document.getElementById(`remote-player-${user.uid}`);
    if (remotePlayerContainer) remotePlayerContainer.remove();

    setRemoteUsers((prevUsers) =>
      prevUsers.filter((remoteUser) => remoteUser.uid !== user.uid)
    );
  };

  // Función para abandonar el canal
  const leaveChannel = async () => {
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }

    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }

    if (client) {
      await client.leave();
    }

    setClient(null);
    setLocalVideoTrack(null);
    setLocalAudioTrack(null);
    setJoined(false);
    setClientReady(false);  // Reiniciar el estado de "cliente listo"
    setRemoteUsers([]);
  };

  return (
    <div id="app" className="relative w-full h-screen flex flex-col items-center justify-between bg-[#202124] text-white">
      {/* Mostrar solo el botón Join si el usuario no ha ingresado */}
      {!joined && (
        <div className="w-full h-full flex flex-col justify-center items-center gap-5">
          <h1 className="text-6xl mb-6 text-center font-black">Agora Video Call</h1>
          <button
            onClick={joinChannel}
            disabled={joined}
            className="px-6 py-3 bg-green-600 text-white rounded-md mx-2 disabled:bg-gray-400 text-xl"
          >
            Ingresar a la sala
          </button>
        </div>
      )}

      {/* Contenedor de botones de audio y video */}
      {joined && (
        <div className="absolute w-full h-[10%] flex justify-center items-center gap-4 bottom-0">
          <button
            onClick={toggleAudio}
            className="px-6 py-3 bg-[#1e8e3e] text-white rounded-md"
          >
            {audioMuted ? "Unmute Audio" : "Mute Audio"}
          </button>
          <button
            onClick={toggleVideo}
            className="px-6 py-3 bg-[#ffb400] text-white rounded-md"
          >
            {videoMuted ? "Unmute Video" : "Mute Video"}
          </button>
          <button
            onClick={leaveChannel}
            className="px-6 py-3 bg-[#d93025] text-white rounded-md"
          >
            Leave
          </button>
        </div>
      )}

      {/* Video local */}
      <div
        id="local-player"
        ref={localPlayerRef}
        className={`w-full h-[90%] bg-black rounded-lg mb-4 ${joined ? "" : "hidden"} ${audioMuted ? "" : "border-2 border-green-500"}`}
      ></div>

      {/* Video remoto */}
      {remoteUsers.length > 0 && (
        <div
          id="remote-player-container"
          ref={remotePlayerRef}
          className="absolute top-0 right-0 w-[25%] h-[90%] bg-[#202124] flex justify-center items-center"
        >
          {remoteUsers.map((user) => (
            <div
              key={user.uid}
              id={`remote-player-${user.uid}`}
              className="w-[100px] h-[100px] bg-white border-2 border-white mb-4"
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
