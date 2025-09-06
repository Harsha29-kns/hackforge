import axios from "axios";
import { useEffect, useState } from "react";
import api from "./api";

// You can use a library like 'react-icons' for better icons
const CrownIcon = () => <span className="text-2xl">👑</span>;

// A dedicated component for list items to keep the code clean
const RankListItem = ({ team, rank }) => (
    <div className="flex flex-col md:flex-row items-center bg-gray-800 p-4 rounded-lg transition-all hover:bg-gray-700 hover:scale-[1.02]">
        <p className="text-lg font-bold text-gray-400 w-12 mb-2 md:mb-0">{rank}</p>
        <div className="flex-1 text-center md:text-left">
            <p className="font-semibold text-white truncate">{team.teamname || "—"}</p>
            <p className="text-xs text-gray-500">{team.Domain || "No Domain"}</p>
        </div>
        <div className="flex gap-4 mx-4 text-center my-3 md:my-0">
            <div>
                <p className="text-xs text-gray-500">Review 1</p>
                <p className="font-semibold text-white">{team.FirstReviewScore || 0}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500">Review 2</p>
                <p className="font-semibold text-white">{team.SecoundReviewScore || 0}</p>
            </div>
        </div>
        <p className="text-lg font-bold text-white w-24 text-center md:text-right">{team.FinalScore || 0} pts</p>
    </div>
);


function TeamMarks() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false); // State to control visibility of all teams

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${api}/Hack/students`);
                const sortedData = response.data.sort((a, b) => (b.FinalScore || 0) - (a.FinalScore || 0));
                setTeams(sortedData);
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
                <div className="text-xl font-semibold animate-pulse">Loading Rankings...</div>
            </div>
        );
    }

    const topThree = teams.slice(0, 3);
    const nextTwelve = teams.slice(3, 15); // Teams ranked 4-15
    const theRest = teams.slice(15);      // Teams ranked 16+

    const getPodiumStyle = (rank) => {
        // ... (this function remains unchanged)
        switch (rank) {
            case 1: return { order: 'md:order-2', scale: 'md:scale-110', borderColor: 'border-yellow-400', bgColor: 'bg-yellow-400/10', textColor: 'text-yellow-300' };
            case 2: return { order: 'md:order-1', scale: 'md:mt-12', borderColor: 'border-gray-400', bgColor: 'bg-gray-400/10', textColor: 'text-gray-300' };
            case 3: return { order: 'md:order-3', scale: 'md:mt-12', borderColor: 'border-orange-600', bgColor: 'bg-orange-600/10', textColor: 'text-orange-400' };
            default: return {};
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans py-12 px-4">
             <style>{`body { background-color: #111827; }`}</style>
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-4 text-white tracking-wider">LEADERBOARD</h1>
                <p className="text-center text-gray-400 mb-12">The top performing teams in the arena.</p>

                {/* --- PODIUM FOR TOP 3 --- */}
                {topThree.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-20">
                         {[topThree[1], topThree[0], topThree[2]].map((team, index) => {
                            if (!team) return <div key={index}></div>;
                            const rank = teams.findIndex(t => t._id === team._id) + 1;
                            const styles = getPodiumStyle(rank);
                            return (
                                <div key={team._id} className={`p-6 bg-gray-800/50 rounded-xl border-2 ${styles.borderColor} ${styles.bgColor} ${styles.order} ${styles.scale} transition-transform duration-300`}>
                                    <div className="flex flex-col items-center text-center">
                                        {rank === 1 && <CrownIcon />}
                                        <h2 className={`text-3xl font-bold ${styles.textColor}`}>{`#${rank}`}</h2>
                                        <p className="text-xl font-semibold mt-2 text-white truncate">{team.teamname || "—"}</p>
                                        <p className="text-sm text-gray-400">{team.Domain || "No Domain"}</p>
                                        <div className="mt-4 text-3xl font-bold text-white">
                                            {team.FinalScore || 0}
                                            <span className="text-base font-normal text-gray-500"> pts</span>
                                        </div>

                                        {/* --- ADDED: Detailed Score Breakdown --- */}
                                        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-700 w-full justify-center">
                                            <div>
                                                <p className="text-xs text-gray-500">Review 1</p>
                                                <p className="font-semibold text-sm text-white">{team.FirstReviewScore || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Review 2</p>
                                                <p className="font-semibold text-sm text-white">{team.SecoundReviewScore || 0}</p>
                                            </div>
                                        </div>
                                        {/* --- END: Detailed Score Breakdown --- */}

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- LIST FOR THE REST --- */}
                <h2 className="text-2xl font-bold text-white mb-6">All Rankings</h2>
                <div className="space-y-3">
                    {/* Render teams 4-15 */}
                    {nextTwelve.map((team, index) => (
                        <RankListItem key={team._id} team={team} rank={index + 4} />
                    ))}

                    {/* Conditionally render the rest of the teams */}
                    {showAll && theRest.map((team, index) => (
                        <RankListItem key={team._id} team={team} rank={index + 16} />
                    ))}

                    {/* "Show All" button */}
                    {theRest.length > 0 && (
                        <div className="pt-4 text-center">
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                {showAll ? "Show Less" : "Show All Teams"}
                            </button>
                        </div>
                    )}

                    {teams.length === 0 && (
                        <div className="text-center py-8 bg-gray-800 rounded-lg">
                            <p className="text-gray-400">No team data available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeamMarks;