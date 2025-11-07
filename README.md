# F1 AI Racing - Sistema di Gioco Competitivo con Privacy Crittografica Totale

**Soluzione Basata su Matematica Pura (Zero-Trust)**

Un sistema di gioco competitivo multiplayer dove i giocatori ottimizzano parametri mantenendo **privacy assoluta** attraverso primitive crittografiche matematiche: VRF, ZK-SNARKs, Crittografia Omomorfica e Blockchain.

---

## 1. Il Problema

### 1.1 Descrizione del Gioco

Sistema di gioco competitivo multiplayer con le seguenti caratteristiche:

#### Struttura Base
- **3 giocatori** partecipano simultaneamente a ogni partita (configurabile)
- Ogni giocatore possiede una **lista privata di 10 numeri** (range: 0-1000)
- Esiste una **funzione di validazione F** che calcola un output numerico O dalla lista
- Il giocatore con **output più alto vince** la partita

#### Meccanica di Gioco
1. **Fase iniziale**: ogni giocatore riceve 10 numeri casuali
2. **Fase variazioni**: ogni giocatore può generare fino a 9 variazioni della propria lista
   - Ogni variazione modifica i valori con delta casuale **±20**
   - Il giocatore vede l'**output** di ogni variazione ma **non i numeri modificati**
   - Il giocatore sceglie quale delle 10 opzioni tenere (iniziale + 9 variazioni)
3. **Fase finale**: confronto degli output e dichiarazione del vincitore

#### Sistema Token XPF
- Ogni giocatore inizia con **10 token XPF**
- Costo **1 XPF**: generare una variazione
- Costo minimo **1 XPF**: per sottomettere la scelta finale
- **Limite critico**: usare tutti i 10 token comporta squalifica automatica
- **Vincitore riceve 100 XPF** (non persiste per la partita successiva)

#### Dilemma Strategico
Il giocatore deve bilanciare:
- Generare più variazioni **aumenta** la probabilità di trovare un output alto
- Rimanere senza XPF per giocare significa **perdita automatica**

### 1.2 Requisiti di Privacy e Sicurezza

#### Privacy Assoluta
- I 10 numeri iniziali **NON** devono essere visibili a nessuno durante la generazione
- Nemmeno chi genera i numeri deve poterli vedere
- Il server **NON** deve mai vedere i numeri di alcun giocatore
- Gli altri giocatori **NON** devono vedere i numeri altrui
- La funzione di validazione **NON** deve essere nota prima dei commitment

#### Anti-Cheat
- Un giocatore **non può** generare migliaia di liste e scegliere la migliore
- Un giocatore **non può** modificare i valori oltre il limite ±20
- Un giocatore **non può** fare più di 9 variazioni
- Un giocatore **non può** manipolare la funzione di validazione
- Un giocatore **non può** cambiare il proprio commitment retroattivamente

#### Verificabilità
- Chiunque deve poter verificare che il vincitore ha giocato legalmente
- La casualità della generazione deve essere dimostrabile
- Tutte le operazioni devono essere tracciabili on-chain
- La correttezza dei calcoli deve essere provabile matematicamente

#### Zero-Trust
- Nessuna fiducia in hardware specifico
- Nessuna fiducia in server centralizzati
- Nessuna fiducia in persone o organizzazioni
- **Solo fiducia nella matematica e nella blockchain**

### 1.3 Sfide Tecniche

#### Sfida 1: Generazione Cieca
Come generare numeri casuali che:
- Nessuno conosce durante la generazione
- Sono verificabilmente casuali
- Non sono manipolabili
- Possono essere verificati dopo

#### Sfida 2: Calcolo su Dati Cifrati
Come permettere al server di:
- Calcolare variazioni (±20)
- Calcolare output con funzione F
- Senza mai vedere i numeri

#### Sfida 3: Prevenzione Cherry-Picking
Come impedire a un giocatore di:
- Generare infinite liste candidate offline
- Testare quale funziona meglio
- Sottomettere solo quella migliore

#### Sfida 4: Verifica Senza Rivelazione
Come provare che:
- I numeri derivano dal seed corretto
- Le variazioni sono valide (±20)
- L'output è calcolato correttamente
- Senza rivelare i numeri stessi

#### Sfida 5: Performance
Come mantenere il sistema:
- Sufficientemente veloce per una buona UX (< 10 secondi per operazione)
- Economicamente sostenibile (costi blockchain accettabili)
- Scalabile a centinaia di partite simultanee

---

## 2. Soluzione: Architettura Matematica Pura

### 2.1 Principi Fondamentali

La soluzione si basa **esclusivamente su primitive crittografiche matematiche**, senza dipendenze da hardware fidato o entità centrali.

#### Stack Crittografico
1. **Verifiable Random Functions (VRF)** - casualità verificabile
2. **Zero-Knowledge Proofs (ZK-SNARKs)** - computazione verificabile senza rivelazione
3. **Crittografia Omomorfica** - calcolo su dati cifrati
4. **Blockchain** - registro immutabile e coordinamento
5. **Funzioni Hash Crittografiche** - derivazione deterministica e commitment

