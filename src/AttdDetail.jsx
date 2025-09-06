import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";
import Papa from "papaparse"; // <-- 1. IMPORT PAPAPARSE

function AttdDetail() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsRound, setStatsRound] = useState(1);

    useEffect(() => {       
        async function fetchData() {
            try {
                let res = await axios.get(`${api}/Hack/students`);
                setTeams(res.data);
            } catch (error) {
                console.error("Error fetching teams:", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, []);

    const getAttendanceStatus = (member, round) => {
        // This function correctly handles potentially missing data
        if (!member || !member.attendance || !Array.isArray(member.attendance)) {
            return "Not Marked";
        }
        const attendanceRecord = member.attendance.find(a => a.round == round);
        return attendanceRecord ? "Present" : "Absent"; // Simplified to Present/Absent for clarity in CSV
    };

    const getAttendanceStats = (round) => {
        let total = 0;
        let present = 0;
        teams.forEach(team => {
            // Combine lead and members into a single array for easier processing
            const allMembers = [team.lead, ...team.teamMembers].filter(Boolean);
            total += allMembers.length;
            allMembers.forEach(member => {
                if (getAttendanceStatus(member, round) === "Present") {
                    present++;
                }
            });
        });
        
        const absent = total - present;
        const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { total, present, absent, presentPercent };
    };    

    // <-- 2. ADD THIS DOWNLOAD HANDLER FUNCTION -->
    const handleDownloadCsv = () => {
        if (teams.length === 0) {
            alert("No data available to download.");
            return;
        }

        // We need to flatten the data: from nested teams/members to a simple list of people
        const flatData = [];
        teams.forEach(team => {
            // Add the team lead
            flatData.push({
                "Team Name": team.teamname,
                "Sector": team.Sector,
                "Member Name": team.name,
                "Registration No": team.registrationNumber,
                "Department": team.department,
                "Role": "Lead",
                "Round 1": getAttendanceStatus(team.lead, 1),
                "Round 2": getAttendanceStatus(team.lead, 2),
                "Round 3": getAttendanceStatus(team.lead, 3),
                "Round 4": getAttendanceStatus(team.lead, 4),
            });

            // Add the team members
            team.teamMembers.forEach(member => {
                flatData.push({
                    "Team Name": team.teamname,
                    "Sector": team.Sector,
                    "Member Name": member.name,
                    "Registration No": member.registrationNumber,
                    "Department": member.department,
                    "Role": "Member",
                    "Round 1": getAttendanceStatus(member, 1),
                    "Round 2": getAttendanceStatus(member, 2),
                    "Round 3": getAttendanceStatus(member, 3),
                    "Round 4": getAttendanceStatus(member, 4),
                });
            });
        });

        // Convert the flat data array to a CSV string
        const csv = Papa.unparse(flatData);

        // Create a Blob and trigger the download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Detailed_Attendance_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl font-semibold">Loading attendance data...</div>
            </div>
        );
    }
    
    const stats = getAttendanceStats(statsRound);

    const getStatusClass = (status) => {
        if (status === "Present") return "bg-green-100 text-green-800";
        if (status === "Absent") return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-5">
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h1 className="text-3xl font-bold">Detailed Attendance</h1>
                    
                    {/* <-- 3. ADD THE DOWNLOAD BUTTON --> */}
                    <button
                        onClick={handleDownloadCsv}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform"
                    >
                        Download Report (CSV)
                    </button>
                </div>

                {/* Round Selector for Stats */}
                <div className="mb-6">
                    <div className="flex justify-center bg-gray-800 rounded-lg p-2 gap-2">
                        {[1, 2, 3, 4].map(round => (
                            <button 
                                key={round}
                                onClick={() => setStatsRound(round)}
                                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${statsRound === round ? 'bg-orange-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                Round {round} Stats
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                     <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg text-gray-400">Total Participants</h3>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg text-gray-400">Present (Round {statsRound})</h3>
                        <p className="text-3xl font-bold text-green-500">{stats.present}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg text-gray-400">Absent/Unmarked (Round {statsRound})</h3>
                        <p className="text-3xl font-bold text-red-500">{stats.absent}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg text-gray-400">Attendance Rate (Round {statsRound})</h3>
                        <p className="text-3xl font-bold text-blue-500">{stats.presentPercent}%</p>
                    </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Member Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Round 1</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Round 2</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Round 3</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Round 4</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {teams.map((team) => (
                                    <React.Fragment key={team._id}>
                                        <tr className="bg-gray-750">
                                            <td colSpan="5" className="px-6 py-3 text-left text-base font-bold text-orange-400">{team.teamname} ({team.Sector})</td>
                                        </tr>
                                        <tr className="bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{team.name} (Lead)</td>
                                            {[1, 2, 3, 4].map(round => (
                                                <td key={`${team._id}-lead-${round}`} className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(getAttendanceStatus(team.lead, round))}`}>
                                                        {getAttendanceStatus(team.lead, round)}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                        {team.teamMembers.map((member, idx) => (
                                            <tr key={`${team._id}-member-${idx}`} className="bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{member.name}</td>
                                                {[1, 2, 3, 4].map(round => (
                                                    <td key={`${team._id}-member-${idx}-${round}`} className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(getAttendanceStatus(member, round))}`}>
                                                            {getAttendanceStatus(member, round)}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                                {teams.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-400">
                                            No teams found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttdDetail;