"use client";

import { useState, useEffect, forwardRef, useRef } from "react";

interface QuestionData {
  theme: string;
  niveau: string;
  question: string;
  correction: string;
  explication: string;
}
import Reponses from './Reponses';
import { Socket } from "socket.io-client";
// import { getSocket } from "@/socket";

// const socket = getSocket();

interface QuestionProps {
  onQuestionChange?: (question: QuestionData) => void;
  team: 'red' | 'blue' | 'admin';
  duration?: number;
  difficulty?: string;
  socket: Socket; // Remplacez 'any' par le type approprié pour votre socket
}

const Question = forwardRef(({ team = 'blue', duration = 260, difficulty, socket }: QuestionProps) => {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
    admin: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-600',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    }
  };

  const teamRef = useRef(team);
  const colors = teamThemes[teamRef.current as keyof typeof teamThemes] || teamThemes.blue;

  useEffect(() => {
    const storedTeam = localStorage.getItem('team');
    if (storedTeam === 'red' || storedTeam === 'blue' || storedTeam === 'admin') {
      teamRef.current = storedTeam;
    } else {
      teamRef.current = 'blue';
    }
    // if (teamRef.current === 'admin') {
      fetchNewQuestion();
    // }else {
    //   setTimeLeft(duration);
    //   setIsLoading(true);
    // }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!question) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          if (team === 'admin') {
            fetchNewQuestion();
          }
          return duration;
        }

        // Si c'est le créateur, synchroniser le timer avec les autres joueurs
        if (team === 'admin') {
          const params = new URLSearchParams(window.location.search);
          const connectionId = params.get('id');
          socket.emit('sync_timer', {
            roomId: connectionId,
            timeLeft: newTime
          });
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question, team, duration]);

  // Écouter les changements de question et de timer
  useEffect(() => {

    if (!socket.connected) {
      socket.connect(); // Explicitly connect the socket if not already connected
  }

    console.log("Écoute des événements de socket...");
    socket.on('change_question', (data) => {
      console.log("Nouvelle question reçue:", data);
      setQuestion(data.settings);
      setTimeLeft(duration);
      setHasSubmitted(false);
      setIsLoading(false);
    });

    socket.on('sync_timer', (timeLeft) => {
      setTimeLeft(timeLeft);
    });

    return () => {
      socket.off('change_question');
      socket.off('sync_timer');
    };
  }, [duration]);

  const handleAnswerSubmit = (isCorrect: boolean) => {
    setHasSubmitted(true);
    const params = new URLSearchParams(window.location.search);
    const connectionId = params.get('id');

    if (isCorrect) {
      socket.emit('correct_answer', {
        roomId: connectionId,
        team: teamRef.current
      });
    }
  };

  const fetchNewQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasSubmitted(false);

      const params = new URLSearchParams(window.location.search);
      const languages = params.get('languages') || '';
      const connectionId = params.get('id');
      const queryParams = new URLSearchParams({
        languages,
        ...(difficulty && { difficulty })
      }).toString();



      const response = await fetch(`/api/getQuestion?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      setQuestion(data.question);
      setTimeLeft(duration);

      socket.emit('change_question', {
        roomId: connectionId,
        settings: data.question
      });

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Loading error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className={colors.text}>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!question) return null;

  return (
    <div className={`w-full max-w-3xl ${colors.bg}`}>
      <div className={`p-6 bg-white rounded-lg shadow-md mb-6 border ${colors.border}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {question?.theme ? `Thème : ${question.theme}` : ''}
            </h2>
            <p className="text-sm text-gray-600">
              {question?.niveau ? `Niveau : ${question.niveau}` : ''}
              <span className="ml-4">Temps restant : {timeLeft}s</span>
            </p>
          </div>
          {team === 'admin' && (
            <button
              onClick={fetchNewQuestion}
              className={`px-4 py-2 rounded text-white ${colors.button}`}
            >
              Question suivante
            </button>
          )}
        </div>
        <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 font-mono whitespace-pre-wrap">
          {question.question}
        </pre>
        {team === 'admin' && (
          <div className="mt-4 p-4 rounded border">
            <div className="space-y-4">
              <div>
                <p className="font-bold mb-2">Correction :</p>
                <pre className="bg-white p-2 rounded">{question.correction}</pre>
              </div>
              <div>
                <p className="font-bold mb-2">Explication :</p>
                <pre className="bg-white p-2 rounded whitespace-pre-wrap">{question.explication}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {question && team !== 'admin' && (
        <Reponses
          correction={question.correction}
          explication={question.explication}
          onAnswerSubmit={handleAnswerSubmit}
          teamColors={colors}
          isDisabled={hasSubmitted}
        />
      )}
    </div>
  );
});

Question.displayName = 'Question';

export default Question;

