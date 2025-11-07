3. Protocollo Dettagliato3.1 Fase 0: Setup InizialeObiettivo: Preparare il sistema per una nuova partita.Azioni:Smart Contract Deployment:

Deploy del contratto principale del gioco
Deploy del contratto token XPF (ERC-20 con restrizioni)
Configurazione parametri: threshold XPF, costi variazioni, reward
Registrazione verifier ZK-SNARK on-chain
Registrazione Giocatori:

Ogni giocatore registra il proprio wallet address
Smart contract minta 10 XPF per ogni nuovo giocatore
Sistema verifica che ogni giocatore ha almeno 1 XPF per partecipare
Quando 3 giocatori registrati, partita può iniziare
Output Fase 0:

Game ID univoco
Lista 3 giocatori con address
Ogni giocatore ha bilancio XPF iniziale (10 se nuovo, residuo se veterano)
Stato gioco: REGISTERING
3.2 Fase 1: Generazione Casualità VerificabileObiettivo: Generare seed casuali che nessuno poteva prevedere o manipolare.Processo VRF:Richiesta Casualità:

Smart contract richiede numero casuale a Chainlink VRF
Parametri: numero di word, callback gas limit, confirmation blocks
VRF assegna un Request ID univoco
Smart contract entra in stato: AWAITING_RANDOMNESS
Generazione Off-Chain (Chainlink):

Nodo Chainlink riceve richiesta
Nodo usa la propria chiave privata per generare output
Output è deterministico dalla chiave ma imprevedibile senza
Nodo genera proof crittografica: dimostrazione matematica che output deriva dalla chiave
Proof utilizza curve ellittiche (secp256k1)
Fulfillment On-Chain:

Nodo Chainlink invia transazione con seed e proof
Smart contract verifica la proof matematicamente
Verifica usa chiave pubblica del nodo (già registrata)
Se proof valida: seed accettato e registrato immutabilmente
Se proof invalida: transazione reverte, nodo perde reputazione
Derivazione Seed per Giocatore:

Smart contract calcola seed univoco per ogni giocatore
Formula: seed_player = Hash(seed_game || address_giocatore || game_id || timestamp)
Ogni giocatore ottiene seed deterministico ma unico
Seed pubblicati on-chain, accessibili a tutti
Proprietà Garantite:

Casualità verificabile: chiunque può verificare la proof VRF
Non manipolabile: impossibile falsificare senza chiave privata nodo
Non prevedibile: nessuno poteva sapere il seed prima del fulfillment
Deterministico: stessi input producono sempre stesso seed
Immutabile: una volta on-chain, impossibile modificare
Output Fase 1:

seed_game: seed principale della partita (256 bit)
proof_VRF: prova crittografica di validità
seed_player_1, seed_player_2, seed_player_3: seed individuali
Timestamp di generazione
Stato gioco: RANDOMNESS_FULFILLED
3.3 Fase 2: Generazione Lista e CommitmentObiettivo: Ogni giocatore genera la propria lista di numeri, la cifra immediatamente, e fa commitment on-chain senza rivelare i valori.Processo Client-Side:Step 1: Ascolto Evento Blockchain

Client monitora eventi smart contract
Riceve notifica quando seed_player disponibile
Scarica seed_player dal contratto (pubblico)
Step 2: Derivazione Numeri (Locale)

Client esegue funzione deterministica in memoria
Per ogni posizione i da 0 a 9:

Calcola hash = Hash(seed_player || indice_i)
Converte hash in numero: numero_i = hash modulo 1001


Lista completa di 10 numeri generata in millisecondi
I numeri esistono in chiaro solo nella RAM del browser
Esempio Derivazione:
seed_player_1 = 0xabc123...
X[0] = Hash(0xabc123... || "0") % 1001 = 347
X[1] = Hash(0xabc123... || "1") % 1001 = 892
X[2] = Hash(0xabc123... || "2") % 1001 = 156
...
X[9] = Hash(0xabc123... || "9") % 1001 = 678Step 3: Generazione Chiavi Omomorfe

Client genera coppia chiavi crittografia omomorfica
Algoritmo: Paillier o BFV/CKKS (a seconda della funzione F)
Chiave pubblica: usata per cifrare e calcolare su cifrati
Chiave privata: usata solo per decifrare, rimane sul client
Generazione avviene in memoria sicura del browser
Step 4: Cifratura Immediata

Ogni numero viene cifrato con chiave pubblica omomorfica
Cifratura include randomness per non-determinismo
Lista cifrata: array di 10 ciphertext
Dimensione: ogni ciphertext 256-2048 bytes (dipende da schema)
Dopo cifratura, numeri in chiaro vengono cancellati dalla memoria
Step 5: Generazione ZK-SNARK Proof #1 (Commitment Proof)Scopo della Proof:
Dimostrare matematicamente al mondo che:

"Conosco una lista di 10 numeri X[0]...X[9]"
"Ogni X[i] deriva correttamente da seed_player tramite Hash(seed || i) % 1001"
"I ciphertext cifrano effettivamente questi numeri"
"Il commitment è l'hash corretto dei ciphertext"
Ma NON rivelo quali sono i numeri
Input della Proof:Input Pubblici (visibili a tutti):

seed_player (già on-chain)
public_key (chiave omomorfica pubblica)
encrypted_numbers (array di 10 ciphertext)
commitment (hash dei dati sopra)
Input Privati (witness, solo il prover sa):

private_numbers (i 10 numeri in chiaro: 347, 892, ...)
randomness_values (i 10 valori casuali usati per cifrare)
Circuit ZK-SNARK:Il circuit è un insieme di vincoli matematici (constraints) che devono essere tutti soddisfatti:Constraint 1 - Derivazione Corretta:

Per ogni i da 0 a 9:
private_numbers[i] DEVE essere uguale a Hash(seed_player || i) % 1001
Verifica che i numeri derivano dal seed pubblico
Constraint 2 - Cifratura Corretta:

Per ogni i da 0 a 9:
encrypted_numbers[i] DEVE essere uguale a Encrypt(private_numbers[i], public_key, randomness_values[i])
Verifica che i ciphertext corrispondono ai numeri privati
Constraint 3 - Range Validity:

Per ogni i da 0 a 9:
private_numbers[i] >= 0 AND private_numbers[i] <= 1000
Verifica che i numeri sono nel range valido
Constraint 4 - Commitment Corretto:

commitment DEVE essere uguale a Hash(encrypted_numbers || public_key)
Verifica che il commitment vincola correttamente i dati
Generazione della Proof:

Client esegue algoritmo ZK-SNARK (Groth16, PLONK, o Stark)
Input: circuit + input pubblici + witness privati
Output: proof (200-500 bytes)
Tempo: 5-30 secondi (dipende da complessità circuit)
La proof è un oggetto crittografico che MATEMATICAMENTE prova che tutti i constraint sono soddisfatti
Proprietà della Proof:

Completezza: se i constraint sono soddisfatti, la proof sarà valida
Soundness: impossibile generare proof valida se anche un solo constraint è falso
Zero-Knowledge: la proof non rivela alcuna informazione sui witness privati
Succinta: la proof è piccola (500 bytes) anche se i witness sono grandi
Verificabile: chiunque può verificare in pochi millisecondi on-chain
Step 6: Calcolo Commitment

commitment = Hash(encrypted_numbers || public_key || timestamp)
Hash function: Keccak256 (usata da Ethereum)
Il commitment "sigilla" i dati: impossibile modificarli dopo
Step 7: Submission On-ChainIl client invia transazione blockchain con:

commitment (32 bytes)
public_key (lunghezza variabile, 256-2048 bytes)
encrypted_numbers (opzionale: può essere su IPFS, solo hash on-chain)
zk_proof (200-500 bytes)
Smart Contract verifica:

Proof ZK-SNARK è matematicamente valida
Verifier on-chain esegue algoritmo di verifica
Se valida: registra il commitment
Se invalida: transazione reverte, giocatore non può procedere
Smart Contract registra:

Player address → Commitment data
Player address → Public key
Player address → Timestamp
Player address → Status: COMMITTED
Evento emesso:

CommitmentSubmitted(player_address, commitment, timestamp)
Garanzie di Questa Fase:Matematiche:

Impossibile fare commitment di numeri che non derivano da seed_player
Impossibile fare commitment di numeri fuori range
Impossibile falsificare la proof senza conoscere i witness corretti
La proof garantisce al 100% matematico che tutto è corretto
Procedurali:

Il commitment è immutabile una volta on-chain
Il timestamp previene modifiche retroattive
La blockchain registra tutto pubblicamente
Chiunque può verificare la proof in qualsiasi momento
Privacy:

I numeri in chiaro non sono mai stati rivelati
La proof ZK non leak alcuna informazione sui numeri
Solo encrypted_numbers sono pubblici (indecifrabili senza chiave privata)
Neanche il client può più vedere i numeri (cancellati dopo cifratura)
Output Fase 2:

