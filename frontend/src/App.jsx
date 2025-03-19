// frontend/src/App.js
import { useState } from "react";
import LogDisplay from "./LogDisplay";

const App = () => {
    const [loading, setLoading] = useState(false);

    const triggerProcessing = async () => {
        setLoading(true);
    
        // Message FHIR à envoyer
        const message = {
            resourceType: "Bundle",
            type: "collection",
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: "12345",
                        name: [{ family: "Doe", given: ["John"] }],
                        birthDate: "1980-05-15",
                        insurance: { plan: "Premium" }
                    }
                },
                {
                    resource: {
                        resourceType: "DiagnosticReport",
                        id: "67890",
                        code: { coding: [{ system: "loinc", code: "1234-5", display: "Blood Test" }] },
                        result: [{ valueString: "Positive" }]
                    }
                }
            ]
        };
    
        try {
            const response = await fetch("http://localhost:9001/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(message)
            });
    
            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi du message");
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Système Healthcare</h1>
            <button onClick={triggerProcessing} disabled={loading}>
                {loading ? "En cours..." : "Envoyer un message"}
            </button>
            <LogDisplay />
        </div>
    );
};

export default App;
