import axios from "axios";
import { useEffect, useState } from "react";
import api from "./api";
import { io } from "socket.io-client"; 
import king from "/public/king.png";

const socket = io(api);

// --- Helper component for the main list ---
const RankListItem = ({ team, rank }) => (
    <div className="grid grid-cols-12 items-center gap-4 px-4 py-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors duration-200">
        <p className="col-span-1 font-bold text-lg text-cyan-400">{rank}</p>
        <p className="col-span-4 font-semibold text-white truncate">{team.teamname || "—"}</p>
        <p className="col-span-1 text-center text-gray-300">{team.memoryGameScore || 0}</p>
        <p className="col-span-1 text-center text-gray-300">{team.numberPuzzleScore || 0}</p>
        <p className="col-span-1 text-center text-gray-300">{team.stopTheBarScore || 0}</p>
        <p className="col-span-2 text-center text-gray-300">{team.internalGameScore || 0}</p>
        <p className="col-span-2 text-right font-bold text-xl text-white">{team.totalScore || 0}</p>
    </div>
);

// --- Main Leaderboard Component ---
function GameLeaderboard() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const response = await axios.get(`${api}/Hack/leaderboard/game`);
                setTeams(response.data.leaderboard);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                setError("Could not load the leaderboard.");
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();

        const handleScoresUpdate = () => {
            fetchLeaderboard();
        };

        // Now this will work correctly
        socket.on('scores:updated', handleScoresUpdate);

        return () => {
            socket.off('scores:updated', handleScoresUpdate);
        };
    }, []);

    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0f2c] to-[#120b2e] text-white">
                <div className="text-xl font-semibold animate-pulse">Loading Leaderboard...</div>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0f2c] to-[#120b2e] text-white">
                <div className="text-xl font-semibold text-red-400">{error}</div>
            </div>
        )
    }

    const topThree = teams.slice(0, 3);
    const theRest = teams.slice(3);

    const podiumStyles = {
        1: { container: "border-yellow-400/80 bg-yellow-400/10", rankText: "text-yellow-300", scoreText: "text-yellow-300", order: "md:order-2 md:-translate-y-8" },
        2: { container: "border-slate-400/80 bg-slate-400/10", rankText: "text-slate-300", scoreText: "text-slate-300", order: "md:order-1" },
        3: { container: "border-orange-600/80 bg-orange-600/10", rankText: "text-orange-400", scoreText: "text-orange-400", order: "md:order-3" }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0f2c] to-[#120b2e] text-gray-200 font-sans py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 font-naruto">
                        GAME LEADERBOARD
                    </h1>
                    <p className="text-gray-400">The ultimate champions of the side-quest challenges.</p>
                </div>

                {topThree.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-16">
                        {topThree.map((team, index) => {
                            const rank = index + 1;
                            const styles = podiumStyles[rank];
                            return (
                                <div key={team._id} className={`relative flex flex-col p-6 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${styles.container} ${styles.order}`}>
                                    {rank === 1 && <img src={king} alt="Crown" className="absolute -top-10 left-1/2 -translate-x-1/2 h-16" />}
                                    <div className="text-center">
                                        <p className={`text-4xl font-bold ${styles.rankText}`}>#{rank}</p>
                                        <p className="text-xl font-semibold mt-3 text-white truncate h-7">{team.teamname || "—"}</p>
                                        <p className={`mt-3 text-5xl font-bold ${styles.scoreText}`}>{team.totalScore}</p>
                                        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-white/10 w-full">
                                            <div><p className="text-xs text-gray-400">Memory</p><p className="font-semibold text-lg text-white">{team.memoryGameScore}</p></div>
                                            <div><p className="text-xs text-gray-400">Puzzle</p><p className="font-semibold text-lg text-white">{team.numberPuzzleScore}</p></div>
                                            <div><p className="text-xs text-gray-400">Timing</p><p className="font-semibold text-lg text-white">{team.stopTheBarScore}</p></div>
                                            <div><p className="text-xs text-gray-400">Internal</p><p className="font-semibold text-lg text-white">{team.internalGameScore}</p></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {theRest.length > 0 && (
                     <div className="space-y-2">
                        <div className="grid grid-cols-12 items-center gap-4 px-4 text-xs font-bold text-gray-400 uppercase">
                            <p className="col-span-1">Rank</p>
                            <p className="col-span-4">Team</p>
                            <p className="col-span-1 text-center">Memory</p>
                            <p className="col-span-1 text-center">Puzzle</p>
                            <p className="col-span-1 text-center">Timing</p>
                            <p className="col-span-2 text-center">Internal</p>
                            <p className="col-span-2 text-right">Total Score</p>
                        </div>
                        {theRest.map((team, index) => (
                            <RankListItem key={team._id} team={team} rank={index + 4} />
                        ))}
                    </div>
                )}

                {teams.length === 0 && (
                    <div className="text-center py-16 bg-white/5 rounded-lg">
                        <p className="text-gray-400">No game scores have been submitted yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GameLeaderboard;