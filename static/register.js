"use strict";
$(document).ready(function() {

    $("#btn").on("click", function() {
        let request = inviaRichiesta("get","/api/elencoUser");
        request.fail(errore);
        request.done(function(data) {
            console.log(data);
            let trov="no";
            for(let i=0;i<data.length;i++)
            {
                if(data[i]["Username"]==$("#username").val())
                    trov="si";
            }
            if(trov=="si")
                alert("Username già in uso");
            else
            {
                let request = inviaRichiesta("get","/api/addUser","par="+$("#username").val()+";"+$("#password").val()+";"+$("#dataNascita").val());
                request.fail(errore);
                request.done(function(data) {
                    let chk=$(".ckPreferenze");
                    let lbl=$(".lbl");
                    for(let i=0;i<chk.length;i++)
                    {
                        if(chk[i].checked)
                        {
                            let request = inviaRichiesta("get","/api/addPreferenze","par="+lbl[i].innerHTML+";"+$("#username").val());
                            request.fail(errore);
                            request.done(function(data) {
                            });
                        }
                    }
                    window.location.href="login.html";
                });
            }
        });
    });
});


function inviaRichiesta(method, url,  parameters="") {
    return $.ajax({
        url: url, //default: currentPage
        type: method,
        data: parameters,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        dataType: "json",
        timeout: 5000,
    });
}

function errore(jqXHR, testStatus, strError) {
    if (jqXHR.status == 0)
        alert("server timeout");
    else if (jqXHR.status == 200)
        alert("Errore Formattazione dati\n" + jqXHR.responseText);
    else
        alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
}