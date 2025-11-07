# API Examples - Chiamate Complete

Esempi pratici di tutte le chiamate API per il frontend.

## Setup

```bash
# Avvia il server
cd backend
python main.py

# Server disponibile su http://localhost:8000
```

## 1. Health Check

```bash
curl http://localhost:8000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "active_games": 0,
  "blockchain_height": 1
}
```

## 2. Crea Gioco

```bash
curl -X POST http://localhost:8000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"max_players": 3}'
```

**Response:**
```json
{
  "game_id": "game_abc123def456",
  "status": "REGISTERING",
  "players": [],
  "max_players": 3,
  "seed_function": null,
  "function_coefficients": null,
  "function_bias": null,
  "winner": null,
  "winning_output": null,
  "created_at": "2025-11-07T14:30:00.123456"
}
```

## 3. Registra Giocatore

```bash
curl -X POST http://localhost:8000/api/game/game_abc123def456/register \
  -H "Content-Type: application/json" \
  -d '{"player_address": "0xPlayer1"}'
```

**Response:**
```json
{
  "address": "0xPlayer1",
  "xpf_balance": 10,
  "xpf_spent": 0,
  "status": "REGISTERED",
  "seed_player": null,
  "has_commitment": false,
  "has_final_submission": false,
  "variations_count": 0
}
```

## 4. Ottieni Stato Gioco

```bash
curl http://localhost:8000/api/game/game_abc123def456
```

**Response (dopo 3 registrazioni):**
```json
{
  "game_id": "game_abc123def456",
  "status": "RANDOMNESS_FULFILLED",
  "players": [
    {
      "address": "0xPlayer1",
      "xpf_balance": 10,
      "xpf_spent": 0,
      "status": "REGISTERED",
      "seed_player": "0x9a7b3c4d...",
      "has_commitment": false,
      "has_final_submission": false,
      "variations_count": 0
    },
    // ... altri 2 giocatori
  ],
  "max_players": 3,
  "seed_function": null,
  "function_coefficients": null,
  "function_bias": null,
  "winner": null,
  "winning_output": null,
  "created_at": "2025-11-07T14:30:00.123456"
}
```

## 5. Deriva Numeri da Seed

```bash
curl -X POST http://localhost:8000/api/crypto/derive-numbers \
  -H "Content-Type: application/json" \
  -d '{"seed_player": "0x9a7b3c4d..."}'
```

**Response:**
```json
{
  "numbers": [347, 892, 156, 723, 445, 891, 234, 678, 912, 445]
}
```

## 6. Genera Keypair

```bash
curl -X POST http://localhost:8000/api/crypto/generate-keypair
```

**Response:**
```json
{
  "public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEF...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA..."
}
```

## 7. Genera ZK Proof per Commitment

```bash
curl -X POST http://localhost:8000/api/crypto/generate-zk-proof-commitment \
  -H "Content-Type: application/json" \
  -d '{
    "seed_player": "0x9a7b3c4d...",
    "numbers": [347, 892, 156, 723, 445, 891, 234, 678, 912, 445],
    "encrypted_numbers": ["enc_1", "enc_2", "enc_3", "enc_4", "enc_5", "enc_6", "enc_7", "enc_8", "enc_9", "enc_10"],
    "public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEF..."
  }'
```

**Response:**
```json
{
  "zk_proof": "0xabcdef123456789..."
}
```

## 8. Sottometti Commitment

```bash
curl -X POST http://localhost:8000/api/game/game_abc123def456/commitment \
  -H "Content-Type: application/json" \
  -d '{
    "player_address": "0xPlayer1",
    "public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEF...",
    "encrypted_numbers": ["enc_1", "enc_2", "enc_3", "enc_4", "enc_5", "enc_6", "enc_7", "enc_8", "enc_9", "enc_10"],
    "zk_proof": "0xabcdef123456789..."
  }'
```

