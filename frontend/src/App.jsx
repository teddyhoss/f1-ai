import { useState } from 'react';
import LobbyScreen from './components/LobbyScreen';
import TrainingScreen from './components/TrainingScreen';
import RaceScreen from './components/RaceScreen';
import ResultsScreen from './components/ResultsScreen';
import { TEAMS } from './components/LobbyScreen';

function App() {
  const [screen, setScreen] = useState('lobby'); // lobby, training, race, results
  const [gameData, setGameData] = useState(null);
  const [raceData, setRaceData] = useState(null);
  const [resultsData, setResultsData] = useState(null);

  const handleStartRace = () => {
    // Initialize game with 3 players
    const initialGameData = {
      gameId: `game_${Date.now()}`,
      players: TEAMS.map(team => ({
        address: team.address,
        name: team.name,
        color: team.color,
        xpf: 10,
      })),
    };

    setGameData(initialGameData);
    setScreen('training');
  };

  const handleTrainingComplete = (bestVariations) => {
    // Prepare race data with selected variations
    const raceDataPrep = bestVariations.map((variation, index) => ({
      playerIndex: index,
      speed: variation.speed,
      parameters: variation.parameters,
    }));

    setRaceData(raceDataPrep);
    setScreen('race');
  };

  const handleRaceComplete = (results) => {
    setResultsData(results);
    setScreen('results');
  };

  const handleRestart = () => {
    setGameData(null);
    setRaceData(null);
    setResultsData(null);
    setScreen('lobby');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {screen === 'lobby' && <LobbyScreen onStartRace={handleStartRace} />}

      {screen === 'training' && (
        <TrainingScreen
          gameData={gameData}
          onTrainingComplete={handleTrainingComplete}
        />
      )}

      {screen === 'race' && (
        <RaceScreen raceData={raceData} onRaceComplete={handleRaceComplete} />
      )}

      {screen === 'results' && (
        <ResultsScreen results={resultsData} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
