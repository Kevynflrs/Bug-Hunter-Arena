"use client";

import { useState, useEffect, forwardRef } from "react";
import Reponses from './Reponses';
import { redirect } from 'next/navigation';

interface QuestionProps {
  onQuestionChange?: (question: QuestionData) => void;
  team: 'red' | 'blue' | 'creator';
  duration?: number;
  difficulty?: string;
}

const Question = forwardRef(({ onQuestionChange, team = 'blue', duration = 260, difficulty }: QuestionProps, ref) => {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);

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

  // Define colors here, before using it
  const colors = teamThemes[team];

  const fetchNewQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams(window.location.search);
      const languages = params.get('languages') || '';
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
      if (onQuestionChange) {
        onQuestionChange(data.question);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Loading error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewQuestion();
  }, []);

  useEffect(() => {
    if (!question) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchNewQuestion(); // Passe automatiquement à la question suivante
          return duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question, duration]);

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore >= 5) {
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('id');
        const nickname = params.get('nickname');
        redirect(`/room?id=${roomId}&nickname=${nickname}`);
        return;
      }
    }
    fetchNewQuestion();
  };

  // Utiliser colors en s'assurant qu'il existe
  if (isLoading) return <div className={colors.text}>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!question) return null;

  return (
    <div className={`w-full max-w-3xl ${colors.bg}`}>
      <div className={`p-6 bg-white rounded-lg shadow-md mb-6 border ${colors.border}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Thème : {question?.theme}</h2>
            <p className="text-sm text-gray-600">
              Niveau : {question?.niveau}
              {/* Afficher le temps pour tous les utilisateurs */}
              <span className="ml-4">Temps restant : {timeLeft}s</span>
            </p>
          </div>
          {team === 'creator' && (
            <button
              onClick={() => fetchNewQuestion()}
              className={`px-4 py-2 rounded text-white ${colors.button}`}
            >
              Question suivante
            </button>
          )}
        </div>
        {question && (
          <>
            <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 font-mono whitespace-pre-wrap">
              {question.question}
            </pre>
            {team === 'creator' && (
              <div className={`mt-4 p-4 rounded border ${colors.bg} ${colors.border}`}>
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
          </>
        )}
      </div>

      {question && team !== 'creator' && (
        <Reponses
          correction={question.correction}
          explication={question.explication}
          onAnswerSubmit={handleAnswerSubmit}
          teamColors={colors}
        />
      )}
    </div>
  );
});

Question.displayName = 'Question';

export default Question;