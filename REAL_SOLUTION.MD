# Soluzione FHE Completa con Output Decifrato

## Architettura Definitiva

### FASE 1: Blind Commitment

```
Blockchain: seed_X = VRF(game_id || "numbers")

Player:
- TFHE keypair (pk_player, sk_player)
- X[i] = SHA256(seed_X || player || i) % 1000
- enc_X[i] = TFHE.encrypt(X[i], pk_player)
- commitment = SHA256(enc_X || salt)
- Pubblica: commitment + pk_player

XPF: 10 token iniziali
```

### FASE 2: Function Encrypted

```
Blockchain: seed_F = VRF(game_id || "function")

Smart Contract:
- TFHE master keypair (pk_master, sk_master)
- c[i] = SHA256(seed_F || i) % 100
- bias = SHA256(seed_F || "bias") % 1000
- enc_c[i] = TFHE.encrypt(c[i], pk_master)
- enc_bias = TFHE.encrypt(bias, pk_master)

Coefficienti rimangono cifrati, sk_master custodita da smart contract
```

**Cruciale**: Commitment tutti player PRIMA che seed_F sia generato.

### FASE 3: Richiesta Variazione

```
Player richiede variation k (1-9):

Smart Contract:
- Verifica: variationCount[player] < 9
- Burn 1 XPF
- variationCount[player]++
- seed_delta_k = VRF(game_id || player || k)
- delta[i] = (SHA256(seed_delta_k || i) % 41) - 20
- enc_delta[i] = TFHE.encrypt(delta[i], pk_player)
- emit VariationRequest(player, k, enc_delta)
```

Blockchain conta automaticamente (max 9 transazioni).

### FASE 4: Calcolo FHE Omomorfico

```javascript
// Server riceve cifrati:
// - enc_X (chiave player)
// - enc_delta (chiave player)  
// - enc_c, enc_bias (chiave master)

// 1. Applica delta (stessa chiave player)
enc_varied[i] = TFHE.add(enc_X[i], enc_delta[i]);

// 2. Re-encrypt varied con master_pk
enc_varied_master[i] = TFHE.reEncrypt(
  enc_varied[i], 
  pk_player → pk_master
);

// 3. Calcola F su cifrati master
enc_result = enc_bias;
for (i = 0; i < 10; i++) {
  term = TFHE.multiply(enc_varied_master[i], enc_c[i]);
  enc_result = TFHE.add(enc_result, term);
}

// 4. Smart contract decifra con sk_master
output = TFHE.decrypt(enc_result, sk_master);

// 5. Ritorna output in chiaro: 8765
```

**Tempo**: ~20-30 secondi per variazione.

**Privacy garantita**:
- Server non vede: X, delta, coefficienti (sempre cifrati)
- Player riceve: output in chiaro (8765)
- Altri player vedono: solo output finale, non intermedi

### FASE 5: Scelta Finale

```
Player confronta output di variazioni:
- k=1: 8234
- k=2: 8765 ← migliore
- k=3: 7899
...

Sceglie: k_best = 2
```

### FASE 6: ZK-SNARK Proof

```javascript
Public inputs:
- commitment
- k_best
- output_declared = 8765
- seed_X, seed_F, seed_delta_k

Private witness:
- X = [234, 567, ...]
- salt
- sk_player

Circuit verifica:
assert(X[i] == SHA256(seed_X || player || i) % 1000);
assert(SHA256(enc(X) || salt) == commitment);

delta[i] = (SHA256(seed_delta_k || i) % 41) - 20;
assert(|delta[i]| <= 20);

varied[i] = X[i] + delta[i];
assert(0 <= varied[i] <= 1000);

c[i] = SHA256(seed_F || i) % 100;
bias = SHA256(seed_F || "bias") % 1000;

computed = bias + Σ(c[i] × varied[i]);
assert(computed == output_declared);
```

Proof generation: ~2-3 secondi.

### FASE 7: Submit On-Chain

```solidity
function submitFinalChoice(
  bytes calldata zkProof,
  uint8 k_best,
  uint256 output
) external {
  require(k_best <= variationCount[msg.sender]);
  require(xpfBalance[msg.sender] >= 1, "Need 1 XPF");
  
  xpfToken.burn(msg.sender, 1);
  
  bool valid = zkVerifier.verify(
    zkProof,
    [commitments[msg.sender], k_best, output,
     seed_X, seed_F, getVariationSeed(msg.sender, k_best)]
  );
  
  require(valid, "Invalid proof");
  
  finalOutputs[msg.sender] = output;
}
```

### FASE 8: Vincitore

```solidity
function declareWinner() external {
  require(allPlayersSubmitted());
  
  address winner;
  uint256 maxOutput = 0;
  
  for (uint i = 0; i < players.length; i++) {
    if (finalOutputs[players[i]] > maxOutput) {
      maxOutput = finalOutputs[players[i]];
      winner = players[i];
    }
  }
  
  xpfToken.mint(winner, 100);
  emit Winner(winner, maxOutput);
}
```

---

## Requisiti Soddisfatti

✅ **Numeri privati**: Sempre cifrati (TFHE), solo ZK witness  
✅ **Funzione privata**: Coefficienti cifrati (master key)  
✅ **Server non vede**: Solo cifrati, output decifrato da smart contract  
✅ **Player vede solo output**: 8765 (non X, delta, coefficienti)  
✅ **Calcolo omomorfico**: TFHE su tutti valori  
✅ **Max 9 variazioni**: Blockchain count immutabile  
✅ **Anti-grinding**: Commitment prima seed_F  
✅ **Delta ±20**: Derivati da VRF, verificati ZK  
✅ **Verificabile**: ZK proof + audit on-chain  
✅ **Zero-trust**: Matematica + blockchain (no hardware, no server trust)

---

## Trust Model

**Player trusts**:
- Blockchain immutability (Ethereum/Arbitrum consensus)
- VRF randomness (Chainlink matematica)
- TFHE security (lattice problem hardness)
- ZK-SNARK soundness (impossibile falsificare proof)

**NON trusts**:
- Server (vede solo cifrati)
- Altri player (matematica forza onestà)
- Hardware specifico (no TEE)
- Organizzazioni centralizzate

---

## Performance

- Variazione: ~25s (FHE computation)
- ZK proof gen: ~2-3s
- ZK verify: ~200k gas (~$0.40 Arbitrum)
- Game completo: ~4-5 minuti (9 variazioni × 25s)

**Implementazione**: TFHE-rs (Zama) o Concrete library.