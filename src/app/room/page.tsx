"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>('');
    const [difficulte, setDifficulte] = useState<number>(1);
    const [duree, setDuree] = useState<number>(260);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [room, setRoom] = useState<any>(null); // Ajout de l'état room
    const [error, setError] = useState<string | null>(null);
    const [teamMembers, setTeamMembers] = useState({
        blue: [],
        red: [],
        admin: [],
        spectator: []
    });

    useEffect(() => {
        const id = searchParams.get('id');
        const nick = searchParams.get('nickname');
        if (id) {
            setConnectionId(id);
            setNickname(nick || '');
            fetchRoomData(id); // Ajout de la fonction pour récupérer les données de la room
        } else {
            router.push('/');
        }
    }, [searchParams]);

    const fetchRoomData = async (id: string) => {
        try {
            const response = await fetch(`/api/getRoomFromId?id=${id}`);
            if (!response.ok) throw new Error('Room not found');
            const data = await response.json();
            setRoom(data);
        } catch (error) {
            console.error('Error fetching room:', error);
            setError('Error loading room data');
        }
    };

    const handleLanguageToggle = (lang: string) => {
        setSelectedLanguages(prev => 
            prev.includes(lang) 
                ? prev.filter(l => l !== lang)
                : [...prev, lang]
        );
    };

    const handleStartGame = () => {
        if (selectedLanguages.length === 0) {
            setError("Veuillez sélectionner au moins un langage");
            return;
        }
        
        const queryParams = new URLSearchParams({
            languages: selectedLanguages.join(','),
            id: connectionId || '',
            difficulty: difficulte.toString(),
            duration: duree.toString()
        }).toString();
        
        router.push(`/in-game?${queryParams}`);
    };

    const goHome = () => {
        router.push('/');
    };

    // Ajout de la fonction getLanguages
    const getLanguages = () => [
        { id: "Js", label: "JavaScript" },
        { id: "Cpp", label: "C++" },
        { id: "Mobile", label: "Mobile" },
        { id: "Csharp", label: "C#" },
        { id: "PHP", label: "PHP" },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">

            {/* Room ID */}
            <div className="rounded-2xl border-2 border-gray-200 p-4 mb-4 max-w-5xl flex items-center justify-between">
                <p className="text-lg font-semibold">
                    Room ID: {connectionId || "Loading..."}
                </p>
                <button
                    type="button"
                    className="ml-2"
                    onClick={() => {
                        if (connectionId) {
                            navigator.clipboard.writeText(connectionId);
                            alert("Room ID copied to clipboard!");
                        }
                    }}
                >
                    <img
                        src="/assets/img/copy.png"
                        alt="Copy"
                        className="w-6 h-6 cursor-pointer"
                    />
                </button>
            </div>

            {/* Main container with two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                {/* Left Column: Room Name + Teams */}
                <div className="rounded-2xl border-2 border-gray-200 p-4">
                    {/* Header row: Room Name + refresh icon */}
                    <div className="flex flex-col mb-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                {room?.name != null ? room.name : "Loading..."}&#39;s room
                            </h2>
                            <button
                                type="button"
                                className="text-gray-500 hover:text-gray-700"
                                title="Refresh"
                                onClick={goHome}
                            >
                                <img
                                    src="/assets/img/return.png"
                                    alt="Return"
                                    className="w-7 h-7"
                                />
                            </button>
                        </div>
                        {/* Gray line */}
                        <hr className="border-gray-200 mt-2" />
                    </div>

                    {/* Join team buttons and error display */}
                    {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

                    {/* Équipe Bleu */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">Équipe Bleu</p>
                            <button onClick={() => handleJoinTeam('blue')} className="bg-blue-600 text-white text-sm px-3 py-1 rounded">
                                Rejoindre
                            </button>
                        </div>
                        {teamMembers.blue.map((user, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <img
                                    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                                    alt="profile"
                                    className="w-6 h-6 rounded-full bg-gray-300 border"
                                />
                                <span>{name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Équipe Rouge */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">Équipe Rouge</p>
                            <button onClick={() => handleJoinTeam('red')} className="bg-red-600 text-white text-sm px-3 py-1 rounded">
                                Rejoindre
                            </button>
                        </div>
                        {teamMembers.red.map((user, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <img
                                    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                                    alt="profile"
                                    className="w-6 h-6 rounded-full bg-gray-300 border"
                                />
                                <span>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Right Column: Maîtres du Jeu + Paramètre de Jeu */}
                <div className="flex flex-col space-y-4">
                    {/* Maîtres du Jeu (still using radio buttons) */}
                    <div className="rounded-2xl border-2 border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center mb-4 space-x-2">
                                <h2 className="text-xl font-semibold">Maîtres du Jeu</h2>
                                <span role="img" aria-label="Game Master" className="text-2xl">
                                    <img
                                        src="/assets/img/mvp.png"
                                        alt="Return"
                                        className="w-7 h-7"
                                    />
                                </span>
                            </div>
                            <button onClick={() => handleJoinTeam('admin')} className="bg-yellow-500 text-white text-sm px-3 py-1 rounded">
                                Rejoindre
                            </button>
                        </div>
                        {/* Gray line */}
                        <hr className="border-gray-200 mb-4" />
                        <div className="flex items-center space-x-2 mb-2">
                            {teamMembers.admin.map((user, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="profile" className="w-6 h-6 rounded-full bg-gray-300 border" />
                                    <span>{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Spectateurs */}
                    <div className="rounded-2xl border-2 border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <h2 className="text-xl font-semibold">Spectateurs</h2>
                                <span role="img" aria-label="Spectator" className="text-2xl">🔍</span>
                            </div>
                            <button onClick={() => handleJoinTeam('spectator')} className="bg-gray-600 text-white text-sm px-3 py-1 rounded">
                                Rejoindre
                            </button>
                        </div>
                        {/* Gray line */}
                        <hr className="border-gray-200 mb-4" />
                        <div className="flex items-center space-x-2 mb-2">
                            {teamMembers.spectator.map((user, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="profile" className="w-6 h-6 rounded-full bg-gray-300 border" />
                                    <span>{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Paramètre de Jeu */}
                    <div className="rounded-2xl border-2 border-gray-200 p-4">
                        <div className="flex items-center mb-4 space-x-2">
                            <h2 className="text-xl font-semibold">Paramètre de Jeu</h2>
                            <img
                                src="/assets/img/setting.png"
                                alt="Settings"
                                className="w-7 h-7"
                            />
                        </div>
                        {/* Gray line */}
                        <hr className="border-gray-200 mb-4" />

                        {/* Conteneur avec espacement uniforme */}
                        <div className="space-y-4">
                            {/* Durée des manches */}
                            <div className="flex items-center space-x-4">
                                <label htmlFor="duree" className="font-medium">
                                    Durée des manches (en Secondes)
                                </label>
                                <input
                                    id="duree"
                                    type="number"
                                    defaultValue={260}
                                    className="border border-gray-300 rounded-lg px-3 py-1 w-32"
                                />
                            </div>

                            {/* Difficulté */}
                            <div className="mb-4 flex items-center space-x-4">
                                <p className="font-medium">Difficulté</p>
                                <div className="flex items-center space-x-2">
                                    {["1", "2", "3"].map((level) => (
                                        <label
                                            key={level}
                                            className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg cursor-pointer text-md font-semibold"
                                        >
                                            <input
                                                type="radio"
                                                name="difficulty"
                                                className="hidden"
                                                onChange={(e) => {
                                                    e.target.parentElement?.classList.add("bg-gray-300");
                                                    document
                                                        .querySelectorAll('input[name="difficulty"]')
                                                        .forEach((input) => {
                                                            if (input !== e.target) {
                                                                input.parentElement?.classList.remove(
                                                                    "bg-gray-300"
                                                                );
                                                            }
                                                        });
                                                }}
                                            />
                                            {level}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Maîtres du Jeu + Paramètre de Jeu */}
                            <div className="flex flex-col space-y-4">
                                <div className="rounded-2xl border-2 border-gray-200 p-4">
                                    {/* Langages */}
                                    <div>
                                        <p className="font-medium mb-2">Langages :</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            {getLanguages().map((lang) => (
                                                <div key={lang.id} className="flex items-center space-x-3 p-1">
                                                    <label htmlFor={lang.id} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            id={lang.id}
                                                            checked={selectedLanguages.includes(lang.id)}
                                                            onChange={() => handleLanguageToggle(lang.id)}
                                                            className="w-5 h-5 cursor-pointer"
                                                        />
                                                        <span className="ml-2">{lang.label}</span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Buttons container */}
                                    <div className="flex justify-between mt-4">
                                        {/* Play button */}
                                        <button
                                            type="button"
                                            className="text-green-500 hover:text-green-700 flex items-center"
                                            onClick={handleStartGame}
                                        >
                                            <span className="mr-2">Lancer la partie</span>
                                            <img
                                                src="/assets/img/play.png"
                                                alt="Lancer la partie"
                                                className="w-6 h-6"
                                            />
                                        </button>

                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            className="text-red-500 hover:text-red-700 flex items-center"
                                            onClick={async () => {
                                                if (
                                                    confirm("Êtes-vous sûr de vouloir supprimer cette partie ?")
                                                ) {
                                                    try {
                                                        const response = await fetch(`/api/deleteRoom`, {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({ id: connectionId }),
                                                        });

                                                        if (!response.ok) {
                                                            const errorData = await response.json();
                                                            console.error("Erreur API :", errorData);
                                                            throw new Error(
                                                                errorData.message ||
                                                                "Échec de la suppression de la salle"
                                                            );
                                                        }

                                                        alert("Partie supprimée avec succès !");
                                                        router.push("/");
                                                    } catch (error) {
                                                        console.error(
                                                            "Erreur lors de la suppression de la salle :",
                                                            error
                                                        );
                                                        alert(
                                                            "Une erreur s'est produite lors de la suppression de la partie."
                                                        );
                                                    }
                                                }
                                            }}
                                        >
                                            <span className="mr-2">Supprimer la partie</span>
                                            <img
                                                src="/assets/img/trash.png"
                                                alt="Supprimer la partie"
                                                className="w-6 h-6"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}