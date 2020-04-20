let express = require('express');
let app = express();
let server = require('http').createServer(app);
app.use(express.static('public'));
let io = require('socket.io').listen(server);
server.listen(process.env.PORT || 3000);

let playersinQueue = [];
let queueCount = 0;
let players = [];
let socketsInQueue = [];
let roomsMade = 0;
io.sockets.on('connection', (socket) => { 
    console.log(socket.id);
    console.log("there has been a connection");
    socket.emit("success",{id:socket.id}); // feeding player it's socket 
    socket.on("playerInQueue",(data) => {
        socket.join('waiting room');
        queueCount++;
        playersinQueue.push(data);
        socketsInQueue.push(data.id);
        let otherPlayerNum = 0;
        let myIndex = 1;
        if(queueCount > 1){ // Create a room 
            roomsMade++;
            if(playersinQueue[otherPlayerNum].id == data.id){
                otherPlayerNum = 1;
                myIndex = 0;
            }
            socket.to('waiting room').emit("foundEnemy", {enemy:playersinQueue[myIndex],roomId:roomsMade}); // sends found enemy to other client along with enemy data
            socket.emit("foundEnemy",{enemy:playersinQueue[otherPlayerNum],roomId:roomsMade}); // sends "foundEnemy" along with enemy data. 
            console.log("New Game Created " + roomsMade);
            queueCount -= 2;
            playersinQueue.splice(0,2);
        }
    })
    socket.on('disconnect',() =>{
        if(socketsInQueue.includes(socket.id)){
            playersinQueue.splice(socketsInQueue.indexOf(socket.id),1);
            socketsInQueue.splice(socketsInQueue.indexOf(socket.id),1);
            if(queueCount > 0){
                queueCount--;
            }
        }
        console.log(queueCount);
        console.log("Socket Disconnected");
    })
    socket.on('remove-from-queue',(data) => {
        playersinQueue.splice(socketsInQueue.indexOf(socket.id),1);
        socketsInQueue.splice(socketsInQueue.indexOf(socket.id),1);
    })
    socket.on('character-locked', (data) => {
        socket.to(data.room).emit('enemyLocked',{room:data.room});
    })
    socket.on('new-character-selected',(data) => {
        socket.to(data.room).emit('enemy-character-selected',{index:data.index});
    })
    socket.on('leave-waiting',(data) => {
        socket.leave('waiting room');
        let joinRoom = "" + data.roomId;
        socket.join(joinRoom); 
    })
    socket.on("ready-to-play",(data) => {
        socket.to(data.room).emit('enemy-ready-to-play',{room:data.room});
    })

    /**
     * Gameplay Stuff
     */
    socket.on("enemy-entity",(data) => {
        socket.to(data.room).emit("enemy-entity-packet",{entities:data.entities});
    })
    socket.on("enemy-char-data",(data) => {
        socket.to(data.room).emit("enemy-char-data",{data:data});
    })
    socket.on("new-square-attack",(data) => {
        socket.to(data.room).emit("enemy-square-attack",{data:data});
    })
    socket.on("new-circle-attack",(data) => {
        socket.to(data.room).emit("enemy-circle-attack",{data:data});
        
    })
    socket.on('enemy-projectiles',(data) => {
        socket.to(data.room).emit("enemy-projectile-packet",{data:data});
    })
    socket.on("damage-marker",(data) => {
        io.in(data.room).emit('damage-marker', {data:data});
    })
    socket.on("enemy-heal", (data) => {
        socket.to(data.room).emit('heal', {data:data});
    })
    socket.on("bat-heal", (data) => {
        socket.to(data.room).emit('bat-heal',{data:data});
    })
    socket.on("new-particle", (data) => {
        socket.to(data.room).emit("new-particle", {data:data});
    })
})

console.log("we running");