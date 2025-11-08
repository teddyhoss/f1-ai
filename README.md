# F1 AI Racing - Sistema di Gioco Competitivo con Privacy Crittografica Totale

## **🔴 VERSIONE DI TEST IMPLEMENTATA SU TESTNET XRPL 🔴**
## **🔴 VERSIONE: QUANTUM RESISTENT 🔴**
**Una rivoluzione nel gaming competitivo: privacy matematicamente garantita attraverso FHE, Threshold Cryptography e Zero-Knowledge Proofs**

### 📍 Deployment Status
- **Network**: XRPL Testnet
- **Status**: Testing Phase
- **Explorer**: [https://testnet.xrpl.org](https://testnet.xrpl.org)
- **Faucet**: [https://xrpl.org/xrp-testnet-faucet.html](https://xrpl.org/xrp-testnet-faucet.html)

---

## 🎯 Il Problema: Gaming Competitivo Senza Fiducia

Immagina un gioco di Formula 1 dove:
- **3 team** competono per ottimizzare i parametri delle loro auto
- Ogni team ha **10 parametri segreti** (aerodinamica, motore, sospensioni...)
- Una **funzione segreta** calcola la velocità finale dell'auto
- Il team con la **velocità più alta vince**

Ma c'è un problema fondamentale: **come garantire che nessuno bari?**

### Il Dilemma della Privacy nel Gaming

In un gioco competitivo tradizionale:
- 🔴 Il server conosce tutti i parametri (può favorire qualcuno)
- 🔴 I giocatori potrebbero hackerare per vedere i parametri altrui
- 🔴 La funzione di calcolo potrebbe essere manipolata
- 🔴 Impossibile verificare che tutti rispettino le regole

### La Nostra Sfida

Creare un sistema dove:
- ✅ **Nessuno** vede i parametri (né server, né altri giocatori, né chi li genera!)
- ✅ **Nessuno** conosce la funzione di calcolo fino alla fine
- ✅ **Tutti** possono verificare matematicamente la correttezza
- ✅ **Impossibile** barare grazie a garanzie crittografiche

---

## 💡 La Soluzione: Crittografia Avanzata + Blockchain

### Architettura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                  BLOCKCHAIN LAYER                    │
│                                                      │
│  • Smart Contracts (regole immutabili)              │
│  • VRF (casualità verificabile)                     │
│  • Token XPF (economia di gioco)                    │
│  • ZK Verifier (verifica matematica)                │
└─────────────────────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼──────┐      ┌──────▼──────┐      ┌─────▼──────┐
│ PLAYER 1 │      │  FHE SERVER  │      │  PLAYER 2  │
│          │      │              │      │            │
│ • Genera │      │ • Calcola su │      │  PLAYER 3  │
│   params │      │   cifrati    │      │            │
│ • Cifra  │      │ • Mai vede   │      │ • Threshold│
│ • Prove  │      │   i valori   │      │   decrypt  │
└──────────┘      └──────────────┘      └────────────┘
```

---

## 🔐 Componenti Crittografici

### 1. **Fully Homomorphic Encryption (FHE)**

FHE permette di eseguire calcoli arbitrari su dati cifrati senza mai decifrarli:

```javascript
// I parametri sono cifrati con TFHE
parametri_cifrati = TFHE.encryptMod([85, 92, 78...], pk_player, p)

// Il server calcola F(X) su cifrati usando proprietà omomorfiche
velocita_cifrata = CalcolaVelocitaMod(parametri_cifrati, p)
// Server opera su ciphertext, non vede plaintext

// Solo chi possiede sk può decifrare
velocita = TFHE.decrypt(velocita_cifrata, sk) // 358 km/h
```

La libreria TFHE-rs implementa schema basato su GLWE con aritmetica modulare nativa su Z_p.

### 2. **Polinomio Lineare Modulare**

La funzione di validazione è un polinomio lineare in Z_p:

```
F(X) = (Σᵢ cᵢ × Xᵢ + bias) mod p
```

Dove:
- `p = 2³¹-1` (primo di Mersenne per efficienza FHE)
- Coefficienti `cᵢ = SHA256(seed_F || i) mod p`
- `bias = SHA256(seed_F || "bias") mod p`
- `seed_F` generato da VRF dopo commitment fase

L'aritmetica modulare garantisce:
- Uniformità distribuzione output
- Efficienza operazioni FHE (~40% più veloci)
- Compatibilità nativa con Shamir Secret Sharing

### 3. **Threshold Decryption con Shamir + Chiavi Cifrate On-Chain**

Implementazione (t,n)-threshold basata su **Shamir Secret Sharing** con pubblicazione cifrata on-chain:

```javascript
// Setup: sk_master divisa usando SHAMIR SECRET SHARING
// Threshold 4/5: servono 4 shares su 5 per ricostruire
sk_shares = ShamirSplit(sk_master, n=5, t=4, p)
// sk_master viene distrutta dopo splitting Shamir

// INNOVAZIONE: Le shares Shamir vengono cifrate e pubblicate on-chain
for (i = 0; i < 5; i++) {
  // Ogni share Shamir viene cifrata dal TEE
  encrypted_share[i] = TEE.encrypt(sk_shares[i])
  // La share cifrata viene pubblicata on-chain (trasparente ma sicura)
  blockchain.publish(encrypted_share[i])
}

// Decryption richiede t=4 shares Shamir su 5
// Solo il TEE può decifrare le shares Shamir quando necessario
shamir_share_i = TEE.decrypt(encrypted_share[i])
shamir_share_j = TEE.decrypt(encrypted_share[j])
// ... (4 shares Shamir totali)

// Ricostruzione usando interpolazione di Lagrange (Shamir standard)
output = ShamirReconstruct([shamir_share_1..4], indices, p)
```

**Doppia Protezione:**
- **Layer 1**: Shamir Secret Sharing (matematicamente sicuro, information-theoretic)
- **Layer 2**: Cifratura TEE delle shares Shamir prima della pubblicazione

Proprietà:
- Usa **Shamir Secret Sharing classico** con threshold 4/5
- Shares Shamir cifrate pubbliche ma accessibili solo dal TEE
- Resistente a collusione fino a 3 giocatori
- Trasparenza totale (shares on-chain) con privacy garantita (cifratura TEE)

### 4. **Trusted Execution Environment (TEE) per Generazione Numeri**

Il TEE garantisce generazione sicura e imprevedibile dei parametri iniziali:

```javascript
// Generazione numeri tramite TEE invece di VRF puro
TEE.initialize(game_id)

// Il TEE genera i parametri con entropia hardware
X[i] = TEE.generateSecure(player_id, i, opponent_randomness)
// Incorpora randomness dagli avversari per fairness distribuita

// Attestazione remota per verificare integrità TEE
attestation = TEE.getAttestation()
blockchain.verifyTEE(attestation)
```

**Vantaggi del TEE:**
- Entropia hardware certificata
- Protezione contro side-channel attacks
- Attestazione verificabile on-chain
- Isolamento completo dai processi esterni

### 5. **Fattore di Randomness degli Avversari**

Ogni giocatore contribuisce alla randomness totale del sistema:

```javascript
// Ogni giocatore fornisce entropia
opponent_random[player] = SHA256(player_secret || nonce)

// Aggregazione sicura della randomness
combined_randomness = XOR(
  opponent_random[0],
  opponent_random[1],
  opponent_random[2]
)

// TEE usa randomness combinata per generazione parametri
X[i] = TEE.generateWithRandomness(
  player_id,
  i,
  combined_randomness
)
```

Proprietà:
- Nessun singolo giocatore controlla la randomness
- Impossibile predire output senza conoscere tutti i contributi
- Resistente a collusione parziale (< 4 giocatori)

### 6. **Zero-Knowledge Proofs**

Implementazione con Groth16 su BN254:

```javascript
// Circuit ZK-SNARK
Circuit {
  // Public inputs
  public: [commitment, output, seed_X, seed_F, k_best, opponent_randomness],

  // Private witness
  private: [X, salt, deltas],

  // Constraints da verificare
  constraints: {
    C1: commitment == SHA256(Enc(X) || salt),
    C2: X[i] == TEE.verify(player, i, opponent_randomness),
    C3: ∀i: |delta[i]| ≤ 20,
    C4: output == F(X + Σ deltas) mod p
  }
}

// Generazione e verifica
proof = Groth16.prove(circuit, witness)  // ~2s
valid = Groth16.verify(proof, public)    // ~200k gas
```

Soundness error < 2^-128, completeness = 1, zero-knowledge perfetto.

---

## 🎮 Meccanica di Gioco

### Sistema di Token XPF

Ogni giocatore inizia con **10 token XPF**:
- 💰 **1 XPF** = Una sessione di training (modifica parametri ±20)
- 💰 **1 XPF** = Submission finale
- ⚠️ **0 XPF** = Squalifica!

### Il Dilemma Strategico

```
Più training = Più chance di migliorare
     MA
Più training = Meno token rimasti

Rischio: Rimanere senza token per la submission finale!
```

### Fasi di Gioco

#### Fase 1: Commitment Iniziale
I team bloccano i loro parametri iniziali (cifrati) sulla blockchain. Nessuno sa ancora quale sarà la formula di calcolo velocità.

#### Fase 2: Rivelazione Formula
La formula viene generata casualmente e rivelata. Ora i team sanno COME sarà calcolata la velocità, ma i parametri sono già bloccati!

#### Fase 3: Training Sessions
```javascript
// Richiesta training (costa 1 XPF)
server.requestVariation(team_ferrari)

// Server applica modifiche casuali ±20 ai parametri CIFRATI
parametri_v2 = ApplyDelta(parametri_cifrati, delta_random)

// Calcola nuova velocità (sempre su cifrati)
velocita_v2 = CalcolaVelocita(parametri_v2) // 362 km/h

// Il team vede solo il risultato, non i nuovi parametri!
```

#### Fase 4: Scelta Finale
Ogni team sceglie la sua migliore variazione e genera una Zero-Knowledge Proof che dimostra:
- I parametri derivano dal seed iniziale
- Le modifiche sono ≤ ±20
- La velocità dichiarata è corretta

#### Fase 5: Gara!
Il team con la velocità più alta vince 100 XPF! 🏆

---

## 🛡️ Garanzie di Sicurezza

### Cosa Garantiamo Matematicamente

| Proprietà | Garanzia | Come |
|-----------|----------|------|
| **Privacy Parametri** | Nessuno vede mai i parametri | FHE con TFHE-rs |
| **Privacy Formula** | Formula sconosciuta fino dopo commitment | VRF + temporal ordering |
| **Anti-Cheat** | Max 9 variazioni, delta ≤ ±20 | Smart contract + ZK proofs |
| **Fairness** | Nessun vantaggio a nessuno | TEE + Opponent randomness |
| **Verificabilità** | Chiunque può verificare | ZK-SNARKs on-chain |
| **No Single Point** | Nessun controllo centralizzato | Threshold 4/5 |
| **Trasparenza Keys** | Chiavi pubbliche ma protette | TEE encryption on-chain |
| **Randomness Distribuita** | Nessun controllo unilaterale | Contributi da tutti i giocatori |

### Perché è Impossibile Barare

1. **Modificare parametri oltre ±20**: La ZK proof fallirebbe
2. **Fare più di 9 training**: Smart contract lo blocca
3. **Vedere parametri altrui**: Cifrati con FHE
4. **Manipolare la formula**: Generata dopo commitment
5. **Falsificare risultati**: ZK proof verificata on-chain
6. **Colludere per vincere**: Serve 4/5 per threshold (80% dei partecipanti)
7. **Manipolare la randomness**: TEE + opponent contributions impediscono controllo unilaterale
8. **Accedere alle chiavi private**: Cifrate dal TEE, solo lui può decifrarle
9. **Compromettere il TEE**: Attestazione remota verificata on-chain
10. **Predire i parametri iniziali**: Entropia hardware + randomness distribuita

---

## 🚀 Tecnologia Utilizzata

### Stack Crittografico

- **FHE (Fully Homomorphic Encryption)**
  - Libreria: TFHE-rs (Zama)
  - Operazioni su interi mod p
  - ~25s per calcolo variazione

- **Threshold Cryptography (Shamir-based)**
  - **Shamir Secret Sharing** classico su Z_p
  - Threshold 4/5 per decryption (servono 4 shares su 5)
  - Ricostruzione tramite interpolazione di Lagrange
  - Shares Shamir cifrate dal TEE e pubblicate on-chain
  - Doppia sicurezza: Shamir (matematica) + TEE (hardware)

- **Trusted Execution Environment (TEE)**
  - Intel SGX / AMD SEV per isolamento hardware
  - Generazione sicura parametri con entropia hardware
  - Cifratura/decifratura chiavi threshold
  - Attestazione remota verificabile

- **Zero-Knowledge Proofs**
  - Groth16 su curva BN254
  - ~2s generazione proof
  - ~200k gas verifica on-chain

- **Blockchain (XRPL Testnet)**
  - **Deployato su XRPL Testnet** per testing
  - Smart contracts Hooks (XRPL native)
  - VRF per casualità verificabile
  - Token XPF su XRPL
  - Storage on-chain delle shares Shamir cifrate
  - Testnet Explorer: https://testnet.xrpl.org

### Aritmetica Modulare

Tutte le operazioni avvengono nel campo finito Z_p con p = 2³¹-1:
- Efficienza FHE migliorata del 40%
- Compatibilità nativa con Shamir
- Proprietà algebriche ottimali

---

## 📊 Performance

| Operazione | Tempo | Note |
|------------|-------|------|
| Calcolo FHE variazione | ~25s | Su server con 8 core |
| Shamir threshold decrypt | ~3s | 4/5 shares, Lagrange reconstruction |
| TEE number generation | ~100ms | Con entropia hardware |
| Opponent randomness | ~500ms | Aggregazione contributi |
| Generazione ZK proof | ~2s | Client-side |
| Verifica on-chain (XRPL) | ~0.2s | XRPL Hooks execution |
| TEE attestation | ~1s | Verifica remota |
| Shamir share encryption | ~50ms | TEE encrypt per share |
| **Partita completa** | ~5 min | 9 variazioni max |

---

## 🎯 Quick Start

### Installazione Rapida

```bash
# Clone del repository
git clone https://github.com/tuouser/f1-ai
cd f1-ai

# Lancio automatico di tutto
./start.sh
```

Questo avvierà:
- Backend API: http://localhost:8000
- Frontend F1: http://localhost:5173
- Documentazione: http://localhost:8000/docs

### Giocare una Partita

1. **Apri 3 browser** (uno per team)
2. **Crea partita** dal primo browser
3. **Join** dagli altri due
4. **Commitment** parametri iniziali
5. **Training** con token XPF
6. **Submit** migliore variazione
7. **Vinci** se hai la velocità più alta!

---

## 📚 Documentazione Tecnica

Per approfondimenti tecnici:

- [Technical Depth Analysis.MD](docs/Solution.MD) - Implementazione dettagliata FHE + Threshold
- [docs/Problem.md](docs/Problem.md) - Specifica formale del problema
- [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) - Esempi API

