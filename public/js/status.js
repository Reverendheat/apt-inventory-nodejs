function getCountAndUpdate() {
    $.get('upccounts', (data) => {
        data.forEach(element => {
            $('#upcList').append('<li ' + 'class="list-group-item"' + 'data-position=' + element.UPCCount + ' id=' + '"' + element.AcceptedUPC + '"' + '>' + element.AcceptedUPC + '<span>' + element.UPCCount + '</span>' + '</li>');
            if (element.UPCCount <= 10) {
                $('#' + element.AcceptedUPC).css('background-color','Tomato');
            } else if (element.UPCCount <= 25) {
                $('#' + element.AcceptedUPC).css('background-color','Orange');
            } else if (element.UPCCount <= 50) {
                $('#' + element.AcceptedUPC).css('background-color','Yellow');
            }
        });
    });
};
function getCounts() {
    $.get('totalCounts', (data) => {
        var successResult = $.grep(data, function(e){ return e.Type == "Success"; });
        var errorResult = $.grep(data, function(e){ return e.Type == "Error"; });
        var tripResult = $.grep(data, function(e){ return e.Type == "Trip"; });
        $('#successfulScans').html('Successful' + '<span>' + successResult.length + '<span>');        
        $('#errorScans').html('Errors' + '<span>' + errorResult.length + '<span>');
        $('#tripScans').html('Trips' + '<span>' + tripResult.length + '<span>');
    });
};
function sortList() {
    $("#upcList li").sort(sort_li).appendTo('#upcList');
    function sort_li(a, b) {
        return ($(b).data('position')) < ($(a).data('position')) ? 1 : -1;
    }
}

$('document').ready(function(){ 
    //Socket IO Client connection/Management
    var socket = io.connect('http://localhost:3000');
    //Listen for upc updates
    socket.on('upc_updated', (data) => {
        console.log(data);
        if(data.old_val == null) {
            //New UPC added to db with counts
            var updateUPC = data.new_val.AcceptedUPC;
            if (data.new_val.UPCCount) {
                upcCountList = data.new_val.UPCCount;
                $('#upcList').append('<li ' + 'class="list-group-item"' + 'data-position=' + upcCountList  + ' id=' + '"' + updateUPC + '"' + '>' + updateUPC + '<span>' + upcCountList + '</span>' + '</li>');
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
            //Reached 0 should be removed
            var updateUPC = data.old_val.AcceptedUPC;
            $('#' + updateUPC).remove();
            console.log(updateUPC + ' removed');
            $('#statusH3').html(updateUPC + ' removed').css('color','red').fadeIn('slow', () => {
                $("#statusH3").delay(1000).fadeOut('slow');
            });
        } else if (data.new_val.UPCCount != null && data.old_val.UPCCount == null) {
            //Count added/updated to existing entry on manager screen
            var upcCountList = data.new_val.UPCCount;
            var updateUPC = data.new_val.AcceptedUPC;
            console.log('trying to add new count');
            $('#upcList').append('<li ' + 'class="list-group-item"' + 'data-position=' + upcCountList  +  ' id=' + '"' + updateUPC + '"' + '>' + updateUPC + '<span>' + upcCountList + '</span>' + '</li>');
            if (upcCountList <= 10) {
                $('#' + updateUPC).css('background-color','Tomato');
            } else if (upcCountList <= 25) {
                $('#' + updateUPC).css('background-color','Orange');
            } else if (upcCountList <= 50) {
                $('#' + updateUPC).css('background-color','Yellow');
            }
            console.log('Count added');
        } else if (data.new_val.UPCCount != null && data.new_val != null) {
            //Adjusting existing couhnt (successful scan and decrement)
            var upcCountList = data.new_val.UPCCount;
            var updateUPC = data.new_val.AcceptedUPC;
            console.log('trying to update');
            $('#' + updateUPC).replaceWith('<li ' + 'class="list-group-item"' + 'data-position=' + upcCountList  +  ' id=' + '"' + updateUPC + '"' + '>' + updateUPC + '<span>' + upcCountList + '</span>' + '</li>');
/*          $('#' + updateUPC).html(updateUPC + '<span>' + upcCountList + '</span>');
            $('#' + updateUPC).attr('data-position',upcCountList); */
            if (upcCountList <= 10) {
                $('#' + updateUPC).css('background-color','Tomato');
            } else if (upcCountList <= 25) {
                $('#' + updateUPC).css('background-color','Orange');
            } else if (upcCountList <= 50) {
                $('#' + updateUPC).css('background-color','Yellow');
            }
            console.log('Count updated');
        } else if (data.new_val.UPCCount == null && data.old_val.UPCCount != null) {
            //Someone removed counts from this item on manager screen
            var updateUPC = data.old_val.AcceptedUPC;
            $('#' + updateUPC).remove();
            console.log(updateUPC + ' removed');
            $('#statusH3').html(updateUPC + ' counts reset or removed').css('color','red').fadeIn('slow', () => {
                $("#statusH3").delay(1000).fadeOut('slow');
            });
        }
        //Re-Sort the list
        sortList();
    });
    socket.on('ErrorReading', (data)=> {
        $('#errorScans').html('Errors' + '<span>' + data + '<span>');
        console.log('Error not found. Currently at ' + data + ' errors!');
    });
    socket.on('SuccessReading', (data)=> {
        $('#successfulScans').html('Successful' + '<span>' + data + '<span>');
        console.log('Success. Currently at ' + data + ' good scans!');
    });
    socket.on('TripReading', (data)=> {
        $('#tripScans').html('Trips' + '<span>' + data + '<span>');
        console.log('Error not found. Currently at ' + data + ' trips!');
    });
    window.history.pushState("Status", "Status","/Status");
    document.getElementById("toEmployee").onclick = function () {
        window.location = "/";
    };
    document.getElementById("toManager").onclick = function () {
        window.location = "/Manager";
    };
    getCountAndUpdate();
    getCounts();
});
