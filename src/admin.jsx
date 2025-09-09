import { useEffect, useState, useRef } from "react";
import axios from "axios";
import api from "./api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from "papaparse";
import JSZip from 'jszip';
import { Gem } from "lucide-react";

const socket = io(api);

// --- HELPER COMPONENTS ---
const Notification = ({ message, type, onClear }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClear();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClear]);

    const baseStyles = "fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-semibold text-lg animate-fade-in-down";
    const typeStyles = type === 'success'
        ? "bg-gradient-to-r from-green-500 to-emerald-600"
        : "bg-gradient-to-r from-red-500 to-rose-600";

    return (
        <div className={`${baseStyles} ${typeStyles}`}>
            {message}
        </div>
    );
};

const NarutoLoader = () => (
    <div className="flex flex-col items-center justify-center text-center">
        <svg width="80" height="80" viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '2s' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#FF5722" strokeWidth="4" />
            <circle cx="50" cy="50" r="15" fill="#FF5722" />
            <path d="M50 5 C 74.85 5, 95 25.15, 95 50 C 95 25.15, 74.85 5, 50 5" fill="none" stroke="#FF5722" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="120 50 50" dur="0.67s" repeatCount="indefinite" />
            </path>
            <path d="M50 5 C 25.15 5, 5 25.15, 5 50 C 5 25.15, 25.15 5, 50 5" fill="none" stroke="#FF5722" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="120 50 50" to="240 50 50" dur="0.67s" repeatCount="indefinite" />
            </path>
             <path d="M5 50 C 5 74.85, 25.15 95, 50 95 C 25.15 95, 5 74.85, 5 50" fill="none" stroke="#FF5722" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="240 50 50" to="360 50 50" dur="0.67s" repeatCount="indefinite" />
            </path>
        </svg>
        <p className="text-orange-400 text-xl font-naruto mt-4">Loading Missions...</p>
    </div>
);

