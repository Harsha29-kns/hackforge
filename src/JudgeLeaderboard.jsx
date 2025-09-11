import axios from "axios";
import { useEffect, useState } from "react";
import api from "./api";

// Reusable component for displaying a team's ranking
const RankListItem = ({ team, rank }) => (
    <div className="flex items-center bg-gray-800/80 p-3 rounded-lg transition-all hover:bg-gray-700/80">
        <p className="text-base font-bold text-gray-400 w-10">{rank}</p>
        <div className="flex-1">
            <p className="font-semibold text-white truncate">{team.teamname || "—"}</p>
            <p className="text-xs text-gray-500">{team.Domain || "No Domain"}</p>
        </div>
        <div className="hidden sm:flex gap-4 mx-4 text-center">
            <div>
                <p className="text-xs text-gray-500">R1</p>
                <p className="font-semibold text-sm text-white">{team.FirstReviewScore || 0}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500">R2</p>
                <p className="font-semibold text-sm text-white">{team.SecoundReviewScore || 0}</p>
            </div>
        </div>
        <p className="text-base font-bold text-white w-20 text-right">{team.FinalScore || 0} pts</p>
    </div>
);

// Component for displaying a judge's leaderboard
const JudgeColumn = ({ title, teams }) => (
    <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-purple-500/30">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{title}</h2>
        <div className="space-y-3">
            {teams.length > 0 ? (
                teams.map((team, index) => (
                    <RankListItem key={team._id} team={team} rank={index + 1} />
                ))
            ) : (
                <p className="text-center text-gray-500 py-8">No scores recorded yet.</p>
            )}
        </div>
    </div>
);


function JudgeLeaderboard() {
    const [judge1Top10, setJudge1Top10] = useState([]);
    const [judge2Top10, setJudge2Top10] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${api}/Hack/students`);
                const allTeams = response.data;

                // Sort teams alphabetically once to ensure consistent slicing
                const sortedSasukeTeams = allTeams
                    .filter(t => t.Sector === "Sasuke")
                    .sort((a, b) => a.teamname.localeCompare(b.teamname));
                
                // Assign teams to judges based on the specified logic
                const judge1Teams = [
                    ...allTeams.filter(t => t.Sector === "Naruto"),
                    ...sortedSasukeTeams.slice(0, 10)
                ];
                const judge2Teams = [
                    ...allTeams.filter(t => t.Sector === "Itachi"),
                    ...sortedSasukeTeams.slice(10)
                ];
                
                // Get the top 10 for each judge
                const top10Judge1 = judge1Teams
                    .sort((a, b) => (b.FinalScore || 0) - (a.FinalScore || 0))
                    .slice(0, 10);

                const top10Judge2 = judge2Teams
                    .sort((a, b) => (b.FinalScore || 0) - (a.FinalScore || 0))
                    .slice(0, 10);

                setJudge1Top10(top10Judge1);
                setJudge2Top10(top10Judge2);

            } catch (error) {
                console.error("Error fetching teams:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-xl font-semibold animate-pulse">Loading Judge Leaderboards...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans py-12 px-4">
             <style>{`body { background-color: #111827; }`}</style>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12 text-white tracking-wider">JUDGE LEADERBOARDS</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <JudgeColumn title="Judge 1's Top 10" teams={judge1Top10} />
                    <JudgeColumn title="Judge 2's Top 10" teams={judge2Top10} />
                </div>
            </div>
        </div>
    );
}

export default JudgeLeaderboard; 