require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');
const { broadcast } = require("/app/websocket");



const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());


const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME;

async function sendToQueue(message) {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: false });

        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
        console.log(`Message envoyé à la queue '${QUEUE_NAME}' :`, message);

        // Notifier le frontend via WebSockets
        broadcast({ type: "message_sent", queue: QUEUE_NAME, data: message });

        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
    }
}

// Endpoint pour envoyer un message
app.post('/send', async (req, res) => {
    const message = req.body;
    await sendToQueue(message);
    res.send({ status: "Message envoyé", data: message });
});

const PORT = 9000;
app.listen(PORT, () => {
    console.log(`🚀 Producteur en écoute sur http://localhost:${PORT}`);
});
