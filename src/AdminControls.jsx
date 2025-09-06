import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "./api";
import { Clock, Unlock, Lock, Users, Gamepad2 } from "lucide-react"; // Added Gamepad2 icon

const socket = io(api);

function AdminControls() {
  // State for various controls
  const [domainTime, setDomainTime] = useState("");
  const [regTime, setRegTime] = useState("");
  const [gameTime, setGameTime] = useState(""); // <-- State for the new game timer

  // State for registration controls
  const [regLimitInput, setRegLimitInput] = useState(60);
  const [currentCount, setCurrentCount] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(0);
  const [isRegClosed, setIsRegClosed] = useState(false);

  // --- Registration Handlers ---
  const handleSetRegLimit = () => {
    const limit = parseInt(regLimitInput, 10);
    if (!isNaN(limit) && limit >= 0) {
      socket.emit("admin:setRegLimit", limit);
      alert(`Registration limit has been set to ${limit}`);
    } else {
      alert("Please enter a valid, non-negative number.");
    }
  };

  const handleSetRegTime = () => {
    if (regTime) {
      const isoTimestamp = new Date(regTime).toISOString();
      socket.emit("admin:setRegOpenTime", isoTimestamp);
      alert(`Registration opening time set to: ${new Date(regTime).toLocaleString()}`);
    } else {
      alert("Please select a valid date and time for registration.");
    }
  };

  const handleForceOpenReg = () => {
    if (window.confirm("Are you sure you want to OPEN registrations immediately?")) {
      socket.emit("admin:forceOpenReg");
      alert("Signal to open registrations sent!");
    }
  };

  const handleForceCloseReg = () => {
    if (window.confirm("⚠️ WARNING: This will immediately CLOSE registrations. Continue?")) {
      socket.emit("admin:forceCloseReg");
      alert("Signal to close registrations sent!");
    }
  };
  
  // --- Domain Handlers ---
  const handleSetDomainTime = () => {
    if (domainTime) {
      const isoTimestamp = new Date(domainTime).toISOString();
      socket.emit("admin:setDomainTime", isoTimestamp);
      alert(`Domain opening time broadcasted: ${new Date(domainTime).toLocaleString()}`);
    } else {
      alert("Please select a valid date and time.");
    }
  };
  
  const handleOpenDomainsNow = () => {
    if (window.confirm("Are you sure you want to OPEN domain selection immediately?")) {
      socket.emit("domainOpen");
      alert("Signal to open domains has been sent!");
    }
  };
  
  const handleCloseDomains = () => {
    if (window.confirm("⚠️ WARNING: This will immediately CLOSE domain selection. Continue?")) {
      socket.emit("admin:closeDomains");
      alert("Signal to close domains has been sent!");
    }
  };

  // --- ADDED: Game Timer Handler ---
  const handleSetGameTime = () => {
    if (gameTime) {
      const isoTimestamp = new Date(gameTime).toISOString();
      socket.emit("admin:setGameOpenTime", isoTimestamp);
      alert(`Game opening time has been set to: ${new Date(gameTime).toLocaleString()}`);
    } else {
      alert("Please select a valid date and time for the game.");
    }
  };

  // Listen for server updates on registration status
  useEffect(() => {
    socket.on('registrationStatus', (status) => {
      setIsRegClosed(status.isClosed);
      setCurrentCount(status.count);
      setCurrentLimit(status.limit);
      setRegLimitInput(status.limit);
    });
    socket.emit('check');
    return () => {
      socket.off('registrationStatus');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">
          Admin Controls Panel
        </h1>
        
        {/* --- Registration Controls Section --- */}
        <section className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-yellow-400 h-7 w-7" />
            <h2 className="text-2xl font-semibold">Registration Controls</h2>
          </div>
          <div className="space-y-4">
            {/* Limit */}
            <div>
              <label className="block text-gray-300 mb-2">Registration Limit (Current: {currentCount} / {currentLimit})</label>
              <div className="flex gap-4">
                <input type="number" value={regLimitInput} onChange={(e) => setRegLimitInput(e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 shadow-sm focus:ring-2 focus:ring-yellow-400 text-white" />
                <button onClick={handleSetRegLimit} className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-lg font-semibold transition shadow-md">Set Limit</button>
              </div>
            </div>
            {/* Timer */}
            <div>
              <label className="block text-gray-300 mb-2">Schedule Opening Time</label>
              <div className="flex gap-4">
                <input type="datetime-local" onChange={(e) => setRegTime(e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 shadow-sm focus:ring-2 focus:ring-cyan-400 text-white" />
                <button onClick={handleSetRegTime} className="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg font-semibold transition shadow-md">Set Timer</button>
              </div>
            </div>
            {/* Force Controls */}
            <div className="flex gap-4 pt-2">
              <button onClick={handleForceOpenReg} className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"><Unlock size={18}/> Open Now</button>
              <button onClick={handleForceCloseReg} className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"><Lock size={18}/> Close Now</button>
            </div>
             <div className={`p-3 rounded-lg text-center font-bold text-lg ${isRegClosed ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
               Status: Registrations are currently {isRegClosed ? 'CLOSED' : 'OPEN'}
            </div>
          </div>
        </section>

        {/* --- Domain Controls Section --- */}
        <section className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-orange-400 h-7 w-7" />
            <h2 className="text-2xl font-semibold">Domain Selection Controls</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Schedule Opening Time</label>
              <div className="flex gap-4">
                <input type="datetime-local" onChange={(e) => setDomainTime(e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 shadow-sm focus:ring-2 focus:ring-orange-400 text-white" />
                <button onClick={handleSetDomainTime} className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg font-semibold transition shadow-md">Set Timer</button>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button onClick={handleOpenDomainsNow} className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"><Unlock size={18}/> Open Now</button>
              <button onClick={handleCloseDomains} className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"><Lock size={18}/> Close Now</button>
            </div>
          </div>
        </section>

        {/* --- ADDED: Game Controls Section --- */}
        <section className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="text-lime-400 h-7 w-7" />
            <h2 className="text-2xl font-semibold">Memory Game Controls</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Schedule Game Opening Time</label>
              <div className="flex gap-4">
                <input type="datetime-local" onChange={(e) => setGameTime(e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 shadow-sm focus:ring-2 focus:ring-lime-400 text-white" />
                <button onClick={handleSetGameTime} className="bg-lime-500 text-black hover:bg-lime-600 px-6 py-2 rounded-lg font-semibold transition shadow-md">Set Timer</button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default AdminControls;