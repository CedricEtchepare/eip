import { useEffect, useState } from "react";

const LogDisplay = () => {
    const [logs, setLogs] = useState([]);
    const [ws, setWs] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    useEffect(() => {
        let isMounted = true; // Pour éviter les mises à jour sur un composant démonté

        const connectWebSocket = () => {
            const socket = new WebSocket("ws://127.0.0.1:8080");

            socket.onopen = () => {
                console.log("Connecté au WebSocket");
                setReconnectAttempts(0); // Reset le compteur de reconnexions
            };

            socket.onmessage = (event) => {
                console.log("Message reçu :", event.data);
                if (isMounted) {
                    setLogs(prevLogs => [...prevLogs, event.data]);
                }
            };

            socket.onerror = (error) => {
                console.error("Erreur WebSocket :", error);
            };

            socket.onclose = (event) => {
                console.warn(`Connexion WebSocket fermée (code: ${event.code}, raison: ${event.reason})`);

                if (event.code !== 1000) { // 1000 = fermeture normale
                    setTimeout(() => {
                        if (isMounted && reconnectAttempts < 10) { // Éviter boucle infinie
                            console.log("Tentative de reconnexion WebSocket...");
                            setReconnectAttempts(prev => prev + 1);
                            connectWebSocket();
                        }
                    }, 3000);
                }
            };

            setWs(socket);
        };

        connectWebSocket();

        return () => {
            isMounted = false;
            if (ws) {
                ws.close();
            }
        };
    }, []);

    return (
        <div>
            <h2>📜 Logs reçus</h2>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}>{log}</li>
                ))}
            </ul>
        </div>
    );
};

export default LogDisplay;
