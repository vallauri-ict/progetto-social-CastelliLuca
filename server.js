"use strict";

const http=require("http");
const express=require("express");
const app=express();
const fs=require("fs");

let mongo=require("mongodb");
let async=require("async");
const { json } = require("body-parser");
let mongoClient=mongo.MongoClient;
const ObjectId=mongo.ObjectID;
const CONNECTIONSTRING=process.env.MONGODB_URI || "mongodb://lucacastelli:Felix2012@cluster0-shard-00-00.f6esz.mongodb.net:27017,cluster0-shard-00-01.f6esz.mongodb.net:27017,cluster0-shard-00-02.f6esz.mongodb.net:27017/test?replicaSet=atlas-1477sw-shard-0&ssl=true&authSource=admin";
const CONNECTIONOPTIONS={useNewUrlParser: true,useUnifiedTopology:true};
let currentUser="";
let currentGame="";
let currentMod="Wiki";
const PORT=process.env.PORT || 1337;
const TTL_Token = 1000; //espresso in sec 
const DBNAME="Gaming";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const server=http.createServer(app);
server.listen(PORT, function() {
    console.log("Server in ascolto sulla porta "+PORT);
    init();
});

let paginaErrore="";
let privateKey;
function init(req,res)
{
    fs.readFile("./static/error.html", function (err, data)
    {
        if (!err)
            paginaErrore = data.toString();
        else
            paginaErrore = "<h1>Risorsa non trovata</h1>";
    });
    fs.readFile("./keys/private.key", function (err, data) {
        if (!err) {
            privateKey = data.toString();
        }
        else {
            //Richiamo la route di gestione degli errori
            console.log("File mancante: private.key");
            server.close();
        }
    })

    app.response.log = function (message) {
        console.log("Errore: " + message);
    }
}

app.get("/", function (req, res, next) {
    controllaToken(req, res, next);
});

app.get("/index.html", function (req, res, next) {
    controllaToken(req, res, next);
});

app.get('/api/updateCurrentGame', function (req, res, next) {
    currentGame=req.query["game"];
    res.send(JSON.stringify({"ris":"ok"}));
});

app.get('/api/updateCurrentMod', function (req, res, next) {
    currentMod=req.query["mod"];
    res.send(JSON.stringify({"ris":"ok"}));
});

app.get('/api/elencoUser', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("User");
            collection.find().toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/aggiornaGiocatori', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Find");
            //collection.updateOne({"_id":req.query.id},{ $set: {"Giocatori" : "200"} },function(err,data){
            collection.updateOne({"Username": req.query.user}, {$inc: {"Giocatori": -1}},function(err,data){
                if(err)
                res.status(500).send("Errore di esecuzione query");
            else
            {
                res.send(data);
            }
            });
        }
    });
});

app.get('/api/annullaRichiesta', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Find");
            collection.deleteOne({"Username": currentUser},function(err,data){
                if(err)
                res.status(500).send("Errore di esecuzione query");
            else
            {
                collection=db.collection("Accepted");
                collection.deleteMany({"Host": currentUser},function(err,data){
                    if(err)
                        res.status(500).send("Errore di esecuzione query");
                    else
                    {
                        res.send(data);
                    }
                });
            }
            });
        }
    });
});

app.get('/api/esciLobby', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Accepted");
            collection.deleteOne({"Client": currentUser},function(err,data){
                if(err)
                res.status(500).send("Errore di esecuzione query");
            else
            {
                let db=client.db("Gaming");
                let collection=db.collection("Find");
                console.log(req.query.user);
                collection.updateOne({"Username": req.query.user}, {$inc: {"Giocatori": 1}},function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                {
                    res.send(data);
                }
                });
            }
            });
        }
    });
});

app.get('/api/elencoPreferenze', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Preferenze");
            collection.find({"Username":currentUser}).toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/elencoRichieste', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("RichiesteMod");
            collection.find().toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/lobby', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Accepted");
            collection.find( {"Host":req.query.user}).toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/infoGame', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let collection=db.collection("Games");
            collection.findOne({"titolo":req.query.game},(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            }));
        }
    });
});

app.get('/api/infoUser', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let collection=db.collection("User");
            collection.findOne({"Username":currentUser},(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            }));
        }
    });
});

app.get('/api/news', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let collection=db.collection("News");
            collection.find({"Gioco":req.query.game}).sort({"data":1}).toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/esports', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let collection=db.collection("Esports");
            collection.find({"Gioco":req.query.game}).sort({"data":1}).toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/forum', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Forum");
            collection.find({"Gioco":req.query.game}).sort({"_id":1}).toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/Accept', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Accepted");
            collection.insertOne({"Host":req.query.user,"Client":currentUser},function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/addUser', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("User");
            let par=req.query.par.split(';');
            collection.insertOne({"Username":par[0],"password":par[1],"dataNascita":par[2],"ruolo":"recluta"},function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                {
                    let collection = db.collection("User");
                    collection.find({}).project({ "password": 1 }).toArray((err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg);
                    }
                    else 
                    {
                        async.forEach(data, (item, callback) => {
                        let pwd = item.password;
                        let rgx = new RegExp("^\\$2[ayb]\\$.{56}$");
                        if (!rgx.test(pwd)) {
                            let pwdHash = bcrypt.hashSync(pwd, 10);
                            collection.updateOne({ "_id": item._id }, { "$set": { "password": pwdHash } }, (err, data) => {
                                callback(err);
                            });
                    }
                    else
                    {
                        callback(err);
                    }
                }, (err) => {
                    if (err) {
                    }
                    else {
                        res.send(JSON.stringify("{ris:ok}"));
                    }
                });
            }
        });
                }
            });
        }
    });

});

app.get('/api/addPreferenze', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Preferenze");
            let par=req.query.par.split(';');   
            collection.insertOne({"Username":par[1],"gioco":par[0]},function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                {
                    res.send(data);
                }
            });
        }
    });

});

app.get('/api/addPreferenze', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("Preferenze");
            let par=req.query.par.split(';');   
            collection.insertOne({"Username":par[1],"gioco":par[0]},function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                {
                    res.send(data);
                }
            });
        }
    });

});

app.get('/api/addRichiesta', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            let db=client.db("Gaming");
            let collection=db.collection("RichiesteMod");
            let par=req.query.par.split(';');   
            collection.insertOne({"Username":currentUser,"Gioco":par[0],"Descrizione":par[1]},function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                {
                    res.send(data);
                }
            });
        }
    });

});

app.get('/api/richieste', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let collection=db.collection("Find");
            collection.find({"Gioco":req.query.game}).sort({"_id":-1}).toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/richiesteUser', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let collection=db.collection("Find");
            collection.find({"Username":currentUser}).toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/acceptRichiesta', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let par=req.query.par.split(';');
            let collection=db.collection("RichiesteMod");
            collection.deleteOne({$and:[{"Username":par[0],"Gioco":par[1]}]},function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                {
                    collection=db.collection("User");
                    collection.updateOne({"Username":par[0]},{ "$set": { "ruolo": "mod" }},function(err,data){
                        if(err)
                            res.status(500).send("Errore di esecuzione query");
                        else
                        {
                            collection=db.collection("Mod");
                            collection.insertOne({"Username": par[0], "Gioco": par[1]},function(err,data){
                                if(err)
                                    res.status(500).send("Errore di esecuzione query");
                                else
                                {
                                    res.send(data);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

app.get('/api/lobbyAttiva', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let collection=db.collection("Accepted");
            collection.find({"Client":currentUser}).toArray(function(err,data){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(data);
            });
        }
    });
});

app.get('/api/Inviarichiesta', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING,CONNECTIONOPTIONS,function(err,client){
        if(err){
            res.status(503).send("Errore di connessione al db");
        }else{
            //console.log(req.query["game"]);
            let db=client.db("Gaming");
            let collection=db.collection("Find");
            let par=req.query.par.split(';');
            collection.insertOne( {"Username": currentUser, "Piattaforma": par[1], "Descrizione": par[2], "Gioco": currentGame, "Giocatori": parseInt(par[0]) },function(err){
                if(err)
                    res.status(500).send("Errore di esecuzione query");
                else
                    res.send(JSON.stringify({"ris":"ok"}));
            });
        }
    });
});

//Questa route deve essere scritta prima del metodo controllaToken()
app.get('/api/login', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database").log(err.message);
        else {
            const db = client.db(DBNAME);
            const collection = db.collection("User");
            console.log(req.query["username"]);
            let username = req.query["username"];
            collection.findOne({ "Username": username }, function (err, dbUser) {
                if (err)
                    res.status(500).send("Internal Error in Query Execution").log(err.message);
                else {
                    if (dbUser == null)
                        res.status(401).send("Username e/o Password non validi");
                    else {
                        //req.body.password --> password in chiaro inserita dall'utente
                        //dbUser.password --> password cifrata contenuta nel DB
                        //Il metodo compare() cifra req.body.password e la va a confrontare con dbUser.password
                        bcrypt.compare(req.query["password"], dbUser.password, function (err, ok) {
                            if (err)
                                res.status(500).send("Internal Error in bcrypt compare").log(err.message);
                            else {
                                if (!ok)
                                    res.status(401).send("Username e/o Password non validi");
                                else {
                                    let token = createToken(dbUser);
                                    writeCookie(res, token);
                                    currentUser=dbUser.Username;
                                    res.send({ "ris": "ok" });
                                }
                            }
                        });
                    }
                }
                client.close();
            })
        }
    });
});

app.get("/api/logout", function (req, res, next) {
    res.set("Set-Cookie", `token="";max-age=-1;path=/;httponly=true`);
    res.send({ "ris": "ok" });
})

//Route per fare in modo che il server risponda a qualunque richiesta anche extra-domain.
app.use("/", function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
})

app.use("/api", function (req, res, next) {
    controllaToken(req, res, next);
});

function controllaToken(req, res, next) {
    let token = readCookie(req);
    if (token == "") {
        inviaErrore(req, res, 403, "Token mancante");
    }
    else {
        jwt.verify(token, privateKey, function (err, payload) {
            if (err) {
                inviaErrore(req, res, 403, "Token scaduto o corrotto");
            }
            else {
                let newToken = createToken(payload);
                writeCookie(res, newToken);
                req.payload = payload; //salvo il payload dentro request in modo che le api successive lo possano leggere e ricavare i dati necessari
                next();
            }
        });
    }
}

function inviaErrore(req, res, cod, errorMessage) {
    if (req.originalUrl.startsWith("/api/")) {
        res.status(cod).send(errorMessage);
    }
    else {
        res.sendFile(__dirname + "/static/login.html");
    }
}

function readCookie(req) {
    let valoreCookie = "";
    if (req.headers.cookie) {
        let cookies = req.headers.cookie.split(';');
        for (let item of cookies) {
            item = item.split('='); //item = chiave=valore --> split --> [chiave, valore]
            if (item[0].includes("token")) {
                valoreCookie = item[1];
                break;
            }
        }
    }
    return valoreCookie;
}

//data --> record dell'utente
function createToken(data) {
    //sign() --> si aspetta come parametro un json con i parametri che si vogliono mettere nel token
    let json = {
        "_id": data["_id"],
        "username": data["username"],
        "iat": data["iat"] || Math.floor((Date.now() / 1000)),
        "exp": (Math.floor((Date.now() / 1000)) + TTL_Token)
    }
    let token = jwt.sign(json, privateKey);
    //console.log(token);
    return token;

}

function writeCookie(res, token) {
    //set() --> metodo di express che consente di impostare una o più intestazioni nella risposta HTTP
    res.set("Set-Cookie", `token=${token};max-age=${TTL_Token};path=/;httponly=true`);
}


app.get('/api/currentGame', function (req, res, next) {
        res.send(JSON.stringify({"ris":currentGame}));
});
app.get('/api/currentMod', function (req, res, next) {
    res.send(JSON.stringify({"ris":currentMod,"user":currentUser}));
});

app.use("/",express.static("./static"));

app.use('/', function (req, res, next) {
    res.status(404);
    if(req.originalUrl.startsWith("/api/"))
        {
            res.json('"Risorsa non trovata"');
        }
    else
        {
            res.send(paginaErrore);
        }
   });