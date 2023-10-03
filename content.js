/*
    Funzionalità content script:
    Le funzionalità del content script vengono definite quando la pagina carica per la prima volta perchè devo caricare i dati (più precisamente lo stato del bottone)
    e decidere se eseguire le azioni di check della sicurezza dei dati o meno.
*/
$(window).on('load', function() {

    let url = window.location.href;
    
    if(url === URL_CREATION)
    {
        chrome.storage.local.set({ serverResponse : "" }) //al primo caricamento della pagina, resetto il messaggio sulla sicurezza
        chrome.runtime.sendMessage({ action: 'isBtnStatusOn'}, function(response) {
            let btnStatus = response

            pageTitle = "None";

            jsonOutput = {}
            jsonOutput[MAP_KEY_TRIGGER] = {}
            jsonOutput[MAP_KEY_ACTION] = {}

            if(btnStatus) //Se il bottone è acceso
            {
                // Seleziona l'elemento header
                const headerElement = $('header')[0];

                // Crea un observer per rilevare l'aggiunta e le modifiche dei nodi
                const observer = new MutationObserver(function(mutationsList, observer) {
                    for (const mutation of mutationsList) {
                        for (const addedNode of mutation.addedNodes) {
                            // Verifica se l'elemento aggiunto è un h1
                            if (addedNode.tagName === 'H1') {
                                pageTitle = $(addedNode).text();
                            }
                        }
                        
                        // Verifica se il nodo modificato è un TextNode (cambio testo)
                        if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
                            // Verifica se il nodo padre è un h1
                            if (mutation.target.parentNode.tagName === 'H1') {
                                pageTitle = $(mutation.target.parentNode).text();

                            }
                        }

                        if(pageTitle === PAGE_TITLE_REVIEW) {
    
                            $(document).on('DOMSubtreeModified', '.preview__cta___mwtgs button', function() {
    
                                $(this).prop("disabled", true);
                                $(this).hide();
                                
                                $(".preview__cta___mwtgs").html("<button class='button-primary' id='btn-finish'>Finish</button>")
                            })
                        }

                    }
                });

                // Configura l'observer per rilevare l'aggiunta e le modifiche dei nodi
                const observerConfig = {
                    childList: true,
                    subtree: true,
                    characterData: true, // Rileva le modifiche al testo dei nodi
                };

                // Avvia l'observer sull'elemento header
                observer.observe(headerElement, observerConfig);

                $(document).on('click', 'form input[type="submit"][role="button"]', function() {
                    switch(pageTitle)
                    {
                        //Fetch ingredient
                        case PAGE_TITLE_COMPLETE_TRIGGER_FIELDS:   
                        case PAGE_TITLE_EDIT_TRIGGER_FIELDS:
                            jsonOutput[MAP_KEY_TRIGGER][MAP_KEY_INGREDIENT] = fetchIngredient();
                        break;

                        case PAGE_TITLE_COMPLETE_ACTION_FIELDS:
                        case PAGE_TITLE_EDIT_ACTION_FIEDLS:
                            jsonOutput[MAP_KEY_ACTION][MAP_KEY_INGREDIENT] = fetchIngredient();
                        break;                 
                    }
                })

                //Fetch del channel, del title e della desc
                // Aggiungi un gestore di eventi di clic agli elementi <li> con attributo role="listitem"
                $(document).on('click', 'li[role="listitem"]', function(){
                    if(pageTitle === PAGE_TITLE_CHOOSE_TRIGGER || pageTitle === PAGE_TITLE_CHOOSE_ACTION) {
                        // Seleziona il primo e il secondo <span> all'interno dell'elemento <li> cliccato
                        var titleElement = $(this).find('span:first');
                        var descriptionElement = $(this).find('span:eq(1)');

                        // Ottieni il testo dal primo e dal secondo <span>
                        var title = titleElement.text();
                        var description = descriptionElement.text();

                        let mapKey;
                        if(pageTitle === PAGE_TITLE_CHOOSE_TRIGGER)
                            mapKey = MAP_KEY_TRIGGER;
                        else if(pageTitle === PAGE_TITLE_CHOOSE_ACTION)
                            mapKey = MAP_KEY_ACTION;

                        jsonOutput[mapKey][MAP_KEY_CHANNEL] = fetchChannel();
                        jsonOutput[mapKey][MAP_KEY_TITLE] = title;
                        jsonOutput[mapKey][MAP_KEY_DESC] = description;
                    }
                });

                $(document).on('click', '#btn-finish', function(){ //se clicco sul pulsante di fine, mando il json al server esterno

                    //Prendo alla fine il titolo
                    jsonOutput[MAP_KEY_TITLE] = $("div.growing-text-area div").text()

                    //SUCCESS
                    /*chrome.storage.local.get("email", (response) => {
                        let email = response.email
                        chrome.runtime.sendMessage({
                            action: 'saveRule',
                            email: email,
                            jsonOutput: jsonOutput
                        })
                    })*/

//=====================================================================================================================================================

                    //FAILURE
                    fetch('http://localhost:3000/error')
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Errore nella richiesta');
                            }
                            return response.text();
                        })
                        .then(data => {
                            chrome.storage.local.get("email", (response) => {
                                let email = response.email
                                chrome.runtime.sendMessage({ 
                                    action: 'notifySecurityProblem', 
                                    serverResponseMsg: data,
                                    email: email,
                                    jsonOutput: jsonOutput
                                });
                            });
                        })
                        .catch(error => {
                        console.error(error); // Gestisci gli errori della richiesta
                    });

                })
            }
        })
    }
    else { //non sono in creazione

        let signinLink = $("a.sign-in");

        if(signinLink.length > 0) { //Se trova questo link, il login non è effettuato
            chrome.storage.local.get("email", (response) => { //Verifico che l'email è ancora salvata in locale dopo il logout
                let email = response.email
                if(email.length > 0) {
                    chrome.storage.local.get(['acceptedRuleCounter', 'rejectedRuleCounter'], function(result) {
                        chrome.runtime.sendMessage({
                            action: 'saveRuleCounter',
                            email: email,
                            acceptedRuleCounter: result.acceptedRuleCounter,
                            rejectedRuleCounter: result.rejectedRuleCounter
                        });
                    });
                }
                chrome.storage.local.set({email: "", registeredPC: false, rejectedRuleCounter: 0, acceptedRuleCounter: 0, serverResponse: ""})
            })
        } else { //Login già effettuato

            if(url === URL_EXPLORE) {

                var accountDropdown = $('.account-dropdown');

                // Seleziona il div figlio con l'attributo "data-react-class" e "data-react-props" specifici
                var targetDiv = accountDropdown.find('div[data-react-class="App.Comps.UnifiedProfileDropdown"]');

                // Ottieni l'attributo "data-react-props"
                var dataReactProps = targetDiv.attr('data-react-props');

                // Decodifica la stringa JSON nell'oggetto JavaScript
                var propsObject = JSON.parse(dataReactProps);

                // Estrai l'email dall'oggetto propsObject
                var email = propsObject.email;

                chrome.storage.local.set({email: email}, () => {

                    chrome.storage.local.get("registeredPC", (response) => {
                        
                        if(!response.registeredPC) //Se non è registrato, quindi è la prima volta che usa questo pc per questa estensione, deve caricare i dati (se l'email è registrata)
                        {  
                            chrome.runtime.sendMessage({
                                action: 'registerPC', //Verifico che l'email esista
                                email: email
                            })
                        }
                    })

                });
            }

        }


    }

});

