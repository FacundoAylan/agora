// components/AgoraRoom.js

const AgoraRoom = ({ joined, users}) => {

  return (
    <div>
      {joined && <button onClick={joinChannel}>Unirse al Canal</button>}
      <div>
        <h3>Usuarios conectados:{users.uid}</h3>
        {users.map((user) => (
          <div key={user.uid}>
            <h4>Usuario: {user.uid}</h4>
            <div
              ref={remoteVideoRefs.current[user.uid]}
              style={{ width: "400px", height: "300px" }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgoraRoom;
