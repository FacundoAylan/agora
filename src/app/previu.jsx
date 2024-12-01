'use client'
import { useEffect, useRef, useState } from "react";
import MicrophoneComponent from "./MicrophoneControl";
import CameraComponent from "./video";
import AgoraRTC from "agora-rtc-sdk-ng";
import CreateRoomForm from "./form";
import UserList from "./UserList";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const videoRef = useRef(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);

  const initAgora = async (channelName, userName) => {
    const appId = "4d69db44bde34c09a76dd24e382261e2"; // Replace with your Agora App ID
    const token = null;
    const rtcUid = Math.floor(Math.random() * 2032);

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(client);

    try {
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      await client.join(appId, channelName, token, rtcUid);
      await client.publish([audioTrack, videoTrack]);

      if (videoRef.current && videoTrack) {
        videoTrack.play(videoRef.current);
      }

      // Registering event handlers
      client.on("user-joined", handleUserJoined);
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      client.on("user-left", handleUserLeft);
      console.log("Eventos registrados");
    } catch (error) {
      console.error("Error starting camera and joining channel:", error);
    }
  };

  const handleUserJoined = (user) => {
    if (!user || !user.uid) return;
    setUsers((prevUsers) => !prevUsers.some((u) => u.uid === user.uid) ? [...prevUsers, user] : prevUsers);
  };

  const handleUserPublished = async (user, mediaType) => {
    if (!user || !user.uid) return;
  
    console.log(`Usuario publicado: ${user.uid}, Tipo de medio: ${mediaType}`);
  
    if (client) {
      await client.subscribe(user, mediaType);
  
      if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.uid === user.uid ? { ...u, videoTrack: remoteVideoTrack } : u
          )
        );
      } else if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
    }
  };
  
  

  const handleUserUnpublished = (user, mediaType) => {
    if (!user || !user.uid) return;
    console.log(`Usuario dejó de publicar: ${user.uid}, Tipo de medio: ${mediaType}`);
    if (mediaType === "video") {
      const remoteVideoContainer = document.getElementById(user.uid.toString());
      if (remoteVideoContainer) remoteVideoContainer.remove();
    }
  };

  const handleUserLeft = (user) => {
    if (!user || !user.uid) return;
    console.log(`Usuario salió: ${user.uid}`);
    setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    const remoteVideoContainer = document.getElementById(user.uid.toString());
    if (remoteVideoContainer) remoteVideoContainer.remove();
  };

  const [userName, setUserName] = useState("");
  const [channelName, setChannelName] = useState("");

  const handleJoinChannel = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !channelName.trim()) {
      alert("Both fields are required.");
      return;
    }

    try {
      await initAgora(channelName.trim(), userName.trim());
      console.log(`Usuario ${userName} se unió a la sala ${channelName}`);
    } catch (error) {
      console.error("Error joining channel:", error);
    }
  };

  const leaveChannel = async () => {
    try {
      if (client) {
        client.off("user-joined", handleUserJoined);
        client.off("user-published", handleUserPublished);
        client.off("user-unpublished", handleUserUnpublished);
        client.off("user-left", handleUserLeft);

        await client.leave();
        localAudioTrack?.stop();
        localAudioTrack?.close();
        localVideoTrack?.stop();
        localVideoTrack?.close();
        setClient(null);
        setLocalAudioTrack(null);
        setLocalVideoTrack(null);
        setUsers([]);
        console.log("Has salido del canal");
      }
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  };

  return (
    <div className="w-full h-screen relative">
      {!client && (
        <CreateRoomForm
          userName={userName}
          setUserName={setUserName}
          channelName={channelName}
          setChannelName={setChannelName}
          handleJoinChannel={handleJoinChannel}
        />
      )}
      {client && (
        <> 
        <div className="w-[80%] h-full"> 
          <CameraComponent users={users} localVideoTrack={localVideoTrack} videoRef={videoRef} /> 
        </div> 
        <div className="absolute bottom-2 left-12"> 
          <MicrophoneComponent localAudioTrack={localAudioTrack} /> 
        </div> 
        <div className="absolute bottom-2 right-[23%] z-10">
          <button onClick={leaveChannel} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 pointer" > 
            Leave Channel 
          </button> 
        </div> 
        <UserList users={users} /> 
      </>
      )}
    </div>
  );
}