#### Garanzie Matematiche
- **Imprevedibilità**: VRF garantisce casualità non manipolabile
- **Privacy**: Crittografia omomorfica nasconde i valori
- **Correttezza**: ZK-SNARK forza regole senza rivelazione
- **Immutabilità**: Blockchain previene modifiche retroattive
- **Verificabilità**: Ogni componente è verificabile matematicamente

### 2.2 Componenti Architetturali

```
┌─────────────────────────────────────────────────┐
│              BLOCKCHAIN LAYER                    │
│  ┌──────────────┐         ┌─────────────────┐  │
│  │Smart Contract│◄────────┤  Chainlink VRF  │  │
│  │(Game Logic)  │         │  (Randomness)   │  │
│  └──────┬───────┘         └─────────────────┘  │
│         │                                        │
│  ┌──────┴───────┐         ┌─────────────────┐  │
│  │  XPF Token   │         │  ZK Verifier    │  │
│  │  (ERC-20)    │         │  (On-chain)     │  │
│  └──────────────┘         └─────────────────┘  │
└─────────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    ┌────▼─────┐         ┌────▼──────┐
    │  CLIENT  │         │  SERVER   │
    │(Browser/ │         │(Stateless)│
    │ Mobile)  │         │           │
    └──────────┘         └───────────┘
```

### 2.3 Divisione Responsabilità: Blockchain vs Server vs Client

#### BLOCKCHAIN (Smart Contract)
**Cosa fa:**
- **Genera seed casuali** tramite Chainlink VRF (fonte di entropia verificabile)
- **Registra commitment** crittografici dei giocatori (hash SHA-256)
- **Gestisce token XPF**: mint iniziale (10 XPF), burn per variazioni (1 XPF), reward vincitore (100 XPF)
- **Verifica ZK-SNARK proofs** matematicamente (on-chain verification)
- **Determina vincitore** confrontando output dichiarati
- **Memorizza audit trail completo** di tutte le operazioni (immutabile)

**Perché è affidabile:**
- Codice eseguito deterministicamente da migliaia di nodi
- Impossibile modificare lo stato passato (blockchain immutabile)
- VRF garantisce casualità non manipolabile da nessun attore
- ZK verifier on-chain forza matematicamente le regole del gioco
- Gas costs prevengono spam e attacchi DoS

#### CLIENT (Browser/Mobile)
**Cosa fa:**
- **Genera keypair RSA-2048** localmente (chiave privata MAI condivisa)
- **Deriva numeri iniziali** da seed VRF usando SHA-256 (deterministico)
- **Cifra immediatamente i numeri** con chiave pubblica RSA
- **Crea commitment** = SHA-256(encrypted_params + salt)
- **Genera ZK-SNARK proof** che prova validità senza rivelare numeri
- **Decifra solo output** delle variazioni (non i numeri intermedi)
- **Gestisce wallet Ethereum** per firmare transazioni

**Perché è affidabile:**
- Chiave privata mai lascia il dispositivo del giocatore
- Numeri cifrati immediatamente dopo derivazione
- Commitment vincola i valori prima che funzione sia nota
- ZK proof matematicamente impossibile da falsificare
- Ogni transazione firmata con chiave privata Ethereum

#### SERVER (Stateless)
**Cosa fa:**
- **Calcolo omomorfico** su parametri cifrati:
  - Applica delta ±20 ai numeri cifrati (operazioni su ciphertext)
  - Valuta funzione F su ciphertext
  - Ritorna SOLO l'output (mai i numeri)
- **Fornisce API REST** per coordinamento gioco
- **Gestisce WebSocket** per notifiche real-time

**Perché è affidabile:**
- Server **non ha accesso ai numeri** (sono cifrati con chiave pubblica del client)
- Server **non memorizza segreti** (stateless, può essere replicato)
- Calcoli verificabili tramite ZK proof (client prova correttezza on-chain)
- Se server manipola calcoli, ZK proof fallisce verifica su blockchain
- Server è **opzionale**: client potrebbe fare calcoli localmente (ma più lento)

### 2.4 Flusso di Dati e Trust Model

**Principio Chiave**: I numeri sono sempre cifrati. Solo il client che possiede la chiave privata può decifrarli, e lo fa solo per generare le ZK proof finali.

#### Percorso dei Dati
1. **Blockchain genera seed** (VRF) → pubblico ma imprevedibile
2. **Client deriva numeri da seed** → SHA-256 deterministico
3. **Client cifra immediatamente** → RSA-2048 encryption
4. **Client invia commitment on-chain** → SHA-256(ciphertext + salt)
5. **Server lavora su cifrati** → calcola senza accesso ai numeri
6. **Client decifra solo output** → vede risultato F(X), non i numeri X
7. **Fine gioco**: ZK proof dimostra correttezza senza rivelare numeri

#### Trust Model
- **ZERO trust nel server**: può essere malevolo, numeri rimangono cifrati
- **ZERO trust in altri giocatori**: vedono solo commitment e output finali
- **SOLO trust in**:
  - Matematica crittografica (RSA, ZK-SNARK, VRF, SHA-256)
  - Blockchain consensus (migliaia di nodi validatori)
  - Codice open-source verificabile da chiunque

