import OpenAI from 'openai';

export async function validateWithLLM(userAnswer: string, correction: string, explication: string) {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
  });

  const prompt = `
Contexte: Un utilisateur a proposé une réponse à un bug.

Réponse attendue:
${correction}

Explication de la correction:
${explication}

Réponse de l'utilisateur:
${userAnswer}

La réponse est-elle fonctionnellement correcte même si la syntaxe peut différer ? 
Répondez uniquement par "Correct : [raison]" ou "Incorrect : [raison]"
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {role: "system", content: "Tu es un expert en programmation qui évalue des corrections de bugs."},
        {role: "user", content: prompt}
      ]
    });

    const response = completion.choices[0].message?.content || '';
    const isCorrect = response.toLowerCase().startsWith('correct');

    return {
      correct: isCorrect,
      reason: response
    };
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    // Fallback sur une comparaison simple si l'API échoue
    const simpleCheck = userAnswer.trim().toLowerCase() === correction.trim().toLowerCase();
    return {
      correct: simpleCheck,
      reason: simpleCheck ? "Correct (vérification simple)" : "Incorrect (vérification simple)"
    };
  }
}