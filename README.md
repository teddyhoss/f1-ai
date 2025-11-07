# F1 AI Game - Sistema di Gioco Competitivo con Privacy Crittografica

Proof of Concept per hackathon di un sistema di gioco multiplayer con:
- Privacy totale dei dati dei giocatori
- Casualità verificabile (VRF simulato)
- Zero-Knowledge Proofs (simulati)
- Blockchain simulata per immutabilità
- Sistema economico con token XPF

## Struttura Progetto

```
f1-ai/
├── context.md           # Specifica high-level del sistema
├── dettaglio.md         # Specifica dettagliata protocollo
├── backend/             # Backend Python (FastAPI)
│   ├── api/            # REST API + WebSocket
│   ├── blockchain/     # Mock blockchain + VRF + Smart Contract
│   ├── core/           # Game Manager
│   ├── crypto/         # Crittografia
│   ├── models/         # Data models
│   └── main.py         # Entry point
└── README.md           # Questo file
```

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Server disponibile su: http://localhost:8000

API Docs: http://localhost:8000/docs

### Frontend (da implementare)

Il backend espone API REST complete per:
- Gestione giochi e giocatori
- Crittografia (keypair, cifratura, ZK proofs)
- Commitment e variazioni
- WebSocket per real-time updates

Vedi [backend/README.md](backend/README.md) per documentazione completa API.

## Architettura

### Layer 1: Mock Blockchain
Simula Ethereum/L2 con:
- Blocchi e transazioni
- Gas costs simulati
- Transaction hashes
- Immutabilità

### Layer 2: Smart Contract Simulator
Implementa logica on-chain:
- Registrazione giocatori
- Token XPF (mint/burn)
- Commitment verification
- Winner determination
- Reward distribution

### Layer 3: VRF Simulator
Simula Chainlink VRF:
- Casualità verificabile
- Proof crittografiche
- Seed derivation per giocatori

### Layer 4: Crypto Engine
Crittografia reale:
- RSA keypair generation
- Cifratura/decifratura
- ZK proofs (simulati ma credibili)
- Commitment schemes
- Derivazione deterministica numeri

### Layer 5: Game Manager
Orchestrazione completa:
- Coordina tutti i layer
- Gestisce stato gioco
- Transitions automatiche
- Event handling

### Layer 6: REST API
FastAPI moderna:
- Swagger auto-documentation
- CORS configurato
- Error handling
- Request/Response schemas

## Flusso di Gioco

1. **Setup**: Crea gioco, registra 3 giocatori
2. **VRF**: Genera casualità verificabile, deriva seed per ogni giocatore
3. **Commitment**: Ogni giocatore deriva numeri, cifra, fa commitment on-chain
4. **Function**: Sistema genera funzione di validazione (dopo commitment!)
5. **Variations**: Giocatori generano fino a 9 variazioni (costo 1 XPF ciascuna)
6. **Submission**: Giocatori scelgono variazione migliore e submitted con ZK proof
7. **Winner**: Sistema determina vincitore (output più alto)
8. **Rewards**: Vincitore riceve bonus XPF basato su efficienza

## API Endpoints Principali

```
POST   /api/game/create                          # Crea gioco
POST   /api/game/{game_id}/register              # Registra giocatore
GET    /api/game/{game_id}                       # Stato gioco
POST   /api/crypto/derive-numbers                # Deriva numeri da seed
POST   /api/crypto/generate-keypair              # Genera chiavi RSA
POST   /api/game/{game_id}/commitment            # Sottometti commitment
POST   /api/game/{game_id}/variation/request     # Richiedi variazione
POST   /api/game/{game_id}/variation/compute     # Calcola variazione
POST   /api/game/{game_id}/submit-final          # Submission finale
GET    /api/player/{address}/xpf                 # Balance XPF
WS     /ws/{game_id}                             # WebSocket real-time
```

## Sistema XPF Token

- Start: 10 XPF per giocatore
- Costo variazione: 1 XPF
- Costo giocata: 1 XPF
- Max variazioni: 9
- Limite critico: serve almeno 1 XPF per giocare
- Bonus vincitore: 1-5 XPF basato su efficienza

**Dilemma strategico**: Generare più variazioni aumenta chance di vincere, ma consumare troppo XPF ti esclude.

## Tecnologie

**Backend:**
- Python 3.10+
- FastAPI (web framework)
- Pydantic (validation)
- PyCryptodome (cryptography)
- WebSockets (real-time)
- Uvicorn (ASGI server)

**Simulati ma Credibili:**
- Blockchain (transazioni, blocchi, gas)
- Chainlink VRF (casualità verificabile)
- ZK-SNARKs (proofs matematiche)
- Crittografia omomorfica (calcolo su cifrati)

## Frontend Integration

Il backend è completamente stateless e REST-first.

### Esempio chiamate per frontend:

```javascript
// 1. Crea gioco
const gameResponse = await fetch('http://localhost:8000/api/game/create', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({max_players: 3})
});
const game = await gameResponse.json();

// 2. Registra giocatore
await fetch(`http://localhost:8000/api/game/${game.game_id}/register`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({player_address: walletAddress})
});

// 3. Deriva numeri quando seed disponibile
const numbersResp = await fetch('http://localhost:8000/api/crypto/derive-numbers', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({seed_player: player.seed_player})
});
const {numbers} = await numbersResp.json();

// 4. Genera keypair
const keypairResp = await fetch('http://localhost:8000/api/crypto/generate-keypair', {
  method: 'POST'
});
const {public_key, private_key} = await keypairResp.json();

// 5. Sottometti commitment con ZK proof
// ...

// 6. Loop variazioni
for (let i = 0; i < 3; i++) {
  await fetch(`http://localhost:8000/api/game/${gameId}/variation/request`, {
    method: 'POST',
    body: JSON.stringify({player_address: address})
  });

  const varResp = await fetch(`http://localhost:8000/api/game/${gameId}/variation/compute`, {
    method: 'POST',
    body: JSON.stringify({player_address: address, current_numbers: numbers})
  });
  const variation = await varResp.json();
  console.log(`Variation ${i}: output = ${variation.output}`);
}

// 7. Submit finale
// ...
```

### WebSocket per real-time:

```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/${gameId}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Game update:', message);
  // Aggiorna UI
};
```

## Demo Hackathon

Per impressionare la giuria:

1. **Mostra Swagger UI**: http://localhost:8000/docs
   - API auto-documentate
   - Testabili direttamente

2. **Esegui flusso completo**:
   - 3 giocatori registrati
   - VRF genera seed (mostra timing)
   - Commitment on-chain (mostra transaction hashes)
   - Funzione generata DOPO commitment (fairness!)
   - Variazioni con XPF burning
   - Vincitore determinato

3. **Highlights tecnici**:
   - "Blockchain" con transaction history
   - Casualità "verificabile" VRF
   - ZK proofs per privacy
   - Crittografia RSA reale
   - Sistema economico XPF

4. **Code walkthrough**:
   - Mock blockchain elegante
   - Smart contract simulator
   - Crypto engine con vere primitive
   - Game manager orchestration

## Note Implementazione

### Cosa è REALE:
- Crittografia RSA (keypair, encrypt/decrypt)
- Hash functions (SHA-256, commitment)
- Derivazione deterministica numeri
- REST API completa
- WebSocket real-time
- Game logic e validazioni

### Cosa è SIMULATO (ma credibile):
- Blockchain (in-memory, no consensus)
- VRF (genera seed casuali ma non vera curva ellittica)
- ZK-SNARKs (hash che sembrano proofs, no Groth16 reale)
- Crittografia omomorfica (RSA invece di Paillier/BFV)

Per una hackathon questo è perfetto: il codice sembra "blockchain-ready" ma è veloce da sviluppare e demo.

## Miglioramenti Post-Hackathon

Se vuoi continuare il progetto:

1. **Vera blockchain**: Deploy su testnet Ethereum/Arbitrum
2. **Vero VRF**: Integra Chainlink VRF reale
3. **Veri ZK-SNARKs**: Circom circuits + SnarkJS
4. **Vera omomorfia**: Libreria python-paillier o SEAL
5. **Database**: PostgreSQL per persistenza
6. **Frontend**: React + ethers.js + RainbowKit
7. **Testing**: Test suite completa
8. **Security audit**: Prima di mainnet

## Troubleshooting

### "Module not found"
```bash
cd backend
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### "Port 8000 in use"
```bash
lsof -ti:8000 | xargs kill -9
```

### Dipendenze problematiche
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## Licenza

MIT - Usa liberamente per la tua hackathon!

## Crediti

Implementato per hackathon - Backend completo pronto per frontend integration.
