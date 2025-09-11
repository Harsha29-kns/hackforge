import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import api from "./api.js";
import { io } from "socket.io-client";

// --- NEW RUBRICS ---
const firstReviewRubric = {
    conceptInnovation: { criteria: "Concept & Innovation", marks: "", max: 20 },
    technicalFeasibility: { criteria: "Technical Feasibility", marks: "", max: 15 },
    initialPrototype: { criteria: "Initial Prototype/Wireframe", marks: "", max: 15 },
};

const secondReviewRubric = {
    executionProgress: { criteria: "Execution & Progress", marks: "", max: 20 },
    technicalComplexity: { criteria: "Technical Complexity", marks: "", max: 15 },
    presentationDemo: { criteria: "Presentation & Demo", marks: "", max: 15 },
};


// --- SVG Icons for UI Enhancement ---
const IconLogout = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> );
const IconSearch = () => ( <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );
const IconCheckCircle = () => ( <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> );

const socket = io(api);

function Review() {
    // --- STATE MANAGEMENT ---
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [judge, setJudge] = useState(null);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [reviewRound, setReviewRound] = useState(1);
    const [scores, setScores] = useState(firstReviewRubric);
    const [showPassword, setShowPassword] = useState(false);
    const [isFirstReviewOpen, setIsFirstReviewOpen] = useState(false);
    const [isSecondReviewOpen, setIsSecondReviewOpen] = useState(false);
    
    const isReviewOpen = reviewRound === 1 ? isFirstReviewOpen : isSecondReviewOpen;

    useEffect(() => {
        socket.on('reviewStatusUpdate', (status) => {
            setIsFirstReviewOpen(status.isFirstReviewOpen);
            setIsSecondReviewOpen(status.isSecondReviewOpen);
        });

        socket.emit('judge:getReviewStatus'); // Get initial status

        return () => {
            socket.off('reviewStatusUpdate');
        };
    }, []);

    useEffect(() => {
        const currentRubric = reviewRound === 1 ? firstReviewRubric : secondReviewRubric;
        setScores(currentRubric);
    }, [reviewRound]);
    
    useEffect(() => {
        const storedPassword = sessionStorage.getItem("judgePassword");
        if (storedPassword === "judge1" || storedPassword === "judge2") {
            setIsAuthenticated(true);
            setJudge(storedPassword);
        }
        async function fetchData() {
            if (!judge) return; 

            try {
                // CORRECT: Using the new, specific endpoint
                const res = await axios.get(`${api}/Hack/judge/${judge}/teams`);
                const sortedTeams = res.data.sort((a, b) => a.teamname.localeCompare(b.teamname));
                setTeams(sortedTeams);
            } catch (error) {
                console.error("Error fetching teams:", error);
            } finally {
                setLoading(false);
            }
        }
        if (isAuthenticated) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, judge]);

    const filteredTeams = useMemo(() => {
        // CORRECTED: The server has already done the filtering. 
        // We just need to add the team number and apply the search query.
        if (!teams) return [];
        
        const numberedTeams = teams.map((team, index) => ({...team, teamNumber: index + 1}));

        if (!searchQuery) return numberedTeams;
        
        return numberedTeams.filter(team =>
            team.teamname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(team.teamNumber) === searchQuery
        );
    }, [teams, searchQuery]);

    const maxMarks = useMemo(() => {
        return Object.values(scores).reduce((total, item) => total + item.max, 0);
    }, [scores]);

    // --- HANDLER FUNCTIONS ---
    const resetScoreMarks = () => {
        const currentRubric = reviewRound === 1 ? firstReviewRubric : secondReviewRubric;
        setScores(currentRubric);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === "judge1" || password === "judge2") {
            setIsAuthenticated(true);
            setJudge(password);
            sessionStorage.setItem("judgePassword", password);
            setError("");
        } else {
            setError("Access Denied. Invalid Credentials.");
        }
    };
    
    const handleLogout = () => {
        setIsAuthenticated(false);
        setJudge(null);
        setPassword("");
        sessionStorage.removeItem("judgePassword");
    };

    const handleScoreChange = (key, value) => {
        const max = scores[key].max;
        const numValue = value === "" ? "" : Math.min(max, Math.max(0, parseInt(value, 10) || 0));
        setScores(prev => ({ ...prev, [key]: { ...prev[key], marks: numValue } }));
    };

    const calculateTotalMarks = () => {
        return Object.values(scores).reduce((total, item) => total + (Number(item.marks) || 0), 0);
    };
    
    const handleTeamSelect = (index) => {
        setCurrentTeamIndex(index);
        resetScoreMarks();
        setSubmitStatus(null);
    };

    const handleSubmitScores = async () => {
        const currentTeam = filteredTeams[currentTeamIndex];
        if (!currentTeam?._id) {
            setSubmitStatus({ type: 'error', message: 'Cannot identify team ID' });
            return;
        }
        
        setSubmitting(true);
        setSubmitStatus(null);
        const payload = {
            score: calculateTotalMarks(),
            ...(reviewRound === 1 && { FirstReview: scores }),
            ...(reviewRound === 2 && { SecoundReview: scores })
        };
        
        try {
            const endpoint = reviewRound === 1 ? 'score1' : 'score';
            await axios.post(`${api}/Hack/team/${endpoint}/${currentTeam._id}`, payload);
            
            const updatedTeams = [...teams];
            const teamIndexInAllTeams = teams.findIndex(t => t._id === currentTeam._id);
            if (teamIndexInAllTeams !== -1) {
                if (reviewRound === 1) {
                    updatedTeams[teamIndexInAllTeams].FirstReviewScore = calculateTotalMarks();
                    updatedTeams[teamIndexInAllTeams].FirstReview = true;
                } else if (reviewRound === 2) {
                    updatedTeams[teamIndexInAllTeams].SecoundReviewScore = calculateTotalMarks();
                    updatedTeams[teamIndexInAllTeams].SecoundReview = true;
                }
                setTeams(updatedTeams);
            }
            setSubmitStatus({ type: 'success', message: 'Scores submitted successfully!' });
        } catch (error) {
            console.error("Submission Error:", error);
            const errorMessage = error.response?.data?.message || 'Failed to submit scores. Please try again.';
            setSubmitStatus({ type: 'error', message: errorMessage });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a091e] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
                 <style>{`
                    @keyframes subtle-glow {
                        0%, 100% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4), inset 0 0 5px rgba(168, 85, 247, 0.3); }
                        50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.6), inset 0 0 8px rgba(168, 85, 247, 0.5); }
                    }
                    .animated-glow { animation: subtle-glow 4s ease-in-out infinite; }
                 `}</style>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 animated-glow">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">EVALUATION TERMINAL</h1>
                            <p className="text-gray-400 mt-2">Authorized Access Only</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="peer w-full px-4 py-3 bg-white/5 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder=" "
                                    required
                                />
                                <label htmlFor="password" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-purple-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                                    Access Code
                                </label>
                                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105">
                                {submitting ? 'Authenticating...' : 'Authorize'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
    
    if (loading) return <div className="h-screen flex items-center justify-center bg-[#0a091e] text-white text-2xl animate-pulse">Loading Terminal Data...</div>;

    const currentTeam = currentTeamIndex !== null ? filteredTeams[currentTeamIndex] : null;
    const isAlreadyMarked = currentTeam ? (reviewRound === 1 ? currentTeam.FirstReview : currentTeam.SecoundReview) : false;

    return (
        <div className="min-h-screen bg-[#0a091e] text-gray-200 font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-3 h-screen">
                
                <aside className="col-span-1 bg-black/30 lg:h-screen flex flex-col border-r border-purple-500/20">
                    <div className="p-4 border-b border-purple-500/20">
                        <h2 className="text-xl font-bold">Assigned Teams</h2>
                    </div>
                    
                    <div className="p-4 relative">
                        <IconSearch />
                        <input
                            type="text"
                            placeholder={`Search by Name or Number...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 rounded-lg pl-12 pr-4 py-2.5 border-2 border-transparent focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div className="flex-grow overflow-y-auto px-4 pb-4 space-y-2">
                        {filteredTeams.length > 0 ? (
                            filteredTeams.map((team, index) => {
                                const isMarked = reviewRound === 1 ? team.FirstReview : team.SecoundReview;
                                return (
                                    <button
                                        key={team._id}
                                        onClick={() => handleTeamSelect(index)}
                                        className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-all duration-200 border-2 ${currentTeamIndex === index ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-sm font-bold text-gray-500 w-6 text-center">{team.teamNumber}.</span>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-medium truncate">{team.teamname}</span>
                                                <span className="text-xs text-gray-400 truncate">{team.Sector}</span>
                                            </div>
                                        </div>
                                        {isMarked && <IconCheckCircle />}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-400 pt-8">No teams found.</p>
                        )}
                    </div>
                </aside>

                <main className="lg:col-span-3 xl:col-span-2 h-screen flex flex-col">
                    <header className="flex-shrink-0 flex justify-between items-center p-4 bg-black/30 border-b border-purple-500/20">
                         <div className="relative">
                            <select value={reviewRound} onChange={(e) => { setReviewRound(Number(e.target.value)); setCurrentTeamIndex(null); }} className="px-4 py-2 rounded-lg bg-white/5 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value={1}>First Review</option>
                                <option value={2}>Second Review</option>
                            </select>
                         </div>
                         <div className="text-center">
                            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                {judge === 'judge1' ? "Judge 1 Terminal" : "Judge 2 Terminal"}
                            </h2>
                         </div>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
                            <IconLogout /> Logout
                        </button>
                    </header>

                    {currentTeam ? (
                        <div className="flex-grow overflow-y-auto p-6 md:p-8">
                             <div className="flex items-baseline mb-1">
                                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                    <span className="text-gray-500 mr-2">{currentTeam.teamNumber}.</span>
                                    {currentTeam.teamname}
                                </h1>
                                <span className="ml-4 px-2 py-1 text-xs font-semibold text-cyan-300 bg-cyan-500/20 rounded-full">{currentTeam.Sector}</span>
                            </div>
                            <p className="text-gray-400 mb-6">Evaluating for <strong className="text-gray-200">{reviewRound === 1 ? 'First' : 'Second'} Review</strong></p>

                            {isReviewOpen ? (
                                <div className="space-y-3">
                                    {Object.keys(scores).map((key) => (
                                        <div key={key} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-3 bg-white/5 rounded-lg">
                                            <span className="font-medium col-span-2">{scores[key].criteria}</span>
                                            <div className="flex justify-start md:justify-end items-center gap-3">
                                                <input type="number" value={scores[key].marks} onChange={(e) => handleScoreChange(key, e.target.value)} className="w-24 px-2 py-1.5 rounded-md bg-black/50 text-white border-2 border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" max={scores[key].max} min="0" />
                                                <p className="w-8 text-gray-400">/ {scores[key].max}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-900/50 rounded-lg">
                                    <h2 className="text-2xl font-bold text-red-400">Review Round Closed</h2>
                                    <p className="text-gray-400 mt-2">Please wait for the admin to open this review round to submit scores.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                            <h2 className="text-2xl font-bold text-gray-400">Awaiting Selection</h2>
                            <p className="text-gray-500 mt-2">Select a team from the panel on the left to begin the evaluation.</p>
                        </div>
                    )}
                    
                    {currentTeam && (
                        <footer className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-black/50 border-t border-purple-500/20">
                            <div className="flex items-baseline">
                                <span className="text-lg font-bold text-gray-400 mr-2">Total Score:</span>
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{calculateTotalMarks()}</span>
                                <span className="text-xl font-bold text-gray-500"> / {maxMarks}</span>
                            </div>
                            
                            {submitStatus && <div className={`px-4 py-2 rounded-md text-sm font-semibold ${submitStatus.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{submitStatus.message}</div>}

                            {isAlreadyMarked ? (
                                <div className="px-4 py-3 rounded-lg bg-green-500/20 text-green-300 font-semibold text-center">✅ This team has already been marked.</div>
                            ) : (
                                <button onClick={handleSubmitScores} disabled={submitting || !isReviewOpen} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all transform hover:scale-105">
                                    {submitting ? "Submitting..." : "Submit Scores"}
                                </button>
                            )}
                        </footer>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Review;
