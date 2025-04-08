import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
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
import StitchesButton from "./components/ui/StichesBtn";
import { Confetti, ConfettiRef } from "./components/magicui/confetti";
import { Copy, Dices } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import { toast } from "sonner";

const socket = io(
  import.meta.env.DEV
    ? "http://localhost:4000"
    : "https://multip-tictactoe.onrender.com"
);

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
  const [usernameError, setUsernameError] = useState("");
  const [roomError, setRoomError] = useState("");

  const confettiRef = useRef<ConfettiRef>(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      toast.success("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      toast.error("Disconnected from server");
    });

    socket.on("gameCreated", () => {
      setGameCreated(true);
      setGameStarted(true);
      toast.success("Game created successfully!");
    });

    socket.on("gameStart", (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setPlayers(data.players);
      setGameStarted(true);
      toast.success("Game started!");
    });

    socket.on("moveMade", (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setWinner(data.winner);
      setIsDraw(data.isDraw);

      if (data.winner && !data.isDraw) {
        setTimeout(() => confettiRef.current?.fire({}), 300);
        const isUserWinner =
          (data.winner === "X" && players[0] === username) ||
          (data.winner === "O" && players[1] === username);

        if (isUserWinner) {
          toast.success("You won! 🎉");
        } else if (data.winner) {
          toast.success(
            `${data.winner === "X" ? players[0] : players[1]} wins!`
          );
        }
      }

      if (data.isDraw) {
        toast.info("It's a draw!");
      }
    });

    socket.on("gameReset", (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setWinner(data.winner);
      setIsDraw(false);
      toast.info("Game reset");
    });

    socket.on("roomFull", (data) => {
      setRoomFullMessage(data.message);
      toast.error(data.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("gameCreated");
      socket.off("gameStart");
      socket.off("moveMade");
      socket.off("gameReset");
      socket.off("roomFull");
    };
  }, [players, username]);

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

  const validateForm = () => {
    let isValid = true;
    if (username.length < 2) {
      setUsernameError("Username must be at least 2 characters");
      isValid = false;
    } else {
      setUsernameError("");
    }

    if (room.length < 2) {
      setRoomError("Room ID must be at least 2 characters");
      isValid = false;
    } else {
      setRoomError("");
    }
    return isValid;
  };

  const handleJoinGame = () => {
    if (validateForm()) {
      joinGame();
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(room);
    toast.success("Room ID copied to clipboard!");
  };

  const generateRandomUsername = () => {
    const randomName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: "",
      style: "capital",
      length: 2,
    });
    setUsername(randomName);
  };

  const generateRandomRoom = () => {
    const randomRoom = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: "-",
      length: 2,
    });
    setRoom(randomRoom);
  };

  return (
    <div className="min-h-screen bg relative flex items-center justify-center p-4">
      <Toaster position="top-center" richColors theme="light" />
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20 select-none pointer-events-none" />
      <img
        src={cross}
        alt=""
        className="absolute w-44 top-12 left-12 sm:top-20 sm:left-32"
        fetchPriority="low"
      />
      <img
        fetchPriority="low"
        src={ttt1}
        alt=""
        className="absolute w-0 sm:w-44 bottom-20 left-36 hidden sm:block"
      />
      <img
        fetchPriority="low"
        src={ttt2}
        alt=""
        className="absolute w-0 sm:w-44 left-48 -scale-x-100 hidden sm:block"
      />
      <img
        fetchPriority="low"
        src={ttt1}
        alt=""
        className="absolute w-0 sm:w-44 right-56 -scale-x-100 hidden sm:block"
      />

      <img
        fetchPriority="low"
        src={circle}
        alt=""
        className="absolute w-44 bottom-12 right-12 sm:bottom-20 sm:right-36"
      />
      <img
        fetchPriority="low"
        src={gamepad}
        alt=""
        className="absolute w-0 sm:w-52 top-20 right-28 hidden sm:block"
      />
      {!gameStarted ? (
        <Card className="w-full max-w-md z-10 py-10">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tighter bg-gradient-to-r from-sky-500 via-rose-400 to-indigo-500 px-1 w-fit text-transparent bg-clip-text ">
              Tic Tac Toe
            </CardTitle>
            <CardDescription>
              Join an existing game or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium pl-3">
                Username
              </label>
              <div className="relative">
                <Input
                  className="text-sm placeholder:text-xs"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <button
                  title="Generate Random Username"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md hover:bg-violet-100 cursor-pointer active:scale-95 transition-all duration-200 ease-in-out"
                  onClick={generateRandomUsername}
                  type="button"
                >
                  <Dices className="size-4" />
                </button>
              </div>
              {usernameError && (
                <p className="text-red-500 text-sm">{usernameError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="room" className="text-sm font-medium pl-3">
                Room ID
              </label>
              <div className="relative">
                <Input
                  className="text-sm pr-16 placeholder:text-xs"
                  id="room"
                  placeholder="Enter room ID or create a new one"
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex">
                  <button
                    title="Copy Room ID"
                    className="p-2 rounded-md hover:bg-violet-100 cursor-pointer active:scale-95 transition-all duration-200 ease-in-out"
                    onClick={copyRoomId}
                    type="button"
                  >
                    <Copy className="size-4" />
                  </button>
                  <button
                    title="Generate Random Room ID"
                    className="p-2 rounded-md hover:bg-violet-100 cursor-pointer active:scale-95 transition-all duration-200 ease-in-out"
                    onClick={generateRandomRoom}
                    type="button"
                  >
                    <Dices className="size-4" />
                  </button>
                </div>
              </div>
              {roomError && <p className="text-red-500 text-sm">{roomError}</p>}
            </div>
            {roomFullMessage && (
              <Alert variant="destructive">
                <AlertDescription>{roomFullMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <StitchesButton
              text="Join Game"
              onClick={handleJoinGame}
              className="w-full"
              disabled={!username || !room}
            />
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-md z-10 py-10">
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tighter bg-gradient-to-r from-sky-500 via-rose-400 to-indigo-500 px-1 w-fit text-transparent bg-clip-text ">
              Tic Tac Toe
            </CardTitle>
            {gameCreated && players.length < 2 ? (
              <AlertDescription className="text-center text-muted-foreground animate-pulse">
                Waiting for Player 2 to join...
              </AlertDescription>
            ) : (
              <div className="flex justify-center gap-8 md:gap-14 mt-2">
                <div className="text-center flex flex-col items-center">
                  <div className="flex text-4xl font-extrabold text-white items-center justify-center size-20 rounded-full bg-red-500/90">
                    X
                  </div>
                  <p className="text-sm font-medium">{players[0]}</p>
                </div>
                <div className="text-center flex flex-col items-center">
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
                <Confetti
                  options={{
                    particleCount: 60,
                    spread: 70,
                    startVelocity: 30,
                  }}
                  ref={confettiRef}
                  className="absolute left-0 top-0 z-0 size-full"
                />
                <AlertDescription className="text-center text-2xl font-semibold tracking-tight text-green-700">
                  {winner === "X"
                    ? players[0] === username
                      ? "You win! 🎉"
                      : `${players[0]} wins!`
                    : players[1] === username
                    ? "You win! 🎉"
                    : `${players[1]} wins!`}
                </AlertDescription>
              </Alert>
            )}
            {isDraw && (
              <Alert className="mt-4 bg-yellow-50 border-yellow-500">
                <AlertDescription className="text-center text-2xl font-semibold tracking-tight text-yellow-700">
                  It's a draw!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          {(winner || isDraw) && (
            <CardFooter>
              <StitchesButton
                text="Play Again !"
                onClick={resetGame}
                className="w-full bg-yellow-600 border-yellow-600"
              />
            </CardFooter>
          )}
        </Card>
      )}
      <footer className="fixed bottom-3 right-3">
        <a
          href="https://git.new/anish"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-slate-950/80 font-medium text-slate-200 transition-all duration-300 hover:w-32"
        >
          <div className="inline-flex whitespace-nowrap opacity-0 transition-all duration-500 group-hover:-translate-x-3 group-hover:opacity-100">
            Github
          </div>
          <div className="absolute right-3">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
            >
              <path
                d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
        </a>
      </footer>
    </div>
  );
}

export default App;
