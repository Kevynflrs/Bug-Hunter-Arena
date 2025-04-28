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
  isDisabled?: boolean;
}

const Reponses = ({ correction, explication, onAnswerSubmit, teamColors, isDisabled = false }: ReponsesProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    const correct = userAnswer.trim().toLowerCase() === correction.trim().toLowerCase();
    setIsCorrect(correct);
    setShowCorrection(true);
    onAnswerSubmit(correct);
  };

  return (
    <div className="mt-4">
      <textarea
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className={`w-full p-4 border rounded-md mb-4 ${teamColors.border}`}
        placeholder="Entrez votre réponse ici..."
        rows={6}
        disabled={showCorrection || isDisabled}
      />

      <button
        onClick={handleSubmit}
        className={`w-full py-3 px-6 rounded-md font-semibold ${teamColors.button} text-white hover:opacity-90 ${
          (showCorrection || isDisabled) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={showCorrection || isDisabled}
      >
        Soumettre
      </button>

      {showCorrection && (
        <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-bold mb-2">{isCorrect ? 'Correct !' : 'Incorrect'}</h3>
          <p className="mb-2">Correction : {correction}</p>
          <p>Explication : {explication}</p>
        </div>
      )}
    </div>
  );
};

export default Reponses;