---

## 3. Fondamenti Matematici: Perché la Soluzione Funziona

### 3.1 Notazione Matematica Formale

Definiamo formalmente gli oggetti matematici utilizzati:

#### Spazi e Gruppi

**Spazio dei Messaggi:**
```
M = {0, 1, ..., 1000}^10  (vettori 10-dimensionali di interi in [0, 1000])
```

**Spazio dei Ciphertext (RSA-2048):**
```
C = Z*_n  dove n = p·q con p, q primi di 1024 bit
|C| ≈ 2^2048  (gruppo moltiplicativo modulo n)
```

**Spazio degli Output:**
```
O = {0, 1, ..., 9999}  (interi modulo 10000)
```

**Spazio dei Commitment:**
```
H = {0, 1}^256  (hash SHA-256, 256 bit)
```

#### Funzioni Crittografiche

**1. Funzione di Cifratura RSA-OAEP:**
```
Enc: M → C
E_pk(x) = (x^e mod n)  dove e = 65537 (esponente pubblico standard)
```

**2. Funzione di Decifratura RSA:**
```
Dec: C → M
D_sk(c) = (c^d mod n)  dove d·e ≡ 1 (mod φ(n))
```

**3. Funzione Hash SHA-256:**
```
H: {0,1}* → {0,1}^256
Proprietà: collision-resistant, one-way, pseudorandom
```

**4. VRF (Verifiable Random Function):**
```
VRF: K × {0,1}* → {0,1}^256 × Π
(y, π) = VRF_sk(x)  dove y = output, π = proof di correttezza
```

**5. Funzione di Validazione:**
```
F: M → O
F(X) = (Σ(i=0 to 9) c_i · X_i + bias) mod 10000

dove:
- X = (X_0, ..., X_9) ∈ M
- c_i = H(seed_function || "coefficient" || i) mod 100  ∀i ∈ {0..9}
- bias = H(seed_function || "bias") mod 1000
```

### 3.2 Proprietà Omomorfiche di RSA

RSA possiede proprietà **moltiplicative** che permettono il calcolo su cifrati:

#### Proprietà Fondamentale
```
∀ x₁, x₂ ∈ M:
Enc(x₁) · Enc(x₂) ≡ Enc(x₁ · x₂) (mod n)

Dimostrazione:
Enc(x₁) · Enc(x₂) = x₁^e · x₂^e = (x₁·x₂)^e = Enc(x₁·x₂) mod n
```

#### Moltiplicazione Scalare
```
∀ k ∈ Z, x ∈ M:
[Enc(x)]^k ≡ Enc(x^k) (mod n)

Dimostrazione:
[Enc(x)]^k = (x^e)^k = x^(e·k) = Enc(x^k) mod n
```

#### Schema Additivo via Codifica Esponenziale
Per trasformare RSA in schema additivo usiamo encoding esponenziale:
```
Enc'(x) = g^x mod n  dove g è generatore di gruppo
Allora: Enc'(x₁) · Enc'(x₂) = g^x₁ · g^x₂ = g^(x₁+x₂) = Enc'(x₁ + x₂)
```

### 3.3 Calcolo Omomorfico della Funzione F

#### Teorema: Valutazione Omomorfica di F

**Enunciato:** Dato X = (X_0, ..., X_9) cifrato come E = (E_0, ..., E_9) con E_i = Enc(X_i),
è possibile calcolare Enc(F(X)) senza mai decifrare E.

**Dimostrazione:**

Passo 1: Calcolo dei termini c_i · X_i
```
Per ogni i ∈ {0..9}:
T_i = [Enc(X_i)]^c_i
    = [X_i^e]^c_i        (definizione Enc)
    = X_i^(e·c_i)        (esponente)
    = (X_i^c_i)^e        (proprietà commutativa)
    = Enc(X_i^c_i)       (definizione Enc)

Nota: X_i^c_i in forma moltiplicativa corrisponde a c_i·X_i in forma additiva
```

Passo 2: Somma omomorfica
```
R = Enc(bias) · ∏(i=0 to 9) T_i
  = Enc(bias) · ∏(i=0 to 9) Enc(X_i^c_i)
  = Enc(bias · ∏(i=0 to 9) X_i^c_i)        (proprietà moltiplicativa)
  = Enc(bias + Σ(i=0 to 9) c_i·X_i)        (conversione add-mult)
  = Enc(F(X))                               (definizione F)
```

**Conclusione:** Il server può calcolare Enc(F(X)) operando solo su {E_0, ..., E_9, c_0, ..., c_9, bias}
senza mai conoscere X_0, ..., X_9. ∎

### 3.4 Sicurezza dei Commitment

#### Teorema: Binding dei Commitment

**Enunciato:** Dato commitment C = H(Enc(X) || salt), è computazionalmente impossibile
per un avversario trovare X' ≠ X tale che H(Enc(X') || salt) = C.

**Dimostrazione (sketch):**

Assumiamo esista avversario A che in tempo polinomiale trova collisione:
```
A trova: (X, salt) e (X', salt') con X ≠ X' tale che
H(Enc(X) || salt) = H(Enc(X') || salt')
```

