"""
Mock Blockchain - Simula una blockchain Ethereum/L2
Tiene traccia di blocchi, transazioni e stato
"""
import hashlib
import time
from datetime import datetime
from typing import Dict, List, Optional
from models.game_models import Transaction


class Block:
    def __init__(self, block_number: int, previous_hash: str, transactions: List[Transaction]):
        self.block_number = block_number
        self.timestamp = datetime.now()
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self._calculate_hash()

    def _calculate_hash(self) -> str:
        data = f"{self.block_number}{self.timestamp}{len(self.transactions)}{self.previous_hash}{self.nonce}"
        return hashlib.sha256(data.encode()).hexdigest()


class MockBlockchain:
    """Simula una blockchain per la demo"""

    def __init__(self):
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.current_block_number = 0
        self.gas_price = 20  # Gwei simulato

        # Genesis block
        genesis = Block(0, "0x0", [])
        self.chain.append(genesis)
        self.current_block_number = 1

    def create_transaction(
        self,
        from_address: str,
        function_name: str,
        params: Dict,
        to_address: Optional[str] = None
    ) -> Transaction:
        """Crea una nuova transazione simulata"""
        tx_data = f"{from_address}{function_name}{str(params)}{time.time()}"
        tx_hash = "0x" + hashlib.sha256(tx_data.encode()).hexdigest()

        # Gas simulato basato sulla complessità
        gas_used = self._estimate_gas(function_name)

        tx = Transaction(
            tx_hash=tx_hash,
            from_address=from_address,
            to_address=to_address or "0xContract",
            function_name=function_name,
            params=params,
            gas_used=gas_used,
            block_number=self.current_block_number,
            timestamp=datetime.now(),
            status="success"
        )

        self.pending_transactions.append(tx)
        return tx

    def mine_block(self) -> Block:
        """Mina un nuovo blocco con le transazioni pending"""
        if not self.pending_transactions:
            # Blocco vuoto
            pass

        previous_hash = self.chain[-1].hash
        block = Block(
            self.current_block_number,
            previous_hash,
            self.pending_transactions.copy()
        )

        # Simula mining time
        time.sleep(0.1)

        self.chain.append(block)
        self.pending_transactions = []
        self.current_block_number += 1

        return block

    def get_transaction(self, tx_hash: str) -> Optional[Transaction]:
        """Recupera una transazione dal suo hash"""
        for block in self.chain:
            for tx in block.transactions:
                if tx.tx_hash == tx_hash:
                    return tx
        return None

    def get_latest_block(self) -> Block:
        """Ritorna l'ultimo blocco"""
        return self.chain[-1]

    def _estimate_gas(self, function_name: str) -> int:
        """Stima il gas in base alla funzione"""
        gas_costs = {
            "register": 50000,
            "requestRandomness": 100000,
            "submitCommitment": 150000,
            "generateFunction": 80000,
            "requestVariation": 30000,
            "submitFinalChoice": 200000,  # ZK verification costa tanto
            "determineWinner": 60000,
            "distributeRewards": 80000
        }
        return gas_costs.get(function_name, 21000)

    def get_block_timestamp(self) -> int:
        """Ritorna timestamp blockchain corrente"""
        return int(time.time())
