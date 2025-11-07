# Guida Integrazione Frontend

Questa guida ti mostra come collegare il tuo frontend al backend.

## Architettura

```
Frontend (React/Vue/Angular)
    ↓
REST API (http://localhost:8000/api/*)
    ↓
Backend Python (FastAPI)
```

## Setup Base

### 1. Configurazione API Client

```javascript
// api/client.js
const API_BASE = 'http://localhost:8000/api';

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
};
```

### 2. WebSocket per Real-Time

```javascript
// api/websocket.js
export class GameWebSocket {
  constructor(gameId) {
    this.ws = new WebSocket(`ws://localhost:8000/ws/${gameId}`);
    this.listeners = new Map();

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.listeners.get(message.type)?.forEach(cb => cb(message));
    };
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  disconnect() {
    this.ws.close();
  }
}
```

## Flusso UI Completo

### Schermata 1: Lobby

```javascript
// pages/Lobby.jsx
import { apiClient } from '../api/client';

export function Lobby() {
  const [walletAddress, setWalletAddress] = useState('');
  const [game, setGame] = useState(null);

  const createGame = async () => {
    const game = await apiClient.post('/game/create', { max_players: 3 });
    setGame(game);
  };

  const joinGame = async () => {
    await apiClient.post(`/game/${game.game_id}/register`, {
      player_address: walletAddress
    });
    // Aggiorna stato
    const updated = await apiClient.get(`/game/${game.game_id}`);
    setGame(updated);
  };

  return (
    <div>
      <h1>F1 AI Game - Lobby</h1>

      <input
        placeholder="Your wallet address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />

      {!game && (
        <button onClick={createGame}>Create New Game</button>
      )}

      {game && (
        <>
          <div>
            <h2>Game: {game.game_id}</h2>
            <p>Status: {game.status}</p>
            <p>Players: {game.players.length}/{game.max_players}</p>
          </div>

          {game.players.length < game.max_players && (
            <button onClick={joinGame}>Join Game</button>
          )}

          {game.status === 'RANDOMNESS_FULFILLED' && (
            <button onClick={() => navigate('/commitment')}>
              Proceed to Commitment
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

### Schermata 2: Commitment Phase

```javascript
// pages/CommitmentPhase.jsx
export function CommitmentPhase({ gameId, playerAddress }) {
  const [numbers, setNumbers] = useState([]);
  const [keys, setKeys] = useState(null);
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    const game = await apiClient.get(`/game/${gameId}`);
    const player = game.players.find(p => p.address === playerAddress);

    if (player.seed_player) {
      // Deriva numeri
      const { numbers } = await apiClient.post('/crypto/derive-numbers', {
        seed_player: player.seed_player
      });
      setNumbers(numbers);

      // Genera keypair
      const keypair = await apiClient.post('/crypto/generate-keypair');
      setKeys(keypair);
    }
  };

  const submitCommitment = async () => {
    // Simula cifratura (in produzione faresti cifratura vera client-side)
    const encrypted = numbers.map(n => `enc_${n}`);

    // Genera ZK proof
    const game = await apiClient.get(`/game/${gameId}`);
    const player = game.players.find(p => p.address === playerAddress);

    const { zk_proof } = await apiClient.post('/crypto/generate-zk-proof-commitment', {
      seed_player: player.seed_player,
      numbers: numbers,
      encrypted_numbers: encrypted,
      public_key: keys.public_key
    });

    // Submit commitment
    await apiClient.post(`/game/${gameId}/commitment`, {
      player_address: playerAddress,
      public_key: keys.public_key,
      encrypted_numbers: encrypted,
      zk_proof: zk_proof
    });

    setCommitted(true);
  };

  return (
    <div>
      <h1>Commitment Phase</h1>

      {numbers.length > 0 && (
        <div>
          <h2>Your Numbers (visible only to you)</h2>
          <div className="numbers-grid">
            {numbers.map((num, i) => (
              <div key={i} className="number-card">
                <span>#{i}</span>
                <strong>{num}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {keys && !committed && (
        <button onClick={submitCommitment}>
          Submit Commitment (Lock Numbers)
        </button>
      )}

      {committed && (
        <div className="success">
          ✅ Commitment submitted! Waiting for other players...
        </div>
      )}
    </div>
  );
}
```

### Schermata 3: Variations

```javascript
// pages/VariationsPhase.jsx
export function VariationsPhase({ gameId, playerAddress }) {
  const [currentNumbers, setCurrentNumbers] = useState([]);
  const [variations, setVariations] = useState([]);
  const [xpfBalance, setXpfBalance] = useState(10);
  const [selectedVariation, setSelectedVariation] = useState(0);

  useEffect(() => {
    loadInitialNumbers();
  }, []);

  const loadInitialNumbers = async () => {
    // Carica numeri iniziali dal local storage o deriva di nuovo
    const game = await apiClient.get(`/game/${gameId}`);
    const player = game.players.find(p => p.address === playerAddress);

    const { numbers } = await apiClient.post('/crypto/derive-numbers', {
      seed_player: player.seed_player
    });

    // Calcola output iniziale
    const initialOutput = calculateOutput(numbers, game);

    setCurrentNumbers(numbers);
    setVariations([{
      index: 0,
      numbers: numbers,
      output: initialOutput,
      label: 'Initial'
    }]);
  };

  const generateVariation = async () => {
    if (xpfBalance <= 1) {
      alert('Need at least 1 XPF remaining to play!');
      return;
    }

    // Request variazione
    await apiClient.post(`/game/${gameId}/variation/request`, {
      player_address: playerAddress
    });

    // Compute variazione
    const variation = await apiClient.post(`/game/${gameId}/variation/compute`, {
      player_address: playerAddress,
      current_numbers: currentNumbers
    });

    setVariations([...variations, {
      index: variation.variation_index + 1,
      numbers: variation.new_numbers,
      output: variation.output,
      deltas: variation.deltas,
      label: `Variation ${variation.variation_index + 1}`
    }]);

    setCurrentNumbers(variation.new_numbers);
    setXpfBalance(variation.xpf_remaining);
  };

  const submitFinalChoice = async () => {
    const chosen = variations[selectedVariation];
    const game = await apiClient.get(`/game/${gameId}`);
    const player = game.players.find(p => p.address === playerAddress);

    // Genera ZK proof finale
    const { zk_proof } = await apiClient.post('/crypto/generate-zk-proof-final', {
      seed_player: player.seed_player,
      seed_function: game.seed_function,
      output_declared: chosen.output,
      variations_count: variations.length - 1
    });

    // Submit
    await apiClient.post(`/game/${gameId}/submit-final`, {
      player_address: playerAddress,
      output_declared: chosen.output,
      encrypted_state_hash: '0xhash',
      variations_count: variations.length - 1,
      zk_proof: zk_proof
    });

    navigate('/results');
  };

  return (
    <div>
      <h1>Generate Variations</h1>

      <div className="xpf-display">
        <span>XPF Remaining: {xpfBalance}</span>
        <span>Variations: {variations.length - 1}/9</span>
      </div>

      <div className="variations-list">
        {variations.map((v, i) => (
          <div
            key={i}
            className={`variation-card ${i === selectedVariation ? 'selected' : ''}`}
            onClick={() => setSelectedVariation(i)}
          >
            <h3>{v.label}</h3>
            <div className="output">Output: {v.output}</div>
            {v.deltas && (
              <div className="deltas">
                Deltas: {v.deltas.map(d => d > 0 ? `+${d}` : d).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="actions">
        <button
          onClick={generateVariation}
          disabled={xpfBalance <= 1 || variations.length >= 10}
        >
          Generate Variation (1 XPF)
        </button>

        <button
          onClick={submitFinalChoice}
          className="submit-btn"
        >
          Submit Choice (1 XPF)
        </button>
      </div>
    </div>
  );
}
```

### Schermata 4: Results

```javascript
// pages/Results.jsx
export function Results({ gameId }) {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const ws = new GameWebSocket(gameId);

    ws.on('game_state_changed', (msg) => {
      if (msg.new_status === 'COMPLETED') {
        loadResults();
      }
    });

    loadResults();
    const interval = setInterval(loadResults, 2000);

    return () => {
      ws.disconnect();
      clearInterval(interval);
    };
  }, []);

  const loadResults = async () => {
    const gameData = await apiClient.get(`/game/${gameId}`);
    setGame(gameData);
  };

  if (!game || game.status !== 'COMPLETED') {
    return (
      <div>
        <h1>Waiting for Results...</h1>
        <p>All players must submit their choices</p>
        <Spinner />
      </div>
    );
  }

  const sortedPlayers = [...game.players].sort((a, b) =>
    (b.final_submission?.output_declared || 0) -
    (a.final_submission?.output_declared || 0)
  );

  return (
    <div>
      <h1>Game Results</h1>

      <div className="winner-card">
        <h2>🏆 Winner</h2>
        <h3>{game.winner}</h3>
        <p>Output: {game.winning_output}</p>
      </div>

      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Output</th>
            <th>Variations</th>
            <th>XPF Spent</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((p, i) => (
            <tr key={p.address} className={i === 0 ? 'winner-row' : ''}>
              <td>{i + 1}</td>
              <td>{p.address}</td>
              <td>{p.final_submission?.output_declared || '-'}</td>
              <td>{p.final_submission?.variations_count || 0}</td>
              <td>{p.xpf_spent}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => navigate('/')}>
        New Game
      </button>
    </div>
  );
}
```

## Styling Suggerito

```css
/* styles/game.css */

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.number-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.number-card strong {
  display: block;
  font-size: 2rem;
  margin-top: 0.5rem;
}

.xpf-display {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-weight: 600;
}

.variations-list {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem 0;
}

.variation-card {
  min-width: 200px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.variation-card.selected {
  border-color: #667eea;
  background: #edf2f7;
  transform: scale(1.05);
}

.variation-card:hover {
  border-color: #cbd5e0;
}

.output {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0.5rem 0;
}

.winner-card {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  margin: 2rem 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.winner-row {
  background: #fef5e7;
  font-weight: 600;
}
```

## Testing Frontend

1. **Avvia backend**:
   ```bash
   ./start.sh
   ```

2. **Testa API con curl**:
   ```bash
   curl http://localhost:8000/api/health
   ```

3. **Integra nel tuo frontend**:
   - Copia il codice API client
   - Implementa le schermate
   - Connetti gli endpoint

## Best Practices

1. **Error Handling**:
   ```javascript
   try {
     await apiClient.post('/game/create', data);
   } catch (error) {
     toast.error(`Failed: ${error.message}`);
   }
   ```

2. **Loading States**:
   ```javascript
   const [loading, setLoading] = useState(false);

   const doAction = async () => {
     setLoading(true);
     try {
       await apiClient.post('/endpoint', data);
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Polling per Updates**:
   ```javascript
   useEffect(() => {
     const interval = setInterval(async () => {
       const game = await apiClient.get(`/game/${gameId}`);
       setGame(game);
     }, 2000);

     return () => clearInterval(interval);
   }, [gameId]);
   ```

4. **Local Storage per Persistenza**:
   ```javascript
   // Salva numeri derivati
   localStorage.setItem(`numbers_${gameId}`, JSON.stringify(numbers));

   // Recupera
   const saved = JSON.parse(localStorage.getItem(`numbers_${gameId}`));
   ```

## Deploy

### Backend (Heroku/Railway)

```bash
# Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify)

Aggiorna API URL:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

Buona codifica! 🚀
