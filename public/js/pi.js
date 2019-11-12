function getPiStatus() {
    $.get('pistatus', (data) => {
        console.log(data[0]);
        data.forEach(element => {
            $('#currentPiList').append('<li ' + 'class="list-group-item"' + element.hostname  + ' id=' + '"' + element.hostname + '"' + '>' + '<a href="#" onclick="launchSSH(this)" class="launchSSH">' + '<i class="fas fa-terminal"></i>' + '</a>' + element.hostname + '<span>' + element.time + ' Ver: ' + element.version + ' Cart: ' + element.cart + ' Emp: ' + element.employee + '</span>' + '</li>');
        });
    });
}
/* function getUploadStatus() {
    $.get('uploadstatus', (data) => {
        data.forEach(element => {
            $('#currentUploadList').append('<li ' + 'class="list-group-item"' + ' id=' + '"' + element.hostname + '"' + '>' + element.hostname + '<span>' + element.time + '</span>' + '</li>');
        });
    });
} */
function launchSSH(atag) {
    sshDest = $(atag).parent('li')[0].id;
    window.open(`ssh://pi@${sshDest}`);
}
$('document').ready(function(){ 
    //Socket IO Client connection/Management
    var socket = io.connect('http://' + document.location.host);
    socket.on('PiOnline', (data) => {
        if ($(`#${data.hostname}`).length) {
            $('#currentPiList').prepend($(`#${data.hostname}`))
            $(`#${data.hostname}`).children().eq(1).text(data.time + ' Ver: ' + data.version + ' Cart: ' + data.cart + ' Emp: ' + data.employee);
        }
        else {
            $('#currentPiList').prepend('<li ' + 'class="list-group-item"' + data.hostname  + ' id=' + '"' + data.hostname + '"' + '>' + data.hostname + '<span>' + data.time + ' Ver: ' + data.version + ' Cart: ' + data.cart + ' Emp: ' + data.employee + '</span>' + '</li>');
        }
    });
/*     socket.on('FileUploaded', (data) => {
        console.log(data)
        if ($(`#${data.hostname}`).length) {
            $('#currentUploadList').prepend($(`#${data.hostname}`))
            $(`#${data.hostname}`).children().text(data.time);
        }
        else {
            $('#currentUploadList').prepend('<li ' + 'class="list-group-item"' + ' id=' + '"' + data.hostname + '"' + '>' + data.hostname + '<span>' + data.time + '</span>' + '</li>');
        }
    }); */
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
    //getUploadStatus()
});
