"""
Test Script - Simula un gioco completo
Esegui: python test_game.py
"""
import requests
import time
from pprint import pprint

BASE_URL = "http://localhost:8000/api"


def print_section(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_full_game():
    """Testa flusso completo di un gioco"""

    print_section("1. CREAZIONE GIOCO")
    response = requests.post(f"{BASE_URL}/game/create", json={"max_players": 3})
    game = response.json()
    game_id = game["game_id"]
    print(f"Gioco creato: {game_id}")
    print(f"Status: {game['status']}")

    print_section("2. REGISTRAZIONE GIOCATORI")
    players = []
    for i in range(3):
        player_address = f"0xPlayer{i+1}"
        response = requests.post(
            f"{BASE_URL}/game/{game_id}/register",
            json={"player_address": player_address}
        )
        player = response.json()
        players.append(player_address)
        print(f"Giocatore {i+1} registrato: {player_address}")
        print(f"  XPF Balance: {player['xpf_balance']}")

    time.sleep(1)  # Aspetta VRF fulfillment

    print_section("3. STATO DOPO REGISTRAZIONE")
    response = requests.get(f"{BASE_URL}/game/{game_id}")
    game = response.json()
    print(f"Status gioco: {game['status']}")
    print(f"Seed funzione: {game['seed_function'][:20]}..." if game['seed_function'] else "Non ancora generato")

    for p in game['players']:
        print(f"\nPlayer {p['address']}:")
        print(f"  Seed: {p['seed_player'][:20]}..." if p['seed_player'] else "  Seed: None")
        print(f"  Status: {p['status']}")

    print_section("4. DERIVAZIONE NUMERI")
    player_numbers = {}
    for player_addr in players:
        player_data = next(p for p in game['players'] if p['address'] == player_addr)
        if player_data['seed_player']:
            response = requests.post(
                f"{BASE_URL}/crypto/derive-numbers",
                json={"seed_player": player_data['seed_player']}
            )
            numbers = response.json()['numbers']
            player_numbers[player_addr] = numbers
            print(f"\n{player_addr}:")
            print(f"  Numeri: {numbers}")

    print_section("5. GENERAZIONE KEYPAIR E COMMITMENT")
    for player_addr in players:
        # Genera keypair
        response = requests.post(f"{BASE_URL}/crypto/generate-keypair")
        keys = response.json()
        print(f"\n{player_addr}: Keypair generato")

        # Simula cifratura (per demo usiamo placeholder)
        encrypted_numbers = [f"enc_{num}" for num in player_numbers[player_addr]]

        # Genera ZK proof
        player_data = next(p for p in game['players'] if p['address'] == player_addr)
        response = requests.post(
            f"{BASE_URL}/crypto/generate-zk-proof-commitment",
            json={
                "seed_player": player_data['seed_player'],
                "numbers": player_numbers[player_addr],
                "encrypted_numbers": encrypted_numbers,
                "public_key": keys['public_key']
            }
        )
        zk_proof = response.json()['zk_proof']

        # Sottometti commitment
        response = requests.post(
            f"{BASE_URL}/game/{game_id}/commitment",
            json={
                "player_address": player_addr,
                "public_key": keys['public_key'],
                "encrypted_numbers": encrypted_numbers,
                "zk_proof": zk_proof
            }
        )
        result = response.json()
        print(f"  Commitment submitted: {result['tx_hash'][:20]}...")

    time.sleep(0.5)

    print_section("6. FUNZIONE DI VALIDAZIONE GENERATA")
    response = requests.get(f"{BASE_URL}/game/{game_id}")
    game = response.json()
    print(f"Status: {game['status']}")
    print(f"Coefficienti: {game['function_coefficients']}")
    print(f"Bias: {game['function_bias']}")

    print_section("7. GENERAZIONE VARIAZIONI (TUTTE E 9)")
    player_variations = {p: [] for p in players}

    # TUTTI i giocatori fanno tutte le 9 variazioni
    for player_addr in players:
        print(f"\n{player_addr}:")
        current_numbers = player_numbers[player_addr].copy()

        # Genera TUTTE le 9 variazioni
        for i in range(9):
            # Request
            response = requests.post(
                f"{BASE_URL}/game/{game_id}/variation/request",
                json={"player_address": player_addr}
            )
            req_result = response.json()

            # Compute
            response = requests.post(
                f"{BASE_URL}/game/{game_id}/variation/compute",
                json={
                    "player_address": player_addr,
                    "current_numbers": current_numbers
                }
            )
            variation = response.json()
            player_variations[player_addr].append(variation)

            print(f"  Variazione {i+1}: Output = {variation['output']}, XPF rimasti = {variation['xpf_remaining']}")

            # Aggiorna numeri per prossima variazione
            current_numbers = variation['new_numbers']

    print_section("8. SUBMISSION FINALE")
    for player_addr in players:
        player_data = next(p for p in game['players'] if p['address'] == player_addr)

        # Trova output migliore
        if player_variations[player_addr]:
            best_var = max(player_variations[player_addr], key=lambda v: v['output'])
            output_declared = best_var['output']
            variations_count = len(player_variations[player_addr])
        else:
            # Calcola output iniziale (nessuna variazione)
            from crypto.number_derivation import calculate_validation_function
            output_declared = calculate_validation_function(
                player_numbers[player_addr],
                game['function_coefficients'],
                game['function_bias']
            )
            variations_count = 0

        # Genera ZK proof finale
        response = requests.post(
            f"{BASE_URL}/crypto/generate-zk-proof-final",
            json={
                "seed_player": player_data['seed_player'],
                "seed_function": game['seed_function'],
                "output_declared": output_declared,
                "variations_count": variations_count
            }
        )
        zk_proof = response.json()['zk_proof']

        # Submit
        response = requests.post(
            f"{BASE_URL}/game/{game_id}/submit-final",
            json={
                "player_address": player_addr,
                "output_declared": output_declared,
                "encrypted_state_hash": "0xhash123",
                "variations_count": variations_count,
                "zk_proof": zk_proof
            }
        )
        result = response.json()

        print(f"{player_addr}:")
        print(f"  Output dichiarato: {output_declared}")
        print(f"  Variazioni usate: {variations_count}")
        print(f"  TX: {result['tx_hash'][:20]}...")

    time.sleep(0.5)

    print_section("9. RISULTATI FINALI")
    response = requests.get(f"{BASE_URL}/game/{game_id}")
    game = response.json()

    print(f"\nStatus gioco: {game['status']}")
    print(f"\nVINCITORE: {game['winner']}")
    print(f"Output vincente: {game['winning_output']}")

    print("\nClassifica:")
    sorted_players = sorted(
        game['players'],
        key=lambda p: p.get('final_submission', {}).get('output_declared', 0) if p.get('final_submission') else 0,
        reverse=True
    )

    for i, player in enumerate(sorted_players):
        if player.get('final_submission'):
            output = player['final_submission']['output_declared']
            variations = player['final_submission']['variations_count']
            print(f"{i+1}. {player['address']}: Output = {output}, Variazioni = {variations}, XPF spesi = {player['xpf_spent']}")

    print_section("10. XPF BALANCES FINALI")
    for player_addr in players:
        response = requests.get(f"{BASE_URL}/player/{player_addr}/xpf")
        balance = response.json()
        print(f"{player_addr}: {balance['balance']} XPF")

    print_section("TEST COMPLETATO!")
    print(f"Game ID: {game_id}")
    return game_id


if __name__ == "__main__":
    print("\n" + "🎮" * 30)
    print("  F1 AI GAME - TEST COMPLETO")
    print("🎮" * 30)

    try:
        # Verifica server
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("ERRORE: Server non raggiungibile!")
            print("Avvia il server con: python main.py")
            exit(1)

        # Esegui test
        game_id = test_full_game()

        print("\n✅ Test completato con successo!")
        print(f"\nPuoi vedere i dettagli su: http://localhost:8000/docs")
        print(f"Stato gioco: http://localhost:8000/api/game/{game_id}")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERRORE: Server non disponibile!")
        print("Avvia il server con: cd backend && python main.py")
    except Exception as e:
        print(f"\n❌ ERRORE: {e}")
        import traceback
        traceback.print_exc()
