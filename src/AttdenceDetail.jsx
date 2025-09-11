import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import api from "./api";
import Papa from "papaparse";
import { Users, CheckCircle, XCircle, Percent, Download, Search, ArrowLeft, ArrowRight } from 'lucide-react';

// --- Re-styled Stat Card Component ---
const StatCard = ({ icon, title, value, color, unit = '' }) => (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700/50 flex items-center gap-5">
        <div className={`p-4 rounded-full bg-gray-800/50 ${color}`}>
            {icon}
        </div>
        <div>
            <h3 className="text-lg text-gray-400">{title}</h3>
            <p className="text-4xl font-bold text-white">{value}{unit}</p>
        </div>
    </div>
);

function AttdenceDetail() {
    const [teams, setTeams] = useState([]);
    const [allTeamsForStats, setAllTeamsForStats] = useState([]); // New state to hold all teams for stats calculation
    const [loading, setLoading] = useState(true);
    const [statsRound, setStatsRound] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch the paginated list of teams for display
                const pagedRes = await axios.get(`${api}/Hack/students?page=${currentPage}&limit=20`);
                setTeams(pagedRes.data.teams);
                setTotalPages(pagedRes.data.totalPages);

                // Fetch all teams *once* for accurate stats, if not already fetched
                if (allTeamsForStats.length === 0) {
                   const allTeamsRes = await axios.get(`${api}/Hack/students`);
                   setAllTeamsForStats(allTeamsRes.data.teams);
                }

            } catch (error) {
                console.error("Error fetching teams:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [currentPage]); // Re-fetch data only when the currentPage changes

    // Memoized filtering for performance
    const filteredTeams = useMemo(() => {
        if (!searchTerm) {
            return teams;
        }
        // This will filter only the teams on the current page
        return teams.filter(team =>
            team.teamname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.registrationNumber.includes(searchTerm)
        );
    }, [teams, searchTerm]);


    const getAttendanceStatus = (member, round) => {
        if (!member || !member.attendance || !Array.isArray(member.attendance)) {
            return "Not Marked";
        }
        const attendanceRecord = member.attendance.find(a => String(a.round) === String(round));
        return attendanceRecord ? attendanceRecord.status : "Absent";
    };

    // This function now uses the complete list of teams for accurate stats
    const getAttendanceStats = (round) => {
        let total = 0;
        let present = 0;
        allTeamsForStats.forEach(team => {
            const allMembers = [ { ...team, isLead: true }, ...team.teamMembers ].filter(Boolean);
            allMembers.forEach(member => {
                const memberOrLead = member.isLead ? team.lead : member;
                if (memberOrLead) {
                    total++;
                    if (getAttendanceStatus(memberOrLead, round) === "Present") {
                        present++;
                    }
                }
            });
        });
        
        const absent = total - present;
        const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
        return { total, present, absent, presentPercent };
    };

    const handleDownloadCsv = () => {
        const flatData = [];
        // Important: Use `allTeamsForStats` for the CSV export to get all data, not just the current page
        allTeamsForStats.forEach(team => {
            flatData.push({
                "Team Name": team.teamname, "Sector": team.Sector, "Member Name": team.name,
                "Registration No": team.registrationNumber, "Department": team.department, "Role": "Lead",
                "Round 1": getAttendanceStatus(team.lead, 1), "Round 2": getAttendanceStatus(team.lead, 2),
                "Round 3": getAttendanceStatus(team.lead, 3), "Round 4": getAttendanceStatus(team.lead, 4),
                "Round 5": getAttendanceStatus(team.lead, 5), "Round 6": getAttendanceStatus(team.lead, 6),
                "Round 7": getAttendanceStatus(team.lead, 7),
            });
            team.teamMembers.forEach(member => {
                flatData.push({
                    "Team Name": team.teamname, "Sector": team.Sector, "Member Name": member.name,
                    "Registration No": member.registrationNumber, "Department": member.department, "Role": "Member",
                    "Round 1": getAttendanceStatus(member, 1), "Round 2": getAttendanceStatus(member, 2),
                    "Round 3": getAttendanceStatus(member, 3), "Round 4": getAttendanceStatus(member, 4),
                    "Round 5": getAttendanceStatus(member, 5), "Round 6": getAttendanceStatus(member, 6),
                    "Round 7": getAttendanceStatus(member, 7),
                });
            });
        });
        const csv = Papa.unparse(flatData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Full_Attendance_Report.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl font-semibold animate-pulse">Loading Attendance Data...</div>
            </div>
        );
    }
    
    const stats = getAttendanceStats(statsRound);
    const getStatusClass = (status) => {
        if (status === "Present") return "bg-green-500/20 text-green-300";
        if (status === "Absent") return "bg-red-500/20 text-red-300";
        return "bg-gray-500/20 text-gray-300";
    };
    const rounds = [1, 2, 3, 4, 5, 6, 7];

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-4xl font-bold font-naruto text-orange-400 tracking-wider">ATTENDANCE REPORT</h1>
                    <button onClick={handleDownloadCsv} className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                        <Download size={20} /> Download Full Report (CSV)
                    </button>
                </div>

                <div className="mb-8 p-2 bg-gray-900/50 border border-gray-700 rounded-xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
                    {rounds.map(round => (
                        <button key={round} onClick={() => setStatsRound(round)} className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${statsRound === round ? 'bg-orange-600 text-white scale-105 shadow-lg shadow-orange-500/20' : 'bg-gray-800 hover:bg-gray-700/50'}`}>
                            Round {round}
                        </button>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     <StatCard icon={<Users size={28} />} title="Total Participants" value={stats.total} color="text-blue-400" />
                     <StatCard icon={<CheckCircle size={28} />} title={`Present (R${statsRound})`} value={stats.present} color="text-green-400" />
                     <StatCard icon={<XCircle size={28} />} title={`Absent (R${statsRound})`} value={stats.absent} color="text-red-400" />
                     <StatCard icon={<Percent size={28} />} title={`Rate (R${statsRound})`} value={stats.presentPercent} unit="%" color="text-cyan-400" />
                </div>
                
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search teams on this page..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>

                <div className="space-y-6">
                    {filteredTeams.map((team) => (
                        <div key={team._id} className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
                            <div className="p-4 bg-black/20">
                                <h3 className="text-xl font-bold text-orange-400">{team.teamname} <span className="text-sm text-gray-500">({team.Sector})</span></h3>
                            </div>
                            <div className="divide-y divide-gray-800">
                                {[ { ...team, isLead: true }, ...team.teamMembers].filter(Boolean).map((member, idx) => {
                                    const memberOrLead = member.isLead ? team.lead : member;
                                    return (
                                        <div key={idx} className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-gray-800/50 transition-colors">
                                            <div className="col-span-12 md:col-span-5">
                                                <p className="font-semibold text-white">{member.name}</p>
                                                <p className={`text-xs ${member.isLead ? 'text-yellow-400' : 'text-gray-400'}`}>{member.isLead ? 'Team Lead' : 'Member'}</p>
                                            </div>
                                            <div className="col-span-12 md:col-span-7 grid grid-cols-7 gap-2 text-center">
                                                {rounds.map(round => (
                                                    <div key={`${team._id}-${idx}-${round}`} className="flex justify-center">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(getAttendanceStatus(memberOrLead, round))}`}>
                                                            {getAttendanceStatus(memberOrLead, round)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {filteredTeams.length === 0 && (
                        <div className="text-center py-16 bg-gray-900/50 rounded-lg">
                            <p className="text-gray-400">No teams match your search criteria on this page.</p>
                        </div>
                    )}
                </div>

                {/* --- Pagination Controls --- */}
                <div className="flex justify-center items-center mt-8 gap-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft size={16} /> Previous
                    </button>
                    <span className="font-semibold text-gray-300">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
                    >
                        Next <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AttdenceDetail;