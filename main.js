$(window).on('load', function() {
    $('#content').load('../html/main-content.html')

})

console.log("Hello World");
let power = false;

let btnPower = $('#btn-on-off');
btnPower.click(function () {
    if(power) {
        btnPower.addClass('btn-off');
        btnPower.removeClass('btn-on');
    } else {
        btnPower.addClass('btn-on');
        btnPower.removeClass('btn-off');
    }

    power = !power;
});

/*
FUNZIONA SOLO SE L'ESTENSIONE E' APERTA 
function bar() {
    console.log("DEBUG");
    var element = document.querySelector('header h1');
    var text = element.textContent;
    console.log(text)
}

//TODO: far funzionare questo codice in background, attualmente funziona solo se clicco sull'estensione. Deve verificare ogni cambiamento di URL in teoria
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            func: bar
    }).then(() => console.log("injected a function"));
});*/