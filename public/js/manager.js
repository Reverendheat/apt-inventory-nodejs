function upcDelete(atag){
    upc = $(atag).parent('li')[0].id;
    if(confirm("OK to remove " + upc + "?"))
        {
            var upcObj = {AcceptedUPC : upc};
            $.ajax({
                url:'/upcset',
                type:'POST',
                contentType:'application/JSON',
                data: JSON.stringify(upcObj)
            }).done((result)=>{
                });
        }
        else
        {
            console.log('You cancelled');
        }
}
function empDelete(atag){
    emp = $(atag).parent('li')[0].id;
    if(confirm("OK to logout " + emp + "?"))
        {
            var empObj = {employee : emp};
            $.ajax({
                url:'/signin',
                type:'POST',
                contentType:'application/JSON',
                data: JSON.stringify(empObj)
            }).done((result)=>{
                });
        }
        else
        {
            console.log('You cancelled');
        }
}
$('document').ready(function(){
    //Socket IO Client connection/Management
    var socket = io.connect('http://localhost:3000');
    //Listen for upc updates
    socket.on('upc_updated', (data) => {
        if(data.old_val == null){
            var updateUPC = data.new_val.AcceptedUPC;
            if (data.new_val.UPCCount) {
                upcCountList = data.new_val.UPCCount;
                $('#upcList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + updateUPC + '"' + '>' + updateUPC + '<a href="#" onclick="upcDelete(this)" class="deleteItem">' + '<span class="badge badge-danger">X</span>' + '</a>' + '<span>' + upcCountList + '</span>' + '</li>');
                console.log(updateUPC + ' added');
                $('#statusH3').html(updateUPC + ' added').css('color','green').fadeIn('slow', () => {
                    $("#statusH3").delay(1000).fadeOut('slow');
                });
            } else {
                $('#upcList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + updateUPC + '"' + '>' + updateUPC +  '<a href="#" onclick="upcDelete(this)" class="deleteItem">' +'<span class="badge badge-danger">X</span>' + '</a>' + '</li>');
                console.log(updateUPC + ' added');
                $('#statusH3').html(updateUPC + ' added').css('color','green').fadeIn('slow', () => {
                    $("#statusH3").delay(1000).fadeOut('slow');
                });
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
            $('#' + updateUPC).html(updateUPC + '<a href="#" onclick="upcDelete(this)" class="deleteItem">' + '<span class="badge badge-danger">X</span>' + '</a>' + '<span>' + upcCountList + '</span>');
            console.log('Count updated');
        }
    })
    //Listen for Scans (Debug)
    socket.on('UPCScanned', (data) => {
        console.log(data + ' was scanned!');
    });
    //Listen for employee updates
    socket.on('emp_updated', (data) => {
        if(data.old_val == null){
            var updateEMP = data.new_val.employee
            $('#employeeList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + updateEMP + '"' + '>' + updateEMP + '<a href="#" onclick="empDelete(this)" class="deleteItem">' +'<span class="badge badge-danger">X</span>' + '</a>' + '</li>');
            console.log(updateEMP + ' has been added!');
            $('#statusH3').html(updateEMP + ' logged in').css('color','green').fadeIn('slow', () => {
                $("#statusH3").delay(1000).fadeOut('slow');
            });
        }else if (data.new_val == null){
            var updateEMP = data.old_val.employee
            $('#' + updateEMP).remove();
            console.log(updateEMP + ' has been removed!');
            $('#statusH3').html(updateEMP + ' logged out').css('color','red').fadeIn('slow', () => {
                $("#statusH3").delay(1000).fadeOut('slow');
            });
        }
    })

    window.history.pushState("Manager", "Manager","/Manager");

    $('#clearedHeader').html('');

    document.getElementById("toEmployee").onclick = function () {
        window.location = "/";
    };

    $('#upcSubmit').on('click', (event)=>{
        event.preventDefault();
        event.stopPropagation();
        var upcInput = $('#upcInput').val()
        console.log($('#'+upcInput).length);
        if ($('#'+upcInput).length == 1){
            console.log("It exists")
        } else {
            console.log('M8 its no theer!')
            var upcCount = prompt('Please enter the amount you would like to create, leaving this blank will disable the countdown feature');
            if (isNaN(upcCount)) {
                alert("Thats not a number, please try again.");
                console.log("Thats not a number, please try again.")
                $('#upcInput').val('');
                return;
            } else {
                upcCount = Number(upcCount);
                console.log(typeof upcCount);
            }
        }
        var upcObj = {AcceptedUPC : upcInput, UPCCount : upcCount};
        console.log("Count is set to " + upcCount + " for " + upcInput)
        $('#upcInput').val('');
        $.ajax({
            url:'/upcset',
            type:'POST',
            contentType:'application/JSON',
            data: JSON.stringify(upcObj)
        }).done((result)=>{
            if (result == "Invalid") {
                console.log('You have entered an invalid UPC');
            } else if(result == 'Empty') {
                console.log('The field is empty...');
            } else if(result == 'EMP') {
                console.log('Please go to the Employee Sign-in page to log in');
            } 
        });
    });

    $('#clearEmployee').click(function(){
        if(confirm("OK to clear all employee logins?"))
        {
            $.post('/clearallEMP');
            location.reload();
            alert('Employee logins cleared!');
        }
        else
        {
            console.log('You cancelled');
        }
        
    });

    $('#clearUPC').click(function(){
        if(confirm("OK to clear all accepted UPCs?"))
        {
            $.post('/clearallUPC');
            location.reload();
            alert('Accepted UPCs cleared!');
        }
        else
        {
            console.log('You cancelled');
        }
    });

    $.get('employees', (data) => {
        data.forEach(element => {
            $('#employeeList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + element.employee + '"' + '>' + element.employee + '<a href="#" onclick="empDelete(this)" class="deleteItem">' +'<span class="badge badge-danger">X</span>' + '</a>' + '</li>');
            console.log(element.employee + ' has been added!');
        });
    });

    $.get('upcs', (data) => {
        console.log(data);
        data.forEach(element => {
            if (element.UPCCount) {
                console.log(element.AcceptedUPC + " has counts!");
                $('#upcList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + element.AcceptedUPC + '"' + '>' + element.AcceptedUPC + '<a href="#" onclick="upcDelete(this)" class="deleteItem">' +'<span class="badge badge-danger">X</span>' + '</a>' + '<span>' + element.UPCCount + '</span>' + '</li>');
                console.log('<li>' + element.AcceptedUPC + '</li>');
            } else {
                console.log(element.AcceptedUPC + " does not have counts ):")
                $('#upcList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + element.AcceptedUPC + '"' + '>' + element.AcceptedUPC + '<a href="#" onclick="upcDelete(this)" class="deleteItem">' +'<span class="badge badge-danger">X</span>' + '</a>' + '</li>');
                console.log('<li>' + element.AcceptedUPC + '</li>');
            }

        });
    });

    $('.input').keypress(function (e) {
        if (e.which == 13) {
          $('#upcSubmit').click();
          return false;    //<---- Add this line
        }
      });
});