const StatCard = ({ title, value, color }) => (
    <div className={`bg-gray-800/50 border-2 ${color} p-6 rounded-xl shadow-lg text-center backdrop-blur-md`}>
        <h2 className="text-lg font-semibold text-white/80 mb-1">{title}</h2>
        <p className="text-4xl font-bold text-white">{value}</p>
    </div>
);
const DomainMonitor = ({ teams, domains, onResetDomains }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Only count verified teams that haven't selected a domain as "pending"
    const teamsWithDomain = teams.filter(team => team.Domain);
    
    // Verified teams that have NOT yet selected a domain
    const unassignedVerifiedTeams = teams.filter(team => !team.Domain && team.verified);

    // --- HANDLERS ---
    const handleResetClick = async () => {
        if (window.confirm("Are you sure you want to reset ALL domain selections? This action cannot be undone.")) {
            setIsLoading(true);
            await onResetDomains();
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="text-4xl font-naruto text-orange-400">Domain Monitor</h2>
                <button
                    onClick={handleResetClick}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-transform hover:scale-105"
                >
                    {isLoading ? "Resetting..." : "Reset All Domains"}
                </button>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard title="Teams Assigned to a Domain" value={teamsWithDomain.length} color="border-green-500" />
                <StatCard title="Unassigned Domains" value={unassignedVerifiedTeams.length} color="border-yellow-500" />
            </div>

            {/* --- TWO-COLUMN LAYOUT --- */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left Column: Domain Status */}
                <div className="w-full lg:w-7/12">
                    <div className="bg-gray-800/60 rounded-lg p-6 max-h-[calc(100vh-350px)] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-4 text-gray-200">Domain Breakdown</h3>
                        <div className="space-y-4">
                            {domains.map(domain => {
                                const assignedTeams = teams.filter(t => t.Domain === domain.name);
                                const totalSlots = domain.slots + assignedTeams.length;
                                const filledPercentage = totalSlots > 0 ? (assignedTeams.length / totalSlots) * 100 : 0;

                                return (
                                    <div key={domain.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-lg text-white">{domain.name}</span>
                                            <span className="font-semibold text-xl">
                                                {assignedTeams.length} <span className="text-sm text-gray-400">/ {totalSlots}</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                            <div
                                                className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${filledPercentage}%` }}
                                            ></div>
                                        </div>
                                        {assignedTeams.length > 0 && (
                                            <div className="mt-3 text-sm text-gray-300 border-t border-gray-700 pt-3">
                                                <strong className="text-gray-400">Assigned Teams:</strong> {assignedTeams.map(t => t.teamname).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Unassigned Teams */}
                <div className="w-full lg:w-5/12">
                     <div className="bg-gray-800/60 rounded-lg p-6 max-h-[calc(100vh-350px)] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-4 text-gray-200">Unassigned Domains</h3>
                        {unassignedVerifiedTeams.length > 0 ? (
                             <ul className="space-y-2">
                                {unassignedVerifiedTeams.map(team => (
                                    <li key={team._id} className="p-3 bg-gray-900/50 rounded-md text-gray-300 font-semibold">
                                        {team.teamname}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-3xl">🎉</p>
                                <p className="mt-2 font-semibold">All verified teams have selected a domain!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



function Admin() {
    // --- STATE AND LOGIC ---
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("adminAuthenticated") === "true");
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState("");
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationTab, setVerificationTab] = useState('pending');
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [showAttdModal, setShowAttdModal] = useState(false);
    const [selectedAttdRound, setSelectedAttdRound] = useState(null);
    const navigate = useNavigate();
    const [showDomainModal, setShowDomainModal] = useState(false);
    const [allDomains, setAllDomains] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [teamsWithIssues, setTeamsWithIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(false);
    const [reminderText, setReminderText] = useState("");
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [reminderError, setReminderError] = useState("");
    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [selectedTeamForPass, setSelectedTeamForPass] = useState("");
    const [isGeneratingPass, setIsGeneratingPass] = useState(false);
    const passContainerRef = useRef(null);
    const [verificationSearchTerm, setVerificationSearchTerm] = useState("");
    const [pptTemplate, setPptTemplate] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [isZipping, setIsZipping] = useState(false);
    const [zipProgress, setZipProgress] = useState({ current: 0, total: 0 });
    const [verifyingTeamId, setVerifyingTeamId] = useState(null);
    const [activeView, setActiveView] = useState('teams');
    const [activeSessionsCount, setActiveSessionsCount] = useState(0);
    const [selectedTeamScoring, setSelectedTeamScoring] = useState("");
    const [internalScoreInput, setInternalScoreInput] = useState("");
    const [isSubmittingScore, setIsSubmittingScore] = useState(false);

    const handleInternalScoreSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeamScoring || internalScoreInput === "") {
            setNotification({ message: 'Please select a team and enter a score.', type: 'error' });
            return;
        }

        setIsSubmittingScore(true);
        const score = parseInt(internalScoreInput, 10);

        try {
            await axios.post(`${api}/Hack/team/${selectedTeamScoring}/internal-score`, { score });
            setNotification({ message: 'Score submitted successfully!', type: 'success' });
            const updatedTeams = teams.map(t => 
                t._id === selectedTeamScoring ? { ...t, internalGameScore: score } : t
            );
            setTeams(updatedTeams);
            setSelectedTeamScoring("");
            setInternalScoreInput("");
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to submit score.";
            setNotification({ message: errorMsg, type: 'error' });
        } finally {
            setIsSubmittingScore(false);
        }
    };

    const handleResetAllDomains = async () => {
        try {
            await axios.post(`${api}/Hack/admin/reset-domains`);
            setNotification({ message: 'All domains have been reset!', type: 'success' });
            const [teamsRes, domainsRes] = await Promise.all([
                axios.get(`${api}/Hack/students`),
                axios.get(`${api}/domains`),
            ]);
            setTeams(teamsRes.data);
            setAllDomains(domainsRes.data);
        } catch (error) {
            setNotification({ message: 'Failed to reset domains.', type: 'error' });
        }
    };

    const handleLogin = (e) => { e.preventDefault(); if (passwordInput === "harsha") { setIsAuthenticated(true); sessionStorage.setItem("adminAuthenticated", "true"); setLoginError(""); } else { setLoginError("Incorrect Secret Jutsu. Access Denied."); setPasswordInput(""); } };
    const handleLogout = () => { sessionStorage.removeItem("adminAuthenticated"); setIsAuthenticated(false); setPasswordInput(""); };
    const handleSendPPT = async () => { if (!pptTemplate) { setUploadError("Please select a file."); return; } setIsUploading(true); setUploadError(""); try { const formData = new FormData(); formData.append("file", pptTemplate); formData.append("upload_preset", "ppt_templet"); const response = await axios.post("https://api.cloudinary.com/v1_1/dsvwojzli/raw/upload", formData); socket.emit('admin:sendPPT', { fileUrl: response.data.secure_url, fileName: pptTemplate.name }); setPptTemplate(null); document.getElementById('ppt-input').value = null; setNotification({ message: 'PPT Sent!', type: 'success' }); } catch (error) { setUploadError("Upload failed."); setNotification({ message: 'PPT Upload Failed!', type: 'error' }); } finally { setIsUploading(false); } };
    const handleExportMembers = () => { const flatData = []; teams.forEach(team => { flatData.push({ "Team Name": team.teamname, "Payment Status": team.verified ? "Yes" : "No", "Member Name": team.name, "Role": "Lead", "Registration Number": team.registrationNumber, "Year": team.year, "Department": team.department, "Email": team.email, "Phone": team.phone, "Transaction ID": team.transtationId, "Payment Image URL": team.imgUrl, }); team.teamMembers.forEach(member => { flatData.push({ "Team Name": team.teamname, "Payment Status": team.verified ? "Yes" : "No", "Member Name": member.name, "Role": "Member", "Registration Number": member.registrationNumber, "Year": member.year, "Department": member.department, "Email": member.email, "Phone": member.phone, }); }); }); const csv = Papa.unparse(flatData); const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); const link = document.createElement("a"); const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", "members_export.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const fetchIssues = async () => { setIssuesLoading(true); try { const res = await axios.get(`${api}/Hack/issues`); const pendingIssues = res.data.map(team => ({ ...team, issues: team.issues.filter(issue => issue.status === 'Pending') })).filter(team => team.issues.length > 0); setTeamsWithIssues(pendingIssues); } catch (error) { alert("Could not load support requests."); } finally { setIssuesLoading(false); } };
    const handleOpenSupportModal = () => { setShowSupportModal(true); fetchIssues(); };
    const handleResolveIssue = async (teamId, issueId) => { const originalIssues = [...teamsWithIssues]; setTeamsWithIssues(prevTeams => prevTeams.map(team => team._id === teamId ? { ...team, issues: team.issues.filter(issue => issue._id !== issueId) } : team).filter(team => team.issues.length > 0)); try { await axios.post(`${api}/Hack/issue/resolve/${teamId}/${issueId}`); setNotification({ message: 'Issue Resolved!', type: 'success' }); } catch (error) { setTeamsWithIssues(originalIssues); setNotification({ message: 'Failed to Resolve Issue!', type: 'error' }); } };
    const handleSendReminder = () => { if (!reminderText.trim()) { setReminderError("Cannot be empty."); return; } setIsSendingReminder(true); setReminderError(""); socket.emit('admin:sendReminder', { message: reminderText.trim() }); setNotification({ message: 'Reminder Sent!', type: 'success' }); setTimeout(() => { setIsSendingReminder(false); setReminderText(""); }, 1000); };
    const handleVerifyTeam = async (teamId) => { setVerifyingTeamId(teamId); try { await axios.post(`${api}/Hack/verify/${teamId}`); setTeams(prev => prev.map(t => t._id === teamId ? { ...t, verified: true } : t)); setNotification({ message: 'Team Verified!', type: 'success' }); } catch (error) { setNotification({ message: 'Verification Failed!', type: 'error' }); } finally { setVerifyingTeamId(null); } };
    const handleDomainChange = async (teamId, newDomain) => { const originalTeams = [...teams]; setTeams(prev => prev.map(t => t._id === teamId ? { ...t, Domain: newDomain } : t)); try { await axios.post(`${api}/Hack/updateDomain`, { teamId, domain: newDomain }); setNotification({ message: 'Domain Updated!', type: 'success' }); } catch (error) { setTeams(originalTeams); setNotification({ message: 'Failed to Update Domain!', type: 'error' }); } };
    const toggleTeamDetails = (teamId) => { setExpandedTeam(expandedTeam === teamId ? null : teamId); };
    const handleDownloadPass = async () => { if (!selectedTeamForPass) { alert("Please select a team."); return; } const team = teams.find(t => t._id === selectedTeamForPass); if (!team) { alert("Selected team not found."); return; } setIsGeneratingPass(true); const passElement = document.getElementById(`credential-pass-${team._id}`); if (!passElement) { setIsGeneratingPass(false); return; } try { const canvas = await html2canvas(passElement, { scale: 2, }); const imgData = canvas.toDataURL('image/png'); const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] }); pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height); pdf.save(`${team.teamname}_Credentials.pdf`); setNotification({ message: 'Credentials Exported!', type: 'success' }); } catch (error) { setNotification({ message: 'Export Failed!', type: 'error' }); } finally { setIsGeneratingPass(false); } };
    const handleDownloadAllPasses = async () => { setIsZipping(true); setZipProgress({ current: 0, total: 0 }); const zip = new JSZip(); const verifiedTeams = teams.filter(t => t.verified); if (verifiedTeams.length === 0) { setNotification({ message: 'No verified teams to export!', type: 'error' }); setIsZipping(false); return; } setZipProgress({ current: 0, total: verifiedTeams.length }); try { for (let i = 0; i < verifiedTeams.length; i++) { const team = verifiedTeams[i]; setZipProgress({ current: i + 1, total: verifiedTeams.length }); const passElement = document.getElementById(`credential-pass-${team._id}`); if (!passElement) { continue; } const canvas = await html2canvas(passElement, { scale: 2 }); const imgData = canvas.toDataURL('image/png'); const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] }); pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height); const pdfBlob = pdf.output('blob'); const safeFileName = team.teamname.replace(/[/\\?%*:|"<>]/g, '-') || 'Unnamed Team'; zip.file(`${safeFileName}_Credentials.pdf`, pdfBlob); } const zipBlob = await zip.generateAsync({ type: "blob" }); const link = document.createElement("a"); link.href = URL.createObjectURL(zipBlob); link.download = "All_Team_Credentials.zip"; document.body.appendChild(link); link.click(); document.body.removeChild(link); setNotification({ message: 'All credentials zipped!', type: 'success' }); } catch (error) { setNotification({ message: 'ZIP export failed!', type: 'error' }); } finally { setIsZipping(false); setZipProgress({ current: 0, total: 0 }); } };

    const fetchData = async () => {
        try {
            const [teamsRes, domainsRes, issuesRes] = await Promise.all([
                axios.get(`${api}/Hack/students`),
                axios.get(`${api}/domains`),
                axios.get(`${api}/Hack/issues`)
            ]);
            setTeams(teamsRes.data);
            setAllDomains(domainsRes.data);
            const pendingIssuesTeams = issuesRes.data.map(team => ({...team, issues: team.issues.filter(issue => issue.status === 'Pending')})).filter(team => team.issues.length > 0);
            setTeamsWithIssues(pendingIssuesTeams);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchData().finally(() => setLoading(false));

        const handleActiveSessionsUpdate = (data) => setActiveSessionsCount(data.count);
        const handleDomainsUpdate = () => fetchData();

        socket.on('admin:activeSessionsUpdate', handleActiveSessionsUpdate);
        socket.on('domains:updated', handleDomainsUpdate);
        socket.emit('admin:getActiveSessions');

        return () => {
            socket.off('admin:activeSessionsUpdate', handleActiveSessionsUpdate);
            socket.off('domains:updated', handleDomainsUpdate);
        };
    }, [isAuthenticated]);

    const verifiedCount = teams.filter(t => t.verified).length;
    const notVerifiedCount = teams.length - verifiedCount;
    const pendingIssuesCount = teamsWithIssues.reduce((count, team) => count + team.issues.length, 0);
    const verificationFilteredTeams = teams.filter(t => verificationTab === 'pending' ? !t.verified : t.verified).filter(team => team.teamname.toLowerCase().includes(verificationSearchTerm.toLowerCase()) || team.email.toLowerCase().includes(verificationSearchTerm.toLowerCase()));

    if (!isAuthenticated) {
        return ( <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url('https://images6.alphacoders.com/605/605598.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}> <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div> <div className="relative z-10 w-full max-w-md"> <form onSubmit={handleLogin} className="bg-gray-900/50 backdrop-blur-lg border border-orange-500/30 rounded-2xl shadow-2xl p-8 space-y-6"> <div className="text-center"> <h1 className="text-4xl font-naruto text-orange-500 drop-shadow-lg">Hokage's Office</h1> <p className="text-gray-400 mt-2">Admin Seal Verification Required</p> </div> <div> <label className="text-sm font-bold text-orange-400 mb-2 block" htmlFor="password">Secret Jutsu (Password)</label> <input id="password" type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="************" className="w-full bg-gray-800 border-2 border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"/> </div> {loginError && <p className="text-red-400 text-center text-sm">{loginError}</p>} <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform text-lg">Verify Seal</button> </form> </div> </div> );
    }
    
    return (
        <div className="min-h-screen text-white" style={{ backgroundImage: `url('https://images6.alphacoders.com/605/605598.jpg')`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            {notification.message && <Notification message={notification.message} type={notification.type} onClear={() => setNotification({ message: '', type: '' })} />}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
            
            <div className="relative z-10 flex h-screen">
                <aside className="w-72 bg-black/30 border-r border-orange-500/20 flex flex-col p-6">
                    <h1 className="text-3xl font-naruto text-orange-500 mb-8">Admin Panel</h1>
                    <nav className="flex flex-col gap-3 flex-grow">
                        <button onClick={() => setActiveView('teams')} className={`p-3 rounded-lg font-semibold text-left transition ${activeView === 'teams' ? 'bg-orange-600' : 'hover:bg-gray-700/50'}`}>Team Management</button>
                        <button onClick={() => setActiveView('scoring')} className={`p-3 rounded-lg font-semibold text-left transition ${activeView === 'scoring' ? 'bg-orange-600' : 'hover:bg-gray-700/50'}`}>Manual Scoring</button>
                        <button onClick={() => setActiveView('broadcast')} className={`p-3 rounded-lg font-semibold text-left transition ${activeView === 'broadcast' ? 'bg-orange-600' : 'hover:bg-gray-700/50'}`}>Broadcast Center</button>
                        <button onClick={() => setActiveView('controls')} className={`p-3 rounded-lg font-semibold text-left transition ${activeView === 'controls' ? 'bg-orange-600' : 'hover:bg-gray-700/50'}`}>Event Controls</button>
                        <button onClick={() => setActiveView('domains')} className={`p-3 rounded-lg font-semibold text-left transition ${activeView === 'domains' ? 'bg-orange-600' : 'hover:bg-gray-700/50'}`}>Domain Monitor</button>
                        <button onClick={() => setActiveView('export')} className={`p-3 rounded-lg font-semibold text-left transition ${activeView === 'export' ? 'bg-orange-600' : 'hover:bg-gray-700/50'}`}>Export Data</button>
                    </nav>
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-400">Live Stats</h3>
                        <div className="text-lg text-cyan-400">Active Logins: <span className="font-bold float-right">{activeSessionsCount}</span></div>
                        <div className="text-lg">Total Teams: <span className="font-bold float-right">{teams.length}</span></div>
                        <div className="text-lg text-green-400">Verified: <span className="font-bold float-right">{verifiedCount}</span></div>
                        <div className="text-lg text-red-400">Pending: <span className="font-bold float-right">{notVerifiedCount}</span></div>
                        <div className="text-lg text-yellow-400">Support Open: <span className="font-bold float-right">{pendingIssuesCount}</span></div>
                    </div>
                    <button onClick={handleLogout} className="mt-8 w-full bg-red-600/80 hover:bg-red-600 text-white font-semibold py-3 rounded-lg">Logout</button>
                </aside>

                <main className="flex-1 p-8 overflow-y-auto">
                    {loading ? <div className="flex h-full items-center justify-center"><NarutoLoader /></div> :
                    <>
                        {activeView === 'teams' && (
                            <div>
                                <h2 className="text-4xl font-naruto text-orange-400 mb-6">Team Management</h2>
                                <input type="text" placeholder="Search for a team..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mb-6 bg-gray-800/50 rounded-lg border-2 border-gray-700 focus:outline-none focus:border-orange-500"/>
                                <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                                    {teams.filter(team => team.teamname.toLowerCase().includes(searchTerm.toLowerCase())).map(team => {
                                        const totalGameScore = (team.memoryGameScore || 0) + (team.numberPuzzleScore || 0) + (team.internalGameScore || 0);
                                        return (
                                         <div key={team._id} className="bg-gray-800/60 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <p className="font-bold text-lg">{team.teamname}</p>
                                                    <div className="flex items-center gap-3 text-sm mt-1">
                                                        <span className={`font-semibold ${team.verified ? 'text-green-400' : 'text-red-400'}`}>{team.verified ? 'Verified' : 'Not Verified'}</span>
                                                        <span className="text-gray-600">|</span>
                                                        <span className="text-gray-300">Total Game Score: <strong className="text-white">{totalGameScore}</strong></span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <select value={team.Domain || ''} onChange={(e) => handleDomainChange(team._id, e.target.value)} className="w-48 p-2 bg-gray-700 text-white rounded-md border border-gray-600">
                                                        <option value="">-- No Domain --</option>
                                                        {allDomains.map(d => (<option key={d.id} value={d.name}>{d.name}</option>))}
                                                    </select>
                                                    <button onClick={() => toggleTeamDetails(team._id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">{expandedTeam === team._id ? 'Collapse' : 'Details'}</button>
                                                </div>
                                            </div>
                                             {expandedTeam === team._id && (
                                                 <div className="mt-4 pt-4 border-t border-gray-700 text-sm space-y-1">
                                                     <p><strong className="text-orange-400 w-24 inline-block">Lead:</strong> {team.name} ({team.registrationNumber})</p>
                                                     <p><strong className="text-orange-400 w-24 inline-block">Members:</strong> {team.teamMembers.map(m => m.name).join(', ')}</p>
                                                     <p><strong className="text-orange-400 w-24 inline-block">Memory Game:</strong> {team.memoryGameScore ?? 'Not Played'}</p>
                                                     <p><strong className="text-orange-400 w-24 inline-block">Number Puzzle:</strong> {team.numberPuzzleScore ?? 'Not Played'}</p>
                                                     <p><strong className="text-orange-400 w-24 inline-block">Internal Game:</strong> {team.internalGameScore ?? 'N/A'}</p>
                                                 </div>
                                             )}
                                         </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        {activeView === 'scoring' && (
                             <div>
                                 <h2 className="text-4xl font-naruto text-orange-400 mb-6">Manual Score Entry</h2>
                                 <div className="bg-gray-800/60 p-6 rounded-lg border border-cyan-500/30 max-w-lg mx-auto">
                                     <h3 className="text-2xl font-naruto text-cyan-400 mb-4 flex items-center gap-3">
                                         <Gem />
                                         Add Internal Game Score
                                     </h3>
                                     <form onSubmit={handleInternalScoreSubmit} className="space-y-4">
                                         <div>
                                             <label className="block text-gray-300 mb-2">Select Team</label>
                                             <select 
                                                 value={selectedTeamScoring}
                                                 onChange={(e) => setSelectedTeamScoring(e.target.value)}
                                                 className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-cyan-500"
                                             >
                                                 <option value="">-- Choose a team --</option>
                                                 {teams.map(team => (
                                                     <option key={team._id} value={team._id}>
                                                         {team.teamname} (Current: {team.internalGameScore || 0})
                                                     </option>
                                                 ))}
                                             </select>
                                         </div>
                                         <div>
                                             <label className="block text-gray-300 mb-2">Enter Score</label>
                                             <input 
                                                 type="number"
                                                 value={internalScoreInput}
                                                 onChange={(e) => setInternalScoreInput(e.target.value)}
                                                 placeholder="e.g., 150"
                                                 className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-cyan-500"
                                             />
                                         </div>
                                         <button 
                                             type="submit"
                                             disabled={isSubmittingScore}
                                             className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold py-3 rounded-lg disabled:opacity-50 transition"
                                         >
                                             {isSubmittingScore ? 'Submitting...' : 'Submit Score'}
                                         </button>
                                     </form>
                                 </div>
                             </div>
                        )}
                        {activeView === 'domains' && (
                            <DomainMonitor
                                teams={teams}
                                domains={allDomains}
                                onResetDomains={handleResetAllDomains}
                            />
                        )}
                        {activeView === 'broadcast' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-4xl font-naruto text-orange-400 mb-6">Broadcast Center</h2>
                                    <div className="bg-gray-800/60 p-6 rounded-lg border border-yellow-500/30">
                                        <h3 className="text-2xl font-naruto text-yellow-400 mb-4">Send Reminder</h3>
                                        <textarea value={reminderText} onChange={(e) => setReminderText(e.target.value)} placeholder="e.g., Lunch will be served at 1:00 PM..." className="w-full h-24 p-3 bg-gray-700 rounded-lg" disabled={isSendingReminder}/>
                                        {reminderError && <p className="text-red-400 text-sm mt-2">{reminderError}</p>}
                                        <button onClick={handleSendReminder} disabled={isSendingReminder || !reminderText.trim()} className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 font-bold py-3 rounded-lg disabled:opacity-50">{isSendingReminder ? 'Broadcasting...' : 'Send to All Teams'}</button>
                                    </div>
                                </div>
                                <div className="bg-gray-800/60 p-6 rounded-lg border border-purple-500/30">
                                    <h3 className="text-2xl font-naruto text-purple-400 mb-4">Send PPT Template</h3>
                                    <input id="ppt-input" type="file" accept=".ppt, .pptx" onChange={(e) => setPptTemplate(e.target.files[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700" disabled={isUploading}/>
                                    {uploadError && <p className="text-red-400 text-sm mt-2">{uploadError}</p>}
                                    <button onClick={handleSendPPT} disabled={isUploading || !pptTemplate} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 font-bold py-3 rounded-lg disabled:opacity-50">{isUploading ? 'Sending...' : 'Broadcast Template'}</button>
                                </div>
                            </div>
                        )}
                        {activeView === 'controls' && (
                             <div>
                                <h2 className="text-4xl font-naruto text-orange-400 mb-6">Event Controls</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button onClick={() => setShowVerificationModal(true)} className="p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform">Verify Payments</button>
                                    <button onClick={handleOpenSupportModal} className="relative p-6 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-bold">{pendingIssuesCount > 0 && <span className="absolute -top-2 -right-2 flex h-6 w-6"><span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center text-xs">{pendingIssuesCount}</span></span>}Support Requests</button>
                                    <button onClick={() => navigate('/admin-controls')} className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold">Domain Controls</button>
                                    <button onClick={() => setShowAttdModal(true)} className="p-6 bg-teal-600 hover:bg-teal-700 rounded-lg text-xl font-bold">Open Attendance</button>
                                </div>
                             </div>
                        )}
                        {activeView === 'export' && (
                            <div>
                                <h2 className="text-4xl font-naruto text-orange-400 mb-6">Export Data</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button onClick={handleExportMembers} className="p-6 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold">Export All Members (CSV)</button>
                                    <button onClick={() => setShowCredentialModal(true)} className="p-6 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-xl font-bold">Export Credentials (PDF)</button>
                                </div>
                            </div>
                        )}
                    </>
                    }
                </main>
            </div>

            {/* --- ALL MODALS --- */}
            {showVerificationModal && ( <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"> <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-4xl flex flex-col"> <div className="flex justify-between items-center mb-4"> <h2 className="text-2xl text-orange-400 font-naruto">Payment Verification</h2> <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowVerificationModal(false)}>&times;</button> </div> <div className="flex border-b border-gray-700 mb-4"> <button onClick={() => setVerificationTab('pending')} className={`py-2 px-4 font-semibold ${verificationTab === 'pending' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'}`}>Pending ({notVerifiedCount})</button> <button onClick={() => setVerificationTab('verified')} className={`py-2 px-4 font-semibold ${verificationTab === 'verified' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>Verified ({verifiedCount})</button> </div> <div className="mb-4"> <input type="text" placeholder="Search by Team Name or Email..." value={verificationSearchTerm} onChange={(e) => setVerificationSearchTerm(e.target.value)} className="w-full p-3 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:outline-none focus:border-orange-500 transition-colors" /> </div> <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2"> {verificationFilteredTeams.length > 0 ? ( verificationFilteredTeams.map((team) => ( <div key={team._id} className="bg-gray-800 rounded-lg p-4 shadow"> <div className="flex justify-between items-center"> <div> <p className="text-white font-semibold">{team.teamname}</p> <p className="text-gray-400 text-sm">{team.email}</p> </div> <div className="flex items-center gap-4"> <button onClick={() => toggleTeamDetails(team._id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold">{expandedTeam === team._id ? 'Collapse' : 'Expand'}</button> {verificationTab === 'pending' && ( <button onClick={() => handleVerifyTeam(team._id)} disabled={verifyingTeamId === team._id} className="w-24 text-center px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow disabled:opacity-50 disabled:cursor-wait"> {verifyingTeamId === team._id ? ( <div className="flex justify-center items-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div> ) : ( 'Verify' )} </button> )} </div> </div> {expandedTeam === team._id && ( <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <h4 className="font-bold text-orange-400 mb-2">Team Members:</h4> <ul className="list-disc list-inside text-gray-300 space-y-1"> <li>{team.name} (Leader)</li> {team.teamMembers.map((member, index) => (<li key={index}>{member.name}</li>))} </ul> <h4 className="font-bold text-orange-400 mt-4 mb-2">Payment Details:</h4> <p className="text-gray-300"><span className="font-semibold">UPI ID:</span> {team.upiId}</p> <p className="text-gray-300"><span className="font-semibold">Transaction ID:</span> {team.transtationId}</p> </div> <div> <h4 className="font-bold text-orange-400 mb-2">Payment Proof:</h4> <a href={team.imgUrl} target="_blank" rel="noopener noreferrer"><img src={team.imgUrl} alt="Payment Proof" className="rounded-lg w-full h-auto max-h-60 object-contain cursor-pointer"/></a> </div> </div> )} </div> )) ) : ( <div className="text-center py-10"> <p className="text-gray-400">No teams found matching your search.</p> </div> )} </div> </div> </div> )}
            {showSupportModal && ( <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"> <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-3xl flex flex-col"> <div className="flex justify-between items-center mb-4"> <h2 className="text-2xl text-orange-400 font-naruto">Support Requests</h2> <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowSupportModal(false)}>&times;</button> </div> <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"> {issuesLoading ? (<div className="text-center text-gray-400 py-8">Loading requests...</div>) : teamsWithIssues.length > 0 ? (teamsWithIssues.map(team => (team.issues.map(issue => ( <div key={issue._id} className="bg-gray-800 rounded-lg p-4 shadow-md"> <div className="flex justify-between items-start gap-4"> <div> <p className="text-sm text-gray-400 mb-1">Sector: {team.Sector}</p> <p className="font-bold text-lg text-white">Team Name: {team.teamname}</p> <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">Issue: {issue.text}</p> </div> <button onClick={() => handleResolveIssue(team._id, issue._id)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md whitespace-nowrap">Resolve</button> </div> <p className="text-xs text-gray-500 text-right mt-2">{new Date(issue.timestamp).toLocaleString()}</p> </div> ))))) : (<div className="text-center text-gray-400 py-12"><p className="text-3xl">🎉</p><p className="mt-2 font-semibold text-lg">All requests have been resolved!</p></div>)} </div> </div> </div> )}
            {showAttdModal && ( <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"> <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col"> <h2 className="text-xl font-bold text-orange-400 mb-4">Select Attendance Round</h2> <div className="flex flex-col gap-3"> {["First", "Second", "Third", "Fourth","Fifth", "Sixth", "Seventh"].map((round, idx) => ( <button key={round} className={`px-4 py-2 rounded-lg font-semibold transition ${selectedAttdRound === idx + 1 ? "bg-orange-700 text-white" : "bg-gray-700 text-gray-300 hover:bg-orange-600 hover:text-white"}`} onClick={() => { setSelectedAttdRound(idx + 1); setShowAttdModal(false); navigate(`/attdence?round=${idx + 1}`); }} >{round} Attendance</button> ))} </div> <button className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg" onClick={() => setShowAttdModal(false)}>Cancel</button> </div> </div> )}
            {showCredentialModal && ( <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"> <div className="bg-gray-900 border-2 border-cyan-500/50 rounded-xl shadow-lg p-6 w-full max-w-lg flex flex-col"> <div className="flex justify-between items-center mb-6"> <h2 className="text-2xl text-cyan-400 font-naruto">Export Team Credentials</h2> <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowCredentialModal(false)}>&times;</button> </div> <div className="space-y-4 border-b border-gray-700 pb-6 mb-6"> <p className="text-gray-300 text-center font-semibold">Download a Single Team Pass</p> <div className="flex flex-col sm:flex-row gap-4"> <select value={selectedTeamForPass} onChange={(e) => setSelectedTeamForPass(e.target.value)} className="flex-grow p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:border-cyan-500"> <option value="">-- Select a Verified Team --</option> {teams.filter(t => t.verified).map(team => ( <option key={team._id} value={team._id}>{team.teamname}</option> ))} </select> <button onClick={handleDownloadPass} disabled={!selectedTeamForPass || isGeneratingPass} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"> {isGeneratingPass ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</>) : 'Download Pass (PDF)'} </button> </div> </div> <div className="space-y-4 text-center"> <p className="text-gray-300 font-semibold">Download All Verified Team Passes</p> <p className="text-sm text-gray-500">This will generate a PDF for every verified team and download them in a single .zip file.</p> <button onClick={handleDownloadAllPasses} disabled={isZipping} className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"> {isZipping ? ( <> <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Zipping... ({zipProgress.current} / {zipProgress.total}) </> ) : ( 'Download All as ZIP' )} </button> </div> </div> </div> )}

            <div ref={passContainerRef} style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -10 }}>
                {teams.filter(t => t.verified).map(team => (
                    <div
                        key={`pass-${team._id}`}
                        id={`credential-pass-${team._id}`}
                        style={{
                            width: '620px',
                            minHeight: '877px',
                            padding: '2rem',
                            backgroundColor: '#f5f5f5',
                            color: '#1a202c',
                            fontFamily: 'sans-serif',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-50px',
                            left: '-50px',
                            width: '200px',
                            height: '200px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            opacity: '0.1',
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-50px',
                            right: '-50px',
                            width: '250px',
                            height: '250px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            opacity: '0.05',
                        }} />

                        <div style={{ textAlign: 'center', borderBottom: '2px solid #cbd5e0', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c' }}>EVENT CREDENTIALS</h1>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 'normal', color: '#4a5568', marginTop: '0.5rem' }}>HACKFORGE 2025</h2>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'normal', color: '#4a5568', marginTop: '0.5rem'}}>DONT SHARE THIS PASSWOARDS WITH ANYONE!</h3>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'semibold', color: '#2d3748', marginBottom: '0.5rem' }}>Team: <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{team.teamname}</span></p>
                            <p style={{ fontSize: '1.125rem', color: '#f82121ff' }}>Sector: {team.Sector || 'N/A'}</p>
                        </div>

                        <div style={{ backgroundColor: '#e2e8f0', border: '1px solid #a0aec0', borderRadius: '1rem', textAlign: 'center', padding: '1.5rem', margin: '2rem 0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <p style={{ color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Team Secret Code / Password</p>
                            <p style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '0.1em' }}>
                                {team.password || 'N/A'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                {team.lead?.qrCode && team.lead.qrCode.startsWith('data:image') ? (
                                    <img src={team.lead.qrCode} alt={`QR Code for ${team.name}`} style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', border: '2px solid #e2e8f0', padding: '0.25rem' }}/>
                                ) : (
                                    <div style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e0', padding: '0.5rem', border: '2px solid #e2e8f0' }}>
                                        QR Code Data Invalid
                                    </div>
                                )}
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {team.name}
                                        <span style={{ fontSize: '0.8rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', marginLeft: '0.5rem', verticalAlign: 'middle' }}>LEADER</span>
                                    </p>
                                    <p style={{ color: '#4a5568' }}>Reg No: {team.registrationNumber}</p>
                                </div>
                            </div>
                            {team.teamMembers.map((member, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {member.qrCode && member.qrCode.startsWith('data:image') ? (
                                        <img src={member.qrCode} alt={`QR Code for ${member.name}`} style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', border: '2px solid #e2e8f0', padding: '0.25rem' }}/>
                                    ) : (
                                        <div style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e0', padding: '0.5rem', border: '2px solid #e2e8f0' }}>
                                            QR Code Data Invalid
                                        </div>
                                    )}
                                    <div>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{member.name}</p>
                                        <p style={{ color: '#4a5568' }}>Reg No: {member.registrationNumber}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#718096', fontSize: '0.875rem' }}>
                            <p>ANY ISSUES CONTACT 7671084221</p>
                            <p>This pass must be presented for entry and attendance verification.</p>
                            <p>&copy; 2025 Scorecraft KARE</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Admin;