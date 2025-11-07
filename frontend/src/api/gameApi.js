import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Player Management
export const createPlayer = async (playerAddress) => {
  const response = await api.post('/players/create', { player_address: playerAddress });
  return response.data;
};

export const getPlayerBalance = async (playerAddress) => {
  const response = await api.get(`/players/${playerAddress}/balance`);
  return response.data;
};

// Game Management
export const createGame = async (players) => {
  const response = await api.post('/game/create', { players });
  return response.data;
};

export const getGameStatus = async (gameId) => {
  const response = await api.get(`/game/${gameId}`);
  return response.data;
};

// Crypto Operations
export const generateKeyPair = async () => {
  const response = await api.get('/crypto/generate-keypair');
  return response.data;
};

export const encryptNumbers = async (publicKey, numbers) => {
  const response = await api.post('/crypto/encrypt', {
    public_key: publicKey,
    numbers,
  });
  return response.data;
};

export const generateZKProofCommitment = async (seedPlayer, numbers, encryptedNumbers, publicKey) => {
  const response = await api.post('/crypto/generate-zk-proof-commitment', {
    seed_player: seedPlayer,
    numbers,
    encrypted_numbers: encryptedNumbers,
    public_key: publicKey,
  });
  return response.data;
};

export const generateZKProofFinal = async (seedPlayer, seedFunction, outputDeclared, variationsCount) => {
  const response = await api.post('/crypto/generate-zk-proof-final', {
    seed_player: seedPlayer,
    seed_function: seedFunction,
    output_declared: outputDeclared,
    variations_count: variationsCount,
  });
  return response.data;
};

// Game Actions
export const commitNumbers = async (gameId, playerAddress, encryptedNumbers, zkProof) => {
  const response = await api.post('/game/commit', {
    game_id: gameId,
    player_address: playerAddress,
    encrypted_numbers: encryptedNumbers,
    zk_proof: zkProof,
  });
  return response.data;
};

export const requestVariation = async (gameId, playerAddress) => {
  const response = await api.post('/game/request-variation', {
    game_id: gameId,
    player_address: playerAddress,
  });
  return response.data;
};

export const computeVariation = async (gameId, playerAddress, numbers, privateKey) => {
  const response = await api.post('/game/compute-variation', {
    game_id: gameId,
    player_address: playerAddress,
    numbers,
    private_key: privateKey,
  });
  return response.data;
};

export const submitFinal = async (gameId, playerAddress, numbers, zkProof) => {
  const response = await api.post('/game/submit-final', {
    game_id: gameId,
    player_address: playerAddress,
    numbers,
    zk_proof: zkProof,
  });
  return response.data;
};

export const finalizeGame = async (gameId) => {
  const response = await api.post(`/game/${gameId}/finalize`);
  return response.data;
};

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
