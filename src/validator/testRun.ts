import vm from 'vm';

export async function runTest(userAnswer: string, correction: string): Promise<{ success: boolean }> {
  // Nettoyage basique des réponses
  const cleanUserAnswer = userAnswer.trim().toLowerCase();
  const cleanCorrection = correction.trim().toLowerCase();

  // Vérification exacte
  if (cleanUserAnswer === cleanCorrection) {
    return { success: true };
  }

  // Si ce n'est pas une correspondance exacte, on teste le code si possible
  try {
    const sandbox: any = {};
    const context = vm.createContext(sandbox);

    // On isole le code dans un VM sécurisée
    const script = new vm.Script(`
      const userResult = (function() { ${userAnswer} })();
      const expectedResult = (function() { ${correction} })();
      if (JSON.stringify(userResult) !== JSON.stringify(expectedResult)) {
        throw new Error('Résultats différents');
      }
    `);
    
    script.runInContext(context, { timeout: 1000 });
    return { success: true };
  } catch (err) {
    console.error('Test échoué:', err);
    return { success: false };
  }
}