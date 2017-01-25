'use strict'

let nforce = require('nforce'),

    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    SF_USER_NAME = process.env.SF_USER_NAME,
    SF_PASSWORD = process.env.SF_PASSWORD;

let org = nforce.createConnection({
    clientId: SF_CLIENT_ID,
    clientSecret: SF_CLIENT_SECRET,
    redirectUri: 'https://node-kafka-client.herokuapp.com/oauth/_callback',
    mode: 'single',
    autoRefresh: true
});

let login = (callback) => {
    return new Promise((resolve, reject) => {
        org.authenticate({username: SF_USER_NAME, password: SF_PASSWORD}, err => {
            if (err) {
                console.log("Authentication error");
                console.log(err);
                reject(err);
            } else {
                console.log("Authentication successful");
                resolve();
            }
        });
    });
};

let update = function(messages) {

    console.log("We have ["+messages.length+"] messages " );
    var messageList = [];
    for (var i in messages ) {
        var m = messages[i];
        var sfMessage = nforce.createSObject('Favourite__c');
        sfMessage.set('OwnerId', 'OwnerId',m.userId);
        sfMessage.set('Property__c', m.propertyId);
        sfMessage.set('User__c', m.userId);
        messageList.push(m)
    }
    org.insert({ sobject: messageList}, function(err, response) {
        if (err) {
            console.log(err)
        } else {
            console.log(JSON.stringify(response))
        }
    });

};

//{"userId":"00528000005nRRpAAM","propertyId":"a032800000LxhVSAAZ","eventType":"appointment","date":1485353220024}

exports.login = login;
exports.update = update;