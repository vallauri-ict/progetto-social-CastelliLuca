"use strict";

let wrapper;
let accountLi;
let accountUl;

$(document).ready(function() {
    let user=$("#User");
    wrapper=$("#wrapper");
    let navbar=$("#navbar");

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
        else
            user.html(data["user"]);
    });

    let header=$("header");
    let n=header.prop("id");
    if($("header").prop("id")=="index")
    {
        request = inviaRichiesta("get","/api/elencoPreferenze");
        request.fail(errore);
        request.done(function(data) {
        console.log(data);
        for(let i=0;i<data.length;i++)
        {
            let div=$("<div>");
            let request = inviaRichiesta("get","/api/infoGame","game="+data[i]["gioco"]);
            request.fail(errore);
            request.done(function(data) {
                console.log(data);
                div.html(data["titolo"]);
                div.prop("val",data["titolo"]);
                div.prop("class","btnGiochi");
            });
            wrapper.append(div);
        }
        });
    }

    $("#wrapper").on("click","div", function() {
        let btn=$(this);
        console.log(btn)
        request = inviaRichiesta("get","/api/updateCurrentGame","game="+btn.prop("val"));
        request.fail(errore);
        request.done(function(data) {
        });
        window.location.href = "pagina2.html";
    });

    
    $("#navbar").on("click","li a", function() {
        if($(this).html()=="Logout")
        {
            let request = inviaRichiesta("get","/api/logout");
            request.fail(errore);
            request.done(function(data) {
                window.location.href = "login.html";
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
        alert("Errore Formattazione dati\n" + jqXHR.responseText);
    else
        alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
}