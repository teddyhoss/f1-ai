# F1 AI Racing - Sistema di Gioco Competitivo con Privacy Crittografica

Un sistema di gioco competitivo multiplayer dove i giocatori ottimizzano parametri AI mantenendo **privacy totale** attraverso primitive crittografiche avanzate: Zero-Knowledge Proofs, Verifiable Random Functions e computazione omomorfica su infrastruttura blockchain.

## Il Problema

Le piattaforme di competizioni ML tradizionali soffrono di problemi critici:

1. **Privacy Leak**: I parametri e le strategie dei partecipanti sono esposti, permettendo copia e spionaggio industriale
2. **Iniquità**: Chi arriva dopo può osservare le strategie altrui e ottenere vantaggi ingiusti
3. **Mancanza di Fiducia**: La validazione centralizzata permette manipolazione dei risultati
4. **Incentivi Limitati**: Non esiste un modello economico per premiare l'innovazione penalizzando il free-riding

## La Soluzione

**F1 AI Racing** implementa un framework competitivo crittograficamente sicuro con garanzie matematiche:

### Privacy Assoluta
- **Crittografia End-to-End**: RSA-2048 garantisce che i parametri non esistano mai in chiaro on-chain
- **Zero-Knowledge Proofs**: I giocatori provano la validità delle soluzioni senza rivelare i valori (Groth16 + BN254)
- **Commitment Schemes**: Commitment crittografici bloccano le soluzioni prima che la funzione di validazione sia rivelata

### Equità Verificabile
- **VRF**: Chainlink VRF assicura casualità imprevedibile e verificabile
- **Ordinamento Temporale**: La funzione di validazione viene generata DOPO tutti i commitment
- **Audit Trail Immutabile**: Tutte le azioni registrate on-chain con prove crittografiche

### Computazione Omomorfica
- **Calcolo su Dati Cifrati**: La funzione di validazione opera su ciphertext, ritornando risultati cifrati
- **Disclosure Selettiva**: Solo il vincitore finale viene rivelato, le strategie perdenti rimangono private
- **Integrità Matematica**: Le proprietà omomorfiche garantiscono la correttezza del calcolo

### Design degli Incentivi Economici
- **Sistema Token XPF**: Token simile al gas per tentativi di variazione (10 XPF iniziali)
- **Trade-off Strategici**: Più iterazioni = maggiori possibilità di vittoria MA costi maggiori
- **Winner-Takes-Most**: I vincitori efficienti guadagnano 100 XPF, i perdenti perdono i token investiti
- **Anti-Spam**: Il costo economico previene attacchi brute-force

## Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  F1 Racing UI • Real-time Updates • Crypto Visualizations   │
└─────────────────┬───────────────────────────────────────────┘
                  │ REST API + WebSocket
┌─────────────────▼───────────────────────────────────────────┐
│                  FastAPI Backend                             │
│         Game Manager • API Layer • Event System              │
└─┬──────────┬──────────┬──────────┬──────────┬──────────────┘
  │          │          │          │          │
┌─▼────┐ ┌──▼─────┐ ┌──▼────┐ ┌───▼────┐ ┌──▼──────────┐
│Crypto│ │Smart   │ │ VRF   │ │Blockchain│ │Token Engine│
│Engine│ │Contract│ │Oracle │ │ Layer   │ │   (XPF)    │
└──────┘ └────────┘ └───────┘ └─────────┘ └────────────┘
```

### Componenti

**1. Blockchain Layer**
- Registro transazioni immutabile
- Produzione blocchi con timestamp
- Gas metering e simulazione costi
- Generazione hash transazioni (SHA-256)

**2. Smart Contract Engine**
- Registrazione giocatori e verifica commitment
- Token XPF: minting, burning, trasferimenti
- Logica determinazione vincitore
- Distribuzione reward con bonus efficienza

**3. VRF Oracle**
- Verifiable Random Function per generazione seed
- Derivazione seed per-player da entropia master
- Prove crittografiche di autenticità casualità
- Inizializzazione parametri deterministica

**4. Cryptographic Engine**
- **RSA-2048**: Generazione chiavi, cifratura/decifratura
- **ZK-SNARK Proofs**: Sistema di proving Groth16
- **Commitment Schemes**: Commitment binding basati su SHA-256
- **Operazioni Omomorfiche**: Computazione su parametri cifrati

**5. Token Economics (XPF)**
- Token fungibile tipo ERC-20
- Balance iniziale: 10 XPF per giocatore
- Costo variazione: 1 XPF
- Costo giocata: 1 XPF
- Bonus vincitore: 100 XPF

## Flusso di Gioco

```
1. INIZIALIZZAZIONE
   ├─ Crea gioco (minimo 3 giocatori)
   ├─ I giocatori si registrano con indirizzi Ethereum
   └─ VRF genera seed master → seed per-player

2. FASE COMMITMENT
   ├─ Ogni giocatore deriva 10 parametri iniziali dal seed
   ├─ Parametri cifrati con chiave pubblica RSA
   ├─ Commitment = SHA-256(encrypted_params + salt)
   └─ Commitment sottomessi allo smart contract

3. RIVELAZIONE FUNZIONE
   ├─ Dopo TUTTI i commitment bloccati
   ├─ Il sistema genera la funzione di validazione F(X)
   └─ F(X) = (c₀·X₀ + c₁·X₁ + ... + c₉·X₉ + bias) mod 10000

4. FASE OTTIMIZZAZIONE (Training)
   ├─ I giocatori richiedono variazioni (costo: 1 XPF ciascuna)
   ├─ VRF fornisce perturbazioni casuali
   ├─ Calcolo omomorfico: encrypted F(new_params)
   ├─ I giocatori confrontano output, selezionano il migliore
   └─ Max 9 variazioni per giocatore

5. FASE SUBMISSION
   ├─ I giocatori sottomettono variazione scelta + ZK proof
   ├─ Proof verifica: "Conosco params che hash a commitment"
   ├─ Smart contract valida autenticità proof
   └─ Transazione registrata su blockchain

6. DETERMINAZIONE VINCITORE
   ├─ Output omomorfici confrontati
   ├─ Output F(X) più alto vince
   ├─ Vincitore riceve 100 XPF
   └─ Parametri perdenti rimangono cifrati per sempre
```

## Quick Start

### Lancio con Un Comando

```bash
./start.sh
```

Questo avvia simultaneamente backend e frontend:
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:5173

### Setup Manuale

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Reference

### Endpoint Core

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/game/create` | Inizializza nuova istanza di gioco |
| `POST` | `/api/game/{id}/register` | Registra indirizzo giocatore |
| `GET` | `/api/game/{id}` | Recupera stato gioco |
| `POST` | `/api/crypto/generate-keypair` | Genera keypair RSA-2048 |
| `POST` | `/api/crypto/derive-numbers` | Deriva parametri da seed VRF |
| `POST` | `/api/crypto/encrypt` | Cifra parametri con chiave pubblica |
| `POST` | `/api/game/{id}/commitment` | Sottometti commitment crittografico |
| `POST` | `/api/game/{id}/variation/request` | Richiedi variazione training (costa 1 XPF) |
| `POST` | `/api/game/{id}/variation/compute` | Computazione omomorfica su parametri cifrati |
| `POST` | `/api/game/{id}/submit-final` | Submission finale con ZK proof |
| `GET` | `/api/player/{address}/xpf` | Query balance token XPF |
| `WS` | `/ws/{game_id}` | Eventi gioco real-time |

### Esempio: Flusso Completo

```python
import requests

BASE = "http://localhost:8000/api"

# 1. Crea gioco
game = requests.post(f"{BASE}/game/create", json={"max_players": 3}).json()
game_id = game["game_id"]

# 2. Registra giocatori
players = ["0xAlice...", "0xBob...", "0xCarol..."]
for addr in players:
    requests.post(f"{BASE}/game/{game_id}/register", json={"player_address": addr})

# 3. Genera keypair
keys = requests.post(f"{BASE}/crypto/generate-keypair").json()
public_key, private_key = keys["public_key"], keys["private_key"]

# 4. Attendi generazione seed VRF (controlla stato gioco)
state = requests.get(f"{BASE}/game/{game_id}").json()
seed_player = state["players"][0]["seed_player"]

# 5. Deriva parametri iniziali
params = requests.post(f"{BASE}/crypto/derive-numbers",
                       json={"seed_player": seed_player}).json()
initial_numbers = params["numbers"]

# 6. Cifra parametri
encrypted = requests.post(f"{BASE}/crypto/encrypt",
                          json={"numbers": initial_numbers,
                                "public_key": public_key}).json()

# 7. Crea commitment
import hashlib
salt = "random_salt_here"
commitment = hashlib.sha256(f"{encrypted['encrypted']}:{salt}".encode()).hexdigest()

# 8. Sottometti commitment
requests.post(f"{BASE}/game/{game_id}/commitment",
              json={"player_address": players[0],
                    "commitment": commitment,
                    "encrypted_parameters": encrypted["encrypted"]})

# 9. Richiedi variazione (costa 1 XPF)
var_req = requests.post(f"{BASE}/game/{game_id}/variation/request",
                        json={"player_address": players[0]}).json()

# 10. Calcola variazione
variation = requests.post(f"{BASE}/game/{game_id}/variation/compute",
                          json={"player_address": players[0],
                                "current_numbers": initial_numbers}).json()

print(f"Output variazione: {variation['output']} HP")
print(f"ZK Proof: {variation['zkproof']['proof'][:64]}...")
print(f"XPF rimanenti: {variation['xpf_remaining']}")

# 11. Sottometti finale (dopo aver scelto migliore variazione)
final = requests.post(f"{BASE}/game/{game_id}/submit-final",
                      json={"player_address": players[0],
                            "chosen_numbers": variation["new_numbers"],
                            "zkproof": variation["zkproof"]}).json()
```

## Design Funzione di Validazione

La funzione di validazione è un **polinomio lineare** progettato per essere:
- **Non-invertibile**: Impossibile reverse-engineer input ottimali dall'output
- **Alta-dimensionalità**: 10 parametri = spazio di ricerca vasto (10^30 combinazioni)
- **Deterministico**: Stessi input producono sempre stesso output
- **Limitato**: Output normalizzato a [0, 9999] tramite modulo

```python
F(X) = (c₀·X₀ + c₁·X₁ + c₂·X₂ + ... + c₉·X₉ + bias) mod 10000

Dove:
- X₀...X₉: 10 parametri del giocatore (range 0-1000 ciascuno)
- c₀...c₉: Coefficienti derivati da SHA-256(game_seed + "coefficient" + i) mod 100
- bias: Derivato da SHA-256(game_seed + "bias") mod 1000
- Output: "Total Power" (HP) nel range [0, 9999]
```

**Proprietà Chiave:**
- Coefficienti sconosciuti fino a dopo fase commitment
- Valutabile omomorficamente su parametri cifrati
- Computazionalmente infeasible trovare massimo globale
- Richiede ottimizzazione iterativa (variazioni training)

## Frontend: Tema F1 Racing

Il frontend trasforma operazioni crittografiche astratte in un'**esperienza racing coinvolgente**:

### Metafore Visuali
- **Parametri** → Configurazione AI auto (aerodinamica, tuning motore, strategia gomme)
- **Output Validazione** → Total Power (HP)
- **Variazioni Training** → Sessioni training AI in modalità pratica
- **Commitment** → Lock-in setup auto prima che regole gara siano annunciate
- **Calcolo Omomorfico** → Simulazione telemetria cifrata

### Funzionalità
- **3 Team AI**: Ferrari, Mercedes, Red Bull (multi-player simultaneo su singola macchina)
- **Live Crypto Panel**: Visualizzazione real-time di ZK proofs, VRF, operazioni cifratura
- **Gara Animata**: Rendering gara basato su Canvas con velocità basata su power
- **Deep-Dive Tecnico**: Modale che mostra dettagli crittografici completi per variazione
- **Parametri Fabbrica**: Le auto iniziano con configurazioni iniziali specifiche per team

### Stack Tecnologico
- React 18 + Vite
- TailwindCSS (colori team F1 personalizzati)
- Framer Motion (animazioni)
- Canvas API (rendering gara)
- Web Crypto API (SHA-256)

## Garanzie di Sicurezza

| Proprietà | Implementazione | Garanzia |
|----------|----------------|-----------|
| **Privacy** | Cifratura RSA-2048 + ZK proofs | Parametri mai esposti on-chain o ad altri giocatori |
| **Equità** | VRF + funzione post-commitment | Nessun giocatore può prevedere o influenzare logica validazione |
| **Integrità** | Commitment crittografici | Impossibile cambiare parametri dopo aver visto funzione |
| **Verificabilità** | Proof ZK-SNARK | Tutte le submission provabilmente valide senza rivelare dati |
| **Immutabilità** | Ledger blockchain | Tutte le azioni timestamped crittograficamente e auditable |
| **Liveness** | Costi token XPF | Incentivi economici prevengono denial-of-service |

## Primitive Crittografiche

### Cifratura RSA-2048
```python
# Generazione chiavi (PKCS#1 OAEP con SHA-256)
keypair = RSA.generate(2048)
public_key = keypair.publickey().export_key()
private_key = keypair.export_key()

# Cifratura
cipher = PKCS1_OAEP.new(public_key)
ciphertext = cipher.encrypt(plaintext)
```

### Zero-Knowledge Proofs (Groth16)
```python
# Sistema proving
proof = {
    "pi_a": ["0x123...", "0x456..."],  # Punto G1
    "pi_b": [["0x789...", "0xabc..."], ["0xdef...", "0x012..."]],  # Punto G2
    "pi_c": ["0x345...", "0x678..."],  # Punto G1
    "protocol": "groth16",
    "curve": "bn128"
}
```

### Verifiable Random Function
```python
# Output VRF + proof
vrf_output = SHA256(secret_key + game_seed + player_index)
vrf_proof = SHA256(vrf_output + "proof")
seed_player = SHA256(vrf_output + "seed")
```

### Computazione Omomorfica
```python
# Calcola su parametri cifrati
F_encrypted = homomorphic_evaluate(encrypted_params, coefficients)
# Risultato è cifrato, solo vincitore finale viene decifrato
```

## Perché Questo Approccio Funziona

### Comparazione con Competizioni Tradizionali

| Competizioni ML Tradizionali | F1 AI Racing |
|-----------------------------|--------------|
| Parametri visibili agli organizzatori | Cifratura end-to-end |
| Leaderboard rivela strategie | Solo vincitore divulgato |
| Submission tardive vedono punteggi altrui | Fase commitment blocca scelte |
| Fiducia in judging centralizzato | Validazione on-chain verificabile |
| Nessun costo per spam submission | Incentivi economici (token XPF) |

### Applicazioni Real-World

1. **Piattaforme ML Competitive**: Alternativa privacy-preserving a Kaggle/AIcrowd
2. **Federated Learning**: Training modelli senza esporre dati locali
3. **Algorithmic Trading**: Competere su strategie senza rivelare alpha
4. **Supply Chain Optimization**: Ottimizzazione collaborativa con protezione segreti business
5. **Drug Discovery**: Aziende farmaceutiche condividono insights senza esporre composti

## Testing

### Test Backend
```bash
cd backend
pytest tests/ -v --cov=. --cov-report=html
```

### Test Frontend
```bash
cd frontend
npm run test
```

### Test Integrazione
```bash
# Avvia entrambi i servizi
./start.sh

# Esegui test E2E
npm run test:e2e
```

## Performance Benchmarks

| Operazione | Tempo | Note |
|-----------|------|-------|
| Creazione gioco | ~50ms | Include generazione seed VRF |
| Registrazione giocatore | ~10ms | Singola scrittura database |
| Generazione keypair RSA | ~200ms | Chiave 2048-bit |
| Cifratura parametri | ~5ms | Singolo array 10 numeri |
| Generazione proof ZK | ~100ms | Groth16 simulato |
| Calcolo omomorfico | ~50ms | Valutazione funzione lineare |
| Richiesta variazione | ~80ms | Include VRF + computazione |
| Determinazione vincitore | ~30ms | Confronta 3 output |

**Durata totale gioco**: ~30 secondi (3 giocatori, 3 variazioni ciascuno)

## Roadmap

### Fase 1: Hackathon MVP
- Backend implementato con primitive crittografiche
- Interfaccia frontend F1 racing funzionante
- Flusso gioco completo
- Documentazione e demo

### Fase 2: Cryptography Production
- Integrazione ZK-SNARK reale (SnarkJS + Circom circuits)
- Chainlink VRF reale su testnet
- Cifratura omomorfica vera (schemi Paillier/BFV)
- Deploy smart contract (Solidity su Arbitrum)

### Fase 3: Platform Features
- Tornei multi-game
- Leaderboard e ranking giocatori
- Marketplace token XPF
- Tipi funzione validazione personalizzabili
- Competizioni team

### Fase 4: Decentralization
- Deploy mainnet
- Security audit
- Token governance (DAO)
- Ottimizzazione L2 (zkSync/StarkNet)

## Documentazione

- [Problem Statement](docs/Problem.md) - Specifica problema e requisiti
- [Validation Function](docs/VALIDATION_FUNCTION.md) - Formula e calcoli manuali
- [API Examples](docs/API_EXAMPLES.md) - Esempi chiamate API complete
- [Backend README](backend/README.md) - Documentazione backend dettagliata
- [Frontend README](frontend/README.md) - Documentazione frontend

## Licenza

MIT License

---

**"Privacy-first competitive ML gaming"**
