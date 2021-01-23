"use strict";

let wrapper;
let accountLi;
let accountUl;
let game;
let divRichieste;
let divRichiesta;
let richieste;
let lobby;
let user;
let navbar;
let intervalLobby;
let divLobby;

$(document).ready(function() {
    user=$("#User");
    wrapper=$("#wrapper");
    navbar=$("#navbar");
    divRichieste="";
    divRichiesta="";
    lobby="";
    divLobby="";


    let li=$("<li>");
    li.prop("id","liWiki");
    let a=$("<a>");
    a.html("Wiki");
    li.append(a);
    navbar.append(li);
    li=$("<li>");
    li.prop("id","liNews");
    a=$("<a>");
    a.html("News");
    li.append(a);
    navbar.append(li);
    li=$("<li>");
    li.prop("id","liEsports");
    a=$("<a>");
    a.html("Esports");
    li.append(a);
    navbar.append(li);
    li=$("<li>");
    li.prop("id","liForum");
    a=$("<a>");
    a.html("Forum");
    li.append(a);
    navbar.append(li);
    li=$("<li>");
    li.prop("id","liGiochiamo");
    a=$("<a>");
    a.html("Giochiamo");
    li.append(a);
    navbar.append(li);

    let request = inviaRichiesta("get","/api/currentMod");
    request.fail(errore);
    request.done(function(data) {
        console.log(data);
        if(data["user"]=="")
        {
            request = inviaRichiesta("get","/api/logout");
            request.fail(errore);
            request.done(function(data) {
                window.location.href="login.html";
            });
        }
    });
    
    request = inviaRichiesta("get","/api/currentGame");
    request.fail(errore);
    request.done(function(data) {
    console.log(data);
    let head=$("head");
    let title=$("<title>");
    title.html(data["ris"]);
    title.appendTo(head);
    game=data["ris"];
    let h1=$("<h1>");
    h1.html(game);
    h1.css({"text-align":"center","margin-top":"0"});
    wrapper.append(h1);
    });


    $("#navbar").on("click","a", function() {
        let btn=$(this);
        console.log(btn.html());
        request = inviaRichiesta("get","/api/updateCurrentMod","mod="+btn.html());
        request.fail(errore);
        request.done(function(data) {
        });
        window.location.href = "pagina2.html";
    });

    
    let mod;
    request = inviaRichiesta("get","/api/currentMod");
    request.fail(errore);
    request.done(function(data) {
    console.log(data);
    user.html(data["user"]);
    mod=data["ris"];
    console.log(mod);
    $("#li"+mod).prop("class","active"); 
    if(mod=="Wiki")
    {
        let div=$("<div>");
        let request = inviaRichiesta("get","/api/infoGame","game="+game);
        request.fail(errore);
        request.done(function(data) {
            console.log(data);
            div=$("<div>");
            div.html("Pubblicato nel: "+data["produzione"]);
            div.prop("val",data["produzione"]);
            wrapper.append(div);
            div=$("<div>");
            div.html(data["descrizione"]);
            div.prop("val",data["descrizione"]);
            wrapper.append(div);
        });
    }
    else if(mod=="News")
    {       
        let request = inviaRichiesta("get","/api/news","game="+game);
        request.fail(errore);
        request.done(function(data) {
            console.log(data);
            for(let i=0;i<data.length;i++)
            {
                let divNotizia=$("<div>");
                let div=$("<div>");
                div.html(data[i]["Testo"]);
                div.prop("val",data["Testo"]);
                divNotizia.append(div);
                div=$("<div>");
                div.html("Pubblicato: "+data[i]["Data"]+" "+data[i]["Ora"]);
                divNotizia.append(div);
                wrapper.append(divNotizia);
            }
            
        });
    }
    else if(mod=="Esports")
    {
        let request = inviaRichiesta("get","/api/esports","game="+game);
        request.fail(errore);
        request.done(function(data) {
            console.log(data);
            for(let i=0;i<data.length;i++)
            {
                let divNotizia=$("<div>");
                //divNotizia.css("background","rgb(2,0,36)");
                divNotizia.css({"background":"rgb(2,0,36)","background":"linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(25,207,209,1) 27%, rgba(0,212,255,1) 83%)","border-radius":"30px","text-align":"left","padding":"20px"});
                let div=$("<div>");
                let aus=data[i]["Testo"].replaceAll(".","<br>");
                div.html(aus);
                divNotizia.append(div);
                div=$("<div>");
                div.html("Pubblicato: "+data[i]["Data"]+" "+data[i]["Ora"]);
                divNotizia.append(div);
                wrapper.append(divNotizia);
            }
            
        });
    }
    else if(mod=="Forum")
    {
        let request = inviaRichiesta("get","/api/forum","game="+game);
        request.fail(errore);
        request.done(function(data) {
            console.log(data);
            for(let i=0;i<data.length;i++)
            {
                let divMessaggio=$("<div>");
                let div=$("<div>");
                div.html(data[i]["Testo"]);
                div.prop("val",data["Testo"]);
                divMessaggio.append(div);
                div=$("<div>");
                div.html(data[i]["Mittente"]+" Pubblicato: "+data[i]["Data"]+" "+data[i]["Ora"]);
                divMessaggio.append(div);
                wrapper.append(divMessaggio);
            }
        });
    }
    else
    {
        let request = inviaRichiesta("get","/api/richiesteUser");
        request.fail(errore);
        request.done(function(data) {
            console.log(data);
            if(data.length==0)
            {
                request = inviaRichiesta("get","/api/lobbyAttiva");
                request.fail(errore);
                request.done(function(lob) {
                    console.log(lob);
                    console.log(lob[0]["Host"]);
                    if(lob.length==0)
                    {
                        let div=$("<div>");
                        div.html("Trova compagni");
                        div.prop("id","btntrovaCompagni");
                        wrapper.append(div);
                        div=$("<div>");
                        div.html("Richiedi compagni");
                        div.prop("id","btnRichiediCompagni");
                        wrapper.append(div);

                        divRichiesta=$("<div>");
                        divRichiesta.prop("id","divRichiesta");
                        divRichiesta.html();
                        wrapper.append(divRichiesta);

                        let p=$("<p>");
                        p.html("Di quanti compagni hai bisogno?");
                        divRichiesta.append(p);
                        let input=$("<input>");
                        input.prop("type","text");
                        input.css("color","black");
                        input.prop("id","txtNumCompagni");
                        divRichiesta.append(input);

                        p=$("<p>");
                        p.html("Piattaforma?");
                        divRichiesta.append(p);
                        let select=$("<select>");
                        select.css("color","black");
                        select.prop("id","sltPlatform");
                        divRichiesta.append(select);
                        let vet=["PS4","XBOX","PC"];
                        for(let i=0;i<vet.length;i++)
                        {
                            let option=$("<option>");
                            option.html(vet[i]);
                            select.append(option);
                        }

                        p=$("<p>");
                        p.html("Richieste aggiuntive");
                        divRichiesta.append(p);
                        input=$("<input>");
                        input.prop("type","text");
                        input.css("color","black");
                        input.prop("id","txtRichAgg");
                        divRichiesta.append(input);

                        div=$("<div>");
                        div.html("Invia");
                        div.prop("id","btnInvia");
                        divRichiesta.append(div);
                        divRichiesta.hide();

                    }
                    else
                    {
                        if(divLobby=="")
                        {
                            divLobby=$("<div>");
                            divLobby.prop("id","divLobby");
                            divLobby.html();
                            wrapper.append(divLobby);

                            let div=$("<div>");
                            div.html("Esci dalla lobby");
                            div.prop("id","esciLobby");
                            divLobby.append(div);
                        }
                        else
                        {
                            divLobby.show();
                            divLobby.empty();
                        }
                        let request = inviaRichiesta("get","/api/lobby","user="+lob[0]["Host"]);
                        request.fail(errore);
                        request.done(function(data) {
                            console.log(data);
                            if(lobby=="")
                            {
                                lobby=data;
                                let div=$("<div>");
                                div.html(lob[0]["Host"]);
                                div.prop("id","btnLobby-"+0);
                                divLobby.append(div);

                                for(let i=0;i<lobby.length;i++)
                                {
                                    div=$("<div>");
                                    div.html(lobby[i]["Client"]);
                                    div.prop("id","btnLobby-"+i+1);
                                    divLobby.append(div);
                                }
                            }
                        });
                        setInterval(function(){
                            let request = inviaRichiesta("get","/api/lobby","user="+lob[0]["Host"]);
                            request.fail(errore);
                            request.done(function(data) {
                                console.log(data);
                                console.log(lobby);
                                if(lobby=="")
                                {
                                    lobby=data;
                                    for(let i=0;i<lobby.length;i++)
                                    {
                                        div=$("<div>");
                                        div.html(lobby[i]["Client"]);
                                        div.prop("id","btnLobby-"+i+1);
                                        divLobby.append(div);
                                    }
                                }
                            });
                        },10000);
                    }
                });
                
                }
                else if(data[0]["Gioco"]==game)
                {
                    let request = inviaRichiesta("get","/api/lobby","user="+user.html());
                        request.fail(errore);
                        request.done(function(data) {
                            if(divLobby=="")
                            {
                                divLobby=$("<div>");
                                divLobby.prop("id","divLobby");
                                divLobby.html();
                                wrapper.append(divLobby);
                            }
                            else
                            {
                                divLobby.show();
                                divLobby.empty();
                            }
                            $("#btnRichieste").hide();
                            console.log(data);
                            if(lobby=="")
                            {
                                lobby=data;

                                let div=$("<div>");
                                div.html("Attendi che i giocatori accettino la tua richiesta");
                                divLobby.append(div);

                                div=$("<div>");
                                div.html("Annulla richiesta");
                                div.prop("id","annullaRichiesta");
                                divLobby.append(div);

                                div=$("<div>");
                                div.html(user.html());
                                div.prop("id","btnLobby-"+0);
                                divLobby.append(div);
    
                                for(let i=0;i<lobby.length;i++)
                                {
                                    div=$("<div>");
                                    div.html(lobby[i]["Client"]);
                                    div.prop("id","btnLobby-"+i+1);
                                    divLobby.append(div);
                                }
                            }
                        });
                    intervalLobby=setInterval(function(){
                        let request = inviaRichiesta("get","/api/lobby","user="+user.html());
                        request.fail(errore);
                        request.done(function(data) {
                            $("#btnRichieste").hide();
                            console.log(data);
                            if(lobby==""&&data.length>0)
                            {
                                lobby=data;
                                let div=$("<div>");
                                div.html(user.html());
                                div.prop("id","btnLobby-"+0);
                                divLobby.append(div);
    
                                for(let i=0;i<lobby.length;i++)
                                {
                                    div=$("<div>");
                                    div.html(lobby[i]["Client"]);
                                    div.prop("id","btnLobby-"+i+1);
                                    divLobby.append(div);
                                }
                            }
                            else if(data==lobby)
                            {
                                alert("nessuno");
                            }
                        });
                    },10000);
                }
                else if(data[0]["Gioco"]!=game)
                {
                    alert("Hai una richiesta attiva nel gioco: "+data[0]["Gioco"]+"\nSe vuoi creare una richiesta devi prima annullare l'altra");
                }
                });
            }
    });

    wrapper.on("click","div",function(){
        if($(this).prop("id")=="btnRichiediCompagni")
        {
            if($("#divRichiesta").is(":hidden"))
                $("#divRichiesta").show();
            else
                $("#divRichiesta").hide();
        }
        else if($(this).prop("id")=="btntrovaCompagni")
        {
            if(divRichieste!="")
                divRichieste.remove();
            divRichieste=$("<div>");
            divRichieste.prop("id","btnRichieste");
            wrapper.append(divRichieste);
            let request = inviaRichiesta("get","/api/richieste","game="+game);
            request.fail(errore);
            request.done(function(data) {
                console.log(data);
                richieste=data;
                for(let i=0;i<data.length;i++)
                {
                    let divRich=$("<div>");
                    divRichieste.append(divRich);
                    let div=$("<div>");
                    div.html(data[i]["Username"]+": Cerco "+data[i]["Giocatori"]+" Giocatori("+data[i]["Descrizione"]+" "+data[i]["Piattaforma"]+")");
                    div.prop("id","btnRich"+i);
                    divRich.append(div);
                    div=$("<div>");
                    div.html("Accetta");
                    div.prop("id","btnAccetta-"+i);
                    divRich.append(div);
                }
            });
        }
    });

    wrapper.on("click","div div",function(){
        if($(this).prop("id")=="btnInvia")
        {
            $("#btntrovaCompagni").remove();
            $("#btnRichiediCompagni").remove();
            $("#divRichiesta").hide();
            let request = inviaRichiesta("get","/api/Inviarichiesta","par="+$("#txtNumCompagni").val()+";"+$("#sltPlatform").val()+";"+$("#txtRichAgg").val());
            request.fail(errore);
            request.done(function(data) {
                console.log(data);
                alert("Richiesta inviata con successo!!")
                $("#txtNumCompagni").val("");
                $("#sltPlatform").val("");
                $("#txtRichAgg").val("");
                if(divLobby=="")
                {
                    divLobby=$("<div>");
                    divLobby.prop("id","divLobby");
                    divLobby.html();
                    wrapper.append(divLobby);

                    let div=$("<div>");
                    div.html("Attendi che i giocatori accettino la tua richiesta");
                    divLobby.append(div);

                    div=$("<div>");
                    div.html("Annulla richiesta");
                    div.prop("id","annullaRichiesta");
                    divLobby.append(div);
                    
                }
                else
                {
                    divLobby.show();
                    divLobby.empty();
                }
                let request = inviaRichiesta("get","/api/lobby","user="+user.html());
                request.fail(errore);
                request.done(function(data) {
                    $("#btnRichieste").hide();
                    console.log(data);
                    if(lobby=="")
                    {
                        lobby=data;
                        let div=$("<div>");
                        div.html(user.html());
                        div.prop("id","btnLobby-"+0);
                        divLobby.append(div);

                        for(let i=0;i<lobby.length;i++)
                        {
                            div=$("<div>");
                            div.html(lobby[i]["Client"]);
                            div.prop("id","btnLobby-"+i+1);
                            divLobby.append(div);
                        }
                    }
                });
                intervalLobby=setInterval(function(){
                    let request = inviaRichiesta("get","/api/lobby","user="+user.html());
                    request.fail(errore);
                    request.done(function(data) {
                        $("#btnRichieste").hide();
                        console.log(data);
                        if(lobby=="")
                        {
                            lobby=data;
                            for(let i=0;i<lobby.length;i++)
                            {
                                div=$("<div>");
                                div.html(lobby[i]["Client"]);
                                div.prop("id","btnLobby-"+i+1);
                                divLobby.append(div);
                            }
                        }
                        else if(data==lobby)
                        {
                            alert("nessuno");
                        }
                    });
                },10000);
        });
        }
        else if($(this).prop("id")=="annullaRichiesta")
        {
            if(confirm("Sicuro di voler eliminare la richiesta"))
            {
                let request = inviaRichiesta("get","/api/annullaRichiesta");
                request.fail(errore);
                request.done(function(data) {
                    $("#divLobby").hide();
                    clearInterval(intervalLobby);
                    let div=$("<div>");
                    div.html("Trova compagni");
                    div.prop("id","btntrovaCompagni");
                    wrapper.append(div);
                    div=$("<div>");
                    div.html("Richiedi compagni");
                    div.prop("id","btnRichiediCompagni");
                    wrapper.append(div);

                    if(divRichiesta=="")
                    {
                        let divRichiesta=$("<div>");
                        divRichiesta.prop("id","divRichiesta");
                        divRichiesta.html();
                        wrapper.append(divRichiesta);
        
                        let p=$("<p>");
                        p.html("Di quanti compagni hai bisogno?");
                        divRichiesta.append(p);
                        let input=$("<input>");
                        input.prop("type","text");
                        input.css("color","black");
                        input.prop("id","txtNumCompagni");
                        divRichiesta.append(input);
        
                        p=$("<p>");
                        p.html("Piattaforma?");
                        divRichiesta.append(p);
                        let select=$("<select>");
                        select.css("color","black");
                        select.prop("id","sltPlatform");
                        divRichiesta.append(select);
                        let vet=["PS4","XBOX","PC"];
                        for(let i=0;i<vet.length;i++)
                        {
                            let option=$("<option>");
                            option.html(vet[i]);
                            select.append(option);
                        }
        
                        p=$("<p>");
                        p.html("Richieste aggiuntive");
                        divRichiesta.append(p);
                        input=$("<input>");
                        input.prop("type","text");
                        input.css("color","black");
                        input.prop("id","txtRichAgg");
                        divRichiesta.append(input);
        
                        div=$("<div>");
                        div.html("Invia");
                        div.prop("id","btnInvia");
                        divRichiesta.append(div);
                        divRichiesta.hide();
                    }
                });
            }
        }
        else if($(this).prop("id")=="esciLobby")
        {
            if(confirm("Sicuro di voler uscire dalla lobby?"))
            {
                let request = inviaRichiesta("get","/api/esciLobby","user="+$("#divLobby div")[1].innerHTML);
                request.fail(errore);
                request.done(function(data) {
                    $("#divLobby").hide();
                    clearInterval(intervalLobby);
                    let div=$("<div>");
                    div.html("Trova compagni");
                    div.prop("id","btntrovaCompagni");
                    wrapper.append(div);
                    div=$("<div>");
                    div.html("Richiedi compagni");
                    div.prop("id","btnRichiediCompagni");
                    wrapper.append(div);

                    if(divRichiesta=="")
                    {
                        divRichiesta=$("<div>");
                        divRichiesta.prop("id","divRichiesta");
                        divRichiesta.html();
                        wrapper.append(divRichiesta);
        
                        let p=$("<p>");
                        p.html("Di quanti compagni hai bisogno?");
                        divRichiesta.append(p);
                        let input=$("<input>");
                        input.prop("type","text");
                        input.css("color","black");
                        input.prop("id","txtNumCompagni");
                        divRichiesta.append(input);
        
                        p=$("<p>");
                        p.html("Piattaforma?");
                        divRichiesta.append(p);
                        let select=$("<select>");
                        select.css("color","black");
                        select.prop("id","sltPlatform");
                        divRichiesta.append(select);
                        let vet=["PS4","XBOX","PC"];
                        for(let i=0;i<vet.length;i++)
                        {
                            let option=$("<option>");
                            option.html(vet[i]);
                            select.append(option);
                        }
        
                        p=$("<p>");
                        p.html("Richieste aggiuntive");
                        divRichiesta.append(p);
                        input=$("<input>");
                        input.prop("type","text");
                        input.css("color","black");
                        input.prop("id","txtRichAgg");
                        divRichiesta.append(input);
        
                        div=$("<div>");
                        div.html("Invia");
                        div.prop("id","btnInvia");
                        divRichiesta.append(div);
                        divRichiesta.hide();
                    }

                });
            }
        }
    });

wrapper.on("click","div div div",function(){
    if($(this).prop("id").split("-")[0]=="btnAccetta")
    {
        $("#btntrovaCompagni").remove();
        $("#btnRichiediCompagni").remove();
        $("#btnRichieste").hide();
        let index=$(this).prop("id").split("-")[1];
        let request = inviaRichiesta("get","/api/AggiornaGiocatori","user="+richieste[index]["Username"]);
        request.fail(errore);
        request.done(function(data) {
            let request = inviaRichiesta("get","/api/Accept","user="+richieste[index]["Username"]);
            request.fail(errore);
            request.done(function(data) {
                console.log(data);
                if(divLobby=="")
                {
                    divLobby=$("<div>");
                    divLobby.prop("id","divLobby");
                    divLobby.html();
                    wrapper.append(divLobby);

                    let div=$("<div>");
                    div.html("Esci dalla lobby");
                    div.prop("id","esciLobby");
                    divLobby.append(div);
                }
                else
                {
                    divLobby.show();
                    divLobby.empty();
                }
                let request = inviaRichiesta("get","/api/lobby","user="+richieste[index]["Username"]);
                request.fail(errore);
                request.done(function(data) {
                    console.log(data);
                    if(lobby=="")
                    {
                        lobby=data;
                        let div=$("<div>");
                        div.html(richieste[index]["Username"]);
                        div.prop("id","btnLobby-"+0);
                        divLobby.append(div);

                        for(let i=0;i<lobby.length;i++)
                        {
                            div=$("<div>");
                            div.html(lobby[i]["Client"]);
                            div.prop("id","btnLobby-"+i+1);
                            divLobby.append(div);
                        }
                    }
                });
                setInterval(function(){
                    let request = inviaRichiesta("get","/api/lobby","user="+richieste[index]["Username"]);
                    request.fail(errore);
                    request.done(function(data) {
                        console.log(data);
                        if(lobby=="")
                        {
                            lobby=data;
                            for(let i=0;i<lobby.length;i++)
                            {
                                div=$("<div>");
                                div.html(lobby[i]["Client"]);
                                div.prop("id","btnLobby-"+i+1);
                                divLobby.append(div);
                            }
                        }
                        else if(data==lobby)
                        {
                            alert("nessuno");
                        }
                    });
                },10000);
            });
        });
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