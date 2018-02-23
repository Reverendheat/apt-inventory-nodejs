$('document').ready(function(){
    window.history.pushState("Index", "EMPSignIn","/");
    document.getElementById("toManager").onclick = function () {
        window.location = "Manager";
    };
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
            } else if(result == 'Delete') {
                $('#'+empInput).remove();
                console.log(empInput + " was deleted");
            } else {
                $('#employeeList').append('<li ' + 'id=' + '"' + result + '"' + '>' + result + '</li>');
                console.log(empInput + ' has been added');
            }
        });
    });
    $.get('employees', (data) => {
        data.forEach(element => {
            $('#employeeList').append('<li ' + 'id=' + '"' + element.employee + '"' + '>' + element.employee + '</li>');
            console.log('<li ' + 'id=' + '"' + element.employee + '"' + '>' + element.employee + '</li>');
        });
    });
    $('.input').keypress(function (e) {
        if (e.which == 13) {
          $('#employeeSubmit').click();
          return false;    //<---- Add this line
        }
      });
});

