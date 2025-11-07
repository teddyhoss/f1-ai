import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function RaceScreen({ raceData, onRaceComplete }) {
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(3);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [positions, setPositions] = useState([0, 0, 0]);
  const [winner, setWinner] = useState(null);

  const cars = raceData.map((data, index) => ({
    name: ['Ferrari', 'Mercedes', 'Red Bull'][index],
    speed: data.speed,
    color: ['#DC0000', '#00D2BE', '#0600EF'][index],
    emoji: '🏎️',
  }));

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !raceStarted) {
      setRaceStarted(true);
      startRace();
    }
  }, [countdown, raceStarted]);

  const startRace = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Sort by speed to determine finish order
    const sortedCars = cars
      .map((car, index) => ({ ...car, originalIndex: index }))
      .sort((a, b) => b.speed - a.speed);

    const raceDuration = 3000; // 3 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / raceDuration, 1);

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);

      // Draw track lines
      ctx.strokeStyle = '#3A3A3A';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (height / 4) * i);
        ctx.lineTo(width, (height / 4) * i);
        ctx.stroke();
      }

      // Draw finish line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(width - 50, 0);
      ctx.lineTo(width - 50, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw cars with easing
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      sortedCars.forEach((car, index) => {
        const laneY = (height / 4) * index + height / 8;

        // Add slight randomness to simulate racing dynamics
        const speedVariance = (car.speed / 10000) * 0.1;
        const adjustedProgress = easedProgress * (0.9 + speedVariance);

        const x = adjustedProgress * (width - 100);

        // Draw car (rectangle + emoji)
        ctx.fillStyle = car.color;
        ctx.fillRect(x, laneY - 15, 60, 30);

        // Car name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(car.name, x + 5, laneY);

        // Update positions
        const newPositions = [...positions];
        newPositions[car.originalIndex] = x;
        setPositions(newPositions);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Race finished
        setRaceFinished(true);
        setWinner(sortedCars[0]);
        setTimeout(() => {
          onRaceComplete({
            winner: sortedCars[0].originalIndex,
            results: sortedCars,
          });
        }, 2000);
      }
    };

    animate();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Countdown */}
      {countdown > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-9xl font-bold mb-8"
        >
          {countdown}
        </motion.div>
      )}

      {countdown === 0 && !raceStarted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          className="text-9xl font-bold mb-8 text-green-400"
        >
          GO!
        </motion.div>
      )}

      {/* Race Title */}
      <motion.h2
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold mb-8"
      >
        F1 AI CHAMPIONSHIP RACE
      </motion.h2>

      {/* Canvas Racing Track */}
      <div className="card w-full max-w-5xl mb-8">
        <canvas
          ref={canvasRef}
          width={1000}
          height={400}
          className="w-full rounded-lg"
        />
      </div>

      {/* Power Leaderboard */}
      <div className="card max-w-2xl w-full">
        <h3 className="text-xl font-bold mb-4">POWER RANKINGS</h3>
        <div className="space-y-3">
          {cars
            .map((car, index) => ({ ...car, index }))
            .sort((a, b) => b.speed - a.speed)
            .map((car, position) => (
              <motion.div
                key={car.name}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: position * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-gray-600">
                    #{position + 1}
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: car.color }}
                  />
                  <div>
                    <div className="font-bold">{car.name}</div>
                    <div className="text-sm text-gray-400">
                      AI Power Output
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold" style={{ color: car.color }}>
                  {car.speed} HP
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Finish Message */}
      {raceFinished && winner && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
        >
          <div className="text-center">
            <div className="text-8xl mb-4">🏆</div>
            <h2 className="text-6xl font-bold mb-4" style={{ color: winner.color }}>
              {winner.name} WINS!
            </h2>
            <p className="text-2xl text-gray-400">
              Power: {winner.speed} HP
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
