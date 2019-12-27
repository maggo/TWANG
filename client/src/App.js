import React, { useEffect, useState } from "react";
import useWebsocket from "react-use-websocket";
import Joystick from "./Joystick";

const MAX_JOY = 90;

const CONNECTION_STATUS_CONNECTING = 0;
const CONNECTION_STATUS_OPEN = 1;
const CONNECTION_STATUS_CLOSING = 2;
const CONNECTION_STATUS_CLOSED = 3;

const mapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

const WS_OPTIONS = {
  shouldReconnect: () => true
};

function App() {
  const [sendMessage, lastMessage, readyState] = useWebsocket(
    "ws://192.168.178.54",
    WS_OPTIONS
  );
  const [lives, setLives] = useState();
  const [gameOver, setGameOver] = useState(false);

  const connectionStatus = {
    [CONNECTION_STATUS_CONNECTING]: "Connecting",
    [CONNECTION_STATUS_OPEN]: "Open",
    [CONNECTION_STATUS_CLOSING]: "Closing",
    [CONNECTION_STATUS_CLOSED]: "Closed"
  }[readyState];

  useEffect(() => {
    if (!lastMessage) return;
    console.log(lastMessage.data);

    if (lastMessage.data.startsWith("LIVES:")) {
      const liveCount = parseInt(lastMessage.data.split(":")[1]);
      setLives(liveCount);

      if (liveCount === 0) {
        setGameOver(true);
        setTimeout(() => {
          setGameOver(false);
        }, 1000);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    window.addEventListener("deviceorientation", e => {
      sendMessage(
        `JOYSTICK:${Math.round(
          mapRange(-e.beta, -10, 10, -MAX_JOY, MAX_JOY)
        )}:${Math.round(mapRange(-e.gamma, -10, 10, -MAX_JOY, MAX_JOY))}`
      );
    });
  }, [sendMessage]);

  // function connect(e) {
  //   e.preventDefault();
  //   setWS(new WebSocket(e.currentTarget.host.value));
  // }

  function joyDown() {
    window.lastDown = new Date().getTime();
  }

  function joyUp() {
    sendMessage(`JOYSTICK:0:0`);

    if (new Date().getTime() - window.lastDown <= 220) {
      sendMessage(`BUTTON_DOWN`);

      setTimeout(() => {
        sendMessage(`BUTTON_UP`);
      }, 50);
    }
  }

  const joyMove = (x, y) => {
    console.log(x, y);

    sendMessage(
      `JOYSTICK:${Math.round(
        mapRange(x, -1, 1, -MAX_JOY, MAX_JOY)
      )}:${Math.round(mapRange(y, -1, 1, -MAX_JOY, MAX_JOY))}`
    );
  };

  return (
    <div className="App">
      {gameOver && <div className="GameOverScreen">Game Over!</div>}
      <form>
        Status: {connectionStatus}
        {lives !== undefined ? ` | Lives: ${lives}` : ""}
      </form>
      <div>
        <Joystick onMove={joyMove} onStart={joyDown} onEnd={joyUp}></Joystick>
      </div>
    </div>
  );
}

export default App;
