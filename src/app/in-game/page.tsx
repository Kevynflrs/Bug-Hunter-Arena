"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Question from "@/components/Questions";
import Reponses from "@/components/Reponses";

export default function InGamePage() {
  const router = useRouter();
  const questionRef = useRef(null);
  const [currentUser, setCurrentUser] = useState("McGrégor");
  const [points, setPoints] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const handlePointsUpdate = (newPoints: number) => {
    setPoints(prev => prev + newPoints);
  };

  const handleNextQuestion = () => {
    if (questionRef.current) {
      questionRef.current.fetchNewQuestion();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-blue-100">
      <Question 
        ref={questionRef}
        onQuestionChange={setCurrentQuestion} 
      />

      {currentQuestion && (
        <Reponses
          currentQuestion={currentQuestion}
          onPointsUpdate={handlePointsUpdate}
          onNextQuestion={handleNextQuestion}
          currentUser={currentUser}
        />
      )}

      {/* Section Points */}
      <div className="w-full max-w-3xl flex justify-between items-center p-4 bg-white rounded-lg shadow-md border border-blue-300">
        <span className="text-gray-800 font-semibold">Points :</span>
        <span className="text-blue-500 font-bold text-xl">{points}/5</span>
      </div>
    </div>
  );
}