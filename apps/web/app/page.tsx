"use client";

import { useState } from "react";
import { useSocket } from "./context/SocketProvider";

export default function Page() {
  const [message, setMessage] = useState("");
  const { sendMessage } = useSocket();

  const sendChatMessage = (message: string) => {
    sendMessage(message);
    setMessage("");
  };

  return (
    <div>
      <h1>All messages will appear here</h1>
      <input
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        value={message}
        type="text"
        placeholder="Message..."
      />
      <button
        onClick={() => {
          sendChatMessage(message);
        }}
        onKeyDown={(e) => {
          e.key === "Enter" ? sendChatMessage(message) : null;
        }}
      >
        Send
      </button>
    </div>
  );
}
