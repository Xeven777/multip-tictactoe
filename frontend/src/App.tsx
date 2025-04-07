import { useState, useEffect } from "react";
import io from "socket.io-client";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Alert, AlertDescription } from "./components/ui/alert";
import { cn } from "./lib/utils";
import cross from "@/assets/cross.png";
import circle from "@/assets/circle.png";
import gamepad from "@/assets/gamepad.png";
import ttt1 from "@/assets/5701567.webp";
import ttt2 from "@/assets/8726950.webp";

const socket = io("http://localhost:4000");

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

    socket.on("gameCreated", () => {
      setGameCreated(true);
      setGameStarted(true);
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

  const handleCellClick = (row: number, col: number) => {
    if (
      !gameStarted ||
      winner ||
      board[row][col] !== "" ||
      currentPlayer !== username
    ) {
      return;
    }
    socket.emit("makeMove", { room, row, col, username });
  };

  const resetGame = () => {
    socket.emit("resetGame", { room });
  };

  return (
    <div className="min-h-screen bg relative flex items-center justify-center p-4">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20 select-none pointer-events-none" />
      <img
        src={cross}
        alt=""
        className="absolute w-40 top-20 left-20"
        fetchPriority="low"
      />
      <img
        fetchPriority="low"
        src={ttt1}
        alt=""
        className="absolute w-40 bottom-20 left-20"
      />
      <img
        fetchPriority="low"
        src={ttt2}
        alt=""
        className="absolute w-40 left-20 -scale-x-100"
      />
      <img
        fetchPriority="low"
        src={ttt1}
        alt=""
        className="absolute w-40 right-20 -scale-x-100"
      />

      <img
        fetchPriority="low"
        src={circle}
        alt=""
        className="absolute w-40 bottom-20 right-20"
      />
      <img
        fetchPriority="low"
        src={gamepad}
        alt=""
        className="absolute w-40 top-20 right-20"
      />
      {!gameStarted ? (
        <Card className="w-full max-w-md z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Tic Tac Toe</CardTitle>
            <CardDescription>
              Join an existing game or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter your username"
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="room" className="text-sm font-medium">
                Room ID
              </label>
              <Input
                id="room"
                placeholder="Enter room ID or create a new one"
                onChange={(event) => setRoom(event.target.value)}
              />
            </div>
            {roomFullMessage && (
              <Alert variant="destructive">
                <AlertDescription>{roomFullMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={joinGame} className="w-full">
              Join Game
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-md z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Tic Tac Toe
            </CardTitle>
            {gameCreated && players.length < 2 ? (
              <AlertDescription className="text-center text-slate-500">
                Waiting for Player 2 to join...
              </AlertDescription>
            ) : (
              <div className="flex justify-center space-x-6 mt-2">
                <div className="text-center">
                  <div className="flex text-4xl font-extrabold text-white items-center justify-center size-20 rounded-full bg-red-500/90">
                    X
                  </div>
                  <p className="text-sm font-medium">{players[0]}</p>
                </div>
                <div className="text-center">
                  <div className="flex text-4xl font-extrabold text-white items-center justify-center size-20 rounded-full bg-blue-500/90">
                    O
                  </div>
                  <p className="text-sm font-medium">
                    {players[1] || "Waiting..."}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-center mt-2">
              {currentPlayer && (
                <Badge
                  variant={currentPlayer === username ? "default" : "outline"}
                  className="mx-auto"
                >
                  {currentPlayer === username
                    ? "Your turn"
                    : `${currentPlayer}'s turn`}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 my-4 place-items-center gap-4 max-w-fit mx-auto">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      "flex items-center border-border/60 border justify-center size-20 rounded-lg shadow cursor-pointer transition-all duration-200 ease-in-out relative",
                      cell === "X"
                        ? "text-red-600"
                        : cell === "O"
                        ? "text-blue-600"
                        : "text-gray-900",
                      !cell && !winner && !isDraw && currentPlayer === username
                        ? "hover:scale-105 active:scale-100"
                        : "bg-slate-100"
                    )}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {/* {cell} */}
                    {cell === "X" && (
                      <img
                        src={cross}
                        alt="cross"
                        className="w-16 absolute hover:rotate-6 transition-all duration-300"
                      />
                    )}
                    {cell === "O" && (
                      <img
                        src={circle}
                        alt="circle"
                        className="w-15 absolute hover:rotate-12 transition-all duration-300"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
            {winner && !isDraw && (
              <Alert className="mt-4 bg-green-50 border-green-500">
                <AlertDescription className="text-center">
                  {winner === username ? "You win! 🎉" : `${winner} wins!`}
                </AlertDescription>
              </Alert>
            )}
            {isDraw && (
              <Alert className="mt-4 bg-yellow-50 border-yellow-500">
                <AlertDescription className="text-center">
                  It's a draw!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          {(winner || isDraw) && (
            <CardFooter>
              <Button onClick={resetGame} className="w-full">
                Play Again
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}

export default App;
