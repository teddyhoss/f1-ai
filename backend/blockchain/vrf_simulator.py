"""
VRF Simulator - Simula Chainlink VRF per generazione casualità verificabile
"""
import hashlib
import secrets
from datetime import datetime
from models.game_models import VRFResult


class VRFSimulator:
    """Simula Chainlink VRF per la demo"""

    def __init__(self):
        # Chiave privata del "nodo Chainlink" (simulata)
        self.vrf_private_key = secrets.token_hex(32)
        self.request_counter = 0

    def request_randomness(self, game_id: str) -> str:
        """Richiede casualità verificabile"""
        self.request_counter += 1
        request_id = f"vrf_request_{game_id}_{self.request_counter}"
        return request_id

    def fulfill_randomness(self, request_id: str, game_id: str) -> VRFResult:
        """
        Simula il fulfillment di Chainlink VRF
        Genera seed casuale + proof verificabile
        """
        # Genera seed casuale (256 bit)
        random_bytes = secrets.token_bytes(32)
        seed_game = "0x" + random_bytes.hex()

        # Genera proof simulata (nella realtà sarebbe una firma su curva ellittica)
        proof_data = f"{self.vrf_private_key}{request_id}{seed_game}{datetime.now()}"
        proof = "0x" + hashlib.sha256(proof_data.encode()).hexdigest()

        vrf_result = VRFResult(
            seed_game=seed_game,
            proof=proof,
            request_id=request_id,
            timestamp=datetime.now(),
            block_number=0  # Verrà aggiornato dal blockchain
        )

        return vrf_result

    def verify_proof(self, seed: str, proof: str) -> bool:
        """
        Verifica la proof VRF (simulato)
        In realtà verificherebbe matematicamente la firma
        """
        # Per la demo, accettiamo sempre proof con formato corretto
        return seed.startswith("0x") and proof.startswith("0x") and len(proof) == 66

    def derive_player_seed(self, seed_game: str, player_address: str, game_id: str) -> str:
        """
        Deriva un seed univoco per ogni giocatore dal seed principale
        Formula: seed_player = Hash(seed_game || player_address || game_id || timestamp)
        """
        data = f"{seed_game}{player_address}{game_id}"
        player_seed = "0x" + hashlib.sha256(data.encode()).hexdigest()
        return player_seed
