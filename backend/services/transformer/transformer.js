require('dotenv').config();
const amqp = require('amqplib');
const { broadcast } = require('/app/websocket');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const INPUT_QUEUE = "fhir_records";
const OUTPUT_QUEUE = "json_records";

async function startConsumer() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(INPUT_QUEUE, { durable: false });
    await channel.assertQueue(OUTPUT_QUEUE, { durable: false });

    console.log(`En attente de messages sur '${INPUT_QUEUE}'...`);
    broadcast({ type: "log", message: `En attente de messages sur '${INPUT_QUEUE}'...` });

    channel.consume(INPUT_QUEUE, (msg) => {
        if (msg !== null) {
            const fhirRecord = JSON.parse(msg.content.toString());
            console.log("Message reçu (FHIR) :", JSON.stringify(fhirRecord, null, 2));
            broadcast({ type: "message_received", queue: INPUT_QUEUE, data: fhirRecord });

            // Transformation HL7 FHIR → JSON
            const transformedRecord = transformFHIRtoJSON(fhirRecord);

            console.log("Message transformé (JSON) :", JSON.stringify(transformedRecord, null, 2));
            broadcast({ type: "message_transformed", queue: OUTPUT_QUEUE, data: transformedRecord });

            // Envoi du JSON transformé à une autre queue pour l’enrichissement
            channel.sendToQueue(OUTPUT_QUEUE, Buffer.from(JSON.stringify(transformedRecord)));

            // Confirmer le message traité
            channel.ack(msg);
        }
    });
}

// Conversion HL7 FHIR → JSON standard
function transformFHIRtoJSON(fhirRecord) {
    const patient = fhirRecord.entry?.find(e => e.resource.resourceType === "Patient")?.resource;
    const report = fhirRecord.entry?.find(e => e.resource.resourceType === "DiagnosticReport")?.resource;

    return {
        id: patient?.id || "Unknown",
        name: `${patient?.name?.[0]?.given?.[0] || ''} ${patient?.name?.[0]?.family || ''}`.trim() || "Unknown",
        dateOfBirth: patient?.birthDate || "Unknown",
        insurance: patient?.insurance?.plan || "Unknown",
        type: "lab",
        data: {
            test: report?.code?.coding?.[0]?.display || "Unknown",
            result: report?.result?.[0]?.valueString || "Unknown"
        }
    };
}

// Lancement du consumer
startConsumer().catch(console.error);
