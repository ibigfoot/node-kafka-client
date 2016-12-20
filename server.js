'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const Kafka = require('no-kafka');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});


var brokerUrls = process.env.KAFKA_URL.replace(/\+ssl/g,'');
var consumer = new Kafka.SimpleConsumer({
  connectionString: brokerUrls,
  ssl: {
    certFile: './client.crt',
    keyFile: './client.key'
  }
});

consumer.init().then(function() {
  return consumer.subscribe(process.env.KAFKA_TOPIC, [0], function(messageSet, topic, partition) {
    messageSet.forEach(function(m) {
      var data = JSON.parse(m.message.value.toString('utf8'));
      wss.clients.forEach((client) => {
        client.send('Message Set - Offset['+m.offset+'] messageSize ['+m.messageSize+']kb - DATA \n'+JSON.stringify(data));
      });
    });  
  });
});
/*
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);
*/