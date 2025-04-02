// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import socket from "../socket";
// import CodeEditor from "../components/Editor";

// const RoomPage = () => {
//   const { roomId } = useParams();
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     socket.emit("joinRoom", roomId);

//     socket.on("roomUsers", (userList) => {
//       setUsers(userList);
//     });

//     return () => {
//       socket.emit("leaveRoom", roomId); 
//       socket.off("roomUsers");
//     };
//   }, [roomId]);

//   return (
//     <div>
//       <h2>Room: {roomId}</h2>
//       <h3>Connected Users:</h3>
//       <ul>
//         {users.map((user, index) => (
//           <li key={index}>{user}</li>
//         ))}
//       </ul>
//       <CodeEditor roomId={roomId} />
//     </div>
//   );
// };

// export default RoomPage;
