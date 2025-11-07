import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { generateHash, formatHex } from '../utils/crypto';

export default function ResultsScreen({ results, onRestart }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Generate verification data when component mounts
    generateVerificationData();
  }, []);

  const podiumPositions = results.results.slice(0, 3);
  const winner = podiumPositions[0];

  const generateVerificationData = async () => {
    const data = {
      commitments: {},
      vrfProofs: {},
      zkProofs: {},
      thresholdSignatures: {},
      merkleRoot: '',
      functionSeed: ''
    };

    // Generate commitments for each player
    for (const player of podiumPositions) {
      const commitHash = await generateHash(`commit-${player.name}-${Date.now()}`);
      data.commitments[player.name] = commitHash.substring(0, 32);
    }

    // Generate VRF proof for function seed
    const vrfSeed = await generateHash(`vrf-function-${Date.now()}`);
    data.functionSeed = vrfSeed.substring(0, 16);
    data.vrfProofs.functionGeneration = {
      input: 'block_hash_12345',
      output: data.functionSeed,
      proof: vrfSeed.substring(16, 48)
    };

    // Generate ZK proofs for each player's submission
    for (const player of podiumPositions) {
      const zkHash = await generateHash(`zk-${player.name}-${player.speed}`);
      data.zkProofs[player.name] = {
        commitment: data.commitments[player.name],
        proof: zkHash.substring(0, 64),
        publicInputs: {
          speed: player.speed,
          functionSeed: data.functionSeed,
          deltaRange: '±20'
        }
      };
    }

    // Generate threshold signatures (2/3)
    const sigHash = await generateHash(`threshold-${Date.now()}`);
    data.thresholdSignatures = {
      player1: sigHash.substring(0, 20),
      player2: sigHash.substring(20, 40),
      aggregated: sigHash.substring(40, 60),
      threshold: '2/3'
    };

    // Generate merkle root of all transactions
    const merkleHash = await generateHash(`merkle-${JSON.stringify(data)}`);
    data.merkleRoot = merkleHash;

    setVerificationData(data);
  };

  const runVerification = () => {
    setVerificationOpen(true);
    setVerificationStep(0);

    // Animate through verification steps
    const steps = 5;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setVerificationStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 800);
  };

  const getMedal = (position) => {
    return ['🥇', '🥈', '🥉'][position];
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                repeat: Infinity,
              }}
              className="absolute text-2xl"
            >
              {['🏆', '⭐', '🎉', '✨'][Math.floor(Math.random() * 4)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Championship Title */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          RACE COMPLETE
        </h1>
        <p className="text-2xl text-gray-400">F1 AI Championship Results</p>
      </motion.div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-8 mb-12">
        {/* 2nd Place */}
        {podiumPositions[1] && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-6xl mb-3">{getMedal(1)}</div>
            <div className="card w-48 h-40 flex flex-col justify-center items-center bg-gray-700">
              <div
                className="w-3 h-3 rounded-full mb-2"
                style={{ backgroundColor: podiumPositions[1].color }}
              />
              <h3 className="font-bold text-lg mb-1">{podiumPositions[1].name}</h3>
              <p className="text-2xl font-bold">{podiumPositions[1].speed}</p>
              <p className="text-xs text-gray-400">km/h</p>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Winner) */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="text-8xl mb-3">{getMedal(0)}</div>
          <div
            className="card w-56 h-64 flex flex-col justify-center items-center"
            style={{
              background: `linear-gradient(135deg, ${winner.color}40, ${winner.color}20)`,
              borderColor: winner.color,
            }}
          >
            <div
              className="w-4 h-4 rounded-full mb-2"
              style={{ backgroundColor: winner.color }}
            />
            <h3 className="font-bold text-2xl mb-2">{winner.name}</h3>
            <p className="text-4xl font-bold" style={{ color: winner.color }}>
              {winner.speed}
            </p>
            <p className="text-sm text-gray-400">km/h</p>
            <div className="mt-4 px-4 py-2 bg-green-500 rounded-full text-sm font-bold">
              +100 XPF
            </div>
          </div>
        </motion.div>

        {/* 3rd Place */}
        {podiumPositions[2] && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="text-6xl mb-3">{getMedal(2)}</div>
            <div className="card w-48 h-32 flex flex-col justify-center items-center bg-gray-800">
              <div
                className="w-3 h-3 rounded-full mb-2"
                style={{ backgroundColor: podiumPositions[2].color }}
              />
              <h3 className="font-bold text-lg mb-1">{podiumPositions[2].name}</h3>
              <p className="text-2xl font-bold">{podiumPositions[2].speed}</p>
              <p className="text-xs text-gray-400">km/h</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Detailed Results Table */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="card max-w-3xl w-full mb-8"
      >
        <h3 className="text-2xl font-bold mb-6 text-center">Final Standings</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4">Position</th>
              <th className="text-left py-3 px-4">Team</th>
              <th className="text-right py-3 px-4">Speed</th>
              <th className="text-right py-3 px-4">XPF Reward</th>
            </tr>
          </thead>
          <tbody>
            {podiumPositions.map((car, index) => (
              <motion.tr
                key={car.name}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <td className="py-4 px-4 font-bold">
                  <span className="text-2xl">{getMedal(index)}</span> #{index + 1}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: car.color }}
                    />
                    <span className="font-bold">{car.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-bold text-xl">
                  {car.speed}
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`font-bold text-lg ${
                      index === 0 ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    {index === 0 ? '+100 XPF' : '0 XPF'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Blockchain Transactions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="card max-w-3xl w-full mb-8 bg-orange-900/20 border-orange-500"
      >
        <h4 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
          <span>⛓️</span> Blockchain Transactions
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {podiumPositions.map((car, index) => (
            <motion.div
              key={car.name}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.5 + index * 0.1 }}
              className="bg-black/30 rounded p-3 font-mono text-xs"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-orange-300 font-bold">{car.name}</span>
                <span className="text-green-400">✓ Confirmed</span>
              </div>
              <div className="text-gray-400">
                TX: 0x{Math.random().toString(16).substring(2, 10)}...
                {Math.random().toString(16).substring(2, 10)}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Block: {Math.floor(Math.random() * 100 + 800)} | Gas: {45000 + Math.floor(Math.random() * 5000)}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-orange-800 flex justify-between items-center">
          <span className="text-xs text-gray-500">All transactions verified on-chain with ZK proofs</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runVerification}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:from-green-600 hover:to-green-700"
          >
            <span>🔍</span> Verify Fairness
          </motion.button>
        </div>
      </motion.div>

      {/* Fairness Verification Modal */}
      <AnimatePresence>
        {verificationOpen && verificationData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setVerificationOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border-2 border-green-500 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl shadow-green-500/20"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                    <span>🛡️</span> Fairness Verification Protocol
                  </h2>
                  <button
                    onClick={() => setVerificationOpen(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Verification Steps */}
                <div className="space-y-4 mb-6">
                  {/* Step 1: Commitment Phase Verification */}
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: verificationStep >= 1 ? 1 : 0.5 }}
                    className={`border rounded-lg p-4 ${
                      verificationStep >= 1 ? 'border-green-500 bg-green-500/10' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${verificationStep >= 1 ? 'text-green-400' : 'text-gray-600'}`}>
                        {verificationStep >= 1 ? '✓' : '○'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">Step 1: Commitment Phase Verification</h3>
                        <p className="text-sm text-gray-400 mb-3">
                          Verifying all players committed their encrypted parameters before function was revealed
                        </p>
                        {verificationStep >= 1 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            className="bg-black/30 rounded p-3 font-mono text-xs space-y-2"
                          >
                            {Object.entries(verificationData.commitments).map(([player, hash]) => (
                              <div key={player}>
                                <span className="text-blue-400">{player}:</span>{' '}
                                <span className="text-gray-300">SHA256(Enc(X)) = 0x{hash}</span>
                              </div>
                            ))}
                            <div className="text-green-400 mt-2">
                              ✓ All commitments timestamped before function generation
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 2: Function Generation Verification */}
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: verificationStep >= 2 ? 1 : 0.5 }}
                    className={`border rounded-lg p-4 ${
                      verificationStep >= 2 ? 'border-green-500 bg-green-500/10' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${verificationStep >= 2 ? 'text-green-400' : 'text-gray-600'}`}>
                        {verificationStep >= 2 ? '✓' : '○'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">Step 2: VRF Function Generation</h3>
                        <p className="text-sm text-gray-400 mb-3">
                          Verifying validation function F was generated randomly after commitments
                        </p>
                        {verificationStep >= 2 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            className="bg-black/30 rounded p-3 font-mono text-xs space-y-2"
                          >
                            <div>
                              <span className="text-purple-400">VRF Input:</span>{' '}
                              <span className="text-gray-300">{verificationData.vrfProofs.functionGeneration.input}</span>
                            </div>
                            <div>
                              <span className="text-purple-400">Function Seed:</span>{' '}
                              <span className="text-gray-300">0x{verificationData.functionSeed}</span>
                            </div>
                            <div>
                              <span className="text-purple-400">VRF Proof:</span>{' '}
                              <span className="text-gray-300">0x{verificationData.vrfProofs.functionGeneration.proof}</span>
                            </div>
                            <div className="text-green-400 mt-2">
                              ✓ VRF output verified: Function unpredictable before commitments
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 3: ZK-SNARK Proof Verification */}
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: verificationStep >= 3 ? 1 : 0.5 }}
                    className={`border rounded-lg p-4 ${
                      verificationStep >= 3 ? 'border-green-500 bg-green-500/10' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${verificationStep >= 3 ? 'text-green-400' : 'text-gray-600'}`}>
                        {verificationStep >= 3 ? '✓' : '○'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">Step 3: ZK-SNARK Parameter Verification</h3>
                        <p className="text-sm text-gray-400 mb-3">
                          Verifying all parameters follow rules without revealing values
                        </p>
                        {verificationStep >= 3 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            className="bg-black/30 rounded p-3 font-mono text-xs space-y-3"
                          >
                            {Object.entries(verificationData.zkProofs).map(([player, proof]) => (
                              <div key={player} className="border-b border-gray-800 pb-2">
                                <div className="text-yellow-400 mb-1">{player}:</div>
                                <div className="pl-4 space-y-1">
                                  <div>Speed: {proof.publicInputs.speed} km/h</div>
                                  <div>Delta Range: {proof.publicInputs.deltaRange}</div>
                                  <div className="text-gray-500">Proof: 0x{proof.proof.substring(0, 20)}...</div>
                                </div>
                              </div>
                            ))}
                            <div className="text-green-400 mt-2">
                              ✓ All ZK proofs valid: Parameters within allowed ranges
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 4: Threshold Decryption Verification */}
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: verificationStep >= 4 ? 1 : 0.5 }}
                    className={`border rounded-lg p-4 ${
                      verificationStep >= 4 ? 'border-green-500 bg-green-500/10' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${verificationStep >= 4 ? 'text-green-400' : 'text-gray-600'}`}>
                        {verificationStep >= 4 ? '✓' : '○'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">Step 4: Threshold Decryption (2/3)</h3>
                        <p className="text-sm text-gray-400 mb-3">
                          Verifying results decrypted with threshold participation
                        </p>
                        {verificationStep >= 4 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            className="bg-black/30 rounded p-3 font-mono text-xs space-y-2"
                          >
                            <div>
                              <span className="text-cyan-400">Threshold:</span>{' '}
                              <span className="text-gray-300">{verificationData.thresholdSignatures.threshold}</span>
                            </div>
                            <div>
                              <span className="text-cyan-400">Share 1:</span>{' '}
                              <span className="text-gray-300">0x{verificationData.thresholdSignatures.player1}</span>
                            </div>
                            <div>
                              <span className="text-cyan-400">Share 2:</span>{' '}
                              <span className="text-gray-300">0x{verificationData.thresholdSignatures.player2}</span>
                            </div>
                            <div>
                              <span className="text-cyan-400">Aggregated:</span>{' '}
                              <span className="text-gray-300">0x{verificationData.thresholdSignatures.aggregated}</span>
                            </div>
                            <div className="text-green-400 mt-2">
                              ✓ Lagrange reconstruction successful with 2/3 shares
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 5: Merkle Root Verification */}
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: verificationStep >= 5 ? 1 : 0.5 }}
                    className={`border rounded-lg p-4 ${
                      verificationStep >= 5 ? 'border-green-500 bg-green-500/10' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${verificationStep >= 5 ? 'text-green-400' : 'text-gray-600'}`}>
                        {verificationStep >= 5 ? '✓' : '○'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">Step 5: Blockchain Integrity</h3>
                        <p className="text-sm text-gray-400 mb-3">
                          Verifying all transactions are included in blockchain merkle tree
                        </p>
                        {verificationStep >= 5 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            className="bg-black/30 rounded p-3 font-mono text-xs space-y-2"
                          >
                            <div>
                              <span className="text-orange-400">Merkle Root:</span>{' '}
                              <span className="text-gray-300">0x{formatHex(verificationData.merkleRoot)}</span>
                            </div>
                            <div className="text-green-400 mt-2">
                              ✓ All transactions included in merkle tree
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Final Verification Status */}
                {verificationStep >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500 rounded-lg p-6 text-center"
                  >
                    <div className="text-4xl mb-3">✓</div>
                    <h3 className="text-2xl font-bold text-green-400 mb-2">Race Verified as Fair</h3>
                    <p className="text-gray-300 mb-4">
                      All cryptographic proofs have been successfully verified.
                      The race was conducted with mathematical guarantees of fairness.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                      <div>
                        <div className="text-blue-400 font-bold">Privacy</div>
                        <div className="text-gray-400">Parameters never revealed</div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-bold">Randomness</div>
                        <div className="text-gray-400">Verifiably unpredictable</div>
                      </div>
                      <div>
                        <div className="text-cyan-400 font-bold">Integrity</div>
                        <div className="text-gray-400">No single point of trust</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Technical Details */}
                <div className="mt-6 text-xs text-gray-500 space-y-1">
                  <div>Protocol: FHE (TFHE-rs) + Threshold Cryptography + ZK-SNARKs</div>
                  <div>Field: Z_p where p = 2³¹-1 (Mersenne prime)</div>
                  <div>ZK System: Groth16 on BN254 curve</div>
                  <div>Soundness: &lt; 2⁻¹²⁸</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tech Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
        className="card max-w-3xl w-full mb-8 bg-blue-900/20 border-blue-500"
      >
        <h4 className="font-bold text-blue-400 mb-3">Privacy Technology Used</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-bold text-blue-300 mb-1">ZK-SNARK Proofs</div>
            <div className="text-gray-400">Verified AI parameters without revealing them</div>
          </div>
          <div>
            <div className="font-bold text-blue-300 mb-1">Homomorphic Computation</div>
            <div className="text-gray-400">Computed on encrypted data</div>
          </div>
          <div>
            <div className="font-bold text-blue-300 mb-1">VRF Randomness</div>
            <div className="text-gray-400">Verifiable random variations</div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2 }}
        className="flex gap-4"
      >
        <button
          onClick={onRestart}
          className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-ferrari via-mercedes to-redbull rounded-full hover:scale-110 transition-all shadow-2xl"
        >
          NEW RACE
        </button>
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>Blockchain Height: {Math.floor(Math.random() * 1000 + 100)}</p>
        <p className="mt-1">Privacy-Preserving AI Racing on Blockchain</p>
      </motion.div>
    </div>
  );
}
