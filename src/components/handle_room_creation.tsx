export default async function handleRoomCreation(name: string) {
  try {
    const res = await fetch("/api/addRoom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      throw new Error("Erreur lors de la création de la room");
    }

    const data = await res.json();
    if (!data.connectionId) {
      throw new Error("ID de connexion manquant");
    }

    return data.connectionId;
  } catch (error) {
    console.error("Erreur création room:", error);
    alert("Erreur lors de la création de la room");
    return null;
  }
}
