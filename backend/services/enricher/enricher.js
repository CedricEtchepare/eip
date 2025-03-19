require('dotenv').config();
const amqp = require('amqplib');
const axios = require('axios');

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://user:password@rabbitmq:5672";
const QUEUE_INPUT = "json_records";
const QUEUE_OUTPUT = "enriched_records";
const API_URL = "http://json-server:3005/patients/";

async function consumeAndEnrich() {
    try {
        // Connexion à RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // S'assurer que les queues existent
        await channel.assertQueue(QUEUE_INPUT, { durable: false });
        await channel.assertQueue(QUEUE_OUTPUT, { durable: false });

        console.log(`En attente de messages sur '${QUEUE_INPUT}'...`);

        // Consommer les messages
        channel.consume(QUEUE_INPUT, async (msg) => {
            if (msg !== null) {
                const patientData = JSON.parse(msg.content.toString());
                console.log("Message reçu :", patientData);

                // Rajouter les infos de l'API
                try {
                    const response = await axios.get(`${API_URL}${patientData.id}`);
                    const enrichedData = {
                        ...patientData,
                        insurance: response.data.insurance,
                        medicalHistory: response.data.medicalHistory
                    };

                    console.log("Données enrichies :", enrichedData);

                    // Envoyer le message enrichi à RabbitMQ
                    channel.sendToQueue(QUEUE_OUTPUT, Buffer.from(JSON.stringify(enrichedData)));

                    // Accuser réception du message
                    channel.ack(msg);
                } catch (error) {
                    console.error("Erreur lors de l'enrichissement :", error.message);
                    channel.nack(msg, false, false); // Rejeter le message sans le réessayer
                }
            }
        });

    } catch (error) {
        console.error("Erreur de connexion à RabbitMQ :", error);
    }
}

// Lancer l'enricher
consumeAndEnrich();
