function getPiStatus() {
    $.get('pistatus', (data) => {
        data.forEach(element => {
            $('#currentPiList').append('<li ' + 'class="list-group-item"' + element.data  + ' id=' + '"' + element.data + '"' + '>' + element.data + '<span>' + element.time + '</span>' + '</li>');
        });
    });
}
$('document').ready(function(){ 
    //Socket IO Client connection/Management
    var socket = io.connect('http://' + document.location.host);
    socket.on('PiOnline', (data) => {
        if ($(`#${data.data}`).length) {
            $(`#${data.data}`).children().text(data.time);
        }
        else {
            $('#currentPiList').append('<li ' + 'class="list-group-item"' + data.data  + ' id=' + '"' + data.data + '"' + '>' + data.data + '<span>' + data.time + '</span>' + '</li>');
        }
    });
    window.history.pushState("Pi", "Pi","/Pi");
    document.getElementById("toEmployee").onclick = function () {
        window.location = "/";
    };
    document.getElementById("toManager").onclick = function () {
        window.location = "/Manager";
    };
    document.getElementById("toStatus").onclick = function () {
        window.location = "/Status";
    };
    getPiStatus()
});
