export default async function handleRoomCreation(name: string) {

  const res = await fetch("/api/addRoom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }), // Include the name in the request body
  });

  if (res.ok) {
    const data: { connectionId: string } = await res.json();
    return data.connectionId;
  } else {
    alert("Erreur lors de la création de la room.");
    return null;
  }

};