function fetchChannel()
{
    // Seleziona l'elemento <section> tramite una querySelector
    var sectionElement = document.querySelector('.step_selector__brand___YQgU1');

    // Verifica se l'elemento è stato trovato
    if (sectionElement) {
        // Seleziona l'elemento <h1> all'interno di <section>
        var h1Element = sectionElement.querySelector('h1');

        // Verifica se l'elemento <h1> è stato trovato
        if (h1Element) {
            // Ottieni il testo dall'elemento <h1>
            var textH1 = h1Element.innerText;
            return textH1;
        }
    }
    return "Empty"
}


function fetchIngredient()
{
    var jsonObj = {};

    // Selezionare tutti gli elementi <li> con classe "field"
    $('form li.field').each(function() {
        var label = $(this).find('span.field-name.label').text();

        // Selezionare tutti gli elementi :input all'interno dello span con classe "input"
        var inputs = $(this).find('span.input :input:not(button):not(input[type="submit"])');

        // Creare un array per memorizzare i valori degli input
        var inputValues = [];

        // Scorrere tutti gli input
        inputs.each(function() {
            var inputValue = $(this).val();
            inputValues.push(inputValue);
        });

        // Aggiungere il valore dell'input alla lista corrispondente nel JSON
        jsonObj[label] = inputValues;
    });
    return jsonObj;
}


const PAGE_TITLE_CREATE = "Create"
const PAGE_TITLE_CHOOSE_SERVICE = "Choose a service"

const PAGE_TITLE_CHOOSE_TRIGGER = "Choose a trigger"
const PAGE_TITLE_COMPLETE_TRIGGER_FIELDS = "Complete trigger fields"
const PAGE_TITLE_EDIT_TRIGGER_FIELDS = "Edit trigger fields"

const PAGE_TITLE_CHOOSE_ACTION = "Choose an action"
const PAGE_TITLE_COMPLETE_ACTION_FIELDS = "Complete action fields"
const PAGE_TITLE_EDIT_ACTION_FIEDLS = "Edit action fields"

const PAGE_TITLE_REVIEW = "Review and finish"

const MAP_KEY_TRIGGER = "trigger"
const MAP_KEY_ACTION = "action"
const MAP_KEY_TITLE = "title"

const MAP_KEY_CHANNEL = "channel"
const MAP_KEY_DESC = "desc"
const MAP_KEY_INGREDIENT = "ingredient"

const URL_CREATION = "https://ifttt.com/create"
const URL_EXPLORE = "https://ifttt.com/explore"
const URL_LOGOUT = "https://ifttt.com/session/logout"