3 commitment registrati on-chain (uno per giocatore)
3 chiavi pubbliche omorforfe registrate
3 proof ZK-SNARK verificate
Tutti i dati immutabili sulla blockchain
Stato gioco: ALL_COMMITTED
3.4 Fase 3: Generazione Funzione di ValidazioneObiettivo: Generare una funzione casuale F che sarà usata da tutti i giocatori, garantendo che nessuno poteva prevederla durante la fase di commitment.Timing Critico:

Questa fase avviene SOLO DOPO che tutti i commitment sono on-chain
Impossibile per i giocatori ottimizzare la lista sulla funzione
I commitment sono già sigillati e immutabili
Processo:Step 1: Smart Contract Verifica Prerequisiti

Controlla che tutti e 3 i giocatori hanno fatto commitment validi
Verifica che i commitment hanno timestamp validi
Controlla che non sia già stata generata una funzione per questo game
Step 2: Derivazione Seed Funzione

Smart contract calcola: seed_function = Hash(seed_game || block.timestamp || "VALIDATION_FUNCTION")
Usa anche timestamp corrente per unicità
seed_function pubblicato on-chain
Evento emesso: FunctionSeedGenerated(seed_function)
Step 3: Costruzione Deterministica FunzioneTutti (client, server, chiunque) possono derivare la stessa funzione da seed_function:Tipo di Funzione: Polinomio Lineare ModulareLa funzione ha la forma:
F(X[0], X[1], ..., X[9]) = (c[0]*X[0] + c[1]*X[1] + ... + c[9]*X[9] + bias) % moduloDove:

c[i]: coefficienti casuali (uno per ogni numero della lista)
bias: termine costante casuale
modulo: valore per mantenere output in range gestibile
Derivazione Coefficienti:

Per ogni i da 0 a 9:

c[i] = Hash(seed_function || "coefficient" || i) % 100
Coefficiente tra 0 e 99


bias = Hash(seed_function || "bias") % 1000

Bias tra 0 e 999


modulo = 10000

Output della funzione sarà tra 0 e 9999


Esempio Concreto:
seed_function = 0x9876abcd...

c[0] = Hash(0x9876... || "coefficient" || "0") % 100 = 37
c[1] = Hash(0x9876... || "coefficient" || "1") % 100 = 82
c[2] = Hash(0x9876... || "coefficient" || "2") % 100 = 15
...
c[9] = Hash(0x9876... || "coefficient" || "9") % 100 = 71

bias = Hash(0x9876... || "bias") % 1000 = 523

Funzione F:
F(X) = (37*X[0] + 82*X[1] + 15*X[2] + ... + 71*X[9] + 523) % 10000Perché Questa Forma:Vantaggi:

Semplice da computare
Calcolabile omoformicamente (solo addizioni e moltiplicazioni)
Deterministica: stessi input sempre stesso output
Casuale: coefficienti imprevedibili senza seed_function
Non triviale: non c'è strategia ovvia per massimizzare
Limitazioni:

Non supporta operazioni non-lineari complesse (log, exp, divisioni)
Più semplice di funzioni arbitrarie
Se serve complessità maggiore: usare polinomi di grado superiore o più termini
Alternative Possibili:Polinomio Quadratico:
F(X) = sum(c1[i]*X[i]) + sum(c2[i,j]*X[i]*X[j]) + bias
Più complesso
Richiede più coefficienti
Più difficile per crittografia omomorfica
Funzione a Pezzi:
if X[0] > 500: use formula_A
else: use formula_B
Molto difficile/impossibile con crittografia omomorfica
Richiede confronti su dati cifrati (costoso o impossibile)
Step 4: Pubblicazione ParametriSmart contract memorizza:

seed_function
modulo (costante)
timestamp generazione
Tutti possono ricalcolare coefficienti quando serve, quindi non serve memorizzarli on-chain (risparmio gas).Step 5: Verifica PubblicaChiunque può:

Scaricare seed_function dalla blockchain
Ricalcolare coefficienti localmente
Verificare che tutti usano stessa funzione
Testare la funzione con valori esempio
Proprietà Garantite:Casualità:

Coefficienti derivano da seed_function (casuale da VRF originale)
Impossibile prevedere coefficienti prima del seed
Distribuzione uniforme dei coefficienti
Fairness:

Stessa funzione per tutti i giocatori
Nessun vantaggio informativo
Deterministica e verificabile
Non-Manipolabilità:

seed_function generato DOPO i commitment
Impossibile scegliere funzione a posteriori
Immutabile una volta generato
Computabilità Omomorfica:

Solo operazioni lineari (addizione, moltiplicazione)
Server può calcolare F su dati cifrati
Performance accettabili
Output Fase 3:

seed_function registrato on-chain
Funzione F deterministicamente definita
Tutti i partecipanti hanno stessa funzione
Stato gioco: FUNCTION_GENERATED
3.5 Fase 4: Gameplay - Generazione VariazioniObiettivo: Ogni giocatore può richiedere fino a 9 variazioni della propria lista, vedere gli output, e scegliere strategicamente quante generarne bilanciando probabilità di output alto vs. consumo di XPF.Ciclo di Variazione (ripetibile fino a 9 volte):Step 1: Decisione del GiocatoreIl giocatore valuta:

XPF rimasti nel wallet
Output attuale migliore
Quante variazioni già generate
Strategia rischio/ricompensa
Interfaccia mostra:

"XPF rimasti: 7/10"
"Variazioni generate: 2/9"
"Output migliore finora: 4827"
"Generare variazione costa 1 XPF"
Bottone: "Genera Variazione" o "Scegli e Gioca"
Step 2: Richiesta Variazione (On-Chain)Se giocatore decide di generare:Client invia transazione on-chain:

Funzione: requestVariation(game_id)
Allega: gas fees
Smart Contract verifica:

Giocatore ha fatto commitment valido
Giocatore ha status COMMITTED o GENERATING
Giocatore ha almeno 2 XPF (1 per variazione + 1 per giocare dopo)
Giocatore ha generato < 9 variazioni già
Funzione di validazione è stata generata
Smart Contract esegue:

Burn 1 XPF dal wallet del giocatore
Incrementa contatore variazioni del giocatore
Genera requestId univoco
Aggiorna stato giocatore: GENERATING
Emette evento: VariationRequested(player, game_id, request_id, variation_number)
Se verifiche falliscono:

Transazione reverte
Giocatore riceve errore (es. "XPF insufficienti")
Nessun XPF bruciato
Step 3: Server Riceve Richiesta (Off-Chain)Server (o client stesso se ha risorse):

Ascolta evento VariationRequested dalla blockchain
Verifica che burn XPF è avvenuto (trustless: controlla blockchain)
Scarica encrypted_numbers corrente del giocatore
Scarica public_key del giocatore
Scarica parametri funzione F (seed_function)
Step 4: Generazione Delta (Server)Server genera modifiche casuali:

Per ogni posizione i da 0 a 9:

delta[i] = numero casuale tra -20 e +20
Esempio: [+13, -7, +5, -18, +20, -3, +9, -15, +11, -8]


Casualità server:

Usa RNG crittografico sicuro locale
Opzionale: seed da blockchain per verificabilità
Ogni variazione ha delta diversi
Step 5: Calcolo Omomorfico (Server)Questa è la parte "magica": il server calcola senza vedere i numeri.Modifica Lista (Omomorfica):
Per ogni numero della lista:

Input: encrypted_X[i] (ciphertext del numero corrente)
Operazione: encrypted_X_new[i] = HomomorphicAdd(encrypted_X[i], Encrypt(delta[i], public_key))
Output: encrypted_X_new[i] (ciphertext del numero modificato)
Proprietà omomorfica:

Se encrypted_X[i] cifra il valore V
E Encrypt(delta[i]) cifra il valore D
Allora HomomorphicAdd(...) cifra il valore V+D
SENZA che il server veda mai V, D, o V+D in chiaro!
Calcolo Output (Omomorfico):Il server deve calcolare F(X_new[0], ..., X_new[9]) dove:
F = (c[0]*X[0] + c[1]*X[1] + ... + c[9]*X[9] + bias) % moduloCalcolo omomorfico passo-passo:Inizializzazione:

encrypted_output = Encrypt(bias, public_key)
Cifra il termine costante
Per ogni termine i da 0 a 9:

Calcola: encrypted_term = HomomorphicMultiply(encrypted_X_new[i], c[i])

Moltiplica il ciphertext per il coefficiente pubblico
Risultato: ciphertext che cifra (X_new[i] * c[i])



Somma: encrypted_output = HomomorphicAdd(encrypted_output, encrypted_term)

Aggiunge il termine all'output accumulato
Risultato: ciphertext che cifra la somma parziale


Dopo il loop:

encrypted_output cifra: c[0]*X[0] + ... + c[9]*X[9] + bias
Il modulo non può essere applicato omoformicamente (operazione problematica)
Soluzione: si applica dopo decifratura lato client
Proprietà Cruciale:

Il server ha eseguito tutti i calcoli
Ma NON ha mai visto X[i], X_new[i], o output in chiaro
Ha lavorato solo con ciphertext
La matematica garantisce che il risultato è corretto
Step 6: Registrazione Variazione (Server)Server memorizza (database locale o IPFS):

request_id
encrypted_numbers_new (lista modificata cifrata)
encrypted_output (output cifrato)
deltas usati (per eventuale verifica futura)
timestamp
Opzionalmente:

Hash della variazione pubblicato on-chain per verificabilità
Ma dati completi off-chain per risparmiare gas
Step 7: Risposta al Client (Off-Chain)Server invia al client:

encrypted_numbers_new
encrypted_output
signature del server (opzionale, per autenticità)
Step 8: Decifratura Output (Client)Client riceve encrypted_output:

Usa la propria private_key per decifrare
output_raw = Decrypt(encrypted_output, private_key)
output_final = output_raw % modulo

Applica modulo (il server non poteva farlo omoformicamente)


Esempio: output_final = 4827
Client mostra al giocatore:

"Variazione 2: Output = 4827"
Confronto con variazioni precedenti
"XPF rimasti: 6/10"
Cruciale:

