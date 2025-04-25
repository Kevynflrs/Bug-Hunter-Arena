const apiKey = process.env.MISTRAL_API_KEY;
const endpoint = "https://api.mistral.ai/v1/chat/completions";

async function callMistralAPI(messages, model = "mistral-medium", temperature = 0.7) {
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        console.error("Erreur lors de l'appel à Mistral:", error);
        throw error;
    }
}

const messages = [
    { role: "system", content: "Tu es un assistant utile." },
    { role: "user", content: "Explique-moi le Big Bang simplement." }
];

callMistralAPI(messages)
    .then(reply => {
        console.log("Réponse de Mistral:", reply);
    })
    .catch(err => {
        console.error("Erreur:", err.message);
    });