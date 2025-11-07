# F1 AI Game - Backend

Backend Python per sistema di gioco competitivo con privacy crittografica totale.

## Architettura

```
backend/
├── api/              # FastAPI routes e schemas
├── blockchain/       # Mock blockchain + VRF + Smart Contract
├── core/             # Game Manager (orchestrazione)
├── crypto/           # Crittografia e derivazione numeri
├── models/           # Data models (Pydantic)
├── main.py           # Entry point
└── requirements.txt  # Dipendenze
```

## Tecnologie

- **FastAPI**: Framework web moderno e veloce
- **Pydantic**: Validazione dati e serializzazione
- **PyCryptodome**: Crittografia RSA
- **WebSockets**: Real-time updates
- **Mock Blockchain**: Simula Ethereum/L2
- **VRF Simulator**: Simula Chainlink VRF

## Installazione

### 1. Crea ambiente virtuale

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# oppure
venv\Scripts\activate     # Windows
```

### 2. Installa dipendenze

```bash
pip install -r requirements.txt
```

### 3. Configura environment

```bash
cp .env.example .env
# Modifica .env se necessario
```

## Esecuzione

### Development Server

```bash
python main.py
```

Server disponibile su: `http://localhost:8000`

### Con Uvicorn

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Dopo aver avviato il server, accedi a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoint Principali

### Game Management

- `POST /api/game/create` - Crea nuovo gioco
- `GET /api/game/{game_id}` - Stato gioco
- `GET /api/game/active/current` - Gioco attivo corrente
- `GET /api/games/all` - Tutti i giochi

### Player

- `POST /api/game/{game_id}/register` - Registra giocatore
- `GET /api/player/{address}/xpf` - Balance XPF

### Cryptography Helpers

- `POST /api/crypto/derive-numbers` - Deriva numeri da seed
- `POST /api/crypto/generate-keypair` - Genera chiavi RSA
- `POST /api/crypto/generate-zk-proof-commitment` - ZK proof commitment
- `POST /api/crypto/generate-zk-proof-final` - ZK proof finale

### Game Flow

1. `POST /api/game/{game_id}/commitment` - Sottometti commitment
2. `POST /api/game/{game_id}/variation/request` - Richiedi variazione
3. `POST /api/game/{game_id}/variation/compute` - Calcola variazione
4. `POST /api/game/{game_id}/submit-final` - Sottometti scelta finale

### WebSocket

- `ws://localhost:8000/ws/{game_id}` - Real-time updates

## Flusso di Gioco Completo

### 1. Creazione Gioco

```bash
curl -X POST http://localhost:8000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"max_players": 3}'
```

### 2. Registrazione Giocatori

```bash
curl -X POST http://localhost:8000/api/game/{game_id}/register \
  -H "Content-Type: application/json" \
  -d '{"player_address": "0xPlayer1"}'
```

Ripeti per 3 giocatori. Dopo il terzo, VRF genera seed automaticamente.

### 3. Deriva Numeri (Client-side)

```bash
curl -X POST http://localhost:8000/api/crypto/derive-numbers \
  -H "Content-Type: application/json" \
  -d '{"seed_player": "0xabc123..."}'
```

### 4. Genera Keypair (Client-side)

```bash
curl -X POST http://localhost:8000/api/crypto/generate-keypair
```

### 5. Cifra Numeri e Commitment

```bash
# Client cifra numeri con public key
# Genera ZK proof
curl -X POST http://localhost:8000/api/crypto/generate-zk-proof-commitment \
  -H "Content-Type: application/json" \
  -d '{
    "seed_player": "0xabc...",
    "numbers": [347, 892, ...],
    "encrypted_numbers": ["enc1", "enc2", ...],
    "public_key": "-----BEGIN PUBLIC KEY-----..."
  }'

# Sottometti commitment
curl -X POST http://localhost:8000/api/game/{game_id}/commitment \
  -H "Content-Type: application/json" \
  -d '{
    "player_address": "0xPlayer1",
    "public_key": "...",
    "encrypted_numbers": [...],
    "zk_proof": "0xproof..."
  }'
```

### 6. Generazione Variazioni

