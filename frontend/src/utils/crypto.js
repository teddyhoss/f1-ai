// Crypto utility functions for demonstration purposes

/**
 * Generate SHA-256 hash from string data
 */
export async function generateHash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate a simulated ZK-SNARK proof structure
 */
export async function generateZKProof(parameters, seedPlayer) {
  const paramsString = parameters.join(',');
  const commitmentData = `${seedPlayer}-${paramsString}-${Date.now()}`;
  const commitment = await generateHash(commitmentData);

  const witnessData = `witness-${commitment}`;
  const witness = await generateHash(witnessData);

  const proofData = `proof-${witness}-${commitment}`;
  const proof = await generateHash(proofData);

  return {
    commitment: commitment.substring(0, 32),
    witness: witness.substring(0, 32),
    proof: proof.substring(0, 64),
    timestamp: Date.now(),
    algorithm: 'Groth16',
    curve: 'BN254',
    verified: true,
  };
}

/**
 * Simulate RSA encryption
 */
export async function encryptParameters(parameters, publicKey) {
  const encrypted = [];

  for (let i = 0; i < parameters.length; i++) {
    const data = `${publicKey}-${parameters[i]}-${i}`;
    const hash = await generateHash(data);
    encrypted.push({
      index: i,
      original: parameters[i],
      encrypted: `0x${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}`,
      fullHash: hash,
    });
  }

  return encrypted;
}

/**
 * Generate VRF (Verifiable Random Function) output
 */
export async function generateVRF(seedPlayer, nonce) {
  const vrfInput = `${seedPlayer}-${nonce}-${Date.now()}`;
  const hash = await generateHash(vrfInput);

  const randomValue = parseInt(hash.substring(0, 8), 16);

  return {
    input: seedPlayer,
    nonce: nonce,
    seed: hash.substring(0, 16),
    output: randomValue % 10000,
    proof: hash.substring(16, 48),
    verified: true,
  };
}

/**
 * Generate blockchain transaction ID
 */
export async function generateTransactionId(type, player, data) {
  const txData = `${type}-${player}-${JSON.stringify(data)}-${Date.now()}`;
  const hash = await generateHash(txData);
  return `0x${hash}`;
}

/**
 * Generate block hash
 */
export async function generateBlockHash(blockNumber, transactions) {
  const blockData = `block-${blockNumber}-${JSON.stringify(transactions)}-${Date.now()}`;
  const hash = await generateHash(blockData);
  return `0x${hash}`;
}

/**
 * Format hex string for display
 */
export function formatHex(hex, prefixLen = 10, suffixLen = 8) {
  if (!hex) return '';
  if (hex.length <= prefixLen + suffixLen) return hex;
  return `${hex.substring(0, prefixLen)}...${hex.substring(hex.length - suffixLen)}`;
}

/**
 * Generate public/private key pair (simulated)
 */
export async function generateKeyPair(playerAddress) {
  const publicKeyData = `public-${playerAddress}-${Date.now()}`;
  const privateKeyData = `private-${playerAddress}-${Date.now()}`;

  const publicKey = await generateHash(publicKeyData);
  const privateKey = await generateHash(privateKeyData);

  return {
    publicKey: `0x${publicKey}`,
    privateKey: `0x${privateKey}`,
    algorithm: 'RSA-2048',
  };
}

/**
 * Calculate validation function output using the correct formula:
 * F(X) = (c[0]×X[0] + c[1]×X[1] + ... + c[9]×X[9] + bias) % 10000
 *
 * Where coefficients and bias are derived from functionSeed via SHA-256
 */
async function calculateValidationFunction(parameters, functionSeed) {
  // Derive coefficients (c[0] ... c[9])
  const coefficients = [];
  for (let i = 0; i < 10; i++) {
    const data = `${functionSeed}coefficient${i}`;
    const hash = await generateHash(data);
    // Take first 4 bytes (8 hex chars) and apply modulo 100
    const coeff = parseInt(hash.substring(0, 8), 16) % 100;
    coefficients.push(coeff);
  }

  // Derive bias
  const biasData = `${functionSeed}bias`;
  const biasHash = await generateHash(biasData);
  const bias = parseInt(biasHash.substring(0, 8), 16) % 1000;

  // Calculate output: sum of (coefficient × parameter) + bias
  let output = bias;
  for (let i = 0; i < 10; i++) {
    output += coefficients[i] * parameters[i];
  }

  // Apply modulo 10000 to get final output
  const finalOutput = output % 10000;

  return {
    coefficients,
    bias,
    rawOutput: output,
    finalOutput,
  };
}

/**
 * Simulate homomorphic computation with correct validation formula
 */
export async function homomorphicCompute(encryptedParams, functionSeed) {
  // Extract original parameters from encrypted data
  const parameters = encryptedParams.map(p => p.original);

  // Calculate using the correct validation formula
  const validation = await calculateValidationFunction(parameters, functionSeed);

  // Generate proof hash
  const computeData = `homomorphic-${JSON.stringify(encryptedParams)}-${functionSeed}`;
  const resultHash = await generateHash(computeData);

  return {
    output: validation.finalOutput,
    proof: resultHash.substring(0, 32),
    encryptedOutput: `0x${resultHash.substring(32, 64)}`,
    verified: true,
    // Include validation details for debugging
    _debug: {
      coefficients: validation.coefficients,
      bias: validation.bias,
      rawOutput: validation.rawOutput,
    },
  };
}

/**
 * Generate Merkle tree root from transactions
 */
export async function generateMerkleRoot(transactions) {
  if (transactions.length === 0) return '0x0';

  const txHashes = await Promise.all(
    transactions.map(tx => generateHash(JSON.stringify(tx)))
  );

  let currentLevel = txHashes;

  while (currentLevel.length > 1) {
    const nextLevel = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] || left;
      const combined = await generateHash(left + right);
      nextLevel.push(combined);
    }

    currentLevel = nextLevel;
  }

  return `0x${currentLevel[0]}`;
}

/**
 * Create a transaction object
 */
export function createTransaction(type, from, data, gasUsed = 21000) {
  return {
    hash: null, // Will be generated
    type,
    from,
    to: '0xSMARTCONTRACT',
    data,
    timestamp: Date.now(),
    blockNumber: null, // Will be set
    gasUsed,
    status: 'pending',
  };
}

/**
 * Calculate and display validation function details (for demo/debugging)
 * This shows the formula breakdown in console
 */
export async function explainValidation(parameters, functionSeed) {
  const validation = await calculateValidationFunction(parameters, functionSeed);

  console.log('═══════════════════════════════════════════════════════');
  console.log('🧮 VALIDATION FUNCTION CALCULATION');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n📊 Formula: F(X) = (c[0]×X[0] + ... + c[9]×X[9] + bias) % 10000\n');
  console.log('🎲 Function Seed:', functionSeed);
  console.log('\n🔢 Parameters (X):', parameters);
  console.log('⚙️  Coefficients (c):', validation.coefficients);
  console.log('➕ Bias:', validation.bias);
  console.log('\n📈 Calculation:');

  let formula = `${validation.bias}`;
  for (let i = 0; i < 10; i++) {
    formula += ` + ${validation.coefficients[i]}×${parameters[i]}`;
  }
  console.log(`   ${formula}`);

  console.log(`\n💡 Raw Output: ${validation.rawOutput}`);
  console.log(`🎯 Final Output (mod 10000): ${validation.finalOutput} HP`);
  console.log('═══════════════════════════════════════════════════════\n');

  return validation;
}