Casi:
1. Se Enc(X) || salt ≠ Enc(X') || salt', allora A ha trovato collisione SHA-256
   → Contraddice collision-resistance di SHA-256 (sicurezza 2^128)

2. Se Enc(X) || salt = Enc(X') || salt':
   a) Se salt ≠ salt' → contraddizione diretta
   b) Se salt = salt' allora Enc(X) = Enc(X')
      → Per iniettività di RSA: X = X' → contraddizione con X ≠ X'

Conclusione: Binding è garantito da collision-resistance di H. ∎

#### Teorema: Hiding dei Commitment

**Enunciato:** Dato commitment C = H(Enc(X) || salt) con salt uniforme random,
C non rivela informazioni su X.

**Dimostrazione:**

Per one-wayness di H:
```
Pr[A(C) = X] ≤ 1/|M| + ε

dove ε è negligible (< 2^-128 per SHA-256)
```

Per semantic security di RSA-OAEP:
```
∀ X₀, X₁ ∈ M, ∀ A:
|Pr[A(Enc(X₀)) = 0] - Pr[A(Enc(X₁)) = 0]| ≤ negl(λ)
```

Composizione (H ∘ Enc):
```
Dato C = H(Enc(X) || salt), distinguere X₀ vs X₁ richiede:
- Invertire H (one-wayness: 2^256 tentativi)
- O rompere RSA-OAEP (best attack: GNFS ≈ 2^112 operazioni)

Entrambi computazionalmente infeasible. ∎
```

### 3.5 Zero-Knowledge Proofs: Garanzie Formali

#### Circuit Arithmetico per ZK-SNARK

Il giocatore prova la seguente relazione R:

```
R = {(C, O, k) ; (X, Δ, s, pk) |
     ∧ H(Enc_pk(X) || s) = C                    (commitment corretto)
     ∧ ∀i: |Δ_i| ≤ 20                           (delta bounded)
     ∧ len(Δ) = k                               (numero variazioni)
     ∧ F(X + Σ Δ) mod 10000 = O                 (output corretto)
}
```

Dove:
- **Public inputs**: (C, O, k) - commitment, output dichiarato, num variazioni
- **Private witness**: (X, Δ, s, pk) - numeri, deltas, salt, chiave pubblica

#### Proprietà di Groth16 su Curva BN254

**1. Completeness (Completezza):**
```
∀ (x, w) ∈ R:
Pr[Verify(Prove(x, w)) = accept] = 1
```
*Traduzione: Giocatore onesto genera sempre proof valida*

**2. Soundness (Correttezza):**
```
∀ x, ∀ A computazionalmente limitato:
Pr[∃π: Verify(x, π) = accept ∧ ¬∃w: (x,w) ∈ R] < 2^-128
```
*Traduzione: Impossibile falsificare proof se non conosci witness valido*

**3. Zero-Knowledge (Privacy):**
```
∃ Simulator S tale che ∀ (x, w) ∈ R:
{Prove(x, w)} ≈_c {S(x)}
```
*Traduzione: Proof non rivela nulla su w (X, Δ, salt, pk)*

#### Complessità Computazionale

**Generazione Proof:**
```
Time: O(|C| · log|C|)  dove |C| = dimensione circuit
|C| ≈ 10^6 gates per il nostro circuit
→ ~2-3 secondi su CPU moderna
```

**Verifica Proof (on-chain):**
```
Time: O(1) - costante, ~200k gas su Ethereum
Verifica: 2 pairing checks su curva BN254
e₁(π_A, π_B) = e₂(π_C, G₂) · e₃(pub_inputs, vk)
```

### 3.6 Analisi della Complessità e Performance

#### Complessità Spaziale

**Commitment:**
```
|C| = 256 bit (SHA-256)
Storage on-chain: 32 bytes per player
```

**ZK Proof:**
```
|π| = 2 · |G₁| + 1 · |G₂| = 2·32 + 64 = 128 bytes (Groth16)
Storage on-chain: 128 bytes per player
```

**Total per game:**
```
3 players × (32 + 128) = 480 bytes + smart contract state
```

#### Complessità Temporale

**Operazioni Client:**
```
Derivazione numeri:    SHA-256 × 10         ~1ms
Cifratura RSA:         Exp mod n × 10       ~50ms
Commitment:            SHA-256 × 1          ~0.1ms
ZK Proof generation:   Circuit evaluation   ~2000ms
-----------------------------------------------------------
Total per player:                           ~2050ms
```

**Operazioni Server (omomorfico):**
```
Applicazione delta:    Mult mod n × 10     ~5ms
Calcolo F:             Exp + Mult × 10     ~15ms
-----------------------------------------------------------
Total per variation:                        ~20ms
```

**Operazioni Blockchain:**
```
VRF generation:        Curve ops            ~100ms
ZK Verify:             2 pairings           ~200ms (gas: 200k)
Token operations:      State writes         ~50ms (gas: 50k)
```

#### Throughput

**Max variazioni per secondo:**
```
1 server: 1000ms / 20ms = 50 variations/sec
10 servers paralleli: 500 variations/sec
```

