$('document').ready(function(){
    //Socket IO Client connection/Management
    var socket = io.connect('http://10.51.4.158:3000');
    socket.on('upc_updated', (data) => {
        if(data.old_val == null){
            var updateUPC = data.new_val.AcceptedUPC;
            $('#upcList').append('<li ' + 'id=' + '"' + updateUPC + '"' + '>' + updateUPC + '</li>');
            console.log(updateUPC + ' has been added!');
        }else if (data.new_val == null){
            var updateUPC = data.old_val.AcceptedUPC;
            $('#' + updateUPC).remove();
            console.log(updateUPC + ' has been removed!');
        }
    })
    socket.on('emp_updated', (data) => {
        if(data.old_val == null){
            var updateEMP = data.new_val.employee
            $('#employeeList').append('<li ' + 'id=' + '"' + updateEMP + '"' + '>' + updateEMP + '</li>');
            console.log(updateEMP + ' has been added!');
        }else if (data.new_val == null){
            var updateEMP = data.old_val.employee
            $('#' + updateEMP).remove();
            console.log(updateEMP + ' has been removed!');
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
        var upcObj = {AcceptedUPC : upcInput};
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
            $('#employeeList').append('<li>' + element.employee + '</li>');
            console.log('<li>' + element.employee + '</li>');
        });
    });
    $.get('upcs', (data) => {
        data.forEach(element => {
            $('#upcList').append('<li>' + element.AcceptedUPC + '</li>');
            console.log('<li>' + element.AcceptedUPC + '</li>');
        });
    });
    $('.input').keypress(function (e) {
        if (e.which == 13) {
          $('#upcSubmit').click();
          return false;    //<---- Add this line
        }
      });
});