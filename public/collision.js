class Collision{
    constructor(){
        this.direction = "none";
        this.state = false;
    }
    set(dir,state){
        this.direction = dir;
        this.state = state;
    }
}

let sendAllEntities = function(){
    let allEntityData = []
    for(let i = 0; i < entities.length;i++){
        allEntityData.push(entities[i].getSendableData());
    }
    socket.emit('enemy-entity',{entities:allEntityData,room:roomId}); // array of sendable data
}
let lastProjectileCount = 0;
let timesZero = 0;
let sendAllProjectiles = function(){
    let allProjectileData = [];
    for(let i = 0; i < projectiles.length;i++){
        allProjectileData.push(projectiles[i].getSendableData());
    }
    if(lastProjectileCount > 0 && timesZero < 2) {
        socket.emit('enemy-projectiles',{projectiles:allProjectileData,room:roomId});
    }
    lastProjectileCount = allProjectileData.length;
    if(lastProjectileCount == 0){
        timesZero++;
    } else {
        timesZero = 0;
    }
}