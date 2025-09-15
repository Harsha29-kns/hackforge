import React, { useState } from "react";

const DomainMonitor = ({ teams, domains, onResetDomains }) => {
    const [isLoading, setIsLoading] = useState(false);

    const teamsWithDomain = teams.filter(team => team.Domain);
    const teamsWithoutDomain = teams.filter(team => !team.Domain && team.verified); // Only count verified teams as pending

    const handleResetClick = async () => {
        if (window.confirm("Are you sure you want to reset ALL domain selections? This action cannot be undone.")) {
            setIsLoading(true);
            await onResetDomains();
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-naruto text-orange-400">Domain Monitor</h2>
                <button
                    onClick={handleResetClick}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                >
                    {isLoading ? "Resetting..." : "Reset All Domains"}
                </button>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Teams with Domain" value={teamsWithDomain.length} color="border-green-500" />
                <StatCard title="Verified Teams Pending" value={teamsWithoutDomain.length} color="border-yellow-500" />
                <StatCard title="Total Teams" value={teams.length} color="border-cyan-500" />
            </div>

            {/* --- DOMAIN LIST --- */}
            <div className="bg-gray-800/60 rounded-lg p-4">
                <h3 className="text-2xl font-bold mb-4">Domain Status</h3>
                <div className="space-y-4">
                    {domains.map(domain => {
                        const assignedTeams = teams.filter(t => t.Domain === domain.name);
                        return (
                            <div key={domain.id} className="p-4 bg-gray-900/50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">{domain.name}</span>
                                    <span className="font-semibold text-xl">
                                        {domain.slots} <span className="text-sm text-gray-400">/ {domain.slots + assignedTeams.length}</span>
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                    <div
                                        className="bg-orange-500 h-2.5 rounded-full"
                                        style={{ width: `${((domain.slots + assignedTeams.length - domain.slots) / (domain.slots + assignedTeams.length)) * 100}%` }}
                                    ></div>
                                </div>
                                {assignedTeams.length > 0 && (
                                    <div className="mt-3 text-sm text-gray-400">
                                        <strong>Teams:</strong> {assignedTeams.map(t => t.teamname).join(', ')}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};