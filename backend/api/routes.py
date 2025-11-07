"""
API Routes per il frontend
"""
from fastapi import APIRouter, HTTPException, status
from typing import List

from api.schemas import (
    CreateGameRequest, RegisterPlayerRequest, SubmitCommitmentRequest,
    RequestVariationRequest, ComputeVariationRequest, SubmitFinalChoiceRequest,
    DeriveNumbersRequest, GenerateZKProofCommitmentRequest, GenerateZKProofFinalRequest,
    GameResponse, PlayerResponse, TransactionResponse,
    DeriveNumbersResponse, VariationResponse, XPFBalanceResponse, ErrorResponse
)
from core.game_manager import GameManager
from crypto.number_derivation import derive_numbers_from_seed
from crypto.crypto_engine import CryptoEngine
from models.game_models import Game, Player

# Inizializza Game Manager (singleton per la demo)
game_manager = GameManager()
crypto_engine = CryptoEngine()

router = APIRouter()


def convert_game_to_response(game: Game) -> GameResponse:
    """Converti Game model in response schema"""
    return GameResponse(
        game_id=game.game_id,
        status=game.status.value,
        players=[convert_player_to_response(p) for p in game.players],
        max_players=game.max_players,
        seed_function=game.seed_function,
        function_coefficients=game.function_coefficients,
        function_bias=game.function_bias,
        winner=game.winner,
        winning_output=game.winning_output,
        created_at=game.created_at.isoformat()
    )


def convert_player_to_response(player: Player) -> PlayerResponse:
    """Converti Player model in response schema"""
    return PlayerResponse(
        address=player.address,
        xpf_balance=player.xpf_balance,
        xpf_spent=player.xpf_spent,
        status=player.status.value,
        seed_player=player.seed_player,
        has_commitment=player.commitment is not None,
        has_final_submission=player.final_submission is not None,
        variations_count=len(player.variations)
    )


# ==================== GAME MANAGEMENT ====================

@router.post("/game/create", response_model=GameResponse)
async def create_game(request: CreateGameRequest):
    """Crea un nuovo gioco"""
    try:
        game = game_manager.create_game(max_players=request.max_players)
        return convert_game_to_response(game)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/game/{game_id}", response_model=GameResponse)
async def get_game(game_id: str):
    """Ottieni stato di un gioco"""
    game = game_manager.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return convert_game_to_response(game)


@router.get("/game/active/current", response_model=GameResponse)
async def get_active_game():
    """Ottieni il gioco attivo corrente"""
    game = game_manager.get_active_game()
    if not game:
        raise HTTPException(status_code=404, detail="No active game")
    return convert_game_to_response(game)


@router.get("/games/all", response_model=List[GameResponse])
async def get_all_games():
    """Ottieni tutti i giochi"""
    games = game_manager.get_all_games()
    return [convert_game_to_response(g) for g in games]


# ==================== PLAYER MANAGEMENT ====================

@router.post("/game/{game_id}/register", response_model=PlayerResponse)
async def register_player(game_id: str, request: RegisterPlayerRequest):
    """Registra un giocatore in un gioco"""
    try:
        player = game_manager.register_player(game_id, request.player_address)
        return convert_player_to_response(player)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/player/{player_address}/xpf", response_model=XPFBalanceResponse)
async def get_player_xpf(player_address: str):
    """Ottieni balance XPF di un giocatore"""
    balance = game_manager.get_player_xpf(player_address)
    return XPFBalanceResponse(address=player_address, balance=balance)


# ==================== CRYPTOGRAPHY HELPERS ====================

@router.post("/crypto/derive-numbers", response_model=DeriveNumbersResponse)
async def derive_numbers(request: DeriveNumbersRequest):
    """Deriva numeri da seed (helper per client)"""
    try:
        numbers = derive_numbers_from_seed(request.seed_player)
        return DeriveNumbersResponse(numbers=numbers)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/crypto/generate-keypair")
async def generate_keypair():
    """Genera coppia di chiavi (helper per client)"""
    try:
        public_key, private_key = crypto_engine.generate_keypair()
        return {
            "public_key": public_key,
            "private_key": private_key
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/crypto/generate-zk-proof-commitment")
async def generate_zk_proof_commitment(request: GenerateZKProofCommitmentRequest):
    """Genera ZK proof per commitment (helper per client)"""
    try:
        proof = crypto_engine.generate_zk_proof_commitment(
            request.seed_player,
            request.numbers,
            request.encrypted_numbers,
            request.public_key
        )
        return {"zk_proof": proof}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/crypto/generate-zk-proof-final")
async def generate_zk_proof_final(request: GenerateZKProofFinalRequest):
    """Genera ZK proof per submission finale (helper per client)"""
    try:
        proof = crypto_engine.generate_zk_proof_final(
            request.seed_player,
            request.seed_function,
            request.output_declared,
            request.variations_count
        )
        return {"zk_proof": proof}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== COMMITMENT PHASE ====================

@router.post("/game/{game_id}/commitment", response_model=TransactionResponse)
async def submit_commitment(game_id: str, request: SubmitCommitmentRequest):
    """Sottometti commitment"""
    try:
        commitment = game_manager.submit_commitment(
            game_id=game_id,
            player_address=request.player_address,
            public_key=request.public_key,
            encrypted_numbers=request.encrypted_numbers,
            zk_proof=request.zk_proof
        )
        return TransactionResponse(
            tx_hash=commitment.tx_hash,
            block_number=0,
            gas_used=150000,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== VARIATION PHASE ====================

@router.post("/game/{game_id}/variation/request", response_model=dict)
async def request_variation(game_id: str, request: RequestVariationRequest):
    """Richiedi generazione variazione"""
    try:
        result = game_manager.request_variation(game_id, request.player_address)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/game/{game_id}/variation/compute", response_model=VariationResponse)
async def compute_variation(game_id: str, request: ComputeVariationRequest):
    """Calcola variazione (server-side con dati cifrati)"""
    try:
        result = game_manager.compute_variation(
            game_id=game_id,
            player_address=request.player_address,
            current_numbers=request.current_numbers
        )

        # Aggiungi XPF remaining
        xpf = game_manager.get_player_xpf(request.player_address)

        return VariationResponse(
            variation_index=result["variation_index"],
            output=result["output"],
            encrypted_state=result["encrypted_state"],
            new_numbers=result["new_numbers"],
            deltas=result["deltas"],
            xpf_remaining=xpf
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== FINAL SUBMISSION ====================

@router.post("/game/{game_id}/submit-final", response_model=TransactionResponse)
async def submit_final_choice(game_id: str, request: SubmitFinalChoiceRequest):
    """Sottometti scelta finale"""
    try:
        submission = game_manager.submit_final_choice(
            game_id=game_id,
            player_address=request.player_address,
            output_declared=request.output_declared,
            encrypted_state_hash=request.encrypted_state_hash,
            variations_count=request.variations_count,
            zk_proof=request.zk_proof
        )
        return TransactionResponse(
            tx_hash=submission.tx_hash,
            block_number=0,
            gas_used=200000,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== HEALTH CHECK ====================

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "active_games": len(game_manager.games),
        "blockchain_height": game_manager.blockchain.current_block_number
    }
