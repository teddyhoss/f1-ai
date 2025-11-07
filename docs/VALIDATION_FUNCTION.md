# Funzione di Validazione - Guida ai Calcoli Manuali

## Formula della Funzione

La funzione di validazione `F` è un **polinomio lineare modulare**:

```
F(X[0], X[1], ..., X[9]) = (c[0]×X[0] + c[1]×X[1] + ... + c[9]×X[9] + bias) % 10000
```

Dove:
- `X[0]...X[9]` = i 10 numeri del giocatore (range 0-1000)
- `c[0]...c[9]` = coefficienti casuali (range 0-99)
- `bias` = termine costante casuale (range 0-999)
- `10000` = modulo per mantenere output tra 0-9999

## Come Derivare i Coefficienti

I coefficienti e il bias sono **deterministici** dal `seed_function`:

### Coefficienti (c[0] ... c[9])

Per ogni indice `i` da 0 a 9:

```python
c[i] = Hash(seed_function + "coefficient" + str(i)) % 100
```

**In pratica:**
1. Concatena: `seed_function` + stringa "coefficient" + numero indice
2. Calcola SHA-256 hash
3. Prendi i primi 4 byte dell'hash
4. Converti in intero
5. Applica modulo 100

### Bias

```python
bias = Hash(seed_function + "bias") % 1000
```

## Esempio Concreto

Supponiamo che il gioco abbia generato:

```
seed_function = "0x1f2e3d4c5b6a79880abcdef123456789..."
```

### Step 1: Calcola i Coefficienti

```python
import hashlib

seed_function = "0x1f2e3d4c5b6a79880abcdef123456789"

# Coefficienti
coefficients = []
for i in range(10):
    data = f"{seed_function}coefficient{i}".encode()
    hash_result = hashlib.sha256(data).digest()
    hash_int = int.from_bytes(hash_result[:4], byteorder='big')
    coeff = hash_int % 100
    coefficients.append(coeff)
    print(f"c[{i}] = {coeff}")

# Bias
data = f"{seed_function}bias".encode()
hash_result = hashlib.sha256(data).digest()
hash_int = int.from_bytes(hash_result[:4], byteorder='big')
bias = hash_int % 1000
print(f"bias = {bias}")
```

**Output Esempio:**
```
c[0] = 37
c[1] = 82
c[2] = 15
c[3] = 64
c[4] = 91
c[5] = 23
c[6] = 58
c[7] = 76
c[8] = 42
c[9] = 19
bias = 523
```

### Step 2: Calcola Output per un Giocatore

Supponiamo che il giocatore abbia questi numeri finali (dopo variazioni):

```
X[0] = 347
X[1] = 885
X[2] = 171
X[3] = 703
X[4] = 465
X[5] = 888
X[6] = 249
X[7] = 663
X[8] = 923
X[9] = 437
```

**Calcolo passo-passo:**

```
output = c[0]×X[0] + c[1]×X[1] + ... + c[9]×X[9] + bias

output = 37×347 + 82×885 + 15×171 + 64×703 + 91×465 +
         23×888 + 58×249 + 76×663 + 42×923 + 19×437 + 523

output = 12839 + 72570 + 2565 + 44992 + 42315 +
         20424 + 14442 + 50388 + 38766 + 8303 + 523

output = 307727

output_finale = 307727 % 10000 = 7727
```

**Il giocatore ha output = 7727**

## Calcolo Variazioni

### Delta Applicati

Quando generi una variazione, il server applica delta casuali tra -20 e +20:

```
X_new[i] = X_old[i] + delta[i]
```

Con vincoli:
- `delta[i]` tra -20 e +20 (inclusi)
- `X_new[i]` deve restare nel range [0, 1000]

**Esempio:**
```
Numeri iniziali:  [347, 892, 156, 723, 445, 891, 234, 678, 912, 445]
Delta applicati:  [  0,  -7,  15, -20,  20,  -3,  15, -15,  11,  -8]
Numeri finali:    [347, 885, 171, 703, 465, 888, 249, 663, 923, 437]
```

### Calcolo Manuale con Python

```python
# Dati del gioco
seed_function = "0x1f2e3d4c5b6a79880abcdef123456789"  # Dal backend
numbers = [347, 885, 171, 703, 465, 888, 249, 663, 923, 437]  # Numeri del player

# Deriva coefficienti
import hashlib

coefficients = []
for i in range(10):
    data = f"{seed_function}coefficient{i}".encode()
    hash_result = hashlib.sha256(data).digest()
    hash_int = int.from_bytes(hash_result[:4], byteorder='big')
    coeff = hash_int % 100
    coefficients.append(coeff)

data = f"{seed_function}bias".encode()
hash_result = hashlib.sha256(data).digest()
hash_int = int.from_bytes(hash_result[:4], byteorder='big')
bias = hash_int % 1000

# Calcola output
output = bias
for i in range(10):
    output += coefficients[i] * numbers[i]

output_finale = output % 10000

print(f"Coefficienti: {coefficients}")
print(f"Bias: {bias}")
print(f"Output intermedio: {output}")
print(f"Output finale: {output_finale}")
```

## Tool Rapido per Calcolo

Puoi usare questo script per verificare i tuoi calcoli:

```python
#!/usr/bin/env python3
import hashlib
import sys

def calculate_output(seed_function, numbers):
    """Calcola output della funzione di validazione"""

    # Deriva coefficienti
    coefficients = []
    for i in range(10):
        data = f"{seed_function}coefficient{i}".encode()
        hash_result = hashlib.sha256(data).digest()
        hash_int = int.from_bytes(hash_result[:4], byteorder='big')
        coeff = hash_int % 100
        coefficients.append(coeff)

    # Deriva bias
    data = f"{seed_function}bias".encode()
    hash_result = hashlib.sha256(data).digest()
    hash_int = int.from_bytes(hash_result[:4], byteorder='big')
    bias = hash_int % 1000

    # Calcola output
    output = bias
    for i, num in enumerate(numbers):
        output += coefficients[i] * num

    output_finale = output % 10000

    return {
        "coefficients": coefficients,
        "bias": bias,
        "raw_output": output,
        "final_output": output_finale
    }

if __name__ == "__main__":
    # Esempio
    seed_function = "0x1f2e3d4c5b6a79880abcdef123456789"
    numbers = [347, 885, 171, 703, 465, 888, 249, 663, 923, 437]

    result = calculate_output(seed_function, numbers)

    print("=" * 60)
    print("CALCOLO FUNZIONE DI VALIDAZIONE")
    print("=" * 60)
    print(f"\nSeed Function: {seed_function}")
    print(f"\nNumeri Player: {numbers}")
    print(f"\nCoefficienti: {result['coefficients']}")
    print(f"Bias: {result['bias']}")
    print(f"\nOutput Grezzo: {result['raw_output']}")
    print(f"OUTPUT FINALE: {result['final_output']}")
    print("=" * 60)
```

Salva come `calculate_output.py` e usa:

```bash
python calculate_output.py
```

## Come Ottenere seed_function dal Backend

Durante il gioco, dopo che tutti hanno fatto commitment, ottieni il `seed_function`:

```bash
curl http://localhost:8000/api/game/{game_id} | jq '.seed_function'
```

Esempio output:
```json
"0x1f2e3d4c5b6a79880abcdef123456789..."
```

## Verifica Output

Per verificare che il backend calcoli correttamente:

1. Ottieni `seed_function` dal gioco
2. Ottieni i numeri finali del giocatore (dopo variazioni)
3. Calcola manualmente con lo script sopra
4. Confronta con l'output dichiarato dal giocatore

**Devono coincidere esattamente!**

## Note Importanti

1. **Deterministico**: Stessi numeri + stesso seed_function = sempre stesso output
2. **Non lineare (per strategia)**: Non c'è modo ovvio di massimizzare senza provare
3. **Fair**: Tutti i giocatori usano stessa funzione (generata dopo commitment)
4. **Verificabile**: Chiunque può ricalcolare gli output

## Sistema XPF Aggiornato

- **Start**: 10 XPF per giocatore
- **Variazioni**: 1 XPF per variazione (max 9 variazioni)
- **Giocata finale**: 1 XPF
- **Totale**: Tutti arrivano a 0 XPF dopo 9 variazioni + giocata
- **Reward vincitore**: 100 XPF (solo il vincitore)
- **Perdenti**: Restano a 0 XPF

**Fine gioco:**
- Player 1: 0 XPF
- Player 2 (vincitore): 100 XPF
- Player 3: 0 XPF

---

**Buon calcolo! 🧮**
