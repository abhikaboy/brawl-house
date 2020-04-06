let projectiles = [];
class Projectile{
    constructor(x,y,dir,radius,size){
        this.position = createVector(x,y);
        this.velocity = dir;
        this.acceleration = createVector(0,0); 
        this.size = size;
        this.sprite;
        this.name;
        this.statusEffect;
        this.attackId;
        this.dmg;
        this.radius = radius;

        this.animation;
        this.animationFrame = 0;
        this.animationFrameCount = 8; 
        
        projectiles.push(this);

    }
    updatePosition(){
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
    }
    sendSquareAttack(attackId){
        console.log("sending a square attack");
        if(random() > 0.5){
            socket.emit("new-square-attack",{x:this.position.x,y:this.position.y,dmg:this.dmg,scaleX:scaleX, scaleY:scaleY,
                sizeX:this.size.x,sizeY:this.size.y,type:this.statusEffect,room:roomId,attackId:attackId});
        }
    }
    sendCircleAttack(attackId){
        if(random() > 0.5){
            socket.emit("new-circle-attack",{x:this.position.x,y:this.position.y,dmg:this.dmg,scaleX:scaleX, scaleY:scaleY,
                radius:this.radius,type:this.statusEffect,room:roomId,attackId:attackId});
        }
    }
    show(){

    }
    update(){

    }
    finished(){

    }
}
class FireBall extends Projectile{
    constructor(x,y,dir,radius,size,dmg){
        super();
        this.position = createVector(x,y);
        this.velocity = dir;
        this.acceleration = createVector(0,0); 
        this.size = size;
        this.name;
        this.radius = radius;
        this.acceleration = createVector(0,0); 
        this.statusEffect = "burn";
        this.name = "Fireball";
        attackId++;
        this.attackId = attackId;
        this.alpha = 255;
        this.dmg = dmg;
        this.r = random(100,255);
        this.g = random(20);
        this.b = 0
    }
    show(){
        fill(this.r,this.g,this.b,this.alpha);
        ellipse(this.position.x,this.position.y,this.radius*2,this.radius*2);
        this.alpha -= 13;
    }
    update(){
        this.updatePosition();
        this.show();
        this.sendSquareAttack(this.attackId);
    }
    finished(){
        return (this.alpha <= 10);
    }
    getSendableData(){
        let data = {r:this.r,g:this.g,b:this.b,alpha:this.alpha,x:this.position.x,
            y:this.position.y,radius:this.radius,name:this.name};
        return data;
    }
}
// projectiless
class Fire{
    constructor(x,y,duration,dmg){
        this.position = createVector(x,y);
        this.velocity = createVector(random(-2,2),random(-10,-20));
        this.fballSzie = createVector(20,20);
        this.fireballs = [];
        this.duration = duration;
        this.dmg = dmg;
        this.alive = true;
    }
    burn(){
        if(random() > 0.8){
            this.fireballs[this.fireballs.length] = new FireBall(this.position.x + random(-40,40),this.position.y,this.velocity,10,this.fballSzie,this.dmg);
        }
    }
    update(){

        if(this.alive){
            this.burn();
            for(let i = 0; i < this.fireballs.length; i++){
                let current = this.fireballs[i];
                current.update();
                if(current.finished()){
                    projectiles.splice(projectiles.indexOf(this.fireballs[i]));
                    this.fireballs.splice(i,1);
                }
            }
        }
    }
    die(){ 
        for(let i = 0; i < this.fireballs.length; i++){
            projectiles.splice(projectiles.indexOf(this.fireballs[i]));    
            this.fireballs.splice(i,1);    
        }
    }
    decay(){
        setTimeout(() => {
            if(this.duration > 0){
                this.duration -= 0.25;
                this.decay();
            } else {
                this.alive = false;
            }
        },250)
    }
}