"use client";
import { useEffect, useState } from 'react';
import { socket } from '@/socket';

const TEAMS = ['red', 'blue', 'spectator', 'admin'];

export default function TeamSelectionPage() {
  const [sessionID, setSessionID] = useState(null);
  const [teamMembers, setTeamMembers] = useState({
    red: [],
    blue: [],
    spectator: [],
    admin: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Request a session UUID when the component mounts
    socket.emit('request_uuid');

    socket.on('assign_uuid', (uuid) => {
      setSessionID(uuid);
      console.log('Assigned UUID:', uuid);
    });

    socket.on('team_update_full', (updatedTeams) => {
      setTeamMembers(updatedTeams);
    });

    socket.on('team_full', (message) => {
      setError(message);
      setTimeout(() => setError(null), 3000); // Clear after 3s
    });

    return () => {
      socket.off('assign_uuid');
      socket.off('team_update');
      socket.off('team_full');
    };
  }, []);

  const handleJoinTeam = (team) => {
    if (!sessionID) return;
    socket.emit('join_team', { team, sessionID });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Selection Équipe</h1>
      {error && (
        <div className="mb-4 text-red-500 font-semibold">{error}</div>
      )}
      <div className="flex gap-4 mb-8">
        {TEAMS.map((team) => (
          <button
            key={team}
            onClick={() => handleJoinTeam(team)}
            className={`px-4 py-2 font-semibold text-white rounded ${
              team === 'red'
                ? 'bg-red-600'
                : team === 'blue'
                ? 'bg-blue-600'
                : team === 'admin'
                ? 'bg-yellow-600'
                : 'bg-gray-600'
            }`}
          >
            Rejoindre {team.charAt(0).toUpperCase() + team.slice(1)} Team
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {TEAMS.map((team) => (
          <div key={team} className="border p-4 rounded">
            <h2 className="font-bold mb-2 capitalize">{team} Team</h2>
            <ul>
              {teamMembers[team].map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
