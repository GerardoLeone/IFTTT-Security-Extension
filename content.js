pageTitle = "None";

triggerMap = {};
actionMap = {};

$(document).on('DOMSubtreeModified', 'header h1', function() { //Rileva il titolo della pagina
    pageTitle = $(this).text()
    switch(pageTitle)
    {
        case PAGE_TITLE_CREATE:
            
            break;
            
            case PAGE_TITLE_CHOOSE_SERVICE:
                
            break;

            case PAGE_TITLE_CHOOSE_TRIGGER:
                
                break;
                    
            case PAGE_TITLE_COMPLETE_TRIGGER_FIELDS:   
            var elementiDinamici = $('[name^="fields["][name$="]"]');
            console.log(elementiDinamici)
            break;

        case PAGE_TITLE_CHOOSE_ACTION:
        
            break;

        case PAGE_TITLE_COMPLETE_ACTION_FIELDS:
            // VIENE CHIAMATA MOLTE VOLTE, DA CAPIRE COME GESTIRE LA COSA
            $(document).on("DOMSubtreeModified", '[name^="fields["][name$="]"]', function() {
                var elementiDinamici = $('[name^="fields["][name$="]"]').toArray();
                
                console.log(elementiDinamici)
            });
            break;

        case PAGE_TITLE_REVIEW: //Appena arrivo nella Review, devo effettuare la chiamata Ajax al server passando i parametri acquisiti dalla regola.

            $(document).on('DOMSubtreeModified', '.preview__cta___mwtgs button', function() {
                console.log($(this))
                console.log($(this).text())

                $(this).prop("disabled", true); //Impostare a true se la regola non è sicura.
            })
            break;
    }
});

const PAGE_TITLE_CREATE = "Create"
const PAGE_TITLE_CHOOSE_SERVICE = "Choose a service"

const PAGE_TITLE_CHOOSE_TRIGGER = "Choose a trigger"
const PAGE_TITLE_COMPLETE_TRIGGER_FIELDS = "Complete trigger fields"

const PAGE_TITLE_CHOOSE_ACTION = "Choose an action"
const PAGE_TITLE_COMPLETE_ACTION_FIELDS = "Complete action fields"

const PAGE_TITLE_REVIEW = "Review and finish"