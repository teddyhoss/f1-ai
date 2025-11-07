"""
Homomorphic Engine - Simula calcolo omomorfico
NOTA: Questa è una semplificazione. Per vera omomorfia servirebbero librerie come python-paillier o SEAL
"""
import secrets
from typing import List
from .crypto_engine import CryptoEngine
from .number_derivation import calculate_validation_function


class HomomorphicEngine:
    """
    Simula calcolo omomorfico su dati cifrati

    IMPORTANTE: In produzione useremmo Paillier o BFV/CKKS
    Per la demo, "fingiamo" di calcolare su cifrati ma in realtà:
    1. Server non vede i numeri (riceve solo ciphertext)
    2. Server fa calcoli e ritorna ciphertext output
    3. Client decifra solo l'output finale

    Questo mantiene il flusso corretto per la demo
    """

    @staticmethod
    def apply_delta_to_encrypted(
        encrypted_numbers: List[str],
        deltas: List[int],
        public_key: str
    ) -> List[str]:
        """
        Simula: encrypted_new[i] = encrypted_numbers[i] + Encrypt(delta[i])

        In realtà in questa demo non possiamo fare vera omomorfia con RSA,
        quindi ritorniamo nuovi ciphertext che sembrano validi.
        Il client dovrà fidarsi del server (accettabile per PoC hackathon)

        Args:
            encrypted_numbers: Lista ciphertext
            deltas: Modifiche da applicare
            public_key: Chiave pubblica

        Returns:
            Nuovi ciphertext (simulati)
        """
        # Nella demo, generiamo nuovi ciphertext "modificati"
        # In produzione, useremmo vera addizione omomorfica
        new_encrypted = []
        for enc in encrypted_numbers:
            # Simula "modifica" generando nuovo ciphertext
            # (In realtà questo non è sicuro, ma per demo va bene)
            modified = enc + "_modified_" + secrets.token_hex(4)
            new_encrypted.append(modified)

        return new_encrypted

    @staticmethod
    def compute_output_on_encrypted(
        encrypted_numbers: List[str],
        coefficients: List[int],
        bias: int,
        public_key: str
    ) -> str:
        """
        Simula: encrypted_output = F(encrypted_numbers)
        dove F = sum(c[i] * X[i]) + bias

        Dovrebbe calcolare tutto su cifrati, ma per demo semplifichiamo

        Args:
            encrypted_numbers: Numeri cifrati
            coefficients: Coefficienti funzione
            bias: Bias funzione
            public_key: Chiave pubblica

        Returns:
            Output cifrato (simulato)
        """
        # Per la demo, creiamo un ciphertext che "contiene" l'output
        # Il client dovrà decifrarlo

        # Simuliamo un ciphertext output
        # In realtà dovremmo fare moltiplicazioni e somme omorforiche
        output_ciphertext = f"encrypted_output_{secrets.token_hex(16)}"

        return output_ciphertext

    @staticmethod
    def compute_output_with_plaintext_for_demo(
        numbers: List[int],
        coefficients: List[int],
        bias: int
    ) -> int:
        """
        Calcola output in chiaro (per server che deve ritornare risultato)

        NOTA: Questa funzione è usata dal server per calcolare l'output reale
        che poi viene cifrato e inviato al client.

        In produzione vera, il server NON avrebbe accesso ai numeri in chiaro.
        """
        return calculate_validation_function(numbers, coefficients, bias)
