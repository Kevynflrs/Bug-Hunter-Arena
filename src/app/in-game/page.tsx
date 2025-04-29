"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Question from '@/components/Questions';
import { getSocket } from "@/socket";

const socket = getSocket();

export default function InGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionRef = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userTeam, setUserTeam] = useState<'red' | 'blue' | 'creator'>('blue');
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);
  const [winningTeam, setWinningTeam] = useState<'red' | 'blue' | null>(null);
  
  const [teamScores, setTeamScores] = useState({
    blue: 0,
    red: 0
  });

  const [teams, setTeams] = useState({
    blue: [] as { name: string }[],
    red: [] as { name: string }[],
    creator: [] as { name: string }[]
  });

  const handleReturnToRoom = () => {
    const connectionId = searchParams.get('id');
    const storedTeam = localStorage.getItem('team');
    
    if (storedTeam === 'admin') {  // Changement ici de 'creator' à 'admin'
      router.push(`/room?id=${connectionId}&nickname=${localStorage.getItem('name')}`);
    } else {
      router.push(`/waitingroom?id=${connectionId}&nickname=${localStorage.getItem('name')}`);
    }
  };

  useEffect(() => {
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }

      const connectionId = searchParams.get('id');
      const name = localStorage.getItem('name');
      const sessionID = localStorage.getItem('sessionID');
      const storedTeam = localStorage.getItem('team');

      if (connectionId && name && sessionID && storedTeam) {
        socket.emit('join_room', connectionId, name, sessionID, storedTeam);
        setUserTeam(storedTeam === 'admin' ? 'creator' : storedTeam as 'red' | 'blue' | 'creator');

        socket.on('user_joined', (data) => {
          setTeams(prev => {
            const team = data.team === 'admin' ? 'creator' : data.team;
            if (team && prev[team] && !prev[team].some(p => p.name === data.name)) {
              return {
                ...prev,
                [team]: [...prev[team], { name: data.name }]
              };
            }
            return prev;
          });
        });

        socket.on('room_joined', (playersInRoom) => {
          const uniquePlayers = new Map();
          
          playersInRoom.forEach((player: { name: string; team: string }) => {
            uniquePlayers.set(player.name, player.team);
          });

          const newTeams = {
            blue: [] as { name: string }[],
            red: [] as { name: string }[],
            creator: [] as { name: string }[]
          };

          uniquePlayers.forEach((team, name) => {
            if (team === 'red') {
              newTeams.red.push({ name });
            } else if (team === 'blue') {
              newTeams.blue.push({ name });
            } else if (team === 'admin') {
              newTeams.creator.push({ name });
            }
          });

          setTeams(newTeams);
        });
      }

      return () => {
        socket.off('room_joined');
        socket.off('user_joined');
      };
    }
  }, [searchParams]);

  useEffect(() => {
    socket.on('update_score', ({ team }) => {
      setTeamScores(prev => ({
        ...prev,
        [team]: prev[team] + 1
      }));
    });

    return () => {
      socket.off('update_score');
    };
  }, []);

  useEffect(() => {
    if (teamScores.blue >= 5) {
      setWinningTeam('blue');
      setShowVictoryPopup(true);
    } else if (teamScores.red >= 5) {
      setWinningTeam('red');
      setShowVictoryPopup(true);
    }
  }, [teamScores]);

  return (
    <div className="min-h-screen flex relative">
      {/* Liste des joueurs équipe bleue */}
      <div className="w-64 bg-blue-50 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-blue-600 font-bold">Équipe Bleue</h3>
          <span className="text-blue-600 font-bold">{teamScores.blue}/5</span>
        </div>
        {teams.blue.map((player, index) => (
          <div key={index} className="mb-2 p-2 bg-white rounded-md shadow-sm">
            <div className="font-medium">{player.name}</div>
          </div>
        ))}
      </div>

      {/* Zone centrale avec la question */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Question 
          ref={questionRef}
          onQuestionChange={setCurrentQuestion}
          team={userTeam}
          duration={Number(searchParams.get('duration')) || 260}
          difficulty={searchParams.get('difficulty') || undefined}
        />
      </div>

      {/* Liste des joueurs équipe rouge */}
      <div className="w-64 bg-red-50 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-red-600 font-bold">Équipe Rouge</h3>
          <span className="text-red-600 font-bold">{teamScores.red}/5</span>
        </div>
        {teams.red.map((player, index) => (
          <div key={index} className="mb-2 p-2 bg-white rounded-md shadow-sm">
            <div className="font-medium">{player.name}</div>
          </div>
        ))}
      </div>

      {/* Popup de victoire */}
      {showVictoryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white p-8 rounded-lg shadow-xl ${
            winningTeam === 'blue' ? 'border-blue-500' : 'border-red-500'
          } border-4`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              winningTeam === 'blue' ? 'text-blue-500' : 'text-red-500'
            }`}>
              L'équipe {winningTeam === 'blue' ? 'Bleue' : 'Rouge'} a gagné !
            </h2>
            <button
              onClick={handleReturnToRoom}
              className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retourner à la salle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getTeamColors(team: 'red' | 'blue' | 'creator') {
  const teamThemes = {
    red: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-600',
      button: 'bg-red-500 hover:bg-red-600'
    },
    blue: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600'
    },
    creator: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-600',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    }
  };
  return teamThemes[team];
}