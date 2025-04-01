const handleSubmit = async () => {

  const res = await fetch("/api/addRoom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (res.ok) {
    alert("Room créée avec succès !");
    return res.json();
  } else {
    alert("Erreur lors de la création de la room.");
  }
};

export default handleSubmit;