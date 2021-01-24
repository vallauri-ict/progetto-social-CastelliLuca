"use strict";

let wrapper;
let richieste;
let user;
let navbar;
let divPreferenze;
let admin;

$(document).ready(function() {
    user=$("#User");
    wrapper=$("#wrapper");
    navbar=$("#navbar");

    wrapper.prop("class","divDinamico");
    let li=$("<li>");
    let a=$("<a>");
    a.prop("href","richiesta.html").html("Richiesta Mod");
    if($("header").prop("id")=="richiesta")
        li.addClass("active");
    li.append(a);
    navbar.append(li);
    li=$("<li>");
    a=$("<a>");
    a.prop("href","info.html").html("Info personali");
    if($("header").prop("id")=="info")
        li.addClass("active");
    li.append(a);
    navbar.append(li);
    li=$("<li>");
    a=$("<a>");
    a.prop("href","contact.html").html("Contattaci");
    if($("header").prop("id")=="contact")
        li.addClass("active");
    li.append(a);
    navbar.append(li);
    li=$("<li>");
    a=$("<a>");
    a.html("Logout");
    li.append(a);
    navbar.append(li);
    
    let page;
    page=$("header").prop("id");
    console.log(page);

            
    let request = inviaRichiesta("get","/api/infoUser");
    request.fail(errore);
    request.done(function(data) {
        console.log(data);
        user.html(data["Username"]);
        if(data["ruolo"]=="admin")
            admin="yes";
        else
            admin="no";
        
    if(page=="info")
    {
        let div=$("<div>");
        let request = inviaRichiesta("get","/api/infoUser");
        request.fail(errore);
        request.done(function(data) {
            console.log(data);
            div=$("<div>");
            div.html("Username: "+data["Username"]);
            div.prop("id","divUsername");
            wrapper.append(div);
            div=$("<div>");
            div.html("Data di nascita: "+data["dataNascita"]);
            
            wrapper.append(div);
            let request = inviaRichiesta("get","/api/elencoPreferenze");
            request.fail(errore);
            request.done(function(data) {
                console.log(data);
                div=$("<div>");
                div.html("Preferenze: ");
                div.prop("id","Preferenze");
                wrapper.append(div);
                for(let i=0;i<data.length;i++)
                {
                    div=$("<div>");
                    div.html(data[i]["gioco"]);
                    div.prop("class","Preferences");
                    wrapper.append(div);
                }
                div=$("<div>");
                div.html("Aggiungi Preferenze");
                div.prop("id","btnAddPreferenze");
                wrapper.append(div);
                divPreferenze=$("<div>");
                divPreferenze.prop("id","AggiuntaPreferenze");
                wrapper.append(divPreferenze);
                let pre=["Tom Clancy's Rainbow Six Siege","Counter-Strike: Global Offensive","Fortnite","Call of Duty: Warzone","FIFA 21"];
                let found;
                for(let j=0;j<5;j++)
                {
                    found="no";
                    for(let i=0;i<data.length;i++)
                    {
                        if(pre[j]==data[i]["gioco"])
                            found="yes";
                    }
                    if(found=="no")
                    {
                        let lbl=$("<label>");
                        lbl.html(pre[j]);
                        lbl.prop("name","lbl");
                        divPreferenze.append(lbl);
                        let chk=$("<input>");
                        chk.prop("type","radio");
                        chk.prop("name","chk");
                        divPreferenze.append(chk);
                        let br=$("<br>");
                        divPreferenze.append(br);
                    }
                }
                divPreferenze.hide();
            });
        });
    }
    else if(page=="contact")
    {       
        let div=$("<div>");
        div.html("Se trovi qualche problema contatta la mail: <br>luca.castelli02@gmail.com <br>Oppure <br>abratizcoabra@gmail.com");
        div.prop("id","contatti");
        wrapper.append(div);
    }
    else if(page=="richiesta")
    {
        if(admin=="no")
        {
            let request = inviaRichiesta("get","/api/elencoPreferenze");
            request.fail(errore);
            request.done(function(data) {
                let p=$("<p>");
                p.html("Scegli il gioco di cui vuoi diventare moderatore:<br>");
                wrapper.append(p);
                let select=$("<select>");
                select.css("color","black");
                select.prop("id","sltGame");
                wrapper.append(select);
                for(let i=0;i<data.length;i++)
                {
                    let option=$("<option>");
                    option.html(data[i]["gioco"]);
                    select.append(option);
                }
                p=$("<p>");
                p.html("Spiegaci perchè vorresti diventare moderatore: <br>");
                wrapper.append(p);
                let input=$("<input>");
                input.prop("type","text");
                input.prop("id","txtDesc");
                input.css("color","black");
                wrapper.append(input);
                let div=$("<div>");
                div.html("Invia la richiesta");
                div.prop("id","btnInviaRichiestaMod");
                wrapper.append(div);
            });
        }
        else
        {
            let request = inviaRichiesta("get","/api/elencoRichieste");
            request.fail(errore);
            request.done(function(data) {
                console.log(data);
                richieste=data;
                for(let i=0;i<data.length;i++)
                {
                    let divRichiesta=$("<div>");
                    divRichiesta.prop("id","divRichiesta"+i);
                    wrapper.append(divRichiesta);
                    let div=$("<div>");
                    div.html(data[i]["Username"]);
                    divRichiesta.append(div);
                    div=$("<div>");
                    div.html(data[i]["Gioco"]);
                    divRichiesta.append(div);
                    div=$("<div>");
                    div.html(data[i]["Descrizione"]);
                    divRichiesta.append(div);
                    div=$("<div>");
                    div.html("Accetta");
                    div.prop("id","btnAccetta-"+i);
                    divRichiesta.append(div);
                }
            });
        }
    }
    });


    wrapper.on("click","div",function(){
        if($(this).prop("id")=="btnAddPreferenze")
        {
            if(divPreferenze.is(":hidden"))
                divPreferenze.show();
            else
            {
                let chk=$("#wrapper div input");
                let lbl=$("#wrapper div label");
                let cont=0;
                for(let i=0;i<chk.length;i++)
                {
                    if(chk[i].checked)
                    {
                        cont++;
                        let request = inviaRichiesta("get","/api/addPreferenze","par="+lbl[i].innerHTML+";"+user.html());
                        request.fail(errore);
                        request.done(function(data) {
                            window.location.href="info.html";
                        });
                    }
                }
                if(cont==0)
                    divPreferenze.hide();
            }
        }
        else if($(this).prop("id")=="btnInviaRichiestaMod")
        {
            let request = inviaRichiesta("get","/api/addRichiesta","par="+$("#sltGame").val()+";"+$("#txtDesc").val());
            request.fail(errore);
            request.done(function(data) {
                alert("Richiesta inviata con successo!!");
                window.location.href="index.html";
            });
        }
    });

    wrapper.on("click","div div",function(){
        if($(this).prop("id").split("-")[0]=="btnAccetta")
        {
            if(confirm("Sicuro di voler accettare la richiesta?"))
            {
                let index=$(this).prop("id").split("-")[1];
                let request = inviaRichiesta("get","/api/acceptRichiesta","par="+richieste[index]["Username"]+";"+richieste[index]["Gioco"]+";"+richieste[index]["Descrizione"]);
                request.fail(errore);
                request.done(function(data) {
                    window.location.href="richiesta.html";
                });
            }
        }
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
    {
        alert("Errore Formattazione dati\n" + jqXHR.responseText);
        window.location.href = "index.html";
    }
    else
        alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
}