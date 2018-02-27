$('document').ready(function(){

    //Socket IO Client connection/Management
    var socket = io.connect('http://localhost:3000');
    socket.on('emp_updated', (data) => {
        if(data.old_val == null){
            var updateEMP = data.new_val.employee
            $('#employeeList').append('<li ' + 'id=' + '"' + updateEMP + '"' + '>' + updateEMP + '</li>');
            console.log(updateEMP + ' has been added!');
        }else if (data.new_vall == null){
            var updateEMP = data.old_val.employee
            $('#' + updateEMP).remove();
            console.log(updateEMP + ' has been removed!');
        }
    })

    //Function for getting employees initially
    function getEmpData() {
        $.get('employees', (data) => {
            data.forEach(element => {
                $('#employeeList').append('<li ' + 'id=' + '"' + element.employee + '"' + '>' + element.employee + '</li>');
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

