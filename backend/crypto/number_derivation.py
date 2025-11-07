"""
Number Derivation - Deriva numeri deterministici da seed
"""
import hashlib
from typing import List


def derive_numbers_from_seed(seed_player: str, count: int = 10, max_value: int = 1000) -> List[int]:
    """
    Deriva una lista di numeri deterministici da un seed
    Formula: numero[i] = Hash(seed_player || i) % (max_value + 1)

    Args:
        seed_player: Seed univoco del giocatore (hex string)
        count: Numero di valori da generare (default 10)
        max_value: Valore massimo (default 1000, quindi range 0-1000)

    Returns:
        Lista di numeri derivati
    """
    numbers = []

    for i in range(count):
        # Concatena seed + indice
        data = f"{seed_player}{i}".encode()

        # Hash SHA-256
        hash_result = hashlib.sha256(data).digest()

        # Converti primi 8 byte in intero
        hash_int = int.from_bytes(hash_result[:8], byteorder='big')

        # Modulo per range valido
        number = hash_int % (max_value + 1)
        numbers.append(number)

    return numbers


def derive_function_coefficients(seed_function: str, count: int = 10, max_coeff: int = 100) -> List[int]:
    """
    Deriva coefficienti della funzione di validazione da un seed

    Args:
        seed_function: Seed per la funzione
        count: Numero di coefficienti (default 10)
        max_coeff: Valore massimo coefficiente (default 100)

    Returns:
        Lista di coefficienti
    """
    coefficients = []

    for i in range(count):
        data = f"{seed_function}coefficient{i}".encode()
        hash_result = hashlib.sha256(data).digest()
        hash_int = int.from_bytes(hash_result[:4], byteorder='big')
        coeff = hash_int % max_coeff
        coefficients.append(coeff)

    return coefficients


def derive_function_bias(seed_function: str, max_bias: int = 1000) -> int:
    """
    Deriva il bias (termine costante) della funzione

    Args:
        seed_function: Seed per la funzione
        max_bias: Valore massimo bias

    Returns:
        Valore bias
    """
    data = f"{seed_function}bias".encode()
    hash_result = hashlib.sha256(data).digest()
    hash_int = int.from_bytes(hash_result[:4], byteorder='big')
    return hash_int % (max_bias + 1)


def calculate_validation_function(numbers: List[int], coefficients: List[int], bias: int, modulo: int = 10000) -> int:
    """
    Calcola la funzione di validazione F
    F(X) = (c[0]*X[0] + c[1]*X[1] + ... + c[9]*X[9] + bias) % modulo

    Args:
        numbers: Lista di 10 numeri del giocatore
        coefficients: Lista di 10 coefficienti
        bias: Termine costante
        modulo: Modulo finale (default 10000)

    Returns:
        Output della funzione (0-9999)
    """
    if len(numbers) != len(coefficients):
        raise ValueError("Numbers and coefficients must have same length")

    result = bias
    for num, coeff in zip(numbers, coefficients):
        result += num * coeff

    return result % modulo
