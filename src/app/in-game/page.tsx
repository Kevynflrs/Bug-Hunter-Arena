"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Question from '@/components/Questions';
import Reponses from '@/components/Reponses';

export default function InGamePage() {
  const router = useRouter();
  const questionRef = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userTeam, setUserTeam] = useState<'red' | 'blue' | 'creator'>('blue');
  
  // Score d'équipe au lieu des scores individuels
  const [teamScores, setTeamScores] = useState({
    blue: 0,
    red: 0
  });

  // Liste des joueurs par équipe
  const [teams, setTeams] = useState({
    blue: [
      { name: "PingPong", role: "JavaScript" },
      { name: "CodeMaster", role: "PHP" },
      { name: "BugBuster", role: "C++" }
    ],
    red: [
      { name: "AlQuaïda", role: "Mobile" },
      { name: "McGrégor", role: "C#" }
    ],
    creator: [
      { name: "GameMaster", role: "Maître du jeu" }
    ]
  });

  const handlePointsUpdate = (isCorrect: boolean) => {
    if (isCorrect) {
      setTeamScores(prev => ({
        ...prev,
        [userTeam === 'creator' ? 'blue' : userTeam]: prev[userTeam === 'creator' ? 'blue' : userTeam] + 1
      }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Liste des joueurs équipe bleue */}
      <div className="w-64 bg-blue-50 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-blue-600 font-bold">Équipe Bleue</h3>
          <span className="text-blue-600 font-bold">{teamScores.blue}/5</span>
        </div>
        {teams.blue.map((player, index) => (
          <div key={index} className="mb-2 p-2 bg-white rounded-md shadow-sm">
            <div className="font-medium">{player.name}</div>
            <div className="text-sm text-gray-600">{player.role}</div>
          </div>
        ))}
      </div>

      {/* Zone centrale avec la question */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Question 
          ref={questionRef}
          onQuestionChange={setCurrentQuestion}
          team={userTeam}
        />

        {currentQuestion && (
          <Reponses
            correction={currentQuestion.correction}
            explication={currentQuestion.explication}
            onAnswerSubmit={handlePointsUpdate}
            teamColors={getTeamColors(userTeam)}
            isGameMaster={userTeam === 'creator'}
          />
        )}
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
            <div className="text-sm text-gray-600">{player.role}</div>
          </div>
        ))}
      </div>

      {/* Maître du jeu (si présent) */}
      {userTeam === 'creator' && (
        <div className="absolute top-4 right-4 bg-yellow-50 p-4 rounded-lg">
          {teams.creator.map((player, index) => (
            <div key={index} className="font-medium text-yellow-600">
              {player.name} - {player.role}
            </div>
          ))}
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