import { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";
import { useLocation } from "react-router-dom";
import QrScannerModal from "./components/QrScanner";

// --- SVG Icons for UI Enhancement ---
const IconScan = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" x2="17" y1="12" y2="12"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// --- Helper Components ---
const MemberRow = ({ member, status, onScan, onToggle, isDisabled }) => {
  const isPresent = status === "Present";
  const isAbsent = status === "Absent";

  return (
    <div className={`p-4 rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/50 border ${ isPresent ? "border-green-500" : isAbsent ? "border-red-500" : "border-gray-700"}`}>
        <div>
            <p className="font-bold text-white text-lg">{member.name} {member.isLead ? "(Lead)" : ""}</p>
            <p className="text-sm text-gray-400">Reg No: {member.registrationNumber}</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onScan(member)} disabled={isDisabled} className="h-12 w-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={`Scan QR for ${member.name}`}>
                <IconScan />
            </button>
            <button onClick={() => onToggle(member.registrationNumber, "Present")} disabled={isDisabled} className={`h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${isPresent ? "bg-green-500 text-white scale-110" : "bg-gray-700 text-gray-400 hover:bg-green-500/50"}`} title={`Mark ${member.name} as Present`}>
                <IconCheck />
            </button>
            <button onClick={() => onToggle(member.registrationNumber, "Absent")} disabled={isDisabled} className={`h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${isAbsent ? "bg-red-500 text-white scale-110" : "bg-gray-700 text-gray-400 hover:bg-red-500/50"}`} title={`Mark ${member.name} as Absent`}>
                <IconX />
            </button>
        </div>
    </div>
  );
};

