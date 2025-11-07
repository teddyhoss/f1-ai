# Formula di Validazione - Frontend

## Formula Implementata

Il frontend ora utilizza la **stessa formula del backend** per calcolare la potenza (HP) delle macchine:

```
F(X) = (c[0]×X[0] + c[1]×X[1] + ... + c[9]×X[9] + bias) % 10000
```

### Componenti

- **X[0]...X[9]**: 10 parametri AI della macchina (range 0-1000)
- **c[0]...c[9]**: Coefficienti derivati dal `functionSeed` via SHA-256 (range 0-99)
- **bias**: Termine costante derivato dal `functionSeed` via SHA-256 (range 0-999)
- **% 10000**: Modulo per output tra 0-9999 HP

### Derivazione Coefficienti

```javascript
// Per ogni coefficiente i (da 0 a 9)
c[i] = SHA256(functionSeed + "coefficient" + i) % 100

// Per il bias
bias = SHA256(functionSeed + "bias") % 1000
```

## Implementazione

File: `frontend/src/utils/crypto.js`

```javascript
async function calculateValidationFunction(parameters, functionSeed) {
  // Deriva coefficienti
  const coefficients = [];
  for (let i = 0; i < 10; i++) {
    const data = `${functionSeed}coefficient${i}`;
    const hash = await generateHash(data);
    const coeff = parseInt(hash.substring(0, 8), 16) % 100;
    coefficients.push(coeff);
  }

  // Deriva bias
  const biasData = `${functionSeed}bias`;
  const biasHash = await generateHash(biasData);
  const bias = parseInt(biasHash.substring(0, 8), 16) % 1000;

  // Calcola output
  let output = bias;
  for (let i = 0; i < 10; i++) {
    output += coefficients[i] * parameters[i];
  }

  return output % 10000;
}
```

## Esempio Pratico

### Parametri di Fabbrica Ferrari
```
Parameters: [650, 720, 580, 690, 710, 640, 700, 680, 660, 695]
FunctionSeed: "game_1234567890"
```

### Calcolo Step-by-Step

1. **Deriva Coefficienti** (esempio)
   ```
   c[0] = SHA256("game_1234567890coefficient0") % 100 = 42
   c[1] = SHA256("game_1234567890coefficient1") % 100 = 87
   ... (e così via per tutti i 10 coefficienti)
   ```

2. **Deriva Bias**
   ```
   bias = SHA256("game_1234567890bias") % 1000 = 523
   ```

3. **Calcola Output**
   ```
   output = 523 + (42×650) + (87×720) + ... + (19×695)
   output = 523 + 27300 + 62640 + ... = 348912
   output % 10000 = 8912 HP
   ```

## Differenza con Backend Python

**NESSUNA!** La formula è identica. L'unica differenza è:
- **Backend**: Usa `int.from_bytes(hash[:4], 'big')` per convertire i byte
- **Frontend**: Usa `parseInt(hash.substring(0, 8), 16)` per convertire hex string

Entrambi producono gli stessi risultati perché:
- SHA-256 è deterministico
- La conversione da bytes/hex a intero è equivalente
- Il modulo è applicato allo stesso modo

## Verifica Console

Apri la console del browser (F12) e vedrai i calcoli stampati:

```
═══════════════════════════════════════════════════════
🧮 VALIDATION FUNCTION CALCULATION
═══════════════════════════════════════════════════════

📊 Formula: F(X) = (c[0]×X[0] + ... + c[9]×X[9] + bias) % 10000

🎲 Function Seed: game_1234567890

🔢 Parameters (X): [650, 720, 580, ...]
⚙️  Coefficients (c): [42, 87, 15, ...]
➕ Bias: 523

📈 Calculation:
   523 + 42×650 + 87×720 + ...

💡 Raw Output: 348912
🎯 Final Output (mod 10000): 8912 HP
═══════════════════════════════════════════════════════
```

## Parametri Factory per Ogni Team

### Ferrari SF-24
```javascript
[650, 720, 580, 690, 710, 640, 700, 680, 660, 695]
```

### Mercedes W15
```javascript
[670, 700, 620, 710, 690, 655, 720, 675, 685, 680]
```

### Red Bull RB20
```javascript
[680, 710, 640, 700, 705, 670, 690, 695, 675, 685]
```

## Caratteristiche

✅ **Deterministico**: Stessi parametri → stesso output  
✅ **Fair**: Tutti i team usano lo stesso `functionSeed`  
✅ **Non-lineare**: Non c'è strategia ovvia, bisogna provare variazioni  
✅ **Verificabile**: Chiunque può ricalcolare e verificare l'output  
✅ **Realistico**: Range 0-9999 HP rappresenta potenza totale della macchina  

## Debug

Per vedere i dettagli della formula:
1. Apri il browser su http://localhost:5173
2. Apri Console (F12)
3. Fai training di una macchina
4. Vedrai il calcolo completo stampato in console

Oppure usa la funzione:
```javascript
import { explainValidation } from './utils/crypto';

explainValidation([650, 720, ...], 'game_seed_123');
```
