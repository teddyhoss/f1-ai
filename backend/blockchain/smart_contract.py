"""
Smart Contract Simulator - Simula il contratto Solidity del gioco
Gestisce la logica on-chain e validazioni
"""
from typing import Optional
from datetime import datetime
from models.game_models import Game, Player, GameState, PlayerStatus, Commitment, FinalSubmission


class SmartContract:
    """Simula lo smart contract Solidity del gioco"""

    XPF_INITIAL = 10
    XPF_VARIATION_COST = 1
    XPF_PLAY_COST = 1
    MAX_VARIATIONS = 9
    WINNER_REWARD = 100  # Vincitore riceve 100 XPF

    def __init__(self):
        self.games: dict[str, Game] = {}
        self.xpf_balances: dict[str, int] = {}  # address -> balance

    # ==================== XPF TOKEN FUNCTIONS ====================

    def mint_xpf(self, address: str, amount: int):
        """Minta XPF per un giocatore"""
        if address not in self.xpf_balances:
            self.xpf_balances[address] = 0
        self.xpf_balances[address] += amount

    def burn_xpf(self, address: str, amount: int) -> bool:
        """Brucia XPF di un giocatore"""
        if address not in self.xpf_balances:
            return False
        if self.xpf_balances[address] < amount:
            return False
        self.xpf_balances[address] -= amount
        return True

    def get_xpf_balance(self, address: str) -> int:
        """Ritorna il balance XPF di un indirizzo"""
        return self.xpf_balances.get(address, 0)

    # ==================== GAME REGISTRATION ====================

    def register_player(self, game_id: str, player_address: str) -> bool:
        """Registra un giocatore in un gioco"""
        if game_id not in self.games:
            return False

        game = self.games[game_id]

        # Validazioni
        if game.is_full():
            raise ValueError("Game is full")
        if game.status != GameState.REGISTERING:
            raise ValueError("Game not accepting registrations")
        if game.get_player(player_address) is not None:
            raise ValueError("Player already registered")

        # Minta XPF iniziali se nuovo giocatore
        if player_address not in self.xpf_balances:
            self.mint_xpf(player_address, self.XPF_INITIAL)

        # Verifica XPF sufficiente
        if self.get_xpf_balance(player_address) < self.XPF_PLAY_COST:
            raise ValueError("Insufficient XPF")

        # Aggiungi giocatore
        player = Player(
            address=player_address,
            xpf_balance=self.get_xpf_balance(player_address),
            status=PlayerStatus.REGISTERED
        )
        game.players.append(player)

        return True

    # ==================== COMMITMENT ====================

    def submit_commitment(
        self,
        game_id: str,
        player_address: str,
        commitment: Commitment
    ) -> bool:
        """Sottometti commitment con ZK proof"""
        game = self.games.get(game_id)
        if not game:
            raise ValueError("Game not found")

        player = game.get_player(player_address)
        if not player:
            raise ValueError("Player not registered")

        # Validazioni
        if game.status not in [GameState.RANDOMNESS_FULFILLED, GameState.ALL_COMMITTED]:
            raise ValueError("Not in commitment phase")
        if player.commitment is not None:
            raise ValueError("Already committed")
        if not player.seed_player:
            raise ValueError("Seed not available yet")

        # Verifica ZK proof (simulato)
        if not self._verify_commitment_proof(commitment):
            raise ValueError("Invalid ZK proof")

        # Registra commitment
        player.commitment = commitment
        player.status = PlayerStatus.COMMITTED

        # Controlla se tutti hanno committato
        if game.all_committed():
            game.status = GameState.ALL_COMMITTED

        return True

    def _verify_commitment_proof(self, commitment: Commitment) -> bool:
        """Verifica la ZK proof del commitment (simulato)"""
        # In realtà chiamerebbe un verifier on-chain
        # Per la demo, verifichiamo solo il formato
        return (
            commitment.zk_proof.startswith("0x") and
            len(commitment.commitment_hash) > 10 and
            len(commitment.public_key) > 10
        )

    # ==================== VARIATIONS ====================

    def request_variation(self, game_id: str, player_address: str) -> bool:
        """Richiedi generazione di una variazione"""
        game = self.games.get(game_id)
        if not game:
            raise ValueError("Game not found")

        player = game.get_player(player_address)
        if not player:
            raise ValueError("Player not registered")

        # Validazioni
        if game.status != GameState.PLAYING:
            raise ValueError("Not in playing phase")
        if player.status not in [PlayerStatus.COMMITTED, PlayerStatus.GENERATING]:
            raise ValueError("Invalid player status")
        if len(player.variations) >= self.MAX_VARIATIONS:
            raise ValueError("Max variations reached")

        # Verifica XPF (ogni variazione costa 1 XPF)
        xpf_balance = self.get_xpf_balance(player_address)
        if xpf_balance < self.XPF_VARIATION_COST:
            raise ValueError("Insufficient XPF")

        # Burn XPF
        if not self.burn_xpf(player_address, self.XPF_VARIATION_COST):
            raise ValueError("Failed to burn XPF")

        player.xpf_spent += self.XPF_VARIATION_COST
        player.xpf_balance = self.get_xpf_balance(player_address)
        player.status = PlayerStatus.GENERATING

        return True

    # ==================== FINAL SUBMISSION ====================

    def submit_final_choice(
        self,
        game_id: str,
        player_address: str,
        submission: FinalSubmission
    ) -> bool:
        """Sottometti la scelta finale con ZK proof"""
        game = self.games.get(game_id)
        if not game:
            raise ValueError("Game not found")

        player = game.get_player(player_address)
        if not player:
            raise ValueError("Player not registered")

        # Validazioni
        if game.status != GameState.PLAYING:
            raise ValueError("Not in playing phase")
        if player.status not in [PlayerStatus.COMMITTED, PlayerStatus.GENERATING]:
            raise ValueError("Invalid player status")
        if player.final_submission is not None:
            raise ValueError("Already submitted")

        # Verifica XPF
        xpf_balance = self.get_xpf_balance(player_address)
        if xpf_balance < self.XPF_PLAY_COST:
            raise ValueError("Insufficient XPF")

        # Verifica ZK proof (simulato)
        if not self._verify_final_proof(submission):
            raise ValueError("Invalid ZK proof")

        # Burn XPF finale
        if not self.burn_xpf(player_address, self.XPF_PLAY_COST):
            raise ValueError("Failed to burn XPF")

        player.xpf_spent += self.XPF_PLAY_COST
        player.xpf_balance = self.get_xpf_balance(player_address)

        # Registra submission
        player.final_submission = submission
        player.status = PlayerStatus.SUBMITTED

        # Controlla se tutti hanno submitted
        if game.all_submitted():
            game.status = GameState.ALL_SUBMITTED

        return True

    def _verify_final_proof(self, submission: FinalSubmission) -> bool:
        """Verifica la ZK proof finale (simulato)"""
        return (
            submission.zk_proof.startswith("0x") and
            0 <= submission.output_declared <= 10000 and
            0 <= submission.variations_count <= self.MAX_VARIATIONS
        )

    # ==================== WINNER DETERMINATION ====================

    def determine_winner(self, game_id: str) -> Optional[str]:
        """Determina il vincitore del gioco"""
        game = self.games.get(game_id)
        if not game:
            raise ValueError("Game not found")

        if game.status != GameState.ALL_SUBMITTED:
            raise ValueError("Not all players submitted")

        max_output = -1
        winner_address = None

        for player in game.players:
            if player.status == PlayerStatus.SUBMITTED and player.final_submission:
                output = player.final_submission.output_declared
                if output > max_output:
                    max_output = output
                    winner_address = player.address

        if winner_address:
            game.winner = winner_address
            game.winning_output = max_output
            game.status = GameState.WINNER_DECLARED

        return winner_address

    def distribute_rewards(self, game_id: str):
        """Distribuisci reward al vincitore"""
        game = self.games.get(game_id)
        if not game or not game.winner:
            raise ValueError("No winner to reward")

        winner = game.get_player(game.winner)
        if not winner:
            raise ValueError("Winner not found")

        # Vincitore riceve 100 XPF fissi
        self.mint_xpf(game.winner, self.WINNER_REWARD)

        game.status = GameState.COMPLETED
        game.completed_at = datetime.now()
