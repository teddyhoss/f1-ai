"""
API Request/Response Schemas per il frontend
"""
from typing import List, Optional
from pydantic import BaseModel


# ==================== REQUEST SCHEMAS ====================

class CreateGameRequest(BaseModel):
    max_players: int = 3


class RegisterPlayerRequest(BaseModel):
    player_address: str


class SubmitCommitmentRequest(BaseModel):
    player_address: str
    public_key: str
    encrypted_numbers: List[str]
    zk_proof: str


class RequestVariationRequest(BaseModel):
    player_address: str


class ComputeVariationRequest(BaseModel):
    player_address: str
    current_numbers: List[int]


class SubmitFinalChoiceRequest(BaseModel):
    player_address: str
    output_declared: int
    encrypted_state_hash: str
    variations_count: int
    zk_proof: str


class DeriveNumbersRequest(BaseModel):
    seed_player: str


class GenerateZKProofCommitmentRequest(BaseModel):
    seed_player: str
    numbers: List[int]
    encrypted_numbers: List[str]
    public_key: str


class GenerateZKProofFinalRequest(BaseModel):
    seed_player: str
    seed_function: str
    output_declared: int
    variations_count: int


# ==================== RESPONSE SCHEMAS ====================

class TransactionResponse(BaseModel):
    tx_hash: str
    block_number: int
    gas_used: int
    status: str


class PlayerResponse(BaseModel):
    address: str
    xpf_balance: int
    xpf_spent: int
    status: str
    seed_player: Optional[str] = None
    has_commitment: bool
    has_final_submission: bool
    variations_count: int


class GameResponse(BaseModel):
    game_id: str
    status: str
    players: List[PlayerResponse]
    max_players: int
    seed_function: Optional[str] = None
    function_coefficients: Optional[List[int]] = None
    function_bias: Optional[int] = None
    winner: Optional[str] = None
    winning_output: Optional[int] = None
    created_at: str


class DeriveNumbersResponse(BaseModel):
    numbers: List[int]


class VariationResponse(BaseModel):
    variation_index: int
    output: int
    encrypted_state: List[str]
    new_numbers: List[int]
    deltas: List[int]
    xpf_remaining: int


class XPFBalanceResponse(BaseModel):
    address: str
    balance: int


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None
