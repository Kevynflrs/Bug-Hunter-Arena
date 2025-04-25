import { useState } from 'react';

interface ReponsesProps {
  correction: string;
  explication: string;
  onAnswerSubmit: (isCorrect: boolean) => void;
}

const Reponses = ({ correction, explication, onAnswerSubmit }: ReponsesProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (showCorrection) {
      // Passer à la question suivante
      onAnswerSubmit(isCorrect || false);
      setUserAnswer('');
      setShowCorrection(false);
      setIsCorrect(null);
    } else {
      // Vérifier la réponse
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
        className="w-full p-4 border rounded-md mb-4"
        placeholder="Entrez votre réponse ici..."
        rows={6}
        disabled={showCorrection}
      />

      <button
        onClick={handleSubmit}
        className={`w-full py-3 px-6 rounded-md font-semibold ${
          showCorrection ? 'bg-green-500' : 'bg-blue-500'
        } text-white hover:opacity-90`}
      >
        {showCorrection ? 'Question suivante' : 'Soumettre'}
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