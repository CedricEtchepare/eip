require('dotenv').config();
const amqp = require('amqplib');
const { broadcast } = require("/app/websocket");




const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://user:password@rabbitmq:5672";
const QUEUE_NAME = process.env.QUEUE_NAME;

async function startConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: false });

        console.log(`En attente de messages sur '${QUEUE_NAME}'...`);

        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                console.log(`Message reçu dans ${QUEUE_NAME} :`, data);

                // Notifier le frontend via WebSockets
                broadcast({ type: "message_received", queue: QUEUE_NAME, data });

                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error("Erreur lors de la récupération du message :", error);
    }
}

// Lancer le consumer
startConsumer();
