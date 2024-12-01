export default function CreateRoomForm({
  userName,
  setUserName,
  channelName,
  setChannelName,
  handleJoinChannel,
}) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <form
        onSubmit={handleJoinChannel}
        className="p-6 bg-gray-100 rounded-lg shadow-md w-96 text-black"
      >
        <h2 className="text-xl font-bold mb-4">Unirse a una Sala</h2>
        <div className="mb-4">
          <label
            htmlFor="userName"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="channelName"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre de la Sala
          </label>
          <input
            type="text"
            id="channelName"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600"
        >
          Unirse
        </button>
      </form>
    </div>
  );
}