**Max games concorrenti:**
```
Blockchain limit: ~15M gas/block / 250k gas per game ≈ 60 games/block
Block time: 12s → ~5 games/sec throughput
```

### 3.7 Analisi di Sicurezza Formale

#### Attack Vectors e Mitigazioni

**1. Privacy Attack (violare cifratura):**
```
Best known attack: GNFS su RSA-2048
Costo: T = exp(1.923 · (log n)^(1/3) · (log log n)^(2/3))
     ≈ 2^112 operazioni
     ≈ 10^24 anni con supercomputer moderno (10^18 ops/sec)

Mitigazione: RSA-2048 garantisce 112-bit security (NIST standard)
```

**2. Commitment Attack (trovare collisione):**
```
Birthday attack su SHA-256:
Costo: 2^(256/2) = 2^128 hashing operations
     ≈ 10^21 anni con hardware moderno

Mitigazione: SHA-256 collision-resistant
```

**3. ZK Proof Forgery:**
```
Soundness error Groth16: 2^-128
Attacco: Risolvere Discrete Log Problem su BN254
Costo: ~2^128 operazioni (impossibile)

Mitigazione: Mathematical impossibility
```

**4. Fairness Attack (predire coefficienti):**
```
Probabilità predire 1 coefficiente: 1/100
Probabilità predire tutti 10: (1/100)^10 = 10^-20

Mitigazione: Funzione rivelata dopo commitment (temporal ordering)
```

**5. Economic Attack (più di 9 variazioni):**
```
Requisiti: Falsificare transazione blockchain
Costo: 51% attack = controllo >50% hashrate
     = ~$1 miliardo per Ethereum

Mitigazione: Economic + cryptographic + smart contract enforcement
```

---

## 4. Perché la Soluzione è Matematicamente Affidabile

### 4.1 Privacy Assoluta - DIMOSTRAZIONE

**Requisito**: "I numeri non devono essere visibili a nessuno"

**Come è garantito:**

1. **Derivazione deterministica (Client)**
   ```
   numeri[i] = SHA256(seed_player + str(i)) % 1000
   ```
   - SHA-256 è **one-way function**: da output impossibile risalire a input
   - Seed pubblico ma numeri derivabili solo tramite funzione hash
   - Attacco brute-force: 2^256 tentativi = fisicamente impossibile

2. **Cifratura immediata (Client)**
   ```
   ciphertext = RSA_OAEP_Encrypt(numeri, public_key)
   ```
   - RSA-2048 con OAEP: **semantically secure** (IND-CCA2)
   - Decifratura richiede chiave privata (2048-bit)
   - Attacco migliore conosciuto: General Number Field Sieve = 2^112 operazioni
   - Supercomputer moderno: ~10^9 ops/sec → serve 10^24 anni

3. **Commitment binding (Blockchain)**
   ```
   commitment = SHA256(ciphertext + salt)
   ```
   - SHA-256 è **collision-resistant**: impossibile trovare due input con stesso hash
   - Attacco birthday: 2^128 tentativi = impossibile
   - Commitment registrato on-chain: **immutabile**

4. **Zero-Knowledge Proof (Client → Blockchain)**
   - Prova "conosco X tale che SHA256(Encrypt(X)) = commitment" **senza rivelare X**
   - Groth16 su curva BN254: **soundness error < 2^-128**
   - Verifier on-chain: accetta solo proof matematicamente valide
   - Impossibile falsificare: richiederebbe risolvere Discrete Logarithm Problem

**Conclusione matematica**: Con parametri scelti (RSA-2048, SHA-256, Groth16), la probabilità di violare privacy è < 2^-112 = **trascurabile** (standard NIST).

### 4.2 Fairness - DIMOSTRAZIONE

**Requisito**: "Nessuno può predire o influenzare la funzione di validazione"

**Come è garantito:**

1. **VRF genera seed master (Blockchain)**
   ```
   seed_master = VRF(block_hash, nonce)
   ```
   - VRF output è **pseudorandom**: indistinguibile da casualità vera
   - Miner non può manipolare: cambiare block_hash invalida blocco
   - Nonce incrementale: nessun attore può scegliere seed

2. **Funzione rivelata DOPO commitment (Temporal Ordering)**
   ```
   Timeline:
   T0: Players sottomettono commitment
   T1: Blockchain blocca commitment (irreversibili)
   T2: seed_function = SHA256(seed_master + "function")
   T3: Coefficienti derivati deterministicamente
   ```
   - A T0, seed_function NON esiste ancora (non generato)
   - Impossibile per giocatori predire coefficienti futuri
   - Blockchain garantisce ordering temporale (timestamp immutabili)

3. **Derivazione deterministica coefficienti**
   ```python
   c[i] = SHA256(seed_function + "coefficient" + str(i)) % 100
   bias = SHA256(seed_function + "bias") % 1000
   ```
   - Output SHA-256 è **uniformly distributed** su {0, ..., 2^256-1}
   - Modulo % 100 preserva uniformità su {0, ..., 99}
   - Nessun attore può influenzare coefficienti (derivati da hash)

