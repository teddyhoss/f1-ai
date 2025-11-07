"""
Game Manager - Orchestrazione completa del gioco
Coordina blockchain, crittografia e logica di gioco
"""
import secrets
import time
from typing import Optional, List, Dict
from datetime import datetime

from models.game_models import (
    Game, GameState, Player, PlayerStatus,
    Commitment, Variation, FinalSubmission, VRFResult
)
from blockchain.mock_blockchain import MockBlockchain
from blockchain.vrf_simulator import VRFSimulator
from blockchain.smart_contract import SmartContract
from crypto.number_derivation import (
    derive_numbers_from_seed,
    derive_function_coefficients,
    derive_function_bias,
    calculate_validation_function
)
from crypto.crypto_engine import CryptoEngine


class GameManager:
    """Gestisce l'intero ciclo di vita del gioco"""

    def __init__(self):
        self.blockchain = MockBlockchain()
        self.vrf = VRFSimulator()
        self.contract = SmartContract()
        self.crypto = CryptoEngine()

        # Storage in-memory (in produzione useremmo database)
        self.games: Dict[str, Game] = {}
        self.active_game_id: Optional[str] = None

    # ==================== FASE 0: SETUP ====================

    def create_game(self, max_players: int = 3) -> Game:
        """Crea un nuovo gioco"""
        game_id = f"game_{secrets.token_hex(8)}"

        game = Game(
            game_id=game_id,
            status=GameState.REGISTERING,
            max_players=max_players,
            created_at=datetime.now()
        )

        self.games[game_id] = game
        self.contract.games[game_id] = game
        self.active_game_id = game_id

        # Transazione blockchain simulata
        tx = self.blockchain.create_transaction(
            from_address="0xGameFactory",
            function_name="createGame",
            params={"game_id": game_id, "max_players": max_players}
        )
        self.blockchain.mine_block()
        game.transactions.append(tx)

        return game

    def register_player(self, game_id: str, player_address: str) -> Player:
        """Registra un giocatore"""
        game = self.games.get(game_id)
        if not game:
            raise ValueError("Game not found")

        # Smart contract gestisce logica
        self.contract.register_player(game_id, player_address)

        # Transazione blockchain
        tx = self.blockchain.create_transaction(
            from_address=player_address,
            function_name="register",
            params={"game_id": game_id}
        )
        self.blockchain.mine_block()
        game.transactions.append(tx)

        player = game.get_player(player_address)

        # Se gioco pieno, richiedi randomness
        if game.is_full():
            self._request_randomness(game_id)

        return player

    # ==================== FASE 1: VRF RANDOMNESS ====================

    def _request_randomness(self, game_id: str):
        """Richiede casualità a VRF"""
        game = self.games[game_id]
        game.status = GameState.AWAITING_RANDOMNESS

        # VRF request
        request_id = self.vrf.request_randomness(game_id)

        # Transazione
        tx = self.blockchain.create_transaction(
            from_address="0xGameContract",
            function_name="requestRandomness",
            params={"game_id": game_id, "request_id": request_id},
            to_address="0xChainlinkVRF"
        )
        self.blockchain.mine_block()
        game.transactions.append(tx)

        # Simula fulfillment asincrono (in realtà sincrono per demo)
        time.sleep(0.5)  # Simula latenza
        self._fulfill_randomness(game_id, request_id)

    def _fulfill_randomness(self, game_id: str, request_id: str):
        """Fulfill VRF (chiamato da "Chainlink")"""
        game = self.games[game_id]

        # VRF genera seed + proof
        vrf_result = self.vrf.fulfill_randomness(request_id, game_id)
        vrf_result.block_number = self.blockchain.current_block_number

        game.vrf_result = vrf_result

        # Deriva seed per ogni giocatore
        for player in game.players:
            player.seed_player = self.vrf.derive_player_seed(
                vrf_result.seed_game,
                player.address,
                game_id
            )

        game.status = GameState.RANDOMNESS_FULFILLED
        game.started_at = datetime.now()

        # Transazione fulfillment
        tx = self.blockchain.create_transaction(
            from_address="0xChainlinkVRF",
            function_name="fulfillRandomness",
            params={
                "game_id": game_id,
                "seed": vrf_result.seed_game,
                "proof": vrf_result.proof
            }
        )
        self.blockchain.mine_block()
        game.transactions.append(tx)

    # ==================== FASE 2: COMMITMENT ====================

    def submit_commitment(
        self,
        game_id: str,
        player_address: str,
        public_key: str,
        encrypted_numbers: List[str],
        zk_proof: str
    ) -> Commitment:
        """Giocatore sottomette commitment"""
        game = self.games[game_id]

        # Crea commitment hash
        commitment_data = f"{public_key}{''.join(encrypted_numbers)}"
        commitment_hash = self.crypto.create_commitment(commitment_data)
        encrypted_numbers_hash = self.crypto.hash_data(''.join(encrypted_numbers))

        commitment = Commitment(
            player_address=player_address,
            commitment_hash=commitment_hash,
            public_key=public_key,
            encrypted_numbers_hash=encrypted_numbers_hash,
            zk_proof=zk_proof,
            timestamp=datetime.now(),
            tx_hash=""
        )

        # Smart contract verifica e registra
        self.contract.submit_commitment(game_id, player_address, commitment)

        # Transazione blockchain
        tx = self.blockchain.create_transaction(
            from_address=player_address,
            function_name="submitCommitment",
            params={
                "game_id": game_id,
                "commitment_hash": commitment_hash
            }
        )
        self.blockchain.mine_block()
        commitment.tx_hash = tx.tx_hash
        game.transactions.append(tx)

        # Se tutti hanno committato, genera funzione
        if game.all_committed():
            self._generate_function(game_id)

        return commitment

    # ==================== FASE 3: FUNCTION GENERATION ====================

    def _generate_function(self, game_id: str):
        """Genera funzione di validazione"""
        game = self.games[game_id]

        # Deriva seed funzione da seed_game + timestamp
        timestamp = self.blockchain.get_block_timestamp()
        seed_function = self.crypto.hash_data(f"{game.vrf_result.seed_game}{timestamp}VALIDATION_FUNCTION")

        # Deriva coefficienti e bias deterministici
        coefficients = derive_function_coefficients(seed_function, count=10)
        bias = derive_function_bias(seed_function)

        game.seed_function = seed_function
        game.function_coefficients = coefficients
        game.function_bias = bias
        game.status = GameState.FUNCTION_GENERATED

        # Dopo poco, passa a PLAYING
        game.status = GameState.PLAYING

        # Transazione
        tx = self.blockchain.create_transaction(
            from_address="0xGameContract",
            function_name="generateFunction",
            params={
                "game_id": game_id,
                "seed_function": seed_function
            }
        )
        self.blockchain.mine_block()
        game.transactions.append(tx)

    # ==================== FASE 4: VARIATIONS ====================

    def request_variation(self, game_id: str, player_address: str) -> Dict:
        """Giocatore richiede generazione variazione"""
        game = self.games[game_id]
        player = game.get_player(player_address)

        # Smart contract verifica e burn XPF
        self.contract.request_variation(game_id, player_address)

        # Transazione
        tx = self.blockchain.create_transaction(
            from_address=player_address,
            function_name="requestVariation",
            params={"game_id": game_id}
        )
        self.blockchain.mine_block()
        game.transactions.append(tx)

        variation_index = len(player.variations)

        return {
            "variation_index": variation_index,
            "tx_hash": tx.tx_hash,
            "xpf_remaining": self.contract.get_xpf_balance(player_address)
        }

    def compute_variation(
        self,
        game_id: str,
        player_address: str,
        current_numbers: List[int]
    ) -> Dict:
        """
        Server calcola variazione (su dati "cifrati" per la demo)

        NOTA: In produzione, server riceverebbe encrypted_numbers e calcolerebbe omoformicamente
        Per la demo, simuliamo il flusso corretto
        """
        game = self.games[game_id]
        player = game.get_player(player_address)

        if not game.function_coefficients:
            raise ValueError("Function not generated yet")

        # Genera delta casuali ±20
        deltas = [secrets.randbelow(41) - 20 for _ in range(10)]  # -20 to +20

        # Applica delta
        new_numbers = [
            max(0, min(1000, num + delta))
            for num, delta in zip(current_numbers, deltas)
        ]

        # Calcola output
        output = calculate_validation_function(
            new_numbers,
            game.function_coefficients,
            game.function_bias
        )

        # In produzione: encrypted_output, encrypted_new_numbers
        # Per demo: ritorniamo output in chiaro + numeri cifrati (simulati)

        variation_index = len(player.variations)

        # Simula cifratura (per mantere il flow)
        encrypted_new_numbers = [f"enc_{num}_{secrets.token_hex(4)}" for num in new_numbers]
        encrypted_output = f"enc_output_{output}_{secrets.token_hex(4)}"

        variation = Variation(
            variation_index=variation_index,
            encrypted_state=encrypted_new_numbers,
            encrypted_output=encrypted_output,
            timestamp=datetime.now()
        )

        player.variations.append(variation)

        return {
            "variation_index": variation_index,
            "output": output,  # Client "decifra" questo
            "encrypted_state": encrypted_new_numbers,
            "new_numbers": new_numbers,  # Per il client (normalmente cifrato)
            "deltas": deltas
        }

    # ==================== FASE 5: FINAL SUBMISSION ====================

    def submit_final_choice(
        self,
        game_id: str,
        player_address: str,
        output_declared: int,
        encrypted_state_hash: str,
        variations_count: int,
        zk_proof: str
    ) -> FinalSubmission:
        """Giocatore sottomette scelta finale"""
        game = self.games[game_id]

        submission = FinalSubmission(
            player_address=player_address,
            output_declared=output_declared,
            encrypted_state_hash=encrypted_state_hash,
            variations_count=variations_count,
            zk_proof=zk_proof,
            timestamp=datetime.now(),
            tx_hash=""
        )

        # Smart contract verifica e registra
        self.contract.submit_final_choice(game_id, player_address, submission)

        # Transazione
        tx = self.blockchain.create_transaction(
            from_address=player_address,
            function_name="submitFinalChoice",
            params={
                "game_id": game_id,
                "output": output_declared,
                "variations_count": variations_count
            }
        )
        self.blockchain.mine_block()
        submission.tx_hash = tx.tx_hash
        game.transactions.append(tx)

        # Se tutti hanno submitted, determina vincitore
        if game.all_submitted():
            self._determine_winner(game_id)

        return submission

    # ==================== FASE 6: WINNER ====================

    def _determine_winner(self, game_id: str):
        """Determina vincitore"""
        winner_address = self.contract.determine_winner(game_id)

        game = self.games[game_id]

        # Transazione
        tx = self.blockchain.create_transaction(
            from_address="0xGameContract",
            function_name="determineWinner",
            params={
                "game_id": game_id,
                "winner": winner_address,
                "winning_output": game.winning_output
            }
        )
        self.blockchain.mine_block()
        game.transactions.append(tx)

        # Distribuisci reward
        self._distribute_rewards(game_id)

    def _distribute_rewards(self, game_id: str):
        """Distribuisci reward"""
        self.contract.distribute_rewards(game_id)

        game = self.games[game_id]

        tx = self.blockchain.create_transaction(
            from_address="0xGameContract",
            function_name="distributeRewards",
            params={
                "game_id": game_id,
                "winner": game.winner
            }
        )
        self.blockchain.mine_block()
        game.transactions.append(tx)

    # ==================== QUERY METHODS ====================

    def get_game(self, game_id: str) -> Optional[Game]:
        """Ottieni stato gioco"""
        return self.games.get(game_id)

    def get_active_game(self) -> Optional[Game]:
        """Ottieni gioco attivo"""
        if self.active_game_id:
            return self.games.get(self.active_game_id)
        return None

    def get_player_xpf(self, player_address: str) -> int:
        """Ottieni balance XPF"""
        return self.contract.get_xpf_balance(player_address)

    def get_all_games(self) -> List[Game]:
        """Ottieni tutti i giochi"""
        return list(self.games.values())
