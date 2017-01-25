'use strict'

const express = require('express');
const path = require('path');
const Kafka = require('no-kafka');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

/*
    KAFKA SETUP
*/
var brokerUrls = process.env.KAFKA_URL.replace(/\+ssl/g,'');
var consumer = new Kafka.SimpleConsumer({
  connectionString: brokerUrls,
  ssl: {
    certFile: './client.crt',
    keyFile: './client.key'
  }
});

/*
    SOCKET.IO setup
*/
io.on('connection', function(client) {

    console.log('connection accepted');

    client.on('event', function(data){
        console.log('event - '+JSON.stringify(data));
    });
    client.on('disconnect', function(){
        console.log('disconect');
    });
});

var dataHandler = function(messageSet, topic, partition) {
    
    var count = 0;
    var messageBuffer = [];

    messageSet.forEach(function(m) {
        count++;
        var data = JSON.parse(m.message.value.toString('utf8'));
        console.log('received - '+m.offset);
        var packet = {};
        packet.offset = m.offset;
        packet.messageSize = m.messageSize;
        packet.data = data;
        messageBuffer.push(packet);
        io.emit('message', JSON.stringify(packet));
        // batch 100 records and push to salesforce
        if(count % 100 == 0 ) {
            salesforce.update(messageBuffer).then(function() {
                console.log("finished updating")
                messageBuffer = [];
            }) 
        }
    });
}

/*
    emit to all clients when a kafka message is received
*/

salesforce.login().
    then(() => {
        consumer.init().then(function() {
            return consumer.subscribe(process.env.KAFKA_TOPIC, dataHandler);
        });   
    });



/*
    Webserver setup
*/
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', function(req,res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/fetch', function(req,res) {

    //console.log(JSON.stringify(req.body));
    var data = {};

    consumer.unsubscribe(process.env.KAFKA_TOPIC);
    data.kafkaReturn = consumer.subscribe(process.env.KAFKA_TOPIC, [0], {offset: req.body.offset}, dataHandler);

    data.first = "First";
    
    res.setHeader('Content-Type','application/json');
    res.write(JSON.stringify(data));
    res.end();

});
app.post('/earliest', function(req,res) {
    
    var data = {}
    data.first = "First";
    data.second = "Second";

    consumer.unsubscribe(process.env.KAFKA_TOPIC);
    data.kafkaReturn = consumer.subscribe(process.env.KAFKA_TOPIC, [0], {time: Kafka.EARLIEST_OFFSET}, dataHandler);

    res.setHeader('Content-Type','application/json');
    res.write(JSON.stringify(data));
    res.end();
});
app.post('/latest', function(req,res) {
    var data = {}
    data.first = "First";
    data.second = "Second";

    consumer.unsubscribe(process.env.KAFKA_TOPIC);
    data.kafkaReturn = consumer.subscribe(process.env.KAFKA_TOPIC, [0], {time: Kafka.LATEST_OFFSET}, dataHandler);

    res.setHeader('Content-Type','application/json');
    res.write(JSON.stringify(data));
    res.end();
});
server.listen(process.env.PORT || 3000);

