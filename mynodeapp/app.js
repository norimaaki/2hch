const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000;
const chatDataFile = 'chatData.json';

let connectedClients = {};
let chatEnabled = true;

app.get('/', (req, res) => {
 res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
 const clientId = socket.id;
 const userName = `p${Math.floor(Math.random()*100000)}`;

 connectedClients[clientId] = {
   userName: userName
 };

 io.emit('updateConnectedClients', connectedClients);

 socket.on('disconnect', () => {
   delete connectedClients[clientId];
   io.emit('updateConnectedClients', connectedClients);
 });

 socket.on('sendMessage', (message) => {
   if (chatEnabled) {
     const chatData = loadChatData();
     chatData.push({
       userName: connectedClients[clientId].userName,
       message: message
     });
     saveChatData(chatData);

     io.emit('updateChat', chatData);
   }
 });
});

server.listen(port, () => {
 console.log(`Server is running at http://localhost:${port}`);
});

function loadChatData() {
 try {
   const data = fs.readFileSync(chatDataFile, 'utf8');
   return JSON.parse(data);
 } catch (error) {
   console.error('Error loading chat data:', error);
   return [];
 }
}

function saveChatData(chatData) {
 fs.writeFileSync(chatDataFile, JSON.stringify(chatData), 'utf8');
}
