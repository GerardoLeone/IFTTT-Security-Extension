pageTitle = "None";

$(document).on('DOMSubtreeModified', 'header h1', function() { //Rileva il titolo della pagina
    pageTitle = $(this).text()

    //Ha senso? Non credo.
    switch(pageTitle)
    {
        case PAGE_TITLE_CREATE:

            break;

        case PAGE_TITLE_CHOOSE_SERVICE:
            
            break;

        case PAGE_TITLE_CHOOSE_TRIGGER:
        
            break;

        case PAGE_TITLE_COMPLETE_TRIGGER_FIELDS:
        
            break;

        case PAGE_TITLE_CHOOSE_ACTION:
        
            break;

        case PAGE_TITLE_COMPLETE_ACTION_FIELDS:
        
            break;

        case PAGE_TITLE_REVIEW:

            $(document).on('click', '.preview__cta___mwtgs', 'button', function(event) {
                //event.preventDefault();
                // Altri codici da eseguire dopo aver chiamato preventDefault()
                console.log('Debug')
                event.preventDefault();
  
                $(this).remove();

                // Rimuovi temporaneamente l'attributo data-track-ifttt-next-event dal pulsante
                //$(this).prop('data-track-ifttt-next-event', null);
                //$(this).prop('data-track-data', null)
                return false;

            });

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