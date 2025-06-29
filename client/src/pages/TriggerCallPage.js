import React, { useState } from 'react';
import axios from 'axios';

export default function TriggerCallPage() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [log, setLog] = useState([]);

  const handleCall = async () => {
    if (!phone.startsWith('+')) {
      setStatus('❌ Phone number must start with + and country code (e.g., +1...)');
      return;
    }
    try {
      setStatus('📞 Calling...');
      const res = await axios.post('/api/call', { phone });
      const logItem = {
        id: Date.now(),
        number: phone,
        message: 'Call initiated',
        sid: res?.data?.data?.call_sid || 'N/A',
        time: new Date().toLocaleString(),
      };
      setLog([logItem, ...log]);
      setStatus('✅ Call placed successfully');
      setPhone('');
    } catch (error) {
      setStatus('❌ Failed to trigger call');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#7E102C] to-[#4A234A] p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-white animate-slidein">Trigger Call</h1>
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadein2">
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Enter phone (e.g., +1XXXXXXXXXX)"
          className="px-4 py-2 border border-gray-300 rounded w-full mb-4"
        />
        <button
          onClick={handleCall}
          className="bg-[#7E102C] text-white px-6 py-2 rounded-full font-bold w-full hover:bg-[#4A234A] transition-colors duration-200"
        >
          Trigger Call
        </button>
        {status && <p className="mt-4 text-center text-lg font-semibold text-[#7E102C]">{status}</p>}
      </div>
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-xl font-bold text-white mb-2">Recent Call Logs</h2>
        {log.length === 0 && <p className="text-white">No calls yet.</p>}
        {log.map(entry => (
          <div key={entry.id} className="bg-white p-4 rounded shadow mb-2 border">
            <p>📱 To: {entry.number}</p>
            <p>🕒 Time: {entry.time}</p>
            <p>📞 SID: {entry.sid}</p>
            <p>✅ Status: {entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