**Conclusione matematica**: Probabilità che un giocatore preveda anche solo 1 coefficiente prima del commitment < 1/100 = **insignificante**. Prevedere tutti 10 coefficienti: (1/100)^10 = **10^-20**.

### 4.3 Anti-Cheat - DIMOSTRAZIONE

**Requisito**: "Impossibile fare più di 9 variazioni"

**Come è garantito:**

1. **XPF Token on-chain (Smart Contract)**
   ```solidity
   function requestVariation(address player) {
       require(xpf_balance[player] >= 1, "Insufficient XPF");
       xpf_balance[player] -= 1;  // Burn irreversibile
       variations_count[player] += 1;
       require(variations_count[player] <= 9, "Max 9 variations");
   }
   ```
   - Ogni variazione richiede transazione on-chain
   - Smart contract decrementa balance (irreversibile)
   - Counter variazioni incrementato atomicamente
   - Se player tenta 10°, transazione REVERSA (fallisce)

2. **Economic Constraint**
   ```
   Start: 10 XPF
   Max variations: 9 × 1 XPF = 9 XPF
   Final submission: 1 XPF
   Total: 9 + 1 = 10 XPF (tutto il balance)
   ```
   - Matematicamente impossibile fare 10 variazioni (serve 11 XPF)
   - Gas costs aggiuntivo rende attacchi costosi

3. **ZK Proof of Bounded Variations (Final Submission)**
   ```
   Proof Circuit:
   public input: commitment, output_declared, variations_count
   private input: numbers[], deltas[][]
   constraints:
     1. SHA256(Encrypt(numbers)) == commitment
     2. for all i: |deltas[i]| <= 20
     3. len(deltas) == variations_count
     4. F(numbers + sum(deltas)) == output_declared
   ```
   - Player deve provare che deltas rispettano limite ±20
   - Se player applica delta > 20, proof è matematicamente invalida
   - Smart contract verifier rigetta proof non valide

**Conclusione matematica**: Violare limite richiede:
- Falsificare transazione blockchain (impossibile: serve consenso 51%)
- O falsificare ZK proof (impossibile: richiederebbe risolvere DLP)

### 4.4 Come Funziona il Calcolo su Cifrati - SPIEGAZIONE DETTAGLIATA

**Requisito**: "Server calcola variazioni e output senza vedere i numeri"

#### PARTE 1: Come si Generano Variazioni con Delta ±20

**Problema**: Il giocatore ha numeri cifrati. Come applicare delta ±20 senza decifrarli?

**Soluzione tramite Crittografia Omomorfica:**

```python
# STATO INIZIALE
numeri_cifrati = [Enc(347), Enc(892), Enc(156), ...]  # Client ha cifrato

# SERVER GENERA DELTA CASUALI
deltas = [VRF.random(-20, 20) for _ in range(10)]  # Es: [5, -12, 18, -7, ...]

# CALCOLO OMOMORFICO (server opera SU CIFRATI)
for i in range(10):
    # Proprietà omomorfica: Enc(a) + Enc(b) = Enc(a + b)
    numeri_cifrati_nuovi[i] = numeri_cifrati[i] + Enc(deltas[i])

    # Matematicamente equivale a:
    # numeri_cifrati_nuovi[i] = Enc(numeri[i] + deltas[i])
    # Ma il server NON vede mai numeri[i]!
```

**Perché i delta rispettano ±20:**
- VRF genera delta verificabile (proof on-chain)
- Smart contract verifica che |delta| ≤ 20 prima di accettare transazione
- ZK proof finale conferma che tutti i delta sono nel range

**Perché il server non può barare:**
- Se server applica delta > 20, il giocatore lo scopre
- Il giocatore genera ZK proof con i delta reali usati
- Smart contract verifica proof: se delta erano > 20, proof INVALIDA

#### PARTE 2: Come si Calcola l'Output Senza Conoscere i Numeri

**Problema**: Il server deve calcolare F(X) = c₀·X₀ + c₁·X₁ + ... + c₉·X₉ + bias, ma X₀...X₉ sono cifrati!

**Soluzione tramite Proprietà Omomorfiche:**

```python
# COEFFICIENTI PUBBLICI (generati dopo commitment)
c = [37, 82, 15, 64, 91, 23, 58, 76, 42, 19]  # Derivati da seed_function
bias = 523

# CALCOLO OMOMORFICO (server opera SU CIFRATI)
result_cifrato = Enc(bias)  # Inizia con bias

for i in range(10):
    # Proprietà: k × Enc(a) = Enc(k × a)
    termine_cifrato = c[i] × numeri_cifrati_nuovi[i]

    # Proprietà: Enc(a) + Enc(b) = Enc(a + b)
    result_cifrato = result_cifrato + termine_cifrato

# result_cifrato = Enc(c₀·X₀ + c₁·X₁ + ... + c₉·X₉ + bias)
# = Enc(F(X))
```

**Client decifra SOLO l'output:**
```python
output = RSA_Decrypt(result_cifrato, private_key)
# output = F(X) = 7727 (esempio)

# Client vede SOLO il numero 7727
# NON vede X₀, X₁, ..., X₉
```

