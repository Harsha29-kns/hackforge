import { useEffect, useState } from "react";
import axios from "axios";
import api from "./api"; // Assuming api.js is in the same directory
import { useLocation } from "react-router-dom";
import QrScannerModal from "./components/QrScanner"; // Assuming QrScannerModal is in a components sub-directory

//==================================================================
// Component from atted.jsx (AttenCard's Child Component)
//==================================================================

const MemberRow = ({ member, status, onScan, onToggle, isDisabled }) => {
  const isPresent = status === "Present";
  const isAbsent = status === "Absent";

  return (
    <div
      className={`p-4 rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isPresent
          ? "bg-green-500/20 border-green-500"
          : isAbsent
          ? "bg-red-500/20 border-red-500"
          : "bg-gray-700/50 border-gray-600"
      } border`}
    >
      <div>
        <p className="font-bold text-white text-lg">
          {member.name} {member.isLead ? "(Lead)" : ""}
        </p>
        <p className="text-sm text-gray-400">
          Reg No: {member.registrationNumber}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onScan(member)}
          disabled={isDisabled}
          className="h-12 w-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={`Scan QR for ${member.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4L12 4C12.5523 4 13 4.44772 13 5L13 5.01C13 5.56228 12.5523 6.01 12 6.01L12 6.01C11.4477 6.01 11 5.56228 11 5.01L11 5C11 4.44772 11.4477 4 12 4zM5 4h1a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm13 0h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V5a1 1 0 011-1zm-13 13h1a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1a1 1 0 011-1z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12v4h4v-4H9zM9 4v4h4V4H9zm10 10v4h4v-4h-4zM4 12v4h4v-4H4zm15-8v4h4V4h-4z"
            />
          </svg>
        </button>
        <button
          onClick={() => onToggle(member.registrationNumber, "Present")}
          disabled={isDisabled}
          className={`h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${
            isPresent
              ? "bg-green-500 text-white scale-110"
              : "bg-gray-700 text-gray-400 hover:bg-green-500/50"
          }`}
          title={`Mark ${member.name} as Present`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
        <button
          onClick={() => onToggle(member.registrationNumber, "Absent")}
          disabled={isDisabled}
          className={`h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${
            isAbsent
              ? "bg-red-500 text-white scale-110"
              : "bg-gray-700 text-gray-400 hover:bg-red-500/50"
          }`}
          title={`Mark ${member.name} as Absent`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

//==================================================================
// Component from atted.jsx (AttenCard)
//==================================================================

function AttenCard({ team, round }) {
  const [attendance, setAttendance] = useState({});
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [memberToScan, setMemberToScan] = useState(null);

  useEffect(() => {
    const initialAttendance = {};
    let isSubmitted = false;

    if (team.lead && team.lead.attendance) {
      const leadAttd = team.lead.attendance.find((a) => a.round == round);
      if (leadAttd) {
        initialAttendance[team.registrationNumber] = leadAttd.status;
        isSubmitted = true;
      }
    }

    team.teamMembers.forEach((member) => {
      if (member.attendance) {
        const memberAttd = member.attendance.find((a) => a.round == round);
        if (memberAttd) {
          initialAttendance[member.registrationNumber] = memberAttd.status;
        }
      }
    });

    setAttendance(initialAttendance);
    setDone(isSubmitted);
    setEditMode(false);
  }, [team, round]);

  const openScannerFor = (member) => {
    setMemberToScan(member);
    setIsScannerOpen(true);
  };

  const handleScan = (data) => {
    if (data) {
      setIsScannerOpen(false);
      try {
        const scannedData = JSON.parse(data.text);

        if (scannedData.teamId !== team._id) {
          alert(`Error: This member is not from team "${team.teamname}".`);
          setMemberToScan(null);
          return;
        }

        if (scannedData.registrationNumber !== memberToScan.registrationNumber) {
          const scannedMember = [
            ...team.teamMembers,
            { name: team.name, registrationNumber: team.registrationNumber },
          ].find((m) => m.registrationNumber === scannedData.registrationNumber);
          const scannedMemberName = scannedMember
            ? scannedMember.name
            : "an unknown member";
          alert(
            `Incorrect QR. You scanned ${scannedMemberName}'s code instead of ${memberToScan.name}'s code.`
          );
          setMemberToScan(null);
          return;
        }

        setAttendance((prev) => ({
          ...prev,
          [scannedData.registrationNumber]: "Present",
        }));

        setMemberToScan(null);
      } catch (error) {
        console.error("Invalid QR code format:", error);
        alert("Invalid QR code format.");
        setMemberToScan(null);
      }
    }
  };

  const handleScanError = (err) => {
    console.error(err);
    alert("Could not start the camera. Please check permissions.");
    setIsScannerOpen(false);
    setMemberToScan(null);
  };

  const toggleAttendance = (registrationNumber, status) => {
    setAttendance((prev) => ({ ...prev, [registrationNumber]: status }));
  };

  const handleSubmit = async () => {
    const allMembers = [
      { registrationNumber: team.registrationNumber },
      ...team.teamMembers,
    ];

    const isComplete = allMembers.every(
      (m) => attendance[m.registrationNumber]
    );
    if (!isComplete) {
      alert("⚠ Please mark attendance for all members before submitting.");
      return;
    }

    try {
      await axios.post(`${api}/Hack/attendance/submit`, {
        teamId: team._id,
        roundNumber: parseInt(round),
        attendanceData: attendance,
      });
      setDone(true);
      setEditMode(false);
      alert(
        editMode
          ? "✅ Attendance updated successfully!"
          : "✅ Attendance submitted successfully!"
      );
    } catch (error) {
      console.error("Failed to submit attendance:", error);
      alert("❌ Error submitting attendance. Please try again.");
    }
  };

  const markAllPresent = () => {
    const newAttendance = {};
    newAttendance[team.registrationNumber] = "Present";
    team.teamMembers.forEach((member) => {
      newAttendance[member.registrationNumber] = "Present";
    });
    setAttendance(newAttendance);
  };

  const getStatus = (regNo) => attendance[regNo] || null;

  return (
    <>
      {isScannerOpen && (
        <QrScannerModal
          onScan={handleScan}
          onError={handleScanError}
          onClose={() => {
            setIsScannerOpen(false);
            setMemberToScan(null);
          }}
          constraints={{
            audio: false,
            video: { facingMode: "environment" },
          }}
        />
      )}

      <div className="bg-gray-800 shadow-lg rounded-xl overflow-hidden max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 px-4 py-3 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700 gap-4">
          <h2 className="text-lg font-bold text-white">
            {team.teamname} - Round {round}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={markAllPresent}
              disabled={done && !editMode}
              className="bg-green-600/50 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark All Present
            </button>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                done ? "bg-green-600 text-white" : "bg-yellow-500 text-white"
              }`}
            >
              {done ? "✔ Submitted" : "⏳ Pending"}
            </span>
          </div>
        </div>

        {/* Members List */}
        <div className="p-4 space-y-4">
          <MemberRow
            member={{
              name: team.name,
              registrationNumber: team.registrationNumber,
              isLead: true,
            }}
            status={getStatus(team.registrationNumber)}
            onScan={openScannerFor}
            onToggle={toggleAttendance}
            isDisabled={done && !editMode}
          />
          {team.teamMembers.map((member) => (
            <MemberRow
              key={member.registrationNumber}
              member={member}
              status={getStatus(member.registrationNumber)}
              onScan={openScannerFor}
              onToggle={toggleAttendance}
              isDisabled={done && !editMode}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-700 flex flex-col sm:flex-row gap-3">
          {(!done || editMode) && (
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg"
              onClick={handleSubmit}
            >
              {editMode ? "Update Attendance" : "Submit Attendance"}
            </button>
          )}
          {done && !editMode && (
            <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg cursor-default font-bold text-lg">
              ✔ Submitted
            </button>
          )}
          {done && (
            <button
              className={`px-6 py-3 rounded-lg text-white font-bold text-lg ${
                editMode
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "✏ Edit"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

//==================================================================
// Main Page Component (from attd.jsx)
//==================================================================

function Attd() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSector, setCurrentSector] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState(
    sessionStorage.getItem("password") || ""
  );
  const [error, setError] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const sectors = ["Naruto", "Sasuke", "Itachi"];

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const round = params.get("round") || "1";

  useEffect(() => {
    async function data() {
      try {
        let res = await axios.get(`${api}/Hack/students`);
        setTeams(res.data); // Directly use res.data
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    }

    if (password === "att2025") {
      setIsAuthenticated(true);
    }
    if (isAuthenticated) {
      data();
    }
  }, [isAuthenticated, password]); // Added password to dependency array

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "att2025") {
      setIsAuthenticated(true);
      sessionStorage.setItem("password", password);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const getSectorTeams = (sectorIndex) => {
    const selectedSector = sectors[sectorIndex];
    return teams.filter((team) => team.Sector === selectedSector);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("password");
    setIsAuthenticated(false);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-tr from-gray-900 to-gray-800 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-gray-800/90 backdrop-blur rounded-2xl shadow-lg p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            🔐 Attendance Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password..."
              className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded-lg shadow-md"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 flex flex-col min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 bg-gray-900/95 border-b border-gray-700 p-4 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-blue-400">
          📊 Attendance Dashboard
        </h1>
        <span className="text-gray-300">
          Round: <b>{round}</b>
        </span>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Sector Tabs */}
          <div className="flex flex-wrap justify-center mb-6 px-4 mt-6">
            {sectors.map((sector, index) => (
              <button
                key={sector}
                className={`mx-2 px-5 py-2 rounded-full transition-all ${
                  currentSector === index
                    ? "bg-blue-600 scale-105"
                    : "bg-gray-700"
                } text-white`}
                onClick={() => {
                  setCurrentSector(index);
                  setSelectedTeam(null); // reset when changing sector
                }}
              >
                {sector}
              </button>
            ))}
          </div>

          {/* Team Selector */}
          <div className="px-6 mb-6 flex justify-center">
            <select
              value={selectedTeam || ""}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
            >
              <option value="">-- Select Team --</option>
              {getSectorTeams(currentSector).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.teamname}
                </option>
              ))}
            </select>
          </div>

          {/* Show Only Selected Team */}
          <div className="px-6 mb-10">
            {selectedTeam ? (
              <AttenCard
                team={teams.find((t) => t._id === selectedTeam)}
                round={round}
              />
            ) : (
              <p className="text-gray-400 text-center">
                Please select a team to view details
              </p>
            )}
          </div>

          <div className="text-right px-6 pb-6">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Attd;