npm install

docker compose up -d 

docker-compose logs -f "nom du service docker" // pour voir les messages passer

docker logs -f backend-producer-1

docker logs -f backend-transformer-1

docker logs -f backend-enricher-1

docker logs -f backend-router-1

docker logs -f backend-consumer_laboratory-1

lancer postman et faire un post sur : http://localhost:9001/send

cocher Content-Type -> application/json

```bash
body : 
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "12345",
        "name": [{ "family": "Doe", "given": ["John"] }],
        "birthDate": "1980-05-15",
        "insurance": { "plan": "Premium" }
      }
    },
    {
      "resource": {
        "resourceType": "DiagnosticReport",
        "id": "67890",
        "code": { "coding": [{ "system": "loinc", "code": "1234-5", "display": "Blood Test" }] },
        "result": [{ "valueString": "Positive" }]
      }
    }
  ]
}
```
