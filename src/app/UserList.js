import React, { useEffect } from "react";

const UserList = ({ users }) => {
  useEffect(() => {
    // Asegúrate de que se reproduzca el video de cada usuario en su contenedor
    users.forEach((user) => {
      if (user.videoTrack) {
        const videoContainer = document.getElementById(`user-video-${user.uid}`);
        if (videoContainer && !videoContainer.hasChildNodes()) {
          user.videoTrack.play(videoContainer);
        }
      }
    });

    // Limpiar cuando los usuarios dejan de estar presentes
    return () => {
      users.forEach((user) => {
        if (user.videoTrack) {
          const videoContainer = document.getElementById(`user-video-${user.uid}`);
          if (videoContainer && videoContainer.hasChildNodes()) {
            user.videoTrack.stop();
          }
        }
      });
    };
  }, [users]);

  return (
    <div className="absolute w-[20%] h-full top-0 right-0 overflow-auto bg-gray-200 p-2">
      {users.map((user) => (
        <div
          key={user.uid}
          className="w-full h-32 bg-gray-100 mb-2 rounded-lg shadow-lg overflow-hidden"
        >
          <div
            id={`user-video-${user.uid}`}
            className="w-full h-[200px] bg-black"
          ></div>
          <p className="text-center text-sm font-medium mt-1">{`:User  ${user.uid}`}</p>
        </div>
      ))}
    </div>
  );
};

export default UserList;