const AttenCard = ({ team, round }) => {
    const [attendance, setAttendance] = useState({});
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [done, setDone] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [memberToScan, setMemberToScan] = useState(null);

    useEffect(() => {
        const initialAttendance = {};
        let isSubmitted = false;
        
        const leadData = { ...team.lead, name: team.name, registrationNumber: team.registrationNumber, isLead: true };
        const allMembers = [leadData, ...team.teamMembers].filter(Boolean);

        allMembers.forEach(member => {
            if (member && member.attendance) {
                const memberAttd = member.attendance.find(a => a.round == round);
                if (memberAttd) {
                    initialAttendance[member.registrationNumber] = memberAttd.status;
                    if(member.isLead) isSubmitted = true;
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
                    const allTeamMembers = [{ name: team.name, registrationNumber: team.registrationNumber }, ...team.teamMembers];
                    const scannedMember = allTeamMembers.find((m) => m.registrationNumber === scannedData.registrationNumber);
                    const scannedMemberName = scannedMember ? scannedMember.name : "an unknown member";
                    alert(`Incorrect QR. You scanned ${scannedMemberName}'s code instead of ${memberToScan.name}'s code.`);
                    setMemberToScan(null);
                    return;
                }

                setAttendance((prev) => ({ ...prev, [scannedData.registrationNumber]: "Present" }));
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
        const allMembers = [{ registrationNumber: team.registrationNumber }, ...team.teamMembers];
        const isComplete = allMembers.every(m => attendance[m.registrationNumber]);
        if (!isComplete) {
            alert("Please mark attendance for all members before submitting.");
            return;
        }

        try {
            await axios.post(`${api}/Hack/attendance/submit`, { teamId: team._id, roundNumber: parseInt(round), attendanceData: attendance });
            setDone(true);
            setEditMode(false);
            alert(editMode ? "Attendance updated successfully!" : "Attendance submitted successfully!");
        } catch (error) {
            alert("Error submitting attendance. Please try again.");
        }
    };

    return (
        <>
            {isScannerOpen && <QrScannerModal onScan={handleScan} onError={handleScanError} onClose={() => { setIsScannerOpen(false); setMemberToScan(null); }} constraints={{ audio: false, video: { facingMode: "environment" } }} />}
            <div className="bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden max-w-2xl mx-auto border border-orange-500/30">
                <div className="bg-black/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700 gap-4">
                    <h2 className="text-xl font-bold text-orange-400 font-naruto">{team.teamname} - Round {round}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${done ? "bg-green-500/30 text-green-300" : "bg-yellow-500/30 text-yellow-300"}`}>{done ? "✔ Submitted" : "⏳ Pending"}</span>
                </div>
                <div className="p-6 space-y-4">
                    <MemberRow member={{ name: team.name, registrationNumber: team.registrationNumber, isLead: true }} status={attendance[team.registrationNumber] || null} onScan={openScannerFor} onToggle={toggleAttendance} isDisabled={done && !editMode}/>
                    {team.teamMembers.map((member) => <MemberRow key={member.registrationNumber} member={member} status={attendance[member.registrationNumber] || null} onScan={openScannerFor} onToggle={toggleAttendance} isDisabled={done && !editMode}/>)}
                </div>
                <div className="p-4 bg-black/30 border-t border-gray-700 flex flex-col sm:flex-row gap-3">
                    {(!done || editMode) && <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold text-lg transition-transform hover:scale-105" onClick={handleSubmit}>{editMode ? "Update Attendance" : "Submit Attendance"}</button>}
                    {done && !editMode && <button className="flex-1 bg-gray-700 text-gray-400 py-3 rounded-lg cursor-default font-bold text-lg">Submitted</button>}
                    {done && <button className={`px-6 py-3 rounded-lg text-white font-bold text-lg transition-transform hover:scale-105 ${editMode ? "bg-gray-600 hover:bg-gray-700" : "bg-yellow-600 hover:bg-yellow-700"}`} onClick={() => setEditMode(!editMode)}>{editMode ? "Cancel Edit" : "✏️ Edit"}</button>}
                </div>
            </div>
        </>
    );
}

function Attd() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSector, setCurrentSector] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const sectors = ["Naruto", "Sasuke", "Itachi"];
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const round = params.get("round") || "1";

    useEffect(() => {
        if (sessionStorage.getItem("password") === "att2025") {
            setIsAuthenticated(true);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                let res = await axios.get(`${api}/Hack/students`);
                setTeams(res.data);
            } catch (error) {
                console.error("Error fetching teams:", error);
                setError("Failed to load team data.");
            } finally {
                setLoading(false);
            }
        }
        
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === "att2025") {
            sessionStorage.setItem("password", password);
            setError("");
            setIsAuthenticated(true);
        } else {
            setError("Incorrect password. Please try again.");
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("password");
        setIsAuthenticated(false);
        setPassword("");
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4" style={{ backgroundImage: `url('/background.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                <div className="relative z-10 w-full max-w-md">
                    <form onSubmit={handleLogin} className="bg-gray-800/50 backdrop-blur-lg border border-orange-500/30 rounded-2xl shadow-2xl p-8 space-y-6">
                        <h2 className="text-3xl font-bold text-orange-400 text-center font-naruto">Attendance Terminal</h2>
                        <input type="password" placeholder="Enter Access Code..." className="w-full px-4 py-3 bg-gray-700/80 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg shadow-lg font-bold transform hover:scale-105 transition-transform">Authorize</button>
                    </form>
                </div>
            </div>
        );
    }

    const getSectorTeams = (sectorIndex) => {
        const selectedSector = sectors[sectorIndex];
        return teams.filter((team) => team.Sector === selectedSector);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans" style={{ backgroundImage: `url('/background1.jpeg')`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="sticky top-0 bg-black/30 backdrop-blur-lg border-b border-orange-500/30 p-4 shadow-lg">
                    <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-orange-400 font-naruto tracking-wider">ATTENDANCE - ROUND {round}</h1>
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md font-semibold">Logout</button>
                    </div>
                </header>

                <main className="container mx-auto p-4 md:p-6 flex-grow">
                    {loading ? (
                        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div></div>
                    ) : (
                        <>
                            <div className="bg-black/20 p-2 rounded-xl flex flex-wrap justify-center mb-6 max-w-lg mx-auto border border-gray-700">
                                {sectors.map((sector, index) => <button key={sector} className={`flex-1 mx-1 px-4 py-2 rounded-lg transition-all font-semibold ${currentSector === index ? "bg-orange-600 scale-105 shadow-lg shadow-orange-500/30" : "bg-gray-700/50 hover:bg-gray-600"}`} onClick={() => { setCurrentSector(index); setSelectedTeam(null); }}>{sector}</button>)}
                            </div>
                            <div className="px-6 mb-6 flex justify-center">
                                <select value={selectedTeam || ""} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full max-w-md px-4 py-3 rounded-lg bg-gray-800 text-white border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors">
                                    <option value="">-- Select a Team from {sectors[currentSector]} Sector --</option>
                                    {getSectorTeams(currentSector).map((t) => <option key={t._id} value={t._id}>{t.teamname}</option>)}
                                </select>
                            </div>
                            <div className="px-2">
                                {selectedTeam ? <AttenCard team={teams.find((t) => t._id === selectedTeam)} round={round} /> : <p className="text-gray-400 text-center text-lg mt-10">Please select a team to begin marking attendance.</p>}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Attd;
