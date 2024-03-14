# IFTTT Security Extension

<p align="center">
  <img src="https://github.com/GerardoLeone/IFTTT-Security-Extension/blob/main/icons/ifttt-se-icon.png" width="30%" alt="Logo del Progetto">
</p>

Questo progetto ha avuto inizio come parte del mio tirocinio interno all'Università degli Studi di Salerno. Successivamente, ho approfondito e ampliato quest'esperienza per svilupparla ulteriormente come tesi di laurea, nell'ambito del corso di laurea triennale in Informatica.

Durante il tirocinio, ho avuto l'opportunità di mettere in pratica le nozioni apprese durante il corso di studi, un'esperienza che ha plasmato e ispirato gran parte di questo progetto. La tesi di laurea è il punto culminante di questo percorso, focalizzandosi su aspetti specifici nel campo dell'analisi dei rischi di sicurezza e privacy nell'ecosistema IFTTT.

Il progetto, sviluppato in collaborazione con Giovanni Mercurio e sotto la supervisione del Dr. Gaetano Cimino e Dr. Bernardo breve, consiste in un'estensione chromium based che fornisce una maggior attenzione sulla privacy e sicurezza degli utenti che interagiscono su sistemi IoT basati su paradigma Trigger-Action. 

## Cosa si intende per IoT?

L'internet delle cose, o IoT, è un termine che indica una grande rete di dispositivi capaci di comunicare tra loro tramite internet
- Telefoni
- Smartwatch
- Elettrodomestici
- Telecamere di sicurezza smart
- Termostati intelligenti
- Dispositivi per la salute
- Sensori
- Smart TV

## Regole Trigger-Action

Per rendere i dispositivi IoT più User-Friendly è diventato sempre più comune l'utilizzo delle **regole Trigger-Action**, che hanno rivoluzionato l'interazione tra dispositivi e utenti. Il concetto alla base delle regole Trigger-Action è semplice: quando si verifica una specifica condizione, definita come ***trigger***, viene innescata un’azione predefinita, definita come ***action***. Questo approccio consente agli utenti di creare connessioni tra diversi dispositivi e servizi, senza la necessità di scrivere codice complesso o di avere competenze tecniche avanzate.
<p align="center">
  <img src="https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/5d543ca2-2818-4066-b64a-1a40fa43ecae" alt="Piattaforma IFTTT">
</p>

# Piattaforma IFTTT
**IFTTT** è una piattaforma online che mette a disposizione un catalogo di regole Trigger-Action prestabilite, che possono essere richiamate da un utente. 
La piattaforma inoltre consente la creazione di regole, collegando diverse applicazioni e servizi web.
Durante la composizione della regola per ogni Trigger e Action va scelto un channel da utilizzare.
Ogni ***channel*** ha una o più azioni che possono essere eseguite. Ogni azione è composta da una serie di variabili o dati specifici detti ***ingredient***.

<p align="center">
  <img src="https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/6fa5e291-79b3-4c1c-8b2b-8d1fe940f11b">
</p>

## Processo di creazione di regole Trigger-Action

<p align="center">
  <img src="https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/af787f3f-1eed-462d-b504-f69e8430f25c">
</p>

- Inizialmente bisogna scegliere un trigger tra i servizi messe a disposizione. 

<p align="center">
  <img src="https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/6d5bcfb1-4c43-4b2a-8d10-2745a83d338d">
</p>

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/66fac6e2-4330-4d1e-abce-d71bf37d5e58)


- Scelto il trigger, bisogna scegliere l'azione da effettuare.

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/f5c78f60-9292-4f20-96a2-3cd54c954b81)

- Infine si definisce il titolo della nuova regola, che verrà pubblicata sul proprio profilo.

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/44d721da-63ab-4e33-abe9-4e91ee32eb8c)

# Criticità nelle regole Trigger-Action

<p align="center">
  <img src="https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/03c3517e-bec6-46a1-85ec-01c0eb7fd35b">
</p>

L'uso di IFTTT, che coinvolge la gestione dei dati personali e l'automazione di azioni, comporta alcuni rischi per la privacy e la sicurezza, come fuga di dati personali o accesso non autorizzato ad un determinato dispositivo.
In letteratura abbiamo visto molti sistemi per tutelare la privacy e la sicurezza dell'utente durante la composizione della regola, ma essi si limitano ad una supervisione superficiale, limitando l'analisi a regole presenti nel catalogo della piattaforma, non analizzando parti importanti della regola come actions e ingredients.

# Il progetto: Front-End

<p align="center">
  <img src="https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/b518608f-0b89-429c-9756-54601cae0181">
</p>

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/eb3e00a9-1651-4f15-991f-d91c3dec6f9d)


L'estensione nasce con l'idea di essere semplice e intuitiva all'utilizzo. Contiene un pulsante di accensione, un box che mostra l'email collegata, una sezione dedicata al feedback della regola appena analizzata e la sezione relativa alle statistiche (regole accettate e rifiutate).
Le tecnologie utilizzate per il front-end sono HTML e CSS. Per ulteriori dettagli sull'architettura del progetto, si rimanda alla sezione [Architettura](#architettura).

## Crawling

L'estensione in esecuzione raccoglie tramite crawling tutti i dati che l'utente inserisce durante la composizione della regola, estrapolando tutte le Textarea e tutti gli ingredient.
Il termine ***crawling*** si riferisce alla pratica di estrazione sistematica delle informazioni da pagine web.

Una volta giunti al termine della composizione, si passa alla creazione della regola, dove il plugin sostituisce il pulsante *Finish* con un altro pulsante che ne impedisce la creazione, dove quest'ultimo invia tutti i dati estrapolati ad un server sempre in ascolto.

## Analisi del danno
Il server, una volta ricevute tutte le informazioni della regola, interroga un modello basato su Transfer Learning che esegue un'analisi e ne restituisce una classe di danno e una spiegazione sulla pericolosità.

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/d778ceb9-7cf4-47b0-b01f-01edd1e5e2dc)

## Architettura
### Back-End

<p align="center">
  <img src="https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/2de2d73d-a856-49ff-929d-a89496a3b275">
</p>

L'architettura back-end è stata progettata secondo una suddivisione in moduli Javascript che comunicano tra di loro. In particolare:

- main.js: gestisce il popup dell'estensione, quindi si occupa del front-end e comunica con il data-manager.js;
- data-manager.js: è un Service-Worker, ovvero uno script che lavora in background una volta installata l'estensione nel browser, gestisce la persistenza dei dati e comunica con Firebase;
- Firebase: è un servizio offerto da Google che permette la gestione della persistenza dei dati in un database NoSQL;
- content.js: è un Content Script che lavora all'interno del contesto di una pagina web, accedendo al DOM, motivo per cui è stato utilizzato per estrarre i parametri di una regola in fase di definizione.
- Node.js: i dati estratti dal content.js vengono passati al server Node.js che interroga un modello di classificazione al fine di stabilire se la regola è sicura o meno.

## Organizzazione dei dati

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/97690979-22ba-49a3-a9ac-8088fe0e4201)

I dati estratti dal Content Script sono delle stringhe che vengono successivamente inserite all'interno di una mappa JSON. Tale mappa è stata suddivisa in 3 chiavi principali:
- Trigger;
- Titolo o descrizione;
- Action;

A loro volta Trigger e Action hanno la medesima struttura:
- channel: contiene il nome del canale;
- title: contiene il nome del titolo del trigger o dell'action;
- desc: contiene la descrizione;
- ingredient: contiene gli ingredient estrapolati in fase di definizione della regola.

Infine la mappa viene inviata al server tramite una chiamata REST per essere analizzata.

## Persistenza dei dati: database Firestore

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/21888a5d-b2c0-4fec-a797-23677dc8f507)

Per quanto riguarda la persistenza dei dati, abbiamo utilizzato un database Firestore, ovvero un database NoSQL, formato da raccolte che contengono un insieme di documenti contenenti coppie chiave-valore.
Abbiamo stabilito l'utilizzo delle email come chiavi primarie delle raccolte.
Ogni raccolta possiede di default un documento *rules* contenente i campi *accepted* e *rejected* che corrispondono al conteggio delle regole *accettate* e *rifiutate*.

# Cosa offre la nostra soluzione in più rispetto alle altre?

In letteratura esistono solo soluzione che analizzano regole prestabilite all'interno del catalogo offerto da IFTTT.
La nostra soluzione, invece, permette l'identificazione di una violazione all'interno di una regola creata dall'utente, utilizzando ingredient personalizzati che possono modificarne il tipo di violazione.

# Analisi di una raccolta di regole

Sfruttando il fatto che l'estensione registri le regole all'interno del database, è stato possibile analizzare un dataset di 200 regole raccolte manualmente e classificate come non sicure, organizzate in gruppi da 25.
Di seguito ne riportiamo i grafici risultanti dalle analisi.

## Classificazione delle classi di danno

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/3c449e2b-af89-4fae-8d1d-ff4170a7a625)

## Distribuzione delle classi di danno

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/902679ee-056e-44c7-90bc-cfd318bace79)

## Ulteriore categorizzazione: 3 sotto-categorie di servizi per la creazione di regole dannose

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/fde8181c-d91f-494b-8797-cf4f3b5187ae)

## Distribuzione dei servizi per trigger

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/4dde77c3-9c4f-402d-9a2c-dd0f6f0c511d)

## Distribuzione dei servizi per action

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/0090225e-70b0-4161-b384-6ea0a37a2d52)

## Servizi più utilizzati nei trigger

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/7cb70b3e-6a47-490e-b5be-032a377606da)

Abbiamo analizzato i servizi più utilizzati nei trigger e possiamo vedere come i Social rappresentino la maggioranza, a seguire i servizi Drive e infine i servizi di Comunicazione.

## Servizi più utilizzati nelle action

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/d7b45de2-2729-4ec5-91a6-98452dbf6e33)

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/4cafc24b-6c02-4d49-8e90-46cc70e10535)

I servizi utilizzati nelle action, invece, sono in numero inferiore come si può notare e tramite un'ulteriore analisi del dataset si è scoperto che la maggior parte delle regole dannose coinvolgono l'URL come ingredient, rappresentando il 29% delle regole.

# Conclusioni

In questo lavoro di tesi abbiamo presentato:

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/51f86dc8-6688-4a00-8bb7-7f469ae96081)

# Sviluppi futuri

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/69086815-68ac-4cb7-8552-3e2193f5645f)

Per quanto riguarda gli sviluppi futuri e quindi come migliorare la nostra soluzione, si potrebbero estendere le funzionalità dell'estensione a più piattaforme, quindi non limitarsi soltanto a IFTTT, ma anche a Zapier, OpenHAB o SmartThings.

## Altri sviluppi possibili

![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/561acf4f-5f9a-4c9a-a8ca-e735f0736e25)

# Author
- Gerardo Leone
- Giovanni Mercurio

# Tutor
- Dr. Bernardo Breve
- Dr. Gaetano Cimino

# Università
![image](https://github.com/GerardoLeone/IFTTT-Security-Extension/assets/61288148/b3a5eb6a-d4ca-4617-9ca2-d8a3c6ca81ec)

Università degli Studi di Salerno (UNISA) - Informatica