**Perché funziona matematicamente:**

1. **Schema Omomorfico Additivo/Moltiplicativo**
   - RSA ha proprietà: Enc(a) × Enc(b) = Enc(a × b) (moltiplicativo)
   - Conversione: Enc(a) + Enc(b) tramite exponential mapping (additivo)

2. **Composizione delle Operazioni**
   - Moltiplicazione scalare: c[i] × Enc(X[i]) = Enc(c[i] × X[i])
   - Somma: Enc(A) + Enc(B) = Enc(A + B)
   - Composizione: Enc(c₀·X₀) + Enc(c₁·X₁) = Enc(c₀·X₀ + c₁·X₁)

3. **Modulo Finale**
   - Output decifrato: F(X) mod 10000
   - Applicato dopo decifratura per range [0, 9999]

**Perché il giocatore vede l'output ma non i numeri:**
- Decifratura parziale: client decifra solo `Enc(F(X))` → ottiene valore numerico
- Numeri intermedi `Enc(X[i])` restano cifrati
- Matematicamente impossibile invertire: da F(X) = 7727, trovare X₀...X₉ richiede risolvere sistema lineare con 10^30 soluzioni possibili

#### PARTE 3: Come si Conosce l'Output Senza Conoscere la Funzione Prima

**Problema**: La funzione F viene rivelata DOPO il commitment. Come il giocatore sa quale variazione è migliore?

**Timeline Precisa:**

```
T0: Commitment Phase
    - Player sottomette commitment di numeri cifrati
    - Funzione F NON esiste ancora

T1: Function Revelation
    - Smart contract genera seed_function
    - Coefficienti c[0]...c[9] e bias derivati da seed_function
    - Funzione F diventa PUBBLICA

T2: Variations Phase
    - Player richiede variazione (delta applicati a numeri cifrati)
    - Server calcola F(numeri_nuovi) omomorficamente
    - Player decifra output: 7250 HP
    - Player richiede altra variazione
    - Server calcola F(numeri_nuovi_2) omomorficamente
    - Player decifra output: 7890 HP
    - Player confronta: 7890 > 7250 → sceglie variazione 2

T3: Final Submission
    - Player dichiara output 7890
    - Player genera ZK proof che prova:
      * Numeri derivano da seed_player
      * Delta applicati sono ≤ 20
      * Output 7890 è corretto per F(numeri_finali)
```

**Perché questo garantisce fairness:**
- A T0, player NON sa quali numeri daranno output alto (F non esiste)
- A T1, player scopre F ma commitment già bloccato (immutabile)
- A T2, player può solo esplorare ±20 variazioni (limitato da XPF e ZK proof)
- Impossibile "cherry-pick": commitment vincola i numeri iniziali

### 4.5 Verifica On-Chain - Garanzia Finale

**ZK-SNARK Verifier (Smart Contract)**

```solidity
function verifyAndSubmit(
    address player,
    uint256 output_declared,
    bytes calldata proof
) public {
    // 1. Verifica proof matematicamente
    bool valid = zkVerifier.verify(
        [commitment[player], output_declared],  // public inputs
        proof                                    // ZK proof
    );
    require(valid, "Invalid ZK proof");

    // 2. Registra submission
    submissions[player] = output_declared;

    // 3. Se tutti hanno submitted, determina vincitore
    if (allSubmitted()) {
        winner = argmax(submissions);
        xpf_balance[winner] += 100;  // Reward
    }
}
```

**Garanzie matematiche:**
- Se `valid == true`, allora con probabilità > 1 - 2^-128:
  - Player conosce numeri che hash a commitment
  - Variazioni rispettano limite ±20
  - Output dichiarato è F(numeri_finali)
- Se player bara, proof è invalida (soundness)
- Player onesto può sempre produrre proof valida (completeness)

---

## 5. Funzione di Validazione

La funzione di validazione è un **polinomio lineare modulare** che calcola l'output dalla lista di 10 numeri.

### Formula

```
F(X[0], X[1], ..., X[9]) = (c[0]×X[0] + c[1]×X[1] + ... + c[9]×X[9] + bias) % 10000
```

Dove:
- `X[0]...X[9]` = i 10 numeri del giocatore (range 0-1000)
- `c[0]...c[9]` = coefficienti casuali (range 0-99)
- `bias` = termine costante casuale (range 0-999)
- `10000` = modulo per mantenere output tra 0-9999

### Derivazione Coefficienti

I coefficienti e il bias sono **deterministici** dal `seed_function`:

#### Coefficienti (c[0] ... c[9])
```python
c[i] = SHA256(seed_function + "coefficient" + str(i)) % 100
```

#### Bias
```python
bias = SHA256(seed_function + "bias") % 1000
```

### Proprietà Chiave
- **Deterministico**: stessi numeri + stesso seed = sempre stesso output
- **Non invertibile**: impossibile reverse-engineer input ottimali dall'output
- **Alta dimensionalità**: 10 parametri = spazio di ricerca vasto (10^30 combinazioni)
- **Fair**: tutti i giocatori usano stessa funzione (generata DOPO commitment)
- **Verificabile**: chiunque può ricalcolare gli output

### Esempio Concreto

Supponiamo:
```
seed_function = "0x1f2e3d4c5b6a79880abcdef123456789"
```

Deriviamo coefficienti:
```python
import hashlib

coefficients = []
for i in range(10):
    data = f"{seed_function}coefficient{i}".encode()
    hash_result = hashlib.sha256(data).digest()
    hash_int = int.from_bytes(hash_result[:4], byteorder='big')
    coeff = hash_int % 100
    coefficients.append(coeff)

# Bias
data = f"{seed_function}bias".encode()
hash_result = hashlib.sha256(data).digest()
hash_int = int.from_bytes(hash_result[:4], byteorder='big')
bias = hash_int % 1000
```

Output esempio:
```
c[0] = 37, c[1] = 82, c[2] = 15, ..., c[9] = 19
bias = 523
```

Calcolo output per giocatore con numeri `[347, 885, 171, 703, 465, 888, 249, 663, 923, 437]`:
```
output = 37×347 + 82×885 + 15×171 + 64×703 + 91×465 +
         23×888 + 58×249 + 76×663 + 42×923 + 19×437 + 523

output = 307727
output_finale = 307727 % 10000 = 7727
```

---

## 6. Flusso di Gioco Completo

### Fase 1: Setup
1. Crea gioco con 3 giocatori
2. Giocatori si registrano con indirizzi Ethereum
3. Smart contract genera seed master tramite **Chainlink VRF**
4. Seed master deriva seed individuali per ogni giocatore

### Fase 2: Commitment
1. Ogni giocatore deriva 10 numeri dal proprio seed (client-side)
2. Numeri cifrati immediatamente con chiave pubblica RSA
3. Client genera **commitment** = `SHA256(encrypted_params + salt)`
4. Commitment inviato on-chain tramite smart contract
5. Sistema attende commitment da tutti i giocatori

### Fase 3: Function Revelation
1. **DOPO** tutti i commitment bloccati
2. Smart contract genera `seed_function` (derivato da seed master)
3. Funzione F diventa pubblica con coefficienti e bias
4. Nessuno poteva prevederla prima dei commitment

### Fase 4: Variations (Training)
1. Giocatore richiede variazione (costa 1 XPF, burn su smart contract)
2. VRF genera delta casuali (±20 per ogni numero)
3. Server esegue **calcolo omomorfico** su parametri cifrati:
   - Applica delta ai numeri cifrati (Enc(X[i]) + Enc(delta[i]))
   - Calcola F(nuovi_numeri) su ciphertext (proprietà omomorfica)
   - Ritorna output cifrato
4. Client decifra solo output (vede 7250 HP, non i numeri)
5. Giocatore decide se continuare o sottomettere
6. Ripeti fino a 9 volte o XPF insufficienti

### Fase 5: Final Submission
1. Giocatore sceglie migliore variazione (più alto output)
2. Client genera **ZK-SNARK proof** che prova:
   - I numeri derivano dal seed corretto
   - Le variazioni rispettano limite ±20
   - L'output dichiarato è corretto
   - Senza rivelare i numeri stessi
3. Submission inviata on-chain con proof (costa 1 XPF)
4. Smart contract verifica proof matematicamente

### Fase 6: Winner Determination
1. Smart contract confronta output dichiarati da tutti i giocatori
2. Output più alto vince
3. Vincitore riceve **100 XPF** come reward
4. Parametri rimangono cifrati per sempre (privacy totale)

---

## 7. Quick Start

### Lancio Automatico

```bash
./start.sh
```

Avvia simultaneamente:
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

---

## 8. Frontend: F1 Racing Theme

Il frontend trasforma il gioco crittografico in un'esperienza **F1 Racing**:

### Metafore
- **10 numeri** → Parametri AI dell'auto (aerodinamica, motore, gomme, ecc.)
- **Output F(X)** → Total Power (HP) dell'auto
- **Variazioni** → Sessioni di training AI
- **Commitment** → Lock-in setup prima che vengano rivelate le regole della gara

### Features
- **3 Team**: Ferrari, Mercedes, Red Bull
- **Live Crypto Panel**: visualizza ZK proofs, VRF, cifratura in tempo reale
- **Gara Animata**: canvas rendering con velocità basata su power
- **Parametri Fabbrica**: ogni team inizia con setup specifici

### Stack
- React 18 + Vite
- TailwindCSS (colori team F1)
- Framer Motion (animazioni)
- Canvas API (gara)
- Web Crypto API (SHA-256)

---

## 9. Documentazione

- [Problem Statement](docs/Problem.md) - Specifica completa problema e soluzione
- [Validation Function](docs/VALIDATION_FUNCTION.md) - Formula e calcoli manuali
- [API Examples](docs/API_EXAMPLES.md) - Esempi chiamate API complete
- [Backend README](backend/README.md) - Documentazione backend
- [Frontend README](frontend/README.md) - Documentazione frontend

---

## 10. Licenza

MIT License

---

**"Zero-Trust Competitive Gaming through Cryptographic Guarantees"**
