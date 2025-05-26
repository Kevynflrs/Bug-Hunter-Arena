"use client";

import { useState, useEffect, forwardRef } from "react";
import { useSearchParams } from 'next/navigation'; // Ajout de cette ligne
import Reponses from './Reponses';
import { getSocket } from "@/socket";

const socket = getSocket();

interface QuestionProps {
  onQuestionChange?: (question: QuestionData) => void;
  team: 'red' | 'blue' | 'creator';
  duration?: number;
  difficulty?: string;
}

const Question = forwardRef(({ onQuestionChange, team = 'blue', duration = 260, difficulty }: QuestionProps, ref) => {
  const searchParams = useSearchParams(); // Ajout de cette ligne
  const connectionId = searchParams.get('id'); // Récupération du connectionId
  
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
    creator: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-600',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    }
  };

  const colors = teamThemes[team as keyof typeof teamThemes] || teamThemes.blue;

  const fetchNewQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasSubmitted(false);

      const response = await fetch('/api/getQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: connectionId,
          languages: searchParams.get('languages'),
          difficulty
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération de la question');
      }

      setQuestion(prevQuestion => ({
        ...data.question,
        key: Math.random() // Ajoute une clé unique pour forcer le re-render
      }));
      setTimeLeft(duration);

      if (team === 'creator') {
        socket.emit('change_question', {
          roomId: connectionId,
          settings: data.question
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (team === 'creator') {
      fetchNewQuestion();
    }

    socket.on('change_question', (data) => {
      if (data.settings) {
        setQuestion(data.settings);
        setTimeLeft(duration);
        setHasSubmitted(false);
        setIsLoading(false);
        // Réinitialiser la zone de texte
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.value = '';
        }
        // Forcer la réinitialisation du composant Reponses
        setQuestion(prevQuestion => ({
          ...prevQuestion,
          key: Math.random() // Ajoute une clé unique pour forcer le re-render
        }));
      }
    });

    socket.on('sync_timer', (timeLeft) => {
      setTimeLeft(timeLeft);
    });

    return () => {
      socket.off('change_question');
      socket.off('sync_timer');
    };
  }, [team, duration]);

  // Timer effect
  useEffect(() => {
    if (!question) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (team === 'creator') {
            fetchNewQuestion();
          }
          return duration;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question, duration, team]);

  const handleAnswerSubmit = (isCorrect: boolean) => {
    setHasSubmitted(true);
    const params = new URLSearchParams(window.location.search);
    const connectionId = params.get('id');
    
    if (isCorrect) {
      socket.emit('correct_answer', {
        roomId: connectionId,
        team: team
      });

      // Émettre l'événement de mise à jour des scores
      socket.emit('update_score', {
        roomId: connectionId,
        team: team
      });
    }

    if (onQuestionChange && question) {
      onQuestionChange({ ...question, isCorrect });
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
          {team === 'creator' && (
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
        {team === 'creator' && (
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

      {question && team !== 'creator' && (
        <Reponses
          key={question.key} // Ajouter cette ligne
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