**Response:**
```json
{
  "tx_hash": "0x7a8b9c0d...",
  "block_number": 0,
  "gas_used": 150000,
  "status": "success"
}
```

## 9. Richiedi Variazione

```bash
curl -X POST http://localhost:8000/api/game/game_abc123def456/variation/request \
  -H "Content-Type: application/json" \
  -d '{"player_address": "0xPlayer1"}'
```

**Response:**
```json
{
  "variation_index": 0,
  "tx_hash": "0x1a2b3c4d...",
  "xpf_remaining": 9
}
```

## 10. Calcola Variazione

```bash
curl -X POST http://localhost:8000/api/game/game_abc123def456/variation/compute \
  -H "Content-Type: application/json" \
  -d '{
    "player_address": "0xPlayer1",
    "current_numbers": [347, 892, 156, 723, 445, 891, 234, 678, 912, 445]
  }'
```

**Response:**
```json
{
  "variation_index": 0,
  "output": 5103,
  "encrypted_state": ["enc_347_a1b2", "enc_885_c3d4", ...],
  "new_numbers": [347, 885, 171, 703, 465, 888, 249, 663, 923, 437],
  "deltas": [0, -7, 15, -20, 20, -3, 15, -15, 11, -8],
  "xpf_remaining": 9
}
```

## 11. Genera ZK Proof Finale

```bash
curl -X POST http://localhost:8000/api/crypto/generate-zk-proof-final \
  -H "Content-Type: application/json" \
  -d '{
    "seed_player": "0x9a7b3c4d...",
    "seed_function": "0x1f2e3d4c...",
    "output_declared": 5103,
    "variations_count": 3
  }'
```

**Response:**
```json
{
  "zk_proof": "0xfedcba987654321..."
}
```

## 12. Sottometti Scelta Finale

```bash
curl -X POST http://localhost:8000/api/game/game_abc123def456/submit-final \
  -H "Content-Type: application/json" \
  -d '{
    "player_address": "0xPlayer1",
    "output_declared": 5103,
    "encrypted_state_hash": "0xhash123...",
    "variations_count": 3,
    "zk_proof": "0xfedcba987654321..."
  }'
```

**Response:**
```json
{
  "tx_hash": "0x9f8e7d6c...",
  "block_number": 0,
  "gas_used": 200000,
  "status": "success"
}
```

## 13. Controlla Balance XPF

```bash
curl http://localhost:8000/api/player/0xPlayer1/xpf
```

**Response:**
```json
{
  "address": "0xPlayer1",
  "balance": 6
}
```

## 14. Lista Tutti i Giochi

```bash
curl http://localhost:8000/api/games/all
```

**Response:**
```json
[
  {
    "game_id": "game_abc123def456",
    "status": "COMPLETED",
    "players": [...],
    "winner": "0xPlayer2",
    "winning_output": 5234
  },
  // ... altri giochi
]
```

## 15. Gioco Attivo

```bash
curl http://localhost:8000/api/game/active/current
```

**Response:**
```json
{
  "game_id": "game_xyz789",
  "status": "PLAYING",
  "players": [...]
}
```

## WebSocket Connection

```javascript
// JavaScript
const ws = new WebSocket('ws://localhost:8000/ws/game_abc123def456');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Message:', message);
};

ws.send(JSON.stringify({
  type: 'subscribe',
  events: ['game_state_changed', 'player_submitted']
}));
```

## Sequenza Completa (Bash Script)

```bash
#!/bin/bash

API="http://localhost:8000/api"

echo "1. Crea gioco"
GAME=$(curl -s -X POST $API/game/create -H "Content-Type: application/json" -d '{"max_players":3}')
GAME_ID=$(echo $GAME | jq -r '.game_id')
echo "Game ID: $GAME_ID"

echo -e "\n2. Registra 3 giocatori"
for i in 1 2 3; do
  curl -s -X POST $API/game/$GAME_ID/register \
    -H "Content-Type: application/json" \
    -d "{\"player_address\":\"0xPlayer$i\"}" | jq -r '.address'
done

sleep 1

echo -e "\n3. Ottieni stato (seed generati)"
curl -s $API/game/$GAME_ID | jq '{status, seed_function, players: [.players[].address]}'

echo -e "\n4. Player1 fa commitment"
SEED=$(curl -s $API/game/$GAME_ID | jq -r '.players[0].seed_player')
NUMBERS=$(curl -s -X POST $API/crypto/derive-numbers \
  -H "Content-Type: application/json" \
  -d "{\"seed_player\":\"$SEED\"}" | jq -r '.numbers')

KEYPAIR=$(curl -s -X POST $API/crypto/generate-keypair)
PUBLIC_KEY=$(echo $KEYPAIR | jq -r '.public_key')

ZK_PROOF=$(curl -s -X POST $API/crypto/generate-zk-proof-commitment \
  -H "Content-Type: application/json" \
  -d "{
    \"seed_player\":\"$SEED\",
    \"numbers\":$NUMBERS,
    \"encrypted_numbers\":[\"e1\",\"e2\",\"e3\",\"e4\",\"e5\",\"e6\",\"e7\",\"e8\",\"e9\",\"e10\"],
    \"public_key\":\"$PUBLIC_KEY\"
  }" | jq -r '.zk_proof')

curl -s -X POST $API/game/$GAME_ID/commitment \
  -H "Content-Type: application/json" \
  -d "{
    \"player_address\":\"0xPlayer1\",
    \"public_key\":\"$PUBLIC_KEY\",
    \"encrypted_numbers\":[\"e1\",\"e2\",\"e3\",\"e4\",\"e5\",\"e6\",\"e7\",\"e8\",\"e9\",\"e10\"],
    \"zk_proof\":\"$ZK_PROOF\"
  }" | jq -r '.tx_hash'

echo -e "\nCommitment submitted!"
```

## Testing con Python

```python
import requests
import json

API = "http://localhost:8000/api"

# Crea gioco
game = requests.post(f"{API}/game/create", json={"max_players": 3}).json()
game_id = game["game_id"]
print(f"Game: {game_id}")

# Registra giocatori
for i in range(3):
    player = requests.post(
        f"{API}/game/{game_id}/register",
        json={"player_address": f"0xPlayer{i+1}"}
    ).json()
    print(f"Player {i+1}: {player['address']}, XPF: {player['xpf_balance']}")

# Ottieni stato
game = requests.get(f"{API}/game/{game_id}").json()
print(f"Status: {game['status']}")
print(f"Seed function: {game['seed_function'][:20]}..." if game['seed_function'] else "Not yet")

# Player1 commitment
player = game['players'][0]
numbers = requests.post(
    f"{API}/crypto/derive-numbers",
    json={"seed_player": player['seed_player']}
).json()['numbers']

print(f"Numbers: {numbers}")

keypair = requests.post(f"{API}/crypto/generate-keypair").json()

zk_proof = requests.post(
    f"{API}/crypto/generate-zk-proof-commitment",
    json={
        "seed_player": player['seed_player'],
        "numbers": numbers,
        "encrypted_numbers": [f"enc_{n}" for n in numbers],
        "public_key": keypair['public_key']
    }
).json()['zk_proof']

result = requests.post(
    f"{API}/game/{game_id}/commitment",
    json={
        "player_address": player['address'],
        "public_key": keypair['public_key'],
        "encrypted_numbers": [f"enc_{n}" for n in numbers],
        "zk_proof": zk_proof
    }
).json()

print(f"Commitment TX: {result['tx_hash']}")
```

## Swagger UI

Vai su http://localhost:8000/docs per interfaccia interattiva con:
- Documentazione automatica
- Test diretto degli endpoint
- Schema validation
- Response examples

Buon divertimento! 🎮
