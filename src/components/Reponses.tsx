import { useState, useEffect } from 'react';

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
  isGameMaster?: boolean;
}

const Reponses = ({ correction, explication, onAnswerSubmit, teamColors, isGameMaster = false }: ReponsesProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Réinitialiser l'état quand la correction change (nouvelle question)
  useEffect(() => {
    setUserAnswer('');
    setShowCorrection(false);
    setIsCorrect(null);
    setValidationMessage('');
    setAiResponse(null);
    setIsValidating(false);
  }, [correction]);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      setValidationMessage('Veuillez entrer une réponse');
      return;
    }

    try {
      setIsValidating(true);
      const response = await fetch('/api/validateAnswer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswer, correction, explication })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "quota") {
          setValidationMessage("Le service IA est indisponible quota OpenAI. Contactez l'administrateur.");
          setShowCorrection(true);
          setIsCorrect(false);
          setAiResponse(null);
          onAnswerSubmit(false);
          return;
        }
        throw new Error(result.explanation || 'Erreur de validation');
      }

      setIsCorrect(result.isValid);
      setShowCorrection(true);
      setValidationMessage(result.explanation);
      setAiResponse(result.aiResponse);
      onAnswerSubmit(result.isValid);

    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setIsCorrect(false);
      setShowCorrection(true);
      setValidationMessage('Erreur technique lors de la validation.');
      setAiResponse(null);
      onAnswerSubmit(false);
    } finally {
      setIsValidating(false);
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
        disabled={showCorrection || isValidating}
      />

      <button
        onClick={handleSubmit}
        className={`w-full py-3 px-6 rounded-md font-semibold ${teamColors.button} text-white hover:opacity-90 ${
          (showCorrection || isValidating) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={showCorrection || isValidating}
      >
        {isValidating ? 'Validation en cours...' : 'Soumettre'}
      </button>

      {showCorrection && (
        <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-bold mb-2">{isCorrect ? 'Correct !' : 'Incorrect'}</h3>
          <p className="mb-2">{validationMessage}</p>
          {aiResponse && (
            <div className="mt-4 p-4 bg-white rounded-md">
              <h4 className="font-bold mb-2">Analyse de l'IA :</h4>
              <p className="whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
          {!isCorrect && (
            <div className="mt-4">
              <p className="font-bold mb-2">La solution attendue était :</p>
              <pre className="bg-white p-4 rounded-md">{correction}</pre>
              <p className="font-bold mt-4 mb-2">Explication :</p>
              <pre className="bg-white p-4 rounded-md whitespace-pre-wrap">{explication}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reponses;