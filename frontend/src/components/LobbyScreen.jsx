import { motion } from 'framer-motion';

const TEAMS = [
  {
    id: 'player1',
    name: 'Ferrari SF-24',
    color: 'ferrari',
    address: '0xF1_FERRARI',
    driver: 'Leclerc',
    emoji: '🏎️'
  },
  {
    id: 'player2',
    name: 'Mercedes W15',
    color: 'mercedes',
    address: '0xF1_MERCEDES',
    driver: 'Hamilton',
    emoji: '🏎️'
  },
  {
    id: 'player3',
    name: 'Red Bull RB20',
    color: 'redbull',
    address: '0xF1_REDBULL',
    driver: 'Verstappen',
    emoji: '🏎️'
  },
];

export default function LobbyScreen({ onStartRace }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-ferrari via-mercedes to-redbull bg-clip-text text-transparent">
          F1 AI RACING
        </h1>
        <p className="text-xl text-gray-400">
          Train your AI. Optimize your car. Race to victory.
        </p>
      </motion.div>

      {/* Player Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-6xl w-full">
        {TEAMS.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="card hover:scale-105 transition-transform duration-300"
          >
            {/* Team Color Bar */}
            <div
              className={`h-2 rounded-t-lg -mt-6 -mx-6 mb-4 bg-${team.color}`}
              style={{ backgroundColor: `var(--tw-${team.color})` }}
            />

            {/* Team Info */}
            <div className="text-center">
              <div className="text-5xl mb-3">{team.emoji}</div>
              <h3 className="text-2xl font-bold mb-2">{team.name}</h3>
              <p className="text-gray-400 mb-1">Driver: {team.driver}</p>
              <p className="text-xs text-gray-500 font-mono mb-4">{team.address}</p>

              {/* Stats */}
              <div className="bg-gray-900 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">XPF Balance</span>
                  <span className="text-lg font-bold text-green-400">10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className="text-sm text-green-400 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Start Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStartRace}
        className="px-12 py-4 text-2xl font-bold bg-gradient-to-r from-ferrari via-mercedes to-redbull rounded-full shadow-2xl hover:shadow-ferrari/50 transition-all duration-300"
      >
        START RACE
      </motion.button>

      {/* Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-12 text-center text-gray-500 text-sm"
      >
        <p>Privacy-Preserving AI Training on Blockchain</p>
        <p className="mt-1">ZK-SNARK Proofs • Homomorphic Computation • VRF</p>
      </motion.div>
    </div>
  );
}

export { TEAMS };
