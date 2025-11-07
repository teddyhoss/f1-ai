"""
Crypto Engine - Gestisce crittografia, commitment, e ZK proof (simulati)
"""
import hashlib
import secrets
from typing import List, Tuple
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import base64


class CryptoEngine:
    """Engine per operazioni crittografiche"""

    @staticmethod
    def generate_keypair() -> Tuple[str, str]:
        """
        Genera coppia di chiavi RSA per cifratura
        (Semplificazione: in produzione useremmo Paillier per omomorfia)

        Returns:
            (public_key, private_key) come stringhe PEM
        """
        key = RSA.generate(2048)
        private_key = key.export_key().decode()
        public_key = key.publickey().export_key().decode()
        return public_key, private_key

    @staticmethod
    def encrypt_number(number: int, public_key_pem: str) -> str:
        """
        Cifra un numero con chiave pubblica

        Args:
            number: Numero da cifrare
            public_key_pem: Chiave pubblica PEM

        Returns:
            Ciphertext come base64
        """
        public_key = RSA.import_key(public_key_pem)
        cipher = PKCS1_OAEP.new(public_key)

        # Converti numero in bytes
        number_bytes = str(number).encode()

        # Cifra
        ciphertext = cipher.encrypt(number_bytes)

        # Ritorna come base64 per facilità di trasporto
        return base64.b64encode(ciphertext).decode()

    @staticmethod
    def decrypt_number(ciphertext_b64: str, private_key_pem: str) -> int:
        """
        Decifra un numero

        Args:
            ciphertext_b64: Ciphertext in base64
            private_key_pem: Chiave privata PEM

        Returns:
            Numero in chiaro
        """
        private_key = RSA.import_key(private_key_pem)
        cipher = PKCS1_OAEP.new(private_key)

        # Decodifica base64
        ciphertext = base64.b64decode(ciphertext_b64)

        # Decifra
        plaintext = cipher.decrypt(ciphertext)

        # Converti da bytes a int
        return int(plaintext.decode())

    @staticmethod
    def encrypt_numbers(numbers: List[int], public_key: str) -> List[str]:
        """Cifra una lista di numeri"""
        return [CryptoEngine.encrypt_number(num, public_key) for num in numbers]

    @staticmethod
    def create_commitment(data: str) -> str:
        """
        Crea un commitment hash

        Args:
            data: Dati da committare

        Returns:
            Hash commitment (hex)
        """
        nonce = secrets.token_hex(16)
        commitment_data = f"{data}{nonce}"
        return "0x" + hashlib.sha256(commitment_data.encode()).hexdigest()

    @staticmethod
    def generate_zk_proof_commitment(
        seed_player: str,
        numbers: List[int],
        encrypted_numbers: List[str],
        public_key: str
    ) -> str:
        """
        Genera ZK-SNARK proof per commitment (SIMULATO)

        In produzione: userebbe Circom + SnarkJS
        Per demo: genera un hash che sembra una proof

        Args:
            seed_player: Seed del giocatore
            numbers: Numeri in chiaro
            encrypted_numbers: Numeri cifrati
            public_key: Chiave pubblica

        Returns:
            ZK proof simulata (hex string)
        """
        # Simula proof generando hash deterministico
        proof_data = f"zk_commitment:{seed_player}:{len(numbers)}:{public_key}:{secrets.token_hex(32)}"
        proof_hash = hashlib.sha256(proof_data.encode()).hexdigest()
        return "0x" + proof_hash

    @staticmethod
    def generate_zk_proof_final(
        seed_player: str,
        seed_function: str,
        output_declared: int,
        variations_count: int
    ) -> str:
        """
        Genera ZK-SNARK proof per submission finale (SIMULATO)

        Questa proof dimostrerebbe:
        - Numeri iniziali derivano da seed
        - Variazioni sono valide (±20)
        - Output calcolato correttamente
        - Tutto senza rivelare i numeri

        Args:
            seed_player: Seed giocatore
            seed_function: Seed funzione
            output_declared: Output dichiarato
            variations_count: Numero variazioni

        Returns:
            ZK proof simulata
        """
        proof_data = (
            f"zk_final:{seed_player}:{seed_function}:"
            f"{output_declared}:{variations_count}:{secrets.token_hex(32)}"
        )
        proof_hash = hashlib.sha256(proof_data.encode()).hexdigest()
        return "0x" + proof_hash

    @staticmethod
    def verify_zk_proof(proof: str) -> bool:
        """
        Verifica una ZK proof (SIMULATO)

        In produzione: userebbe verifier on-chain
        Per demo: controlla solo formato
        """
        return proof.startswith("0x") and len(proof) == 66

    @staticmethod
    def hash_data(data: str) -> str:
        """Hash generico per dati"""
        return "0x" + hashlib.sha256(data.encode()).hexdigest()
