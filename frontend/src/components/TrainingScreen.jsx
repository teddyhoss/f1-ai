import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CryptoPanel from './CryptoPanel';
import TechDetailsModal from './TechDetailsModal';
import {
  generateZKProof,
  encryptParameters,
  generateVRF,
  generateTransactionId,
  generateKeyPair,
  homomorphicCompute,
} from '../utils/crypto';

export default function TrainingScreen({
  gameData,
  onTrainingComplete
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [variations, setVariations] = useState([[], [], []]); // 3 players
  const [currentVariation, setCurrentVariation] = useState([0, 0, 0]); // Current variation index per player
  const [isTraining, setIsTraining] = useState(false);
  const [bestVariations, setBestVariations] = useState([null, null, null]); // Best variation per player
  const [cryptoData, setCryptoData] = useState(null);
  const [showCryptoPanel, setShowCryptoPanel] = useState(false);
  const [playerKeys, setPlayerKeys] = useState([null, null, null]);
  const [selectedVariationForDetails, setSelectedVariationForDetails] = useState(null);
  const [showTechModal, setShowTechModal] = useState(false);
  const [factoryParams, setFactoryParams] = useState([null, null, null]); // Factory parameters

  const players = gameData.players || [];

  // Factory parameter sets for each team (initial values from factory)
  const FACTORY_PARAMETERS = [
    [650, 720, 580, 690, 710, 640, 700, 680, 660, 695], // Ferrari factory config
    [670, 700, 620, 710, 690, 655, 720, 675, 685, 680], // Mercedes factory config
    [680, 710, 640, 700, 705, 670, 690, 695, 675, 685], // Red Bull factory config
  ];

  // Generate keys and set factory parameters for each player on mount
  useEffect(() => {
    const initializePlayers = async () => {
      // Generate keys
      const keys = await Promise.all(
        players.map(player => generateKeyPair(player.address))
      );
      setPlayerKeys(keys);

      // Set factory parameters with crypto data for each player
      const factoryVariations = await Promise.all(
        players.map(async (player, index) => {
          const params = FACTORY_PARAMETERS[index];
          const playerKey = keys[index];

          // Encrypt factory parameters
          const encryptedParams = await encryptParameters(params, playerKey.publicKey);

          // Generate initial homomorphic computation
          const homomorphic = await homomorphicCompute(encryptedParams, gameData.gameId);

          // Generate ZK proof for factory params
          const zkProof = await generateZKProof(params, player.address);

          // Generate VRF
          const vrf = await generateVRF(player.address, 0);

          // Transaction for factory commit
          const transactionId = await generateTransactionId('FACTORY_COMMIT', player.address, {
            factoryParams: true,
          });

          return {
            index: -1, // Factory config (before variations)
            parameters: params,
            encryptedParams,
            zkProof,
            vrf,
            speed: homomorphic.output,
            timestamp: Date.now() - 1000 * (3 - index), // Stagger timestamps
            transactionId,
            isFactory: true,
            _debug: homomorphic._debug, // Include validation formula details
          };
        })
      );

      setFactoryParams(factoryVariations);
      setBestVariations(factoryVariations); // Start with factory as best
    };

    if (players.length > 0) {
      initializePlayers();
    }
  }, []);

  // Simulate AI training (variations)
  const handleTrain = async (playerIndex) => {
    if (currentVariation[playerIndex] >= 9) {
      alert('Maximum 9 training sessions reached!');
      return;
    }

    setIsTraining(true);
    setShowCryptoPanel(true);

    const player = players[playerIndex];
    const playerKey = playerKeys[playerIndex];

    if (!playerKey) {
      setIsTraining(false);
      return;
    }

    // Step 1: Generate parameters
    const parameters = generateRandomParameters();
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: Encrypt parameters
    const encryptedParams = await encryptParameters(parameters, playerKey.publicKey);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Generate VRF for randomness
    const vrf = await generateVRF(player.address, currentVariation[playerIndex]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 4: Homomorphic computation (speed calculation)
    const homomorphic = await homomorphicCompute(encryptedParams, gameData.gameId);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 5: Generate ZK proof
    const zkProof = await generateZKProof(parameters, player.address);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 6: Create blockchain transaction
    const transactionId = await generateTransactionId('TRAINING', player.address, {
      variation: currentVariation[playerIndex],
      zkProof: zkProof.proof,
    });

    // Update crypto panel with all data - make it unique for each variation
    setCryptoData({
      zkProof,
      encryptedParams,
      publicKey: playerKey.publicKey,
      vrf,
      homomorphic,
      transactionId,
      blockNumber: 15000000 + Math.floor(Math.random() * 10000) + (currentVariation[playerIndex] * 100),
      gasUsed: 180000 + Math.floor(Math.random() * 50000) + (playerIndex * 10000),
      timestamp: Date.now(),
      playerIndex,
      variationNumber: currentVariation[playerIndex] + 1,
      playerName: player.name || `Player ${playerIndex + 1}`,
    });

    const newVariation = {
      index: currentVariation[playerIndex],
      parameters,
      encryptedParams,
      zkProof,
      vrf,
      speed: homomorphic.output,
      timestamp: Date.now(),
      transactionId,
      _debug: homomorphic._debug, // Include validation formula details
    };

    const newVariations = [...variations];
    newVariations[playerIndex] = [...newVariations[playerIndex], newVariation];
    setVariations(newVariations);

    const newCurrentVariation = [...currentVariation];
    newCurrentVariation[playerIndex]++;
    setCurrentVariation(newCurrentVariation);

    // Update best variation if this is better
    if (!bestVariations[playerIndex] || newVariation.speed > bestVariations[playerIndex].speed) {
      const newBest = [...bestVariations];
      newBest[playerIndex] = newVariation;
      setBestVariations(newBest);
    }

    setIsTraining(false);

    // Don't auto-hide anymore, let user control it</
    // setTimeout(() => setShowCryptoPanel(false), 5000);
  };

  const generateRandomParameters = () => {
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 1000));
  };

  const handleSelectVariation = (playerIndex, variation) => {
    const newBest = [...bestVariations];
    newBest[playerIndex] = variation;
    setBestVariations(newBest);

    // Update crypto panel to show this variation's data
    if (variation.zkProof && variation.encryptedParams) {
      setCryptoData({
        zkProof: variation.zkProof,
        encryptedParams: variation.encryptedParams,
        publicKey: playerKeys[playerIndex]?.publicKey || `0x${Math.random().toString(16).slice(2, 66)}`,
        vrf: variation.vrf,
        homomorphic: {
          output: variation.speed,
          proof: variation.zkProof?.proof?.substring(0, 32) || Math.random().toString(16).slice(2, 34),
          encryptedOutput: `0x${Math.random().toString(16).slice(2, 34)}`,
          verified: true,
          _debug: variation._debug,
        },
        transactionId: variation.transactionId,
        blockNumber: 15000000 + Math.floor(Math.random() * 50000) + (variation.index * 100),
        gasUsed: 180000 + Math.floor(Math.random() * 50000),
        timestamp: variation.timestamp || Date.now(),
        playerIndex,
        variationNumber: variation.index + 1,
        playerName: players[playerIndex]?.name || `Player ${playerIndex + 1}`,
      });
    }
  };

  const handleStartRace = () => {
    // Check all players have selected a variation
    const allReady = bestVariations.every(v => v !== null);
    if (!allReady) {
      alert('All drivers must complete at least one training session!');
      return;
    }

    onTrainingComplete(bestVariations);
  };

  const playerColors = ['ferrari', 'mercedes', 'redbull'];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold mb-2">AI TRAINING CENTER</h2>
        <p className="text-gray-400">Optimize your car's AI parameters to maximize power output</p>
      </motion.div>

      {/* Player Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {players.map((player, index) => (
          <button
            key={player.address}
            onClick={() => {
              setSelectedPlayer(index);
              // Update crypto panel if this player has variations
              if (bestVariations[index]) {
                handleSelectVariation(index, bestVariations[index]);
              }
            }}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedPlayer === index
                ? `bg-${playerColors[index]} text-white shadow-lg`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            style={
              selectedPlayer === index
                ? { backgroundColor: `var(--tw-${playerColors[index]})` }
                : {}
            }
          >
            {player.name || `Player ${index + 1}`}
            <span className="ml-2 text-xs">
              ({currentVariation[index]}/9)
            </span>
          </button>
        ))}
      </div>

      {/* Training Area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Stats */}
        <motion.div
          key={selectedPlayer}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="card"
        >
          <h3 className="text-2xl font-bold mb-4">Current Best Configuration</h3>

          {bestVariations[selectedPlayer] ? (
            <>
              {/* Power Display */}
              <div className="bg-gray-900 rounded-lg p-6 mb-4 text-center">
                <div className="text-sm text-gray-400 mb-2 flex items-center justify-center gap-2">
                  TOTAL POWER
                  {bestVariations[selectedPlayer].isFactory && (
                    <span className="px-2 py-1 bg-blue-600 text-xs rounded">FACTORY</span>
                  )}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent"
                >
                  {bestVariations[selectedPlayer].speed}
                </motion.div>
                <div className="text-sm text-gray-400 mt-2">km/h (F(X) mod p)</div>
              </div>

              {/* Parameters (Hidden/Encrypted) */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-3">AI Parameters (Encrypted)</div>
                <div className="grid grid-cols-5 gap-2">
                  {bestVariations[selectedPlayer].parameters.map((param, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 rounded px-2 py-1 text-center font-mono text-xs blur-sm hover:blur-none transition-all cursor-pointer"
                      title={`Parameter ${i}: ${param}`}
                    >
                      ***
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Parameters encrypted with TFHE-rs • Threshold: 2/3
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => {
                  setSelectedVariationForDetails(bestVariations[selectedPlayer]);
                  setShowTechModal(true);
                }}
                className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                View Crypto Details
              </button>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🏎️</div>
              <p>No training completed yet</p>
              <p className="text-sm mt-2">Click TRAIN AI to start</p>
            </div>
          )}

          {/* XPF Cost */}
          <div className="mt-4 p-3 bg-gray-900 rounded-lg flex justify-between items-center">
            <span className="text-sm text-gray-400">XPF Remaining</span>
            <span className="text-lg font-bold text-green-400">
              {10 - currentVariation[selectedPlayer]}
            </span>
          </div>
        </motion.div>

        {/* Training Controls */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="card"
        >
          <h3 className="text-2xl font-bold mb-4">Training Sessions</h3>

          {/* Train Button */}
          <button
            onClick={() => handleTrain(selectedPlayer)}
            disabled={isTraining || currentVariation[selectedPlayer] >= 9}
            className={`w-full py-6 rounded-lg font-bold text-xl mb-6 transition-all ${
              isTraining
                ? 'bg-gray-600 cursor-not-allowed'
                : currentVariation[selectedPlayer] >= 9
                ? 'bg-gray-700 cursor-not-allowed'
                : `bg-${playerColors[selectedPlayer]} hover:scale-105 active:scale-95`
            }`}
            style={
              !isTraining && currentVariation[selectedPlayer] < 9
                ? { backgroundColor: `var(--tw-${playerColors[selectedPlayer]})` }
                : {}
            }
          >
            {isTraining ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-3">⚙️</span>
                TRAINING AI...
              </span>
            ) : currentVariation[selectedPlayer] >= 9 ? (
              'MAX TRAINING REACHED'
            ) : (
              `TRAIN AI (${9 - currentVariation[selectedPlayer]} left)`
            )}
          </button>

          {/* Variations List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {variations[selectedPlayer].map((variation, index) => (
                <motion.div
                  key={variation.timestamp}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    bestVariations[selectedPlayer]?.timestamp === variation.timestamp
                      ? 'border-green-400 bg-green-900/20'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                  onClick={() => handleSelectVariation(selectedPlayer, variation)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-400">Session #{index + 1}</span>
                      <div className="text-2xl font-bold">{variation.speed} km/h</div>
                    </div>
                    {bestVariations[selectedPlayer]?.timestamp === variation.timestamp && (
                      <div className="text-green-400 text-2xl">✓</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {variations[selectedPlayer].length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No training sessions yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Start Race Button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mt-8"
      >
        <button
          onClick={handleStartRace}
          disabled={!bestVariations.every(v => v !== null)}
          className="px-12 py-4 text-xl font-bold rounded-full transition-all"
          style={
            bestVariations.every(v => v !== null)
              ? {
                  background: 'linear-gradient(to right, #DC0000, #00D2BE, #0600EF)',
                  boxShadow: '0 20px 25px -5px rgba(220, 0, 0, 0.3)',
                  cursor: 'pointer',
                }
              : {
                  background: '#374151',
                  cursor: 'not-allowed',
                }
          }
          onMouseEnter={(e) => {
            if (bestVariations.every(v => v !== null)) {
              e.target.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          START RACE
        </button>

        <div className="mt-4 text-sm text-gray-500">
          All drivers: {bestVariations.filter(v => v !== null).length}/3 ready
        </div>
      </motion.div>

      {/* Crypto Panel Toggle Button */}
      {cryptoData && (
        <button
          onClick={() => setShowCryptoPanel(!showCryptoPanel)}
          className="fixed bottom-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-110"
          title={showCryptoPanel ? "Hide Crypto Panel" : "Show Crypto Panel"}
        >
          <span className="text-xl">{showCryptoPanel ? '🔒' : '🔐'}</span>
          <span className="ml-2 text-sm font-bold">
            {showCryptoPanel ? 'Hide' : 'Crypto'}
          </span>
        </button>
      )}

      {/* Crypto Panel */}
      <CryptoPanel cryptoData={cryptoData} isVisible={showCryptoPanel} />

      {/* Tech Details Modal */}
      <TechDetailsModal
        isOpen={showTechModal}
        onClose={() => setShowTechModal(false)}
        variation={selectedVariationForDetails}
      />
    </div>
  );
}
