import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { formatHex } from '../utils/crypto';

export default function CryptoPanel({ cryptoData, isVisible }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { name: 'Commitment', icon: '🔒', color: 'text-blue-400' },
    { name: 'Witness', icon: '👁️', color: 'text-purple-400' },
    { name: 'Proof', icon: '✓', color: 'text-green-400' },
  ];

  useEffect(() => {
    if (isVisible && cryptoData?.zkProof) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step <= 2) {
          setActiveStep(step);
        } else {
          clearInterval(interval);
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [isVisible, cryptoData]);

  if (!isVisible || !cryptoData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="fixed right-4 top-20 w-96 card bg-gray-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/50 z-50 max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="mb-4 pb-3 border-b border-gray-700">
          <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
            <span className="animate-pulse">🔐</span>
            Crypto Inspector
          </h3>
          <p className="text-xs text-gray-500 mt-1">Live cryptographic operations</p>
        </div>

        {/* ZK-SNARK Proof Generation */}
        {cryptoData.zkProof && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧮</span>
              <h4 className="font-bold text-green-400">ZK-SNARK Proof</h4>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.name} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: activeStep >= index ? 1 : 0.8,
                      opacity: activeStep >= index ? 1 : 0.5,
                    }}
                    className={`text-3xl mb-1 ${activeStep >= index ? step.color : 'text-gray-600'}`}
                  >
                    {step.icon}
                  </motion.div>
                  <span className={`text-xs ${activeStep >= index ? step.color : 'text-gray-600'}`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Proof Details */}
            <div className="space-y-2 bg-black/30 rounded p-3 font-mono text-xs">
              <div>
                <span className="text-gray-500">Algorithm:</span>{' '}
                <span className="text-blue-300">{cryptoData.zkProof.algorithm}</span>
              </div>
              <div>
                <span className="text-gray-500">Curve:</span>{' '}
                <span className="text-blue-300">{cryptoData.zkProof.curve}</span>
              </div>
              <div>
                <span className="text-gray-500">Commitment:</span>{' '}
                <span className="text-purple-300 break-all">
                  0x{cryptoData.zkProof.commitment}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Proof:</span>{' '}
                <span className="text-green-300 break-all">
                  0x{cryptoData.zkProof.proof}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
                <span className="text-green-400">✓</span>
                <span className="text-green-400 font-bold">Proof Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* RSA Encryption */}
        {cryptoData.encryptedParams && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔑</span>
              <h4 className="font-bold text-yellow-400">RSA Encryption</h4>
            </div>

            <div className="space-y-2 bg-black/30 rounded p-3">
              <div className="font-mono text-xs">
                <span className="text-gray-500">Public Key:</span>{' '}
                <span className="text-yellow-300 break-all">
                  {formatHex(cryptoData.publicKey)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {cryptoData.encryptedParams.length} parameters encrypted
              </div>
              <div className="grid grid-cols-5 gap-1 mt-2">
                {cryptoData.encryptedParams.slice(0, 10).map((param, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gray-800 rounded px-1 py-1 text-center"
                  >
                    <div className="text-xs text-yellow-400">🔒</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VRF */}
        {cryptoData.vrf && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎲</span>
              <h4 className="font-bold text-pink-400">VRF Randomness</h4>
            </div>

            <div className="space-y-2 bg-black/30 rounded p-3 font-mono text-xs">
              <div>
                <span className="text-gray-500">Seed:</span>{' '}
                <span className="text-pink-300">0x{cryptoData.vrf.seed}</span>
              </div>
              <div>
                <span className="text-gray-500">Output:</span>{' '}
                <span className="text-pink-300 font-bold">{cryptoData.vrf.output}</span>
              </div>
              <div>
                <span className="text-gray-500">Proof:</span>{' '}
                <span className="text-pink-300 break-all">0x{cryptoData.vrf.proof}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
                <span className="text-green-400">✓</span>
                <span className="text-green-400">VRF Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Homomorphic Computation */}
        {cryptoData.homomorphic && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧬</span>
              <h4 className="font-bold text-cyan-400">Homomorphic Compute</h4>
            </div>

            <div className="space-y-2 bg-black/30 rounded p-3 font-mono text-xs">
              <div className="text-gray-400 mb-2">
                Computed on encrypted data without decryption
              </div>
              <div>
                <span className="text-gray-500">Output:</span>{' '}
                <span className="text-cyan-300 font-bold text-lg">
                  {cryptoData.homomorphic.output}
                </span>
                <span className="text-gray-500 ml-2">HP</span>
              </div>
              <div>
                <span className="text-gray-500">Proof:</span>{' '}
                <span className="text-cyan-300 break-all">
                  0x{cryptoData.homomorphic.proof}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Transaction */}
        {cryptoData.transactionId && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⛓️</span>
              <h4 className="font-bold text-orange-400">Blockchain TX</h4>
            </div>

            <div className="space-y-2 bg-black/30 rounded p-3 font-mono text-xs">
              <div>
                <span className="text-gray-500">TX Hash:</span>{' '}
                <span className="text-orange-300 break-all">
                  {formatHex(cryptoData.transactionId, 12, 10)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Block:</span>{' '}
                <span className="text-orange-300">{cryptoData.blockNumber || 'Pending'}</span>
              </div>
              <div>
                <span className="text-gray-500">Gas Used:</span>{' '}
                <span className="text-orange-300">{cryptoData.gasUsed || 21000}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-orange-400"
                >
                  ⚡
                </motion.span>
                <span className="text-orange-400">Confirmed on Blockchain</span>
              </div>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-600 text-center pt-3 border-t border-gray-800">
          Timestamp: {new Date(cryptoData.timestamp || Date.now()).toLocaleTimeString()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