```bash
# Richiedi variazione (burn 1 XPF)
curl -X POST http://localhost:8000/api/game/{game_id}/variation/request \
  -H "Content-Type: application/json" \
  -d '{"player_address": "0xPlayer1"}'

# Calcola variazione (server-side)
curl -X POST http://localhost:8000/api/game/{game_id}/variation/compute \
  -H "Content-Type: application/json" \
  -d '{
    "player_address": "0xPlayer1",
    "current_numbers": [347, 892, ...]
  }'
```

Ripeti fino a 9 volte o finché soddisfatto.

### 7. Submission Finale

```bash
# Genera ZK proof finale
curl -X POST http://localhost:8000/api/crypto/generate-zk-proof-final \
  -H "Content-Type: application/json" \
  -d '{
    "seed_player": "0xabc...",
    "seed_function": "0xdef...",
    "output_declared": 5103,
    "variations_count": 3
  }'

# Sottometti scelta
curl -X POST http://localhost:8000/api/game/{game_id}/submit-final \
  -H "Content-Type: application/json" \
  -d '{
    "player_address": "0xPlayer1",
    "output_declared": 5103,
    "encrypted_state_hash": "0xhash...",
    "variations_count": 3,
    "zk_proof": "0xproof..."
  }'
```

### 8. Vincitore

Dopo che tutti hanno submitted, il backend determina automaticamente il vincitore.

```bash
# Verifica stato
curl http://localhost:8000/api/game/{game_id}
```

## Struttura Dati

### Game State

```json
{
  "game_id": "game_abc123",
  "status": "PLAYING",
  "players": [...],
  "seed_function": "0xdef456...",
  "function_coefficients": [37, 82, 15, ...],
  "function_bias": 523,
  "winner": null,
  "winning_output": null
}
```

### Player

```json
{
  "address": "0xPlayer1",
  "xpf_balance": 7,
  "xpf_spent": 3,
  "status": "GENERATING",
  "seed_player": "0xabc123...",
  "has_commitment": true,
  "has_final_submission": false,
  "variations_count": 2
}
```

## Note per Frontend

### CORS

Il backend accetta richieste da qualsiasi origine (`allow_origins=["*"]`).
In produzione, specifica i domini autorizzati.

### Autenticazione

Per la demo, non c'è autenticazione. In produzione:
- Firma messaggi con wallet (MetaMask)
- Verifica firme server-side
- JWT tokens per sessioni

### Error Handling

Tutti gli errori ritornano:

```json
{
  "detail": "Error message here"
}
```

Con status code appropriato (400, 404, 500).

### WebSocket Events

Il WebSocket può inviare eventi come:

```json
{
  "type": "game_state_changed",
  "game_id": "game_abc123",
  "new_status": "ALL_COMMITTED"
}
```

Implementa listener nel frontend per updates real-time.

## Testing

### Test Manuale

Usa Swagger UI: http://localhost:8000/docs

### Test Script

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Crea gioco
response = requests.post(f"{BASE_URL}/game/create", json={"max_players": 3})
game = response.json()
game_id = game["game_id"]

# Registra giocatori
for i in range(3):
    requests.post(
        f"{BASE_URL}/game/{game_id}/register",
        json={"player_address": f"0xPlayer{i+1}"}
    )

# Verifica stato
game = requests.get(f"{BASE_URL}/game/{game_id}").json()
print(f"Game Status: {game['status']}")
print(f"Players: {len(game['players'])}")
```

## Troubleshooting

### Port già in uso

```bash
# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Dipendenze mancanti

```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Import errors

Assicurati di essere nella cartella `backend/` ed eseguire:

```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"  # Linux/Mac
set PYTHONPATH=%PYTHONPATH%;%cd%          # Windows
```

## Produzione

Per deployment in produzione:

1. Disabilita `reload=True` in `main.py`
2. Configura `allow_origins` con domini specifici
3. Usa HTTPS (reverse proxy Nginx)
4. Database persistente (PostgreSQL/MongoDB)
5. Redis per caching
6. Monitoring (Sentry, Prometheus)
7. Rate limiting
8. Autenticazione robusta

## Contatto

Per domande o problemi, apri issue su GitHub.

## License

MIT
