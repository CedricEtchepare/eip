const WebSocket = require('ws');

const port = process.env.WS_PORT || 8080;
const wss = new WebSocket.Server({ port: port, host: "0.0.0.0" });

console.log(`WebSocket Server en écoute sur ws://localhost:${port}`);

wss.on('connection', (ws) => {
    console.log("Nouvelle connexion WebSocket établie");

    // Vérification périodique pour garder la connexion active
    ws.isAlive = true;
    ws.on('pong', () => {
        console.log("Pong reçu ! Connexion WebSocket toujours active.");
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        console.log("Message reçu depuis WebSocket :", message.toString());
    });

    ws.on('close', (code, reason) => {
        console.log(`Connexion WebSocket fermée (code: ${code}, raison: ${reason || "Aucune raison"})`);
    });

    ws.on('error', (error) => {
        console.error("Erreur WebSocket :", error);
    });
});

// Verif des connexions toutes les 10s
setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) {
            console.log("Déconnexion d'un client WebSocket inactif...");
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 10000);

// Fonction pour envoyer des messages aux clients WebSocket connectés
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

module.exports = { broadcast };
