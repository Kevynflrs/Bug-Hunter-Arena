"use client";

import { useState, useEffect, forwardRef } from "react";
import Reponses from './Reponses';
import { redirect } from 'next/navigation';

interface QuestionData {
  id: string;
  theme: string;
  niveau: string;
  question: string;
  correction: string;
  explication: string;
}

interface QuestionProps {
  onQuestionChange?: (question: QuestionData) => void;
}

const Question = forwardRef(({ onQuestionChange }: QuestionProps, ref) => {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);

  const fetchNewQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/getQuestion');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.question) {
        throw new Error('Aucune question reçue du serveur');
      }

      setQuestion(data.question);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      
      // Vérifier si le score a atteint 5 points
      if (newScore >= 5) {
        // Récupérer l'ID de la room depuis l'URL
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('id');
        const nickname = params.get('nickname');
        
        // Rediriger vers la page de la room avec les paramètres
        redirect(`/room?id=${roomId}&nickname=${nickname}`);
        return;
      }
    }
    fetchNewQuestion();
  };

  useEffect(() => {
    fetchNewQuestion();
  }, []);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!question) return null;

  return (
    <div className="w-full max-w-3xl">
      <div className="p-6 bg-white rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Thème : {question.theme}</h2>
            <p className="text-sm text-gray-600">Niveau : {question.niveau}</p>
          </div>
          <div className="text-xl font-bold text-blue-600">
            Score: {score}/5
          </div>
        </div>
        <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 font-mono whitespace-pre-wrap">
          {question.question}
        </pre>
      </div>

      <Reponses
        correction={question.correction}
        explication={question.explication}
        onAnswerSubmit={handleAnswerSubmit}
      />
    </div>
  );
});

Question.displayName = 'Question';

export default Question;