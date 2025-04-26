import { useState } from 'react';

interface ReponsesProps {
  correction: string;
  explication: string;
  onAnswerSubmit: (isCorrect: boolean) => void;
  teamColors: {
    bg: string;
    border: string;
    text: string;
    button: string;
  };
  isGameMaster: boolean;
}

const Reponses = ({ correction, explication, onAnswerSubmit, teamColors, isGameMaster }: ReponsesProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (showCorrection) {
      // Seul le maître du jeu peut passer à la question suivante
      if (!isGameMaster) {
        return;
      }
      onAnswerSubmit(isCorrect || false);
      setUserAnswer('');
      setShowCorrection(false);
      setIsCorrect(null);
    } else {
      const correct = userAnswer.trim().toLowerCase() === correction.trim().toLowerCase();
      setIsCorrect(correct);
      setShowCorrection(true);
    }
  };

  return (
    <div className="mt-4">
      <textarea
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className={`w-full p-4 border rounded-md mb-4 ${teamColors.border}`}
        placeholder="Entrez votre réponse ici..."
        rows={6}
        disabled={showCorrection}
      />

      <button
        onClick={handleSubmit}
        className={`w-full py-3 px-6 rounded-md font-semibold ${
          showCorrection ? (isGameMaster ? 'bg-green-500' : 'bg-gray-400') : teamColors.button
        } text-white ${!isGameMaster && showCorrection ? 'cursor-not-allowed' : 'hover:opacity-90'}`}
        disabled={!isGameMaster && showCorrection}
      >
        {showCorrection ? (isGameMaster ? 'Question suivante' : 'En attente du maître du jeu...') : 'Soumettre'}
      </button>

      {showCorrection && (
        <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-bold mb-2">
            {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </h3>
          <div className="mb-2">
            <h4 className="font-semibold">Correction:</h4>
            <pre className="bg-white p-2 rounded mt-1">{correction}</pre>
          </div>
          <div>
            <h4 className="font-semibold">Explication:</h4>
            <p>{explication}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reponses;