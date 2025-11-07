# Modifiche Sistema XPF e Reward

## Cosa è Cambiato

### 1. Sistema XPF Semplificato

**PRIMA:**
- Ogni giocatore doveva conservare almeno 1 XPF per giocare
- Poteva fare max 8 variazioni (per lasciare 1 XPF per submit)
- Reward vincitore: 1-5 XPF basato su efficienza

**ADESSO:**
- Ogni giocatore può fare **9 variazioni complete**
- Tutti arrivano a **0 XPF** dopo il gioco (9 variazioni + 1 submit = 10 XPF)
- Vincitore riceve **100 XPF fissi**
- Perdenti restano a **0 XPF**

### 2. Meccanica di Gioco

```
Ogni giocatore:
├─ Inizio: 10 XPF
├─ Variazione 1: -1 XPF → 9 XPF rimasti
├─ Variazione 2: -1 XPF → 8 XPF rimasti
├─ Variazione 3: -1 XPF → 7 XPF rimasti
├─ ...
├─ Variazione 9: -1 XPF → 1 XPF rimasto
└─ Submit Finale: -1 XPF → 0 XPF

Fine gioco:
├─ Player 1 (perdente): 0 XPF
├─ Player 2 (VINCITORE): 0 + 100 = 100 XPF ✨
└─ Player 3 (perdente): 0 XPF
```

### 3. Strategia di Gioco

Ora **non c'è più dilemma strategico** sul numero di variazioni:
- Prima: "Uso 5 variazioni o 8? Devo bilanciare probabilità vs efficienza"
- Ora: "Faccio sempre tutte le 9 variazioni e scelgo la migliore"

Questo rende il gioco più **equo e deterministico**:
- Tutti hanno stesse opportunità
- Vince chi ha più fortuna con i delta casuali
- Nessun vantaggio nel risparmiare XPF

### 4. File Modificati

1. **`backend/blockchain/smart_contract.py`**
   - Rimosso check "deve lasciare 1 XPF"
   - Semplificato `request_variation()`: controlla solo `XPF >= 1`
   - Rimossa funzione `calculate_xpf_bonus()`
   - `distribute_rewards()` ora minta 100 XPF fissi al vincitore

### 5. Nuovi File Creati

1. **`VALIDATION_FUNCTION.md`**
   - Spiegazione completa della funzione F
   - Come derivare coefficienti da seed
   - Esempi di calcolo passo-passo
   - Guida per verificare output manualmente

2. **`calculate_output.py`**
   - Script Python per calcolare output
   - Stampa calcolo dettagliato
   - Usa: `python calculate_output.py <seed> <num0> ... <num9>`

## Come Testare

### 1. Avvia il server (se non è già avviato)

```bash
cd /home/teddy/f1-ai
./start.sh
```

### 2. Esegui test completo

```bash
cd backend
source venv/bin/activate
python test_game.py
```

Ora tutti i giocatori faranno più variazioni e finiranno a 0 XPF, tranne il vincitore che avrà 100 XPF.

### 3. Verifica output manualmente

```bash
# Durante il gioco, ottieni seed_function
curl http://localhost:8000/api/game/{game_id} | jq '.seed_function'

# Poi calcola output con i numeri di un player
python calculate_output.py <seed_function> <num0> <num1> ... <num9>
```

## Funzione di Validazione

**Formula:**
```
F(X) = (c[0]×X[0] + c[1]×X[1] + ... + c[9]×X[9] + bias) % 10000
```

**Dove:**
- `c[i]` = Hash(seed_function + "coefficient" + i) % 100
- `bias` = Hash(seed_function + "bias") % 1000
- Output finale tra 0 e 9999

**Esempio con script:**
```bash
python calculate_output.py 0xabc123... 347 885 171 703 465 888 249 663 923 437
```

Output:
```
======================================================================
OUTPUT FINALE: 2632
======================================================================
```

## Vantaggi del Nuovo Sistema

1. **Più semplice**: Non serve strategia su quante variazioni fare
2. **Più equo**: Tutti hanno stesse chances (9 variazioni)
3. **Più pulito**: Tutti finiscono a 0 XPF, solo vincitore ha reward
4. **Più chiaro**: 100 XPF è un numero tondo e significativo
5. **Verificabile**: Script per calcolare output manualmente

## Note per Frontend

Se implementi il frontend, ricorda:
- Permetti sempre tutte le 9 variazioni
- Mostra "XPF rimasti: X/10"
- Alla fine mostra: "Vincitore: +100 XPF, Altri: 0 XPF"
- Nessun bonus per efficienza da mostrare

---

**Tutto aggiornato e pronto per l'uso! 🚀**
