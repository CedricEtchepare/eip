require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://user:password@rabbitmq:5672";
const QUEUE_INPUT = process.env.QUEUE_INPUT || "enriched_records";
const QUEUE_LAB = process.env.QUEUE_LAB || "queue_laboratory";
const QUEUE_RADIOLOGY = process.env.QUEUE_RADIOLOGY || "queue_radiology";
const QUEUE_CARDIO = process.env.QUEUE_CARDIO || "queue_cardiology";

async function startRouter() {
    try {
        // Connexion à RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Déclaration des queues
        await channel.assertQueue(QUEUE_INPUT, { durable: false });
        await channel.assertQueue(QUEUE_LAB, { durable: false });
        await channel.assertQueue(QUEUE_RADIOLOGY, { durable: false });
        await channel.assertQueue(QUEUE_CARDIO, { durable: false });

        console.log(`Content-Based Router en attente de messages sur '${QUEUE_INPUT}'...`);

        // Consommer les messages
        channel.consume(QUEUE_INPUT, async (msg) => {
            if (msg !== null) {
                const record = JSON.parse(msg.content.toString());
                console.log("Message reçu :", record);

                let destinationQueue = "";

                if (record.data.test.includes("Blood Test")) {
                    destinationQueue = QUEUE_LAB;
                } else if (record.data.test.includes("MRI")) {
                    destinationQueue = QUEUE_RADIOLOGY;
                } else if (record.data.test.includes("Heart ECG")) {
                    destinationQueue = QUEUE_CARDIO;
                }

                if (destinationQueue) {
                    channel.sendToQueue(destinationQueue, Buffer.from(JSON.stringify(record)));
                    console.log(`Message routé vers '${destinationQueue}'`);
                } else {
                    console.log("Aucun routage défini pour ce test médical.");
                }

                // Accuser réception du message
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error("Erreur lors du routage :", error);
    }
}

// Lancement du router
startRouter();
