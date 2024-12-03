'use client'
import { useRef, useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

export default function Home() {
  const APP_ID = "4d69db44bde34c09a76dd24e382261e2";
  const CHANNEL = "testChannel";
  const TOKEN = null;
  const RTCUID = Math.floor(Math.random() * 2032);

  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [joined, setJoined] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);

  const localPlayerRef = useRef(null);

  const joinChannel = async () => {
    try {
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      await agoraClient.join(APP_ID, CHANNEL, TOKEN, RTCUID);
      setClient(agoraClient);

      // Crear pistas de audio y video locales
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);
      setJoined(true);

      // Publicar pistas
      await agoraClient.publish([videoTrack, audioTrack]);
      videoTrack.play(localPlayerRef.current);
    } catch (error) {
      console.error("Error al conectarse con Agora:", error);
    }
  };

  useEffect(() => {
    if (!client) return;

    const handleUserPublished = async (user, mediaType) => {
      setRemoteUsers((prevUsers) => {
        if (!prevUsers.some((remoteUser) => remoteUser.uid === user.uid)) {
          return [...prevUsers, { ...user, hasVideo: mediaType === "video" }];
        }
        return prevUsers.map((remoteUser) =>
          remoteUser.uid === user.uid ? { ...remoteUser, hasVideo: mediaType === "video" } : remoteUser
        );
      });

      try {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && user.videoTrack) {
          const remoteVideoContainer = document.getElementById(`remote-video-${user.uid}`);
          if (remoteVideoContainer) {
            user.videoTrack.play(remoteVideoContainer);
          }
        }
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (error) {
        console.error("Error al suscribir al usuario remoto:", error);
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === "video" && user.videoTrack) {
        user.videoTrack.stop();
        setRemoteUsers((prevUsers) =>
          prevUsers.map((remoteUser) =>
            remoteUser.uid === user.uid ? { ...remoteUser, hasVideo: false } : remoteUser
          )
        );
      }
    };

    const handleUserLeft = (user) => {
      setRemoteUsers((prevUsers) => prevUsers.filter((remoteUser) => remoteUser.uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, [client]);

  const toggleAudio = () => {
    if (!localAudioTrack) return;

    const isMuted = !audioMuted;
    localAudioTrack.setMuted(isMuted);
    setAudioMuted(isMuted);
  };

  const toggleVideo = () => {
    if (!localVideoTrack) return;

    const isMuted = !videoMuted;
    localVideoTrack.setEnabled(!isMuted);
    setVideoMuted(isMuted);

    if (!isMuted) {
      localVideoTrack.play(localPlayerRef.current);
    } else {
      localVideoTrack.stop();
    }
  };

  const leaveChannel = async () => {
    try {
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
      setRemoteUsers([]);
    } catch (error) {
      console.error("Error al salir del canal:", error);
    }
  };

  return (
    <div id="app" className="relative w-full h-screen flex flex-col bg-[#202124] text-white">
      {!joined && (
        <div className="w-full h-full flex flex-col justify-center items-center gap-5">
          <h1 className="text-6xl mb-6 text-center font-black">Agora Video Call</h1>
          <button
            onClick={joinChannel}
            className="px-6 py-3 bg-green-600 text-white rounded-md mx-2 disabled:bg-gray-400 text-xl"
          >
            Ingresar a la sala
          </button>
        </div>
      )}

      {joined && (
        <>
          <div
            id="local-player"
            ref={localPlayerRef}
            className="w-full h-[70%] bg-black flex justify-center items-center"
          >
            {!videoMuted && <div id="local-video"></div>}
          </div>

          <div
            id="remote-player-container"
            className="absolute top-0 right-0 w-[25%] h-full bg-[#202124] flex flex-col items-center gap-4 p-4 overflow-y-auto"
          >
            {remoteUsers.map((user) => (
              <div
                key={user.uid}
                id={`remote-player-${user.uid}`}
                className="w-[100%] h-[120px] bg-gray-800 border-2 border-white flex flex-col justify-center items-center text-white rounded-lg"
              >
                <div className="w-full h-full">
                  <div id={`remote-video-${user.uid}`} className="w-full h-full"></div>
                  {!user.hasVideo && (
                    <div className="flex flex-col justify-center items-center w-full h-full">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex justify-center items-center text-xl font-bold">
                        {user.uid.toString().charAt(0).toUpperCase()}
                      </div>
                      <span className="mt-2 text-sm text-gray-300">No Video</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 w-full flex justify-center items-center gap-4 py-4 bg-black">
            <button onClick={toggleAudio} className="px-6 py-3 bg-[#1e8e3e] text-white rounded-md">
              {audioMuted ? "Unmute Audio" : "Mute Audio"}
            </button>
            <button onClick={toggleVideo} className="px-6 py-3 bg-[#ffb400] text-white rounded-md">
              {videoMuted ? "Unmute Video" : "Mute Video"}
            </button>
            <button onClick={leaveChannel} className="px-6 py-3 bg-[#d93025] text-white rounded-md">
              Leave
            </button>
          </div>
        </>
      )}
    </div>
  );
}
