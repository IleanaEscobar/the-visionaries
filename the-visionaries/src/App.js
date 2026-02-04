import logo from './logo.svg';
import './App.css';

// later implement for webrtc
// import { io } from "socket.io-client";

// const socket = io("https://localhost:8443", { secure: true });

// socket.on("connect", () => console.log("Connected to signaling server"));
// socket.on("answer", (data) => console.log("Received answer:", data));


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
