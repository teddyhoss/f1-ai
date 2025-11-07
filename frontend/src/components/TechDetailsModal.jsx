import { motion, AnimatePresence } from 'framer-motion';
import { formatHex } from '../utils/crypto';

export default function TechDetailsModal({ isOpen, onClose, variation }) {
  if (!isOpen || !variation) return null;

  const cryptoDetails = {
    parameters: {
      original: variation.parameters,
      encrypted: variation.encryptedParams,
    },
    zkProof: variation.zkProof,
    vrf: variation.vrf,
    transaction: {
      hash: variation.transactionId,
      speed: variation.speed,
    },
    // Include validation formula details if available
    validation: variation._debug || {},
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <div>
              <h2 className="text-3xl font-bold text-blue-400">Technical Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Cryptographic proof and blockchain data
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl"
            >
              ×
            </button>
          </div>

          {/* Parameters Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <span>🔑</span> AI Parameters
            </h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
              <div className="mb-4">
                <div className="text-gray-500 text-xs mb-2">ORIGINAL (hidden)</div>
                <div className="grid grid-cols-5 gap-2">
                  {cryptoDetails.parameters.original.map((param, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 rounded px-3 py-2 text-center"
                    >
                      <div className="text-xs text-gray-500">P{i}</div>
                      <div className="blur-sm hover:blur-none transition-all cursor-pointer">
                        {param}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-gray-500 text-xs mb-2">ENCRYPTED (on blockchain)</div>
                <div className="space-y-1">
                  {cryptoDetails.parameters.encrypted.slice(0, 5).map((enc, i) => (
                    <div key={i} className="text-xs text-yellow-300 break-all">
                      <span className="text-gray-600">#{i}:</span> {enc.encrypted}
                    </div>
                  ))}
                  <div className="text-xs text-gray-600">... and 5 more</div>
                </div>
              </div>
            </div>
          </div>

          {/* ZK-SNARK Proof Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
              <span>✓</span> ZK-SNARK Proof
            </h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
              <pre className="text-green-300 whitespace-pre-wrap break-all">
{JSON.stringify(
  {
    algorithm: cryptoDetails.zkProof.algorithm,
    curve: cryptoDetails.zkProof.curve,
    commitment: `0x${cryptoDetails.zkProof.commitment}`,
    witness: `0x${cryptoDetails.zkProof.witness}`,
    proof: `0x${cryptoDetails.zkProof.proof}`,
    verified: cryptoDetails.zkProof.verified,
    timestamp: new Date(cryptoDetails.zkProof.timestamp).toISOString(),
  },
  null,
  2
)}
              </pre>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Zero-Knowledge Succinct Non-Interactive Argument of Knowledge -
              Proves correctness without revealing private data
            </div>
          </div>

          {/* VRF Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-pink-400 mb-3 flex items-center gap-2">
              <span>🎲</span> Verifiable Random Function
            </h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
              <pre className="text-pink-300 whitespace-pre-wrap break-all">
{JSON.stringify(
  {
    input: cryptoDetails.vrf.input,
    nonce: cryptoDetails.vrf.nonce,
    seed: `0x${cryptoDetails.vrf.seed}`,
    output: cryptoDetails.vrf.output,
    proof: `0x${cryptoDetails.vrf.proof}`,
    verified: cryptoDetails.vrf.verified,
  },
  null,
  2
)}
              </pre>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              VRF provides verifiable randomness for training variations -
              Random but provably fair
            </div>
          </div>

          {/* Transaction Data */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-orange-400 mb-3 flex items-center gap-2">
              <span>⛓️</span> Blockchain Transaction
            </h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">TX Hash:</span>
                  <div className="text-orange-300 break-all text-xs mt-1">
                    {cryptoDetails.transaction.hash}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Power Output:</span>
                  <div className="text-orange-300 text-2xl font-bold mt-1">
                    {cryptoDetails.transaction.speed} HP
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="text-green-400 mt-1">✓ Confirmed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Contract Call */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <span>📜</span> Smart Contract Call
            </h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
              <div className="text-cyan-300">
                <div className="mb-2">
                  <span className="text-gray-500">Function:</span> submitVariation()
                </div>
                <div className="mb-2">
                  <span className="text-gray-500">Contract:</span> 0xSMARTCONTRACT
                </div>
                <div>
                  <span className="text-gray-500">XPF Cost:</span> 1 XPF
                </div>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card bg-blue-900/20 border-blue-500">
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="font-bold text-blue-400">Encrypted</div>
                <div className="text-xs text-gray-400 mt-1">RSA-2048</div>
              </div>
            </div>
            <div className="card bg-green-900/20 border-green-500">
              <div className="text-center">
                <div className="text-3xl mb-2">✓</div>
                <div className="font-bold text-green-400">Verified</div>
                <div className="text-xs text-gray-400 mt-1">ZK-SNARK</div>
              </div>
            </div>
            <div className="card bg-orange-900/20 border-orange-500">
              <div className="text-center">
                <div className="text-3xl mb-2">⛓️</div>
                <div className="font-bold text-orange-400">On-Chain</div>
                <div className="text-xs text-gray-400 mt-1">Immutable</div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
