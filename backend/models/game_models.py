from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class GameState(str, Enum):
    REGISTERING = "REGISTERING"
    AWAITING_RANDOMNESS = "AWAITING_RANDOMNESS"
    RANDOMNESS_FULFILLED = "RANDOMNESS_FULFILLED"
    ALL_COMMITTED = "ALL_COMMITTED"
    FUNCTION_GENERATED = "FUNCTION_GENERATED"
    PLAYING = "PLAYING"
    ALL_SUBMITTED = "ALL_SUBMITTED"
    WINNER_DECLARED = "WINNER_DECLARED"
    CHALLENGED = "CHALLENGED"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"


class PlayerStatus(str, Enum):
    REGISTERED = "REGISTERED"
    COMMITTED = "COMMITTED"
    GENERATING = "GENERATING"
    SUBMITTED = "SUBMITTED"
    DISQUALIFIED = "DISQUALIFIED"
    TIMED_OUT = "TIMED_OUT"


class Transaction(BaseModel):
    tx_hash: str
    from_address: str
    to_address: Optional[str] = None
    function_name: str
    params: Dict
    gas_used: int
    block_number: int
    timestamp: datetime
    status: str = "success"


class VRFResult(BaseModel):
    seed_game: str
    proof: str
    request_id: str
    timestamp: datetime
    block_number: int


class Commitment(BaseModel):
    player_address: str
    commitment_hash: str
    public_key: str
    encrypted_numbers_hash: str
    zk_proof: str
    timestamp: datetime
    tx_hash: str


class Variation(BaseModel):
    variation_index: int
    encrypted_state: List[str]
    encrypted_output: str
    timestamp: datetime


class FinalSubmission(BaseModel):
    player_address: str
    output_declared: int
    encrypted_state_hash: str
    variations_count: int
    zk_proof: str
    timestamp: datetime
    tx_hash: str


class Player(BaseModel):
    address: str
    xpf_balance: int = 10
    xpf_spent: int = 0
    status: PlayerStatus = PlayerStatus.REGISTERED
    seed_player: Optional[str] = None
    commitment: Optional[Commitment] = None
    variations: List[Variation] = Field(default_factory=list)
    final_submission: Optional[FinalSubmission] = None
    registered_at: datetime = Field(default_factory=datetime.now)


class Game(BaseModel):
    game_id: str
    status: GameState = GameState.REGISTERING
    players: List[Player] = Field(default_factory=list)
    max_players: int = 3
    vrf_result: Optional[VRFResult] = None
    seed_function: Optional[str] = None
    function_coefficients: Optional[List[int]] = None
    function_bias: Optional[int] = None
    winner: Optional[str] = None
    winning_output: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    transactions: List[Transaction] = Field(default_factory=list)

    def get_player(self, address: str) -> Optional[Player]:
        for player in self.players:
            if player.address == address:
                return player
        return None

    def is_full(self) -> bool:
        return len(self.players) >= self.max_players

    def all_committed(self) -> bool:
        return all(p.commitment is not None for p in self.players)

    def all_submitted(self) -> bool:
        return all(p.final_submission is not None for p in self.players)
