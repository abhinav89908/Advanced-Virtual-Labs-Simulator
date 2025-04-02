// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const [roomId, setRoomId] = useState("");
//   const navigate = useNavigate();

//   const handleCreateRoom = () => {
//     const newRoomId = Math.random().toString(36).substring(2, 8);
//     navigate(`/room/${newRoomId}`);
//   };

//   const handleJoinRoom = () => {
//     if (roomId.trim()) {
//       navigate(`/room/${roomId}`);
//     }
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h1>Virtual Lab Simulator</h1>
//       <button onClick={handleCreateRoom}>Create Room</button>
//       <br /><br />
//       <input
//         type="text"
//         placeholder="Enter Room ID"
//         value={roomId}
//         onChange={(e) => setRoomId(e.target.value)}
//       />
//       <button onClick={handleJoinRoom}>Join Room</button>
//     </div>
//   );
// };

// export default Home;
