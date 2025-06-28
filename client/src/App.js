import React, { useState } from "react";
import axios from "axios";

function App() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [log, setLog] = useState([]);
  const [logs, setLogs] = useState([]);

  // Trigger outbound call
  const handleCall = async () => {
    if (!phone.startsWith("+")) {
      setStatus("❌ Phone number must start with + and country code (e.g., +1...)");
      return;
    }

    try {
      setStatus("📞 Calling...");
      const res = await axios.post("/api/call", { phone });

      const logItem = {
        id: Date.now(),
        number: phone,
        message: "Call initiated",
        sid: res?.data?.data?.call_sid || "N/A",
        time: new Date().toLocaleString(),
      };
      setLog([logItem, ...log]);
      setStatus("✅ Call placed successfully");
      setPhone("");
    } catch (error) {
      console.error(error);
      setStatus("❌ Failed to trigger call");
    }
  };

  // Load past conversation logs from DB
  const fetchLogs = async () => {
    try {
      const res = await axios.get("/api/conversations");
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📞 AI Sales Agent Dashboard</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone (e.g., +1XXXXXXXXXX)"
          className="px-4 py-2 border border-gray-300 rounded w-64"
        />
        <button
          onClick={handleCall}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Trigger Call
        </button>
      </div>

      {status && <p className="text-md text-gray-700 mb-6">{status}</p>}

      {/* Call Initiation Logs */}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-xl font-semibold mb-2">📋 Recent Call Logs</h2>
        {log.length === 0 && <p>No calls yet.</p>}
        {log.map((entry) => (
          <div
            key={entry.id}
            className="bg-white p-4 rounded shadow mb-2 border"
          >
            <p>📱 To: {entry.number}</p>
            <p>🕒 Time: {entry.time}</p>
            <p>📞 SID: {entry.sid}</p>
            <p>✅ Status: {entry.message}</p>
          </div>
        ))}
      </div>

      {/* Load Past Conversations */}
      <button
        onClick={fetchLogs}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Load Past Conversations
      </button>

      {/* Past Conversations from MongoDB */}
      <div className="w-full max-w-3xl">
        {logs.length > 0 && (
          <h2 className="text-xl font-semibold mb-2">🗂️ Conversation History</h2>
        )}
        {logs.map((log) => (
          <div
            key={log._id}
            className="bg-white border rounded p-4 mb-4 shadow"
          >
            <p className="font-bold">Call SID: {log.call_sid}</p>
            <p className="text-sm text-gray-500">🕒 {new Date(log.createdAt).toLocaleString()}</p>
            {log.user_info && (
              <p className="text-sm text-gray-700 mb-2">
                👤 User: {log.user_info.name || "Unknown"}
              </p>
            )}
            <div className="mt-2">
              {log.conversation.map((msg, idx) => (
                <p key={idx}>
                  <span className="font-semibold">{msg.role}:</span> {msg.content}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
