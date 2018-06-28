$('document').ready(function(){

    //Socket IO Client connection/Management
    var socket = io.connect('http://10.79.1.30:3000');
    socket.on('emp_updated', (data) => {
        if(data.old_val == null){
            var updateEMP = data.new_val.employee
            $('#employeeList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + updateEMP + '"' + '>' + updateEMP + '</li>');
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

    //Function for getting employees initially
    function getEmpData() {
        $.get('employees', (data) => {
            data.forEach(element => {
                $('#employeeList').append('<li ' + 'class="list-group-item"' + 'id=' + '"' + element.employee + '"' + '>' + element.employee + '</li>');
                console.log(element.employee + ' has been added!');
            });
        });
    };

    //Force redirect incase of POST adding sub-page
    window.history.pushState("Index", "EMPSignIn","/");

    //Click event to manager screen
    document.getElementById("toManager").onclick = function () {
        window.location = "Manager";
    };
    //Click event to status screen
    document.getElementById("toStatus").onclick = function () {
        window.location = "Status";
    };

    //POST to DB
    $('#employeeSubmit').on('click', (event)=>{
        event.preventDefault();
        event.stopPropagation();
        var empInput = $('#employeeInput').val()
        var empObj = {employee : empInput};
        $('#employeeInput').val('');
        $.ajax({
            url:'/signin',
            type:'POST',
            contentType:'application/JSON',
            data: JSON.stringify(empObj)
        }).done((result)=>{
            if (result == "Invalid") {
                console.log('You have entered an invalid Employee ID');
            } else if(result == 'Empty') {
                console.log('The field is empty...');
            }
        });
    });

    //Get EMP data on page load
    getEmpData();


    //Allow enter to submit the form (for scanners carriage return)
    $('.input').keypress(function (e) {
        if (e.which == 13) {
          $('#employeeSubmit').click();
          return false;    //<---- Add this line
        }
      });
});

