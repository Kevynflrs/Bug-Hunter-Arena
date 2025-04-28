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

  // Surveiller les scores
  useEffect(() => {
    if (teamScores.blue >= 5) {
      setWinningTeam('blue');
      setShowVictoryPopup(true);
    } else if (teamScores.red >= 5) {
      setWinningTeam('red');
      setShowVictoryPopup(true);
    }
  }, [teamScores]);

  const handleReturnToRoom = () => {
    const connectionId = searchParams.get('id');
    router.push(`/room?id=${connectionId}`);
  };

  useEffect(() => {
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }

      // Récupérer l'ID de la room depuis l'URL
      const connectionId = searchParams.get('id');
      const name = localStorage.getItem('name');
      const sessionID = localStorage.getItem('sessionID');
      const storedTeam = localStorage.getItem('team');

      if (connectionId && name && sessionID && storedTeam) {
        socket.emit('join_room', connectionId, name, sessionID, storedTeam);
        // Mettre à jour userTeam en fonction de l'équipe stockée
        setUserTeam(storedTeam === 'admin' ? 'creator' : storedTeam as 'red' | 'blue' | 'creator');
      }

      socket.on('room_joined', (playersInRoom) => {
        const newTeams = {
          blue: [] as { name: string }[],
          red: [] as { name: string }[],
          creator: [] as { name: string }[]
        };

        playersInRoom.forEach((player: { name: string; team: string }) => {
          if (player.team === 'red' || player.team === 'blue' || player.team === 'admin') {
            newTeams[player.team === 'admin' ? 'creator' : player.team].push({
              name: player.name
            });
          }
        });

        setTeams(newTeams);
      });

      socket.on('user_joined', (user) => {
        setTeams(prev => {
          const team = user.team === 'admin' ? 'creator' : user.team;
          if (team === 'red' || team === 'blue' || team === 'creator') {
            return {
              ...prev,
              [team]: [...prev[team], { name: user.name, role: user.role || 'Non assigné' }]
            };
          }
          return prev;
        });
      });

      return () => {
        if (socket) {
          socket.off('room_joined');
          socket.off('user_joined');
        }
      };
    }
  }, [searchParams]);

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