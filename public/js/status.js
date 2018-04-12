$('document').ready(function(){ 
    //Socket IO Client connection/Management
    var socket = io.connect('http://localhost:3000');
    //Listen for upc updates
    socket.on('upc_updated', (data) => {
        if(data.old_val == null){
            var updateUPC = data.new_val.AcceptedUPC;
            if (data.new_val.UPCCount) {
                upcCountList = data.new_val.UPCCount;
                $('#upcList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + updateUPC + '"' + '>' + updateUPC + '<i class="far fa-times-circle"></i>' + '<span>' + upcCountList + '</span>' + '</li>');
                console.log(updateUPC + ' added');
                $('#statusH3').html(updateUPC + ' added').css('color','green').fadeIn('slow', () => {
                    $("#statusH3").delay(1000).fadeOut('slow');
                });
                if (upcCountList <= 10) {
                    $('#' + updateUPC).css('background-color','Tomato');
                } else if (upcCountList <= 25) {
                    $('#' + updateUPC).css('background-color','Orange');
                } else if (upcCountList <= 50) {
                    $('#' + updateUPC).css('background-color','Yellow');
                }
            } 
        } else if (data.new_val == null){
            var updateUPC = data.old_val.AcceptedUPC;
            $('#' + updateUPC).remove();
            console.log(updateUPC + ' removed');
            $('#statusH3').html(updateUPC + ' removed').css('color','red').fadeIn('slow', () => {
                $("#statusH3").delay(1000).fadeOut('slow');
            });
        } else if (data.new_val.UPCCount != null && data.new_val != null) {
            var upcCountList = data.new_val.UPCCount;
            var updateUPC = data.new_val.AcceptedUPC;
            console.log('trying to update');
            $('#' + updateUPC).html(updateUPC + '<a href="#" onclick="upcDelete(this)" class="deleteItem">' + '<i class="far fa-times-circle"></i>' + '</a>' + '<a href="#" onclick="upcChange(this)" class="changeItem">' +'<i class="fas fa-cog"></i>' + '</a>' + '<span>' + upcCountList + '</span>');
            if (upcCountList <= 10) {
                $('#' + updateUPC).css('background-color','Tomato');
            } else if (upcCountList <= 25) {
                $('#' + updateUPC).css('background-color','Orange');
            } else if (upcCountList <= 50) {
                $('#' + updateUPC).css('background-color','Yellow');
            }
            console.log('Count updated');
        } else if (data.new_val.UPCCount == null && data.old_val.UPCCount != null) {
            var updateUPC = data.new_val.AcceptedUPC;
            $('#' + updateUPC).remove();
        }
    })
    window.history.pushState("Status", "Status","/Status");
    document.getElementById("toEmployee").onclick = function () {
        window.location = "/";
    };
    document.getElementById("toManager").onclick = function () {
        window.location = "/Manager";
    };
    $.get('upccounts', (data) => {
        data.forEach(element => {
            if (element.UPCCount) {
                console.log(element.AcceptedUPC + " has counts!");
                $('#upcList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + element.AcceptedUPC + '"' + '>' + element.AcceptedUPC + '<a href="#" onclick="upcDelete(this)" class="deleteItem">' +'<i class="far fa-times-circle"></i>' + '</a>' + '<a href="#" onclick="upcChange(this)" class="changeItem">' +'<i class="fas fa-cog"></i>' + '</a>' + '<span>' + element.UPCCount + '</span>' + '</li>');
                if (element.UPCCount <= 10) {
                    $('#' + element.AcceptedUPC).css('background-color','Tomato');
                } else if (element.UPCCount <= 25) {
                    $('#' + element.AcceptedUPC).css('background-color','Orange');
                } else if (element.UPCCount <= 50) {
                    $('#' + element.AcceptedUPC).css('background-color','Yellow');
                }
            } 
        });
    });
});