import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ResultsScreen({ results, onRestart }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const podiumPositions = results.results.slice(0, 3);
  const winner = podiumPositions[0];

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
              <p className="text-xs text-gray-400">HP</p>
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
            <p className="text-sm text-gray-400">HP</p>
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
              <p className="text-xs text-gray-400">HP</p>
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
              <th className="text-right py-3 px-4">Power</th>
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
        <div className="mt-3 pt-3 border-t border-orange-800 text-xs text-gray-500">
          All transactions verified on-chain with ZK proofs
        </div>
      </motion.div>

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
