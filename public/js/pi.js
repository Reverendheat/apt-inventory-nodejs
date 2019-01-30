function getPiStatus() {
    $.get('pistatus', (data) => {
        data.forEach(element => {
            $('#currentPiList').append('<li ' + 'class="list-group-item"' + element.data  + ' id=' + '"' + element.data + '"' + '>' + '<a href="#" onclick="launchSSH(this)" class="launchSSH">' + '<i class="fas fa-terminal"></i>' + '</a>' + element.data + '<span>' + element.time + '</span>' + '</li>');
        });
    });
}
function launchSSH(atag) {
    sshDest = $(atag).parent('li')[0].id;
    window.open(`ssh://pi@${sshDest}`);
}
$('document').ready(function(){ 
    //Socket IO Client connection/Management
    var socket = io.connect('http://' + document.location.host);
    socket.on('PiOnline', (data) => {
        if ($(`#${data.data}`).length) {
            $('#currentPiList').prepend($(`#${data.data}`))
            $(`#${data.data}`).children().eq(1).text(data.time);
        }
        else {
            $('#currentPiList').prepend('<li ' + 'class="list-group-item"' + data.data  + ' id=' + '"' + data.data + '"' + '>' + '<a href="#" onclick="launchSSH(this)" class="launchSSH">' + '<i class="fas fa-terminal"></i>' + '</a>' + data.data + '<span>' + data.time + '</span>' + '</li>');
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
