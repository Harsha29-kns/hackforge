import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from './api';
import axios from 'axios';

const socket = io(api);

const TeamLoginStatus = () => {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        // Fetch initial team statuses
        const fetchTeams = async () => {
            try {
                const response = await axios.get(`${api}/Hack/teams/status`);
                setTeams(response.data);
            } catch (error) {
                console.error('Error fetching team statuses:', error);
            }
        };
        fetchTeams();

        // Listen for updates
        socket.on('teamStatusUpdate', (updatedTeams) => {
            setTeams(updatedTeams);
        });

        return () => {
            socket.off('teamStatusUpdate');
        };
    }, []);

    const handleLogout = (teamId) => {
        socket.emit('admin:forceLogout', teamId);
    };

    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-orange-400 font-naruto">Team Login Status</h1>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full bg-gray-800">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Team Name</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Login Status</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {teams.map((team) => (
                            <tr key={team._id} className="hover:bg-gray-700 transition-colors">
                                <td className="border-t border-gray-700 px-4 py-3 whitespace-nowrap">{team.teamname}</td>
                                <td className="border-t border-gray-700 px-4 py-3 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${team.isLoggedIn ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {team.isLoggedIn ? 'Logged In' : 'Not Logged In'}
                                    </span>
                                </td>
                                <td className="border-t border-gray-700 px-4 py-3">
                                    <button
                                        onClick={() => handleLogout(team._id)}
                                        disabled={!team.isLoggedIn}
                                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Force Log out
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamLoginStatus;