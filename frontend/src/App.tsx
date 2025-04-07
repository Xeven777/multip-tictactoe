// client/src/App.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:4000"); // Replace with your backend URL

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [gameCreated, setGameCreated] = useState(false);
  const [players, setPlayers] = useState([]);
  const [roomFullMessage, setRoomFullMessage] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("gameCreated", (data) => {
      setGameCreated(true);
    });

    socket.on("gameStart", (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setPlayers(data.players);
      setGameStarted(true);
    });

    socket.on("moveMade", (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setWinner(data.winner);
      setIsDraw(data.isDraw);
    });

    socket.on("gameReset", (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setWinner(data.winner);
      setIsDraw(false);
    });

    socket.on("roomFull", (data) => {
      setRoomFullMessage(data.message);
    });

    // Clean up the socket when the component unmounts
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("gameStart");
      socket.off("moveMade");
      socket.off("gameReset");
      socket.off("roomFull");
    };
  }, []);

  const joinGame = () => {
    if (username !== "" && room !== "") {
      socket.emit("joinGame", { username, room });
    }
  };

  const handleCellClick = (row, col) => {
    if (
      !gameStarted ||
      winner ||
      board[row][col] !== "" ||
      currentPlayer !== username
    ) {
      return; // Don't allow moves if game isn't started, is won, cell is occupied, or not their turn.
    }
    socket.emit("makeMove", { room, row, col, username });
  };

  const resetGame = () => {
    socket.emit("resetGame", { room });
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <div className="joinGameContainer">
          <h3>Join or Create Game</h3>
          <input
            type="text"
            placeholder="Username..."
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID (or create a new one)..."
            onChange={(event) => setRoom(event.target.value)}
          />
          <button onClick={joinGame}>Join Game</button>
          {roomFullMessage && <p style={{ color: "red" }}>{roomFullMessage}</p>}
        </div>
      ) : (
        <div className="gameContainer">
          <h1>Tic-Tac-Toe</h1>
          <p>
            Player 1: {players[0]} (X)
            <br />
            Player 2: {players[1] || "Waiting for Player 2"} (O)
          </p>
          {currentPlayer && <p>Current Player: {currentPlayer}</p>}
          {winner && <p>Winner: {winner === username ? "You" : winner}</p>}
          {isDraw && <p>It's a Draw!</p>}
          <div className="board">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className="cell"
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {winner || isDraw ? (
            <button onClick={resetGame}>Play Again</button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default App;