Client NON decifra encrypted_numbers_new
I numeri modificati restano cifrati
Client vede SOLO l'output numerico
Privacy mantenuta
Step 9: Memorizzazione Locale (Client)Client tiene traccia di tutte le variazioni:
Variazioni = [
  { index: 0, encrypted_state: [E(X0),...], output: 4234 },  // iniziale
  { index: 1, encrypted_state: [E(X0'),...], output: 4827 }, // var 1
  { index: 2, encrypted_state: [E(X0''),...], output: 3912 } // var 2
]Step 10: Decisione IterazioneGiocatore decide:

"Voglio generare altra variazione" → torna a Step 1
"Ho finito, scelgo questa" → va a Fase 5
Vincoli:

Max 9 iterazioni totali
Deve conservare almeno 1 XPF per giocare
Non può più generare se XPF < 2
Caso Limite: XPF EsauritiSe giocatore usa tutti i 10 XPF prima di giocare:

Smart contract marca status: DISQUALIFIED
Non può sottomettere scelta finale
Perde automaticamente la partita
Evento: PlayerDisqualified(player, reason: "Exhausted XPF")
Protezioni UI:Client mostra warning progressivi:

XPF = 5: "Attenzione, rimangono pochi XPF"
XPF = 3: "Sei vicino al limite critico"
XPF = 2: "ULTIMA VARIAZIONE POSSIBILE! Dopo questa dovrai giocare"
XPF = 1: Bottone "Genera Variazione" disabilitato

Solo bottone "Scegli e Gioca" disponibile


Timeout (Opzionale):Smart contract può avere deadline:

Tempo massimo per generare variazioni (es. 10 minuti)
Se scaduto: giocatore deve scegliere con quello che ha
Previene stallo del gioco
Output Fase 4 (per ogni giocatore):

N variazioni generate (0 <= N <= 9)
N+1 opzioni totali disponibili (iniziale + variazioni)
XPF consumati registrati on-chain
Stato variazioni memorizzato (off-chain o hash on-chain)
Giocatore pronto per scegliere opzione finale
3.6 Fase 5: Scelta Finale e SubmissionObiettivo: Il giocatore seleziona quale delle sue opzioni (iniziale + variazioni) tenere come submission finale e la registra on-chain, provando matematicamente la sua validità.Step 1: Selezione da Parte del GiocatoreGiocatore revisiona tutte le opzioni:
[✓] Stato Iniziale:  Output = 4234
[ ] Variazione 1:    Output = 4827
[ ] Variazione 2:    Output = 3912
[✓] Variazione 3:    Output = 5103  ← selezionato (massimo)
[ ] Variazione 4:    Output = 4456
... (se ha generato altre)Giocatore clicca su "Scegli Variazione 3 e Gioca"Step 2: Verifica Prerequisiti (Client)Client verifica localmente:

XPF rimasti >= 1 (necessario per giocare)
Ha fatto commitment valido in Fase 2
Ha encrypted_state corrispondente alla variazione scelta
Game status permette submission
Se checks falliscono:

Mostra errore al giocatore
Non procede con submission
Step 3: Generazione ZK-SNARK Proof #2 (Final Validation Proof)Questa è la proof più complessa: dimostra che l'intera catena di operazioni è stata valida.Scopo della Proof:
Dimostrare matematicamente che:

"I miei numeri iniziali X_initial[0]...X_initial[9] derivano dal seed_player"
"Ho fatto esattamente N variazioni (dove N è il numero dichiarato)"
"Ogni variazione ha modificato i numeri con delta tra -20 e +20"
"I numeri finali X_final[0]...X_final[9] sono il risultato delle N variazioni su X_initial"
"Tutti i numeri finali sono nel range [0, 1000]"
"Il mio output dichiarato è F(X_final) calcolato correttamente"
"encrypted_state_final cifra effettivamente X_final"
Ma NON rivelo X_initial, X_final, o i delta usati
Input della Proof:Input Pubblici (visibili a tutti, on-chain):

seed_player (il seed personale del giocatore, già on-chain)
seed_function (seed della funzione F, già on-chain)
encrypted_state_final (lo stato cifrato scelto)
output_declared (il numero output che il giocatore dichiara, es. 5103)
variations_count (quante variazioni ha fatto, es. 3)
public_key (chiave omomorfica pubblica del giocatore)
Input Privati (witness, solo il giocatore conosce):

X_initial[0...9] (i 10 numeri iniziali in chiaro)
X_final[0...9] (i 10 numeri finali in chiaro, dopo variazioni)
deltas_history[variazione][indice] (tutte le modifiche fatte)

Esempio per 3 variazioni: array 3×10 di delta
deltas_history[0] = [+13, -7, +5, ...] // variazione 1
deltas_history[1] = [+2, +15, -8, ...] // variazione 2
deltas_history[2] = [-5, +3, +11, ...] // variazione 3


randomness_values[0...9] (casualità usata per cifrare X_final)
Circuit ZK-SNARK Completo:Il circuit contiene tutti i constraint che devono essere soddisfatti simultaneamente:Gruppo 1: Derivazione Iniziale Corretta
Per ogni i da 0 a 9:
  CONSTRAINT: X_initial[i] == Hash(seed_player || i) % 1001
  
Verifica: i numeri iniziali derivano dal seed pubblico
Se falso: impossibile generare proof validaGruppo 2: Range Validity Iniziale
Per ogni i da 0 a 9:
  CONSTRAINT: X_initial[i] >= 0
  CONSTRAINT: X_initial[i] <= 1000
  
Verifica: numeri iniziali nel range validoGruppo 3: Validità Delta
Per ogni variazione v da 0 a variations_count-1:
  Per ogni indice i da 0 a 9:
    CONSTRAINT: deltas_history[v][i] >= -20
    CONSTRAINT: deltas_history[v][i] <= 20
    
Verifica: tutte le modifiche rispettano il limite ±20
Critico per anti-cheatGruppo 4: Applicazione Variazioni Corretta
Per ogni indice i da 0 a 9:
  sum = X_initial[i]
  Per ogni variazione v da 0 a variations_count-1:
    sum = sum + deltas_history[v][i]
  CONSTRAINT: X_final[i] == sum
  
Verifica: i numeri finali sono il risultato dell'applicazione sequenziale dei delta
Matematica: X_final[i] = X_initial[i] + Σ(delta[v][i])Gruppo 5: Range Validity Finale
Per ogni i da 0 a 9:
  CONSTRAINT: X_final[i] >= 0
  CONSTRAINT: X_final[i] <= 1000
  
Verifica: dopo tutte le variazioni, numeri ancora validi
Esempio: se X[i] era 5 e applichi -20, diventa -15 (invalido!)Gruppo 6: Calcolo Output Corretto
// Deriva coefficienti dalla funzione (pubblici)
Per ogni i da 0 a 9:
  c[i] = Hash(seed_function || "coefficient" || i) % 100

bias = Hash(seed_function || "bias") % 1000

// Calcola output
computed_output = bias
Per ogni i da 0 a 9:
  computed_output = computed_output + (c[i] * X_final[i])
computed_output = computed_output % 10000

CONSTRAINT: computed_output == output_declared

Verifica: l'output dichiarato è effettivamente F(X_final)Gruppo 7: Cifratura Corretta
Per ogni i da 0 a 9:
  CONSTRAINT: encrypted_state_final[i] == Encrypt(X_final[i], public_key, randomness_values[i])
  
Verifica: i ciphertext cifrano effettivamente X_finalGruppo 8: Consistenza Commitment Originale (Opzionale)
// Verifica che X_initial corrisponde al commitment fatto in Fase 2
encrypted_initial = Encrypt(X_initial, public_key, original_randomness)
CONSTRAINT: Hash(encrypted_initial) == commitment_originale

Verifica: il giocatore sta usando gli stessi numeri iniziali committedGenerazione della Proof:Processo (eseguito nel browser del client):

Algoritmo: Groth16, PLONK, o STARK
Input: circuit (compilato) + input pubblici + witness privati
Computazione: algoritmi di pairing su curve ellittiche
Output: proof (oggetto crittografico 200-500 bytes)
Tempo: 10-60 secondi (dipende da complessità)

Variazioni molte (9) → più tempo
Circuit grande → più tempo
Hardware client → influenza performance


Durante generazione:

Browser mostra "Generando proof di validità... 45%"
CPU intensivo (può usare WebAssembly per velocità)
Una volta completato, proof è un blob binario
Proprietà della Proof Generata:Matematiche:

Se anche UN SOLO constraint è falso → impossibile generare proof valida
Probabilità di falsificare proof: 2^-128 (praticamente zero)
La proof è "succinta": dimensione costante indipendente da witness
Verifica è veloce: pochi millisecondi on-chain
Zero-Knowledge:

La proof NON contiene informazioni sui witness
Impossibile dedurre X_initial, X_final, o delta dalla proof
Anche con infinite proof non si possono inferire i segreti
Informazione rivelata: SOLO che i constraint sono soddisfatti
Step 4: Preparazione Dati SubmissionClient prepara payload per transazione on-chain:

output_declared: 5103 (pubblico)
encrypted_state_final: array di ciphertext (pubblico ma incomprensibile)
variations_count: 3 (pubblico)
zk_proof: blob binario 500 bytes (pubblico, verificabile)
optional: metadata (quale variazione scelta, timestamp locale)
Step 5: Transaction On-ChainClient invia transazione Ethereum:

Funzione: submitFinalChoice(game_id, output_declared, encrypted_state_final, variations_count, zk_proof)
Gas: stimato alto (verifica ZK consuma gas)
Firma: con private key del wallet
Smart Contract esegue:Verifica 1: Prerequisiti
require(players[msg.sender].status == COMMITTED || GENERATING)
require(game.status == PLAYING)
require(game.function_seed != 0)  // funzione già generata
require(players[msg.sender].final_submission == false)  // non già submittedVerifica 2: XPF Disponibili
uint256 xpf_balance = xpfToken.balanceOf(msg.sender)
require(xpf_balance >= 1, "Need 1 XPF to play")Verifica 3: ZK-SNARK Proof (CRUCIALE)
// Prepara input pubblici per verifier
uint256[] memory publicInputs = [
    uint256(players[msg.sender].seed_player),
    uint256(game.seed_function),
    uint256(keccak256(encrypted_state_final)),
    output_declared,
    variations_count,
    uint256(keccak256(players[msg.sender].public_key))
];

// Verifica proof matematicamente
bool proofValid = zkVerifier.verifyProof(
    zk_proof,
    publicInputs
);

require(proofValid, "Invalid ZK proof - cheating detected");Se proof invalida:

Transazione reverte
Gas speso comunque (penalità per tentativo di cheat)
Giocatore riceve errore
Non può procedere
Se proof valida:

Smart contract sa con certezza matematica al 100% che:

Numeri iniziali derivano da seed
Tutte variazioni valide (±20)
Output calcolato correttamente
Numeri in range


Ma NON sa quali sono i numeri!
Verifica 4: Variazioni Count Sensato
require(variations_count <= 9, "Max 9 variations")
require(variations_count == players[msg.sender].variations_generated, "Variations count mismatch")Azione 1: Burn XPF Finale
xpfToken.burn(msg.sender, 1 * 10**18);  // 1 XPF per giocare
players[msg.sender].xpf_spent_total = initial_xpf - current_xpf;Azione 2: Registrazione Submission
players[msg.sender].final_output = output_declared;
players[msg.sender].final_encrypted_state = keccak256(encrypted_state_final);  // hash per gas saving
players[msg.sender].final_submission = true;
players[msg.sender].submission_timestamp = block.timestamp;
players[msg.sender].status = SUBMITTED;Azione 3: Incremento Counter Gioco
game.submissions_count++;

if (game.submissions_count == 3) {  // tutti hanno submitted
    game.status = ALL_SUBMITTED;
    emit AllPlayersSubmitted(game.id, block.timestamp);
}Evento Emesso:
emit FinalChoiceSubmitted(
    msg.sender,
    game.id,
    output_declared,
    variations_count,
    players[msg.sender].xpf_spent_total,
    block.timestamp
);Step 6: Conferma al ClientClient riceve:

Transaction hash
Conferma di successo
Gas consumato
Nuovo stato XPF
Client mostra:

"✓ Scelta registrata on-chain!"
"Output submitted: 5103"
"XPF rimasti: 6"
"In attesa degli altri giocatori..."
Gestione Timeout:Se altri giocatori non fanno submission entro deadline:
function handleTimeout() external {
    require(block.timestamp > game.submission_deadline);
    require(game.status == PLAYING);
    
    // Marca giocatori non-submitted come TIMED_OUT
    // Procede con chi ha submitted
    // O annulla gioco se nessuno ha submitted
}Output Fase 5 (per ogni giocatore che completa):

Final output dichiarato e verificato (on-chain)
ZK proof validata matematicamente
XPF finale bruciato (1 token)
Status: SUBMITTED
Timestamp immutabile
Dati verificabili pubblicamente
Garanzie di Questa Fase:Matematiche (da ZK-SNARK):

Impossibile dichiarare output falso
Impossibile usare variazioni > ±20
Impossibile usare numeri fuori range
Impossibile usare numeri diversi da quelli committed
Procedurali (da Smart Contract):

Una submission per giocatore
XPF correttamente consumato
Timestamp certificato dalla blockchain
Immutabile e irreversibile
Stato Finale Fase 5:

3 giocatori con status SUBMITTED (se tutti completano)
3 output dichiarati on-chain
Game status: ALL_SUBMITTED
Sistema pronto per determinare vincitore
3.7 Fase 6: Determinazione VincitoreObiettivo: Smart contract confronta gli output dei giocatori e dichiara il vincitore in modo trasparente e verificabile.Prerequisiti:

Tutti e 3 i giocatori hanno status SUBMITTED
O deadline scaduta e si procede con chi ha submitted
Game status: ALL_SUBMITTED
Processo:Step 1: Trigger DeterminazioneChiunque può chiamare (funzione pubblica):
function determineWinner(uint256 game_id) externalO automaticamente dopo ultimo submission.Step 2: Verifica PrerequisitiSmart contract verifica:

Game status è ALL_SUBMITTED o TIMEOUT_REACHED
Almeno 1 giocatore ha submitted (senso ha vincitore)
Winner non già determinato (idempotenza)
Step 3: Confronto OutputAlgoritmo semplice on-chain:
uint256 maxOutput = 0;
address winner;
uint256 validPlayers = 0;

for (address player in game.players) {
    if (players[player].status == SUBMITTED) {
        validPlayers++;
        
        if (players[player].final_output > maxOutput) {
            maxOutput = players[player].final_output;
            winner = player;
        }
    }
    // Ignora: DISQUALIFIED, TIMED_OUT, ACTIVE
}

require(validPlayers > 0, "No valid players");Gestione Pareggio (Tie):Se due o più giocatori hanno output identico:
if (players[player].final_output == maxOutput) {
    // Tiebreaker: chi ha submitted prima
    if (players[player].submission_timestamp < players[winner].submission_timestamp) {
        winner = player;
    }
}O alternativamente:

Confronto XPF spesi (chi ha usato meno vince)
Hash degli address (deterministico)
Condivisione reward
Step 4: Registrazione VincitoreSmart contract aggiorna stato:
game.winner = winner;
game.winning_output = maxOutput;
game.status = WINNER_DECLARED;
game.declaration_timestamp = block.timestamp;
game.challenge_deadline = block.timestamp + 24 hours;  // challenge periodStep 5: Evento Pubblicoemit WinnerDeclared(
    game.id,
    winner,
    maxOutput,
    validPlayers,
    block.timestamp
);Evento include:

Game ID
Indirizzo vincitore
Output vincente
Quanti giocatori validi
Timestamp
Step 6: NotificheClient di tutti i giocatori ricevono evento:

Vincitore: mostra "🎉 Hai vinto!"
Perdenti: mostra "Hai perso. Vincitore: 0xAAA con output 5103"
Tabella Comparativa Finale:
╔════════════════════════════════════════════════╗
║           RISULTATI FINALI - GAME #123         ║
╠════════════════════════════════════════════════╣
║ 🏆 VINCITORE: Player 1 (0xAAA)                 ║
║    Output: 5103                                ║
║    XPF usati: 4 (variazioni: 3, giocata: 1)   ║
║    Reward: 1 ETH + 3 XPF bonus                 ║
╠════════════════════════════════════════════════╣
║ 2. Player 2 (0xBBB)                            ║
║    Output: 4876                                ║
║    XPF usati: 8 (variazioni: 7, giocata: 1)   ║
╠════════════════════════════════════════════════╣
║ 3. Player 3 (0xCCC)                            ║
║    Output: 4321                                ║
║    XPF usati: 2 (variazioni: 1, giocata: 1)   ║
╚════════════════════════════════════════════════╝Challenge Period:Dopo dichiarazione, si apre periodo di 24h dove:

Altri giocatori possono contestare
Vincitore può prepararsi a difendersi
Se nessuna challenge → vincitore confermato automaticamente
Possibili Contestazioni:Motivi legittimi per challenge:

Dubbio sulla validità ZK proof del vincitore
Sospetto di collusion con server/validator
Problema tecnico (bug smart contract)
Dati on-chain inconsistenti
Procedura Challenge:
function challengeWinner(uint256 game_id, string reason) external payable {
    require(msg.value >= 0.1 ether, "Challenge requires 0.1 ETH stake");
    require(block.timestamp < game.challenge_deadline, "Challenge period ended");
    require(msg.sender != game.winner, "Winner cannot self-challenge");
    
    game.status = CHALLENGED;
    game.challenger = msg.sender;
    game.challenge_reason = reason;
    game.challenge_stake = msg.value;
    
    emit WinnerChallenged(game.id, msg.sender, reason, msg.value);
}Output Fase 6:

Vincitore dichiarato pubblicamente on-chain
Output vincente registrato
Challenge period attivo (24h)
Stato: WINNER_DECLARED
Tutti possono verificare risultato sulla blockchain
3.8 Fase 7: Verifica e Challenge (Opzionale)Obiettivo: Garantire integrità del risultato attraverso un sistema di challenge con incentivi economici, permettendo contestazione ma mantenendo privacy quando possibile.Scenario A: Nessuna Challenge (Caso Normale)Dopo 24 ore dalla dichiarazione:Chiunque può chiamare:
function finalizeWinner(uint256 game_id) externalSmart contract verifica:

block.timestamp > challenge_deadline
game.status == WINNER_DECLARED (non challenged)
Esegue:

game.status = CONFIRMED
Procede a distribuzione reward (Fase 8)
Scenario B: Challenge AttivaSe qualcuno ha chiamato challengeWinner entro 24h:Step 1: Notifica al VincitoreVincitore riceve notifica:

"La tua vittoria è stata contestata"
"Motivo: [reason]"
"Challenger: 0xBBB"
"Devi rispondere entro 48h o perdi"
Step 2: Risposta del Vincitore - Opzione 1: Reveal CompletoVincitore può scegliere di rivelare tutto per provare innocenza:function respondToChallengeWithReveal(
    uint256 game_id,
    uint256[10] memory X_initial,
    uint256[10] memory X_final,
    int256[][] memory deltas_history,
    bytes memory randomness_values
) externalSmart contract esegue verifica completa on-chain (gas-intensive):Verifica 1: Derivazione Iniziale
for (uint i = 0; i < 10; i++) {
    bytes32 expected = keccak256(abi.encodePacked(seed_player, i));
    uint256 expected_value = uint256(expected) % 1001;
    require(X_initial[i] == expected_value, "Initial values don't match seed");
}Verifica 2: Validità Delta
for (uint v = 0; v < variations_count; v++) {
    for (uint i = 0; i < 10; i++) {
        require(deltas_history[v][i] >= -20 && deltas_history[v][i] <= 20, "Invalid delta");
    }
}Verifica 3: Applicazione Corretta
for (uint i = 0; i < 10; i++) {
    int256 computed = int256(X_initial[i]);
    for (uint v = 0; v < variations_count; v++) {
        computed += deltas_history[v][i];
    }
    require(uint256(computed) == X_final[i], "Final values incorrect");
    require(X_final[i] >= 0 && X_final[i] <= 1000, "Final values out of range");
}Verifica 4: Output Corretto
uint256 computed_output = calculateFunction(X_final, seed_function);
require(computed_output == declared_output, "Output mismatch");Verifica 5: Cifratura Corrispondente (Opzionale)
bytes memory recomputed_encrypted = encrypt(X_final, public_key, randomness_values);
require(keccak256(recomputed_encrypted) == final_encrypted_state_hash, "Encryption mismatch");Risultato Reveal:Se tutte le verifiche passano:
game.status = CHALLENGE_FAILED;
game.winner_confirmed = true;

// Vincitore prende stake del challenger + il suo deposito indietro
payable(game.winner).transfer(challenge_stake + winner_stake);

emit ChallengeFailed(game.id, challenger, "Winner proven innocent");Se anche una verifica fallisce:
game.status = CHALLENGE_SUCCESSFUL;
game.winner = address(0);  // revoca vittoria

// Challenger vince e prende stake
payable(challenger).transfer(challenge_stake + winner_stake);

// Nuovo vincitore: secondo classificato
determineNewWinner(game_id);

emit ChallengeSuccessful(game.id, challenger, "Winner caught cheating");Conseguenze Reveal:

❌ Privacy persa: X_initial e X_final sono ora pubblici on-chain
❌ Chiunque può vedere i numeri del vincitore
✅ Ma integrità garantita al 100%
✅ Verificabile da chiunque per sempre
Step 3: Risposta del Vincitore - Opzione 2: ZK-SNARK Aggiuntiva (Privacy Preserving)Vincitore può generare una proof più specifica che risponde alla challenge:Esempio: se challenge è "credo che delta > 20":Proof che dimostra:
"Per ogni variazione v e ogni indice i:
 |delta[v][i]| <= 20"

Ma senza rivelare i delta esattiSmart contract verifica questa proof:

Se valida: challenge respinta, vincitore confermato
Se invalida o non fornita: challenger vince
Vantaggi:

✅ Privacy mantenuta
✅ Matematicamente sicuro
❌ Richiede generazione proof addizionale (tempo)
❌ Gas cost per verifica on-chain
Step 4: Timeout VincitoreSe vincitore non risponde entro 48h:
function claimChallengeVictory(uint256 game_id) external {
    require(msg.sender == game.challenger);
    require(block.timestamp > challenge_response_deadline);
    require(game.status == CHALLENGED);
    
    game.status = CHALLENGE_WON_BY_TIMEOUT;
    payable(challenger).transfer(challenge_stake + winner_stake);
    
    // Revoca vittoria
    determineNewWinner(game_id);
}Scenario C: Arbitrato DAO (Opzionale, Caso Complesso)Per dispute complesse (bug smart contract, problema tecnico):function escalateToDAO(uint256 game_id) external {
    require(game.status == CHALLENGED);
    require(challenge_severity == CRITICAL);
    
    game.status = DAO_ARBITRATION;
    
    // Crea proposal in DAO governance
    // Validators votano sulla risoluzione
    // Decisione finale vincolante
}Output Fase 7:

Se no challenge: Vincitore confermato automaticamente
Se challenge fallita: Vincitore confermato, challenger perde stake
Se challenge successo: Vincitore revocato, nuovo vincitore determinato
Privacy: persa solo se reveal necessario
Stato finale: CONFIRMED o CHALLENGE_RESOLVED
3.9 Fase 8: Distribuzione RewardObiettivo: Distribuire i premi al vincitore confermato e aggiornare l'economia XPF per incentivare efficienza.Prerequisiti:

game.status == CONFIRMED
Vincitore verificato (con o senza challenge)
24h+ 48h passati (challenge period + response period)
Componenti del Reward:1. Prize Pool (Ethereum)Se gioco ha prize pool in ETH/token:
uint256 prizePool = game.entry_fee * number_of_players;
// O da sponsor, o da pool comune

payable(game.winner).transfer(prizePool);Esempio:

Entry fee: 0.1 ETH per giocatore
3 giocatori = 0.3 ETH total
Vincitore riceve 0.3 ETH
2. XPF Bonus (Token Economy)Bonus basato su efficienza del giocatore:function calculateXPFBonus(address player) internal view returns (uint256) {
    uint256 xpf_spent = players[player].xpf_spent_total;
    
    // Formula progressiva inversa: meno spendi, più bonus
    if (xpf_spent <= 3) {
        return 5 * 10**18;  // +5 XPF (molto efficiente)
    } else if (xpf_spent <= 5) {
        return 3 * 10**18;  // +3 XPF (efficiente)
    } else if (xpf_spent <= 7) {
        return 2 * 10**18;  // +2 XPF (medio)
    } else if (xpf_spent <= 9) {
        return 1 * 10**18;  // +1 XPF (poco efficiente)
    } else {
        return 0;  // Nessun bonus (o squalificato se 10)
    }
}Logica:

Vincere usando pochi XPF = skill elevato = reward maggiore
Vincere usando molti XPF = meno skill o fortuna = reward minore
Incentiva strategia efficiente a lungo termine
3. NFT Badge (Opzionale)Minting di NFT commemorativo:
function mintWinnerNFT(address winner, uint256 game_id) internal {
    uint256 tokenId = nextTokenId++;
    
    // Metadata NFT
    WinnerBadge memory badge = WinnerBadge({
        gameId: game_id,
        winningOutput: game.winning_output,
        xpfEfficiency: players[winner].xpf_spent_total,
        timestamp: block.timestamp,
        rank: calculateRank(winner)  // basato su win streak, etc
    });
    
    nftContract.mint(winner, tokenId, badge);
    
    emit WinnerBadgeMinted(winner, tokenId, game_id);
}NFT può avere:

Immagine generativa basata su stats
Attributi: win rate, efficiency score, streak
Tradable o soulbound
Utility: sconti, accesso VIP, tornei speciali
4. Leaderboard Updatefunction updateLeaderboard(address winner) internal {
    leaderboard[winner].total_wins++;
    leaderboard[winner].total_output += game.winning_output;
    leaderboard[winner].average_efficiency = 
        (leaderboard[winner].average_efficiency * (total_wins - 1) + players[winner].xpf_spent_total) 
        / total_wins;
    
    // Win streak
    if (leaderboard[winner].last_game_status == WIN) {
        leaderboard[winner].current_streak++;
    } else {
        leaderboard[winner].current_streak = 1;
    }
    
    // Aggiorna rank globale
    updateGlobalRankings(winner);
}Processo Completo:function distributeRewards(uint256 game_id) external {
    require(game.status == CONFIRMED, "Game not confirmed");
    require(!game.rewards_distributed, "Already distributed");
    
    address winner = game.winner;
    
    // 1. ETH Prize Pool
    if (game.prizePool > 0) {
        payable(winner).transfer(game.prizePool);
        emit PrizeDistributed(winner, game.prizePool);
    }
    
    // 2. XPF Bonus
    uint256 xpfBonus = calculateXPFBonus(winner);
    if (xpfBonus > 0) {
        xpfToken.mint(winner, xpfBonus);
        emit XPFBonusAwarded(winner, xpfBonus, "Efficiency bonus");
    }
    
    // 3. NFT Badge
    if (game.mintNFT) {
        mintWinnerNFT(winner, game_id);
    }
    
    // 4. Leaderboard
    updateLeaderboard(winner);
    
    // 5. Finalizza gioco
    game.rewards_distributed = true;
    game.status = COMPLETED;
    game.completion_timestamp = block.timestamp;
    
    emit GameCompleted(game_id, winner, block.timestamp);
}Reward Tracking:Ogni giocatore ha profilo cumulativo:
struct PlayerProfile {
    uint256 total_games;
    uint256 total_wins;
    uint256 total_eth_earned;
    uint256 total_xpf_earned;
    uint256 total_xpf_spent;
    uint256 net_xpf;  // earned - spent
    uint256 average_output;
    uint256 best_output;
    uint256 current_streak;
    uint256 longest_streak;
    uint256 rank;
    uint256[] nft_badges;
}Economia XPF a Lungo Termine:Giocatore di Successo (Efficiente):
Game 1: Start 10 XPF → Usa 3 → Vince → +5 bonus = 12 XPF
Game 2: Start 12 XPF → Usa 4 → Vince → +3 bonus = 11 XPF
Game 3: Start 11 XPF → Usa 5 → Perde → +0 bonus = 6 XPF
Game 4: Start 6 XPF → Usa 2 → Vince → +5 bonus = 9 XPF

Trend: Sostenibile, può giocare indefinitamenteGiocatore Inefficiente (Aggressivo):
Game 1: Start 10 XPF → Usa 9 → Vince → +1 bonus = 2 XPF
Game 2: Start 2 XPF → Usa 1 → Perde → +0 bonus = 1 XPF
Game 3: Start 1 XPF → Usa 1 → Perde → +0 bonus = 0 XPF
Game 4: BANKRUPT - Non può giocare

Trend: Insostenibile, esaurisce risorseSistema di Recupero XPF:Per giocatori in difficoltà:Daily Faucet:
function claimDailyXPF() external {
    require(block.timestamp >= lastClaim[msg.sender] + 1 days, "Already claimed today");
    require(xpfToken.balanceOf(msg.sender) < 3, "Only for low balance");
    
    xpfToken.mint(msg.sender, 1 * 10**18);  // 1 XPF gratis
    lastClaim[msg.sender] = block.timestamp;
    
    emit DailyXPFClaimed(msg.sender);
}Acquisto Diretto:
function buyXPF() external payable {
    require(msg.value >= 0.01 ether, "Minimum 0.01 ETH");
    
    uint256 xpfAmount = (msg.value * 10) / 0.01 ether;  // 10 XPF per 0.01 ETH
    xpfToken.mint(msg.sender, xpfAmount * 10**18);
    
    emit XPFPurchased(msg.sender, xpfAmount, msg.value);
}Referral System:
function claimReferralReward() external {
    uint256 referrals = referralCount[msg.sender];
    uint256 unclaimed = referrals - referralsClaimed[msg.sender];
    
    if (unclaimed > 0) {
        uint256 reward = unclaimed * 2 * 10**18;  // 2 XPF per referral
        xpfToken.mint(msg.sender, reward);
        referralsClaimed[msg.sender] = referrals;
        
        emit ReferralRewardClaimed(msg.sender, reward);
    }
}Output Fase 8:

Vincitore ha ricevuto tutti i reward
ETH trasferito
XPF bonus mintato
NFT creato
Leaderboard aggiornato
Game status: COMPLETED
Sistema pronto per nuova partita
Stato Finale del Sistema:

Game completo e archiviato on-chain
Tutti i dati verificabili storicamente
Economia XPF aggiornata
Profili giocatori aggiornati
Privacy mantenuta (se no challenge/reveal)
Zero-trust garantito matematicamente
4. Garanzie del Sistema4.1 Garanzie Matematiche (Provabili)Teorema 1: Imprevedibilità del Seed
Dato: VRF con chiave privata K_vrf sconosciuta
Assunzione: Problema del logaritmo discreto è difficile
Conclusione: Nessun avversario polinomiale può prevedere seed_game 
             con probabilità > 1/2 + epsilon trascurabile
Dimostrazione: Segue da sicurezza VRF (dimostrata in letteratura)Teorema 2: Vincolo del Commitment
Dato: Commitment C = Hash(data) con Hash collision-resistant
Assunzione: Trovare collisioni SHA3-256 richiede 2^128 operazioni
Conclusione: Impossibile modificare data dopo commitment
             mantenendo C invariato
Dimostrazione: Proprietà binding degli schemi di commitmentTeorema 3: Zero-Knowledge della Proof
Dato: ZK-SNARK proof P per statement S con witness W
Assunzione: Sicurezza del pairing su curve ellittiche
Conclusione: Da P non si può estrarre informazione su W
             oltre a "S è vero"
Dimostrazione: Proprietà zero-knowledge di Groth16/PLONKTeorema 4: Soundness della Verifica
Dato: Verifier accetta proof P per statement falso S'
Assunzione: Nessun attaccante polinomiale
Conclusione: Probabilità < 2^-128 (trascurabile)
Dimostrazione: Proprietà soundness computazionale ZK-SNARKTeorema 5: Privacy Omomorfica
Dato: Ciphertext E(m) da schema omomorfico sicuro
Assunzione: Problema LWE o RSA è difficile
Conclusione: Impossibile recuperare m da E(m) senza chiave privata
             in tempo polinomiale
Dimostrazione: Sicurezza semantica Paillier/BFV4.2 Garanzie di Sicurezza (Game-Theoretic)Proprietà 1: Non-Manipolabilità InizialeAttacco: Giocatore genera 10,000 liste e sceglie la migliore
Difesa:

Commitment deve derivare da seed_player (pubblico da VRF)
ZK proof forza che numeri = Hash(seed_player || i)
Impossibile generare proof valida per seed diverso
Risultato: Attacco fallisce matematicamente
Proprietà 2: Non-Superamento Limiti DeltaAttacco: Giocatore usa delta di ±100 invece di ±20
Difesa:

ZK proof contiene constraint: |delta| <= 20
Se violato, proof non verifica
Smart contract respinge submission
Risultato: Attacco rilevato automaticamente
Proprietà 3: Non-Manipolabilità FunzioneAttacco: Giocatore ottimizza lista sulla funzione prima di commitment
Difesa:

Funzione generata DOPO commitment
seed_function usa timestamp post-commitment
Impossibile sapere coefficienti prima
Risultato: Nessun vantaggio informativo
Proprietà 4: Non-Modifica RetroattivaAttacco: Giocatore tenta di cambiare commitment dopo aver visto funzione
Difesa:

Commitment immutabile su blockchain
Timestamp certificato
Qualsiasi modifica richiede nuova transazione (visibile)
Risultato: Tentativo pubblicamente visibile e fallisce
Proprietà 5: Privacy dei NumeriAttacco: Server o terze parti tentano di vedere numeri durante gioco
Difesa:

Numeri esistono cifrati (omomorfico)
Chiave privata solo sul client
ZK proof non rivela witness
Risultato: Impossibile senza chiave privata
4.3 Garanzie di RobustezzaFault Tolerance:Server offline:

Client può calcolare variazioni localmente (più lento)
O aspettare server backup
Dati su blockchain: nessuna perdita
Blockchain congestionata:

Transazioni in coda ma eventualmente processate
Dati commitments preservati
Game può pausare e riprendere
Client crash:

Commitment già on-chain: preservato
Chiave privata nel wallet: recuperabile
Può rigenerare proof quando torna online
Resistance to:51% Attack (Blockchain):

Impatto limitato: può ritardare ma non falsificare VRF proof
Commitment immutabili anche con reorg (profondità sufficiente)
ZK proof matematicamente valide indipendentemente
DDoS (Server):

Server stateless: facilmente replicabile
Client può operare autonomamente (più lento)
Blockchain rimane source of truth
Sybil Attack (Giocatori):

Entry fee previene spam
XPF economy limita partecipazione continua
Reputation system può blacklist cheater
4.4 Garanzie EconomicheIncentivi Allineati:Giocatori onesti:

Vincere legalmente: reward pieno + XPF bonus + reputazione
Giocare efficiente: XPF sostenibile lungo termine
Costruire streak: NFT rari, accesso VIP
Giocatori disonesti:

Cheating rilevato: perdita stake + ban + reputazione
Inefficienza: esaurimento XPF → impossibilità giocare
Challenge persa: perdita stake economico
Challenger:

Challenge vera: vince stake + reputazione
Challenge falsa: perde stake
Incentivo: solo challenge fondate
Server:

Onesto: fees per computazione + reputazione
Disonesto: rilevabile (dati on-chain verificabili) + perdita clienti
4.5 Limiti e AssunzioniAssunzioni Crittografiche:

SHA3-256 è collision-resistant
VRF Chainlink è sicuro
ZK-SNARK soundness reggono
Crittografia omomorfica è sicura
Curve ellittiche non rotte
Assunzioni di Rete:

Blockchain resta operativa (Ethereum uptime >99.9%)
Chainlink VRF risponde (SLA 99%)
Internet accessibile ai client
Assunzioni di Implementazione:

Smart contract bug-free (richiede audit)
Circuit ZK-SNARK corretto (richiede verifica formale)
Client code non vulnerabile
Library crittografiche affidabili
Limitazioni Conosciute:Performance:

ZK proof generation: 10-60 secondi
Gas cost: $1-10 per gioco
Scalabilità: ~100 giochi paralleli su L2
Usabilità:

Complessità tecnica alta per utenti
Richiede wallet crypto
Latenza maggiore di giochi tradizionali
Complessità Funzione:

Solo operazioni polinomiali
No confronti, loop dinamici
Limitazione crittografia omomorfica
5. Stack Tecnologico5.1 Blockchain LayerPrimary Chain:

Ethereum Layer 2 (Arbitrum, Optimism, o Polygon zkEVM)
Rationale: gas costs bassi, velocità transazioni, compatibilità EVM
Smart Contracts:

Linguaggio: Solidity 0.8.x
Framework: Hardhat o Foundry
Standard: ERC-20 (XPF token), ERC-721 (NFT badges)
Audit: necessario prima di mainnet
VRF Provider:

Chainlink VRF v2
Alternative: API3 QRNG, UMA oSnap
Fallback: RANDAO (Ethereum beacon chain)
5.2 Crittografia LayerZero-Knowledge Proofs:

Framework: Circom (circuit definition) + SnarkJS (proof generation)
Proof system: Groth16 (più veloce) o PLONK (più flessibile)
Alternative: ZoKrates (più user-friendly), Noir (Aztec)
Crittografia Omomorfica:

Schema: Paillier (solo addizione, più semplice)
Alternative: BFV/CKKS (SEAL library) se serve moltiplicazione
Library:

JavaScript: node-paillier, seal-wasm
Rust: concrete (Zama), tfhe-rs


Hash Functions:

Keccak256 (nativa Ethereum)
SHA3-256 per derivazioni specifiche
Poseidon hash (ZK-friendly) dentro circuit
5.3 BackendServer (Stateless):

Linguaggio: Node.js/TypeScript o Rust
Framework: Express/Fastify o Actix
Responsabilità: calcoli omomorfici, coordinamento
Deployment: Docker containers, Kubernetes
Database (Opzionale):

Redis: cache variazioni temporanee
IPFS: storage encrypted_states (off-chain)
PostgreSQL: analytics, leaderboard cache
API:

REST per richieste variazioni
WebSocket per real-time updates
GraphQL per query complesse (opzionale)
5.4 FrontendWeb App:

Framework: React o Vue.js
Web3 Integration: ethers.js o viem
Wallet: RainbowKit, Web3Modal
UI: Tailwind CSS, shadcn/ui
ZK Proof Generation:

In-browser con WebAssembly
Library: snarkjs compiled
Worker thread per non bloccare UI
State Management:

React Context o Zustand
Blockchain sync: TanStack Query (React Query)
Mobile (Opzionale):

React Native per iOS/Android
WalletConnect per mobile wallets
Ottimizzazioni performance per proof generation
5.5 Developer ToolsTesting:

Hardhat test suite (smart contracts)
Jest/Vitest (circuit testing)
Playwright (E2E frontend)
Monitoring:

Tenderly (transaction debugging)
Grafana + Prometheus (metrics)
Sentry (error tracking)
CI/CD:

GitHub Actions
Automated testing
Deployment pipelines
6. Metriche e Performance6.1 Latenze AtteseFase 1 - Registrazione:

Transazione on-chain: 2-15 secondi (dipende da L2)
Mint XPF: incluso nella tx
Totale: ~10 secondi
Fase 2 - VRF Fulfillment:

Richiesta: ~5 secondi
Chainlink elaborazione: 1-2 minuti
Callback: ~10 secondi
Totale: ~2-3 minuti
Fase 3 - Commitment:

Derivazione numeri: <100ms
Cifratura: 500ms - 2s
ZK proof generation: 5-30 secondi (dipende da hardware)
Transazione on-chain: 2-15 secondi
Totale: ~10-50 secondi
Fase 4 - Funzione:

Transazione on-chain: ~10 secondi
Derivazione client-side: <100ms
Totale: ~10 secondi
Fase 5 - Variazione (singola):

Richiesta + burn XPF: ~10 secondi (on-chain)
Calcolo omomorfico server: 2-10 secondi
Decifratura client: <500ms
Totale: ~15-20 secondi per variazione
Fase 6 - Submission Finale:

ZK proof generation: 10-60 secondi
Transazione + verifica: 5-20 secondi
Totale: ~20-80 secondi
Fase 7 - Determinazione:

Confronto on-chain: ~10 secondi
Totale: ~10 secondi
Game Totale (stima):

Setup (fasi 1-4): ~5 minuti
Gameplay (fase 5, 3 variazioni): ~1 minuto
Finale (fase 6-7): ~1 minuto
Totale: ~7-10 minuti per partita completa
6.2 Costi EconomiciGas Costs (su Arbitrum, stima):

Registrazione + mint XPF: ~$0.05
Commitment submission: ~$0.10
Richiesta variazione: ~$0.02 × N
Submission finale: ~$0.50 (verifica ZK costosa)
Determinazione vincitore: ~$0.05
Distribuzione reward: ~$0.10
Totale per giocatore: ~$0.80-1.50
VRF Costs:

Chainlink VRF v2: ~$5-10 per richiesta
Split tra giocatori: ~$2-3 ciascuno
Alternative economiche: drand (gratis ma meno flessibile)
Server Costs:

CPU per calcoli omomorfici: intensive
Stimato: $0.10-0.50 per partita
Scalabile con load balancing
Totale per Giocatore:

Entry: ~$3-5
Sostenibile per reward pool >$10-15
6.3 ScalabilitàPartite Simultanee:

Limite teorico: illimitato (blockchain permitting)
Limite pratico server: ~100 partite parallele (single server)
Con scaling orizzontale: ~1000+ partite
Giocatori Totali:

Database può gestire milioni di profili
Blockchain gas costs limitano a utenti "seri"
Target: 10,000-100,000 giocatori attivi
Throughput:

Partite/giorno: ~10,000 (con infra adeguata)
Limited by: VRF throughput, gas costs, server compute

Rischi e Mitigazioni
8.1 Rischi Tecnici
Rischio: Bug in Circuit ZK-SNARK

Impatto: Proof false possibili, sistema compromesso
Probabilità: Media (circuit complessi)
Mitigazione:

Testing exhaustive con casi edge
Formal verification (opzionale, costoso)
Audit specializzato
Beta testing extensive



Rischio: Vulnerabilità Smart Contract

Impatto: Fondi rubati, sistema exploitato
Probabilità: Media-Alta (storia di hack)
Mitigazione:

Audit professionale obbligatorio
Bug bounty program
Timelock per upgrade
Multi-sig per funzioni critiche
Insurance (Nexus Mutual, opzionale)



Rischio: Performance Crittografia Omomorfica

Impatto: UX pessima, abbandono utenti
Probabilità: Alta (noto problema)
Mitigazione:

Usare Paillier (più veloce) se possibile
Hardware accelerazione (GPU se disponibile)
Server potenti
Ottimizzazione algoritmi
Caching intelligente



Rischio: Gas Costs Proibitivi

Impatto: Gioco troppo costoso, nessun utente
Probabilità: Media
Mitigazione:

Deployment su L2 (Arbitrum/Optimism)
Ottimizzazione contratti
Storage off-chain (IPFS) dove possibile
Batch transactions
Subsidize iniziale



8.2 Rischi Economici
Rischio: XPF Deflation Spiral

Impatto: Giocatori esauriscono XPF, nessuno può giocare
Probabilità: Media
Mitigazione:

Faucet daily generoso inizialmente
Bonus XPF per vincitori
Acquisto XPF possibile
Adjust parametri dinamicamente



Rischio: XPF Inflation

Impatto: XPF perde valore, nessun incentivo
Probabilità: Bassa-Media
Mitigazione:

Burn meccanismi (ogni giocata)
Cap su faucet/bonus
Monitoring supply closely
DAO governance per parametri



Rischio: Reward Pool Insufficiente

Impatto: Giocatori non interessati
Probabilità: Alta inizialmente
Mitigazione:

Seeding iniziale da team/VC
Entry fees contributivi
Sponsor/partnership
Staking pool contributivo



8.3 Rischi di Adozione
Rischio: Complessità per Utenti

Impatto: Barriera all'entrata troppo alta
Probabilità: Alta
Mitigazione:

UI/UX eccellente
Onboarding tutorial
Social wallet (account abstraction)
Gamification dell'apprendimento
Community support



Rischio: Concorrenza

Impatto: Utenti scelgono alternative
Probabilità: Media
Mitigazione:

USP chiaro (privacy + fairness matematica)
Network effects (leaderboard, social)
Iterazione rapida features
Community building



Rischio: Regolamentazione

Impatto: Ban in giurisdizioni, problema legale
Probabilità: Media (dipende da prize pool)
Mitigazione:

Consulenza legale early
Geo-blocking se necessario
Struttura legale appropriata
Evitare caratteristiche "gambling" esplicite



RiprovaBContinua8.4 Rischi Operativi
Rischio: Dipendenza da Chainlink VRF

Impatto: Se Chainlink down, nessun gioco può iniziare
Probabilità: Bassa (uptime >99%)
Mitigazione:

Fallback a drand o RANDAO
Multiple VRF providers in parallelo
Cache di seed pre-generati per emergenze
SLA monitoring e alerting
Comunicazione trasparente con utenti su status



Rischio: Server Centralizzato Compromesso

Impatto: Calcoli omomorfici incorretti, DoS
Probabilità: Media
Mitigazione:

Server stateless (nessun secret memorizzato)
Verificabilità: hash risultati on-chain
Replicazione geografica (multi-region)
Client può calcolare localmente (fallback)
Monitoring e intrusion detection



Rischio: Key Management (Client)

Impatto: Utenti perdono chiave privata omomorfica
Probabilità: Alta (tipico problema crypto)
Mitigazione:

Backup automatico cifrato in cloud (opzionale)
Recovery tramite social (Shamir secret sharing)
Educazione utenti su importanza backup
Threshold keys (client + server + validator)
In casi estremi: reveal completo per recupero



Rischio: Network Congestion (L2)

Impatto: Transazioni lente, timeout
Probabilità: Media durante picchi
Mitigazione:

Gas price oracle dinamico
Timeout generosi per submission
Pause automatica durante congestione estrema
Comunicazione proattiva con utenti
Migration plan a L2 alternativo se necessario



8.5 Rischi di Sicurezza Avanzati
Rischio: Side-Channel Attacks

Impatto: Leak informazioni tramite timing, power analysis
Probabilità: Bassa (richiede attaccante sofisticato)
Mitigazione:

Constant-time operations dove possibile
Blinding techniques in crittografia
Secure enclaves per operazioni critiche (opzionale)
Audit specifico per side-channels



Rischio: Front-Running (MEV)

Impatto: Miner vede submission e modifica propria
Probabilità: Bassa (commitment già fatto)
Mitigazione:

Commitment scheme già previene
Private mempool (Flashbots) opzionale
Timelock su reveal
Monitoring MEV activity



Rischio: Sybil Attack su Challenge System

Impatto: Attaccante crea multipli account per challenge spam
Probabilità: Media
Mitigazione:

Stake economico per challenge (0.1 ETH)
Reputation system
Rate limiting on-chain
Penalty escalation per challenge false
Governance può ban persistent attackers



Rischio: Collusion (Server + Giocatore)

Impatto: Server favorisce un giocatore specifico
Probabilità: Bassa (difficile da orchestrare)
Mitigazione:

Hash variazioni on-chain (verificabilità)
Multiple server providers (decentralizzazione futura)
Whistleblower rewards
Statistical analysis on-chain (outlier detection)
Community oversight



Rischio: Zero-Day in Librerie Crittografiche

Impatto: Vulnerabilità critica sistema intero
Probabilità: Molto bassa ma possibile
Mitigazione:

Usare librerie mature e auditate (SEAL, snarkjs)
Dependency scanning automatico
Security advisories monitoring
Circuit breaker: pause system se vulnerability discovered
Upgrade path pianificato



8.6 Rischi di Governance
Rischio: Parametri Economici Sbagliati

Impatto: Economia XPF collassa o inflaziona
Probabilità: Media (difficile predire)
Mitigazione:

Simulazioni Monte Carlo pre-launch
Parametri adjustable via governance
Slow rollout con monitoring
DAO per decisioni collettive
Emergency pause mechanism



Rischio: Centralizzazione Decisionale

Impatto: Team prende decisioni contro community
Probabilità: Media-Alta inizialmente
Mitigazione:

Progressive decentralization roadmap
Token governance (opzionale)
Transparent decision-making process
Community proposals
Multi-sig per operazioni critiche



Rischio: Contentious Upgrade

Impatto: Community split, fork
Probabilità: Bassa ma impattante
Mitigazione:

Comunicazione chiara su upgrade
Testing pubblico su testnet
Voting mechanism
Backward compatibility dove possibile
Gradual migration paths




9. Estensioni Future
9.1 Funzionalità Aggiuntive
Multiplayer Scalabile:

Partite con 10, 50, 100 giocatori
Tournament brackets
League system
Team competitions

Funzioni di Validazione Avanzate:

Polinomi di grado superiore
Funzioni non-lineari (con FHE completo)
Funzioni adaptive (cambiano durante gioco)
Multiple funzioni votate dalla community

Modalità di Gioco Alternative:

Time-limited games (blitz)
Collaborative mode (team vs environment)
Asymmetric games (diversi obiettivi)
Story mode con progressione

Social Features:

Friend lists e private matches
Spectator mode (con privacy preservata)
Replay system (con numeri nascosti)
Achievements e badges avanzati

Economia Avanzata:

Marketplace XPF (se non soulbound)
Staking per rewards passivi
Liquidity pools per prize pools
NFT tradable con stats

9.2 Ottimizzazioni Tecniche
ZK Proof Ottimizzazioni:

Recursive proofs (proof di proof)
Aggregation (batch verification)
Universal setup (eliminare trusted setup)
STARK invece di SNARK (no trusted setup, più grande proof)

Crittografia Omomorfica Avanzata:

FHE completo (funzioni arbitrarie)
Hardware acceleration (GPU, FPGA, ASIC)
Batching operations
Approximate computation (CKKS per floats)

Blockchain Scalability:

Migration a validium/volition (off-chain data)
zkRollup custom con application-specific logic
Fractal scaling (rollup di rollup)
Celestia/EigenDA per data availability

Client Optimization:

WASM compilation ottimizzata
Web Workers per parallelizzazione
Progressive proof generation (partial updates)
Pre-compilation circuit per device