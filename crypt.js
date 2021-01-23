"use strict"

const async = require("async");
const mongo = require("mongodb");
const bcrypt = require("bcryptjs");
const { table, log } = require("console");

let mongoClient = mongo.MongoClient;

const DB_NAME = "Gaming";
const CONNECTIONSTRING = "mongodb://lucacastelli:Felix2012@cluster0-shard-00-00.f6esz.mongodb.net:27017,cluster0-shard-00-01.f6esz.mongodb.net:27017,cluster0-shard-00-02.f6esz.mongodb.net:27017/test?replicaSet=atlas-1477sw-shard-0&ssl=true&authSource=admin";
const CONNECTIONOPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };

mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, (err, client) => {
    if (err) {
        log("Errore di connessione al server mongoDb: " + err.errmsg);
    }
    else {
        let db = client.db(DB_NAME);
        let collection = db.collection("User");
        collection.find({}).project({ "password": 1 }).toArray((err, data) => {
            if (err) {
                log("Errore durante l'esecuzione della query: " + err.errmsg);
            }
            else {
                async.forEach(data, (item, callback) => {
                    let pwd = item.password;
                    let rgx = new RegExp("^\\$2[ayb]\\$.{56}$");
                    if (!rgx.test(pwd)) {
                        let pwdHash = bcrypt.hashSync(pwd, 10);
                        collection.updateOne({ "_id": item._id }, { "$set": { "password": pwdHash } }, (err, data) => {
                            callback(err);
                        });
                    }
                    else{
                        callback(err);
                    }
                }, (err) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg);
                    }
                    else {
                        client.close();
                        log("Done!");
                    }
                });
            }
        });
    }
});