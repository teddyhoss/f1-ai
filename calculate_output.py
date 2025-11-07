#!/usr/bin/env python3
"""
Script per calcolare manualmente l'output della funzione di validazione
Utile per verificare i calcoli del gioco
"""
import hashlib
import sys


def calculate_output(seed_function, numbers):
    """
    Calcola output della funzione di validazione

    Args:
        seed_function: Seed della funzione (hex string)
        numbers: Lista di 10 numeri del giocatore

    Returns:
        Dict con coefficienti, bias e output
    """
    if len(numbers) != 10:
        raise ValueError("Servono esattamente 10 numeri!")

    # Deriva coefficienti (c[0] ... c[9])
    coefficients = []
    for i in range(10):
        data = f"{seed_function}coefficient{i}".encode()
        hash_result = hashlib.sha256(data).digest()
        hash_int = int.from_bytes(hash_result[:4], byteorder='big')
        coeff = hash_int % 100
        coefficients.append(coeff)

    # Deriva bias
    data = f"{seed_function}bias".encode()
    hash_result = hashlib.sha256(data).digest()
    hash_int = int.from_bytes(hash_result[:4], byteorder='big')
    bias = hash_int % 1000

    # Calcola output
    # F(X) = (c[0]*X[0] + c[1]*X[1] + ... + c[9]*X[9] + bias) % 10000
    output = bias
    for i, num in enumerate(numbers):
        output += coefficients[i] * num

    output_finale = output % 10000

    return {
        "coefficients": coefficients,
        "bias": bias,
        "raw_output": output,
        "final_output": output_finale
    }


def print_detailed_calculation(seed_function, numbers):
    """Stampa calcolo dettagliato passo-passo"""

    print("=" * 70)
    print("CALCOLO FUNZIONE DI VALIDAZIONE F1 AI GAME")
    print("=" * 70)

    result = calculate_output(seed_function, numbers)

    print(f"\nSeed Function:")
    print(f"  {seed_function}")

    print(f"\nNumeri Giocatore:")
    print(f"  {numbers}")

    print(f"\nCoefficienti Derivati:")
    for i, c in enumerate(result['coefficients']):
        print(f"  c[{i}] = {c:2d}")

    print(f"\nBias:")
    print(f"  bias = {result['bias']}")

    print(f"\nCalcolo Dettagliato:")
    print(f"  F(X) = c[0]×X[0] + c[1]×X[1] + ... + c[9]×X[9] + bias")
    print()

    total = result['bias']
    print(f"  Inizio con bias: {result['bias']}")

    for i in range(10):
        term = result['coefficients'][i] * numbers[i]
        total_before = total
        total += term
        print(f"  + c[{i}]×X[{i}] = {result['coefficients'][i]:2d} × {numbers[i]:4d} = {term:6d}  (totale parziale: {total})")

    print(f"\n  Somma totale: {result['raw_output']}")
    print(f"  Applica modulo 10000: {result['raw_output']} % 10000")

    print(f"\n{'=' * 70}")
    print(f"OUTPUT FINALE: {result['final_output']}")
    print(f"{'=' * 70}\n")

    return result['final_output']


def main():
    """Main function con esempi"""

    if len(sys.argv) > 1:
        # Modalità interattiva
        if sys.argv[1] == "--help" or sys.argv[1] == "-h":
            print("Uso:")
            print("  python calculate_output.py                    # Esegue esempio")
            print("  python calculate_output.py <seed> <num0> ... <num9>  # Calcolo custom")
            print()
            print("Esempio:")
            print("  python calculate_output.py 0xabc123 347 885 171 703 465 888 249 663 923 437")
            return

        if len(sys.argv) != 12:
            print("Errore: Servono seed_function + 10 numeri")
            print("Usa --help per istruzioni")
            return

        seed_function = sys.argv[1]
        try:
            numbers = [int(x) for x in sys.argv[2:12]]
            print_detailed_calculation(seed_function, numbers)
        except ValueError:
            print("Errore: I numeri devono essere interi")
            return

    else:
        # Esempio di default
        print("\n🎮 ESEMPIO DI CALCOLO\n")

        seed_function = "0x1f2e3d4c5b6a79880abcdef123456789"
        numbers = [347, 885, 171, 703, 465, 888, 249, 663, 923, 437]

        output = print_detailed_calculation(seed_function, numbers)

        print("\n💡 TIP: Per calcolare con i tuoi dati:")
        print("  python calculate_output.py <seed_function> <num0> <num1> ... <num9>")
        print()
        print("  Esempio:")
        print(f"  python calculate_output.py {seed_function} {' '.join(map(str, numbers))}")
        print()


if __name__ == "__main__":
    main()
