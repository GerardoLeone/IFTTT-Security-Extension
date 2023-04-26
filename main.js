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