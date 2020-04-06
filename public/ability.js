class Ability{
    constructor(){
        this.active;
        this.burn;
        this.duration;  
        this.cooldown; 
        this.toggle; 
    }
    update(){

    }
    show(){

    }
    activate(){

    }
}

class FireBurst extends Ability{
    constructor(){
        super();
        this.active = false;
        this.burn = true;
        this.duration = 3;
        this.cooldown = 5;
        this.toggle = false;

        this.fireBallRadius = 15;
        this.fireBallCount = 20;
        this.fireBalls = [];    
    }
    // do delta x delta y to figure out the slope it has to go at. Multiply the slope values by the ranodms
    activate(x,y){
        this.active = true;
        let randomFactor = 10;
        let deltaX = (mouseX - x)/10;
        let deltaY = (y - mouseY)/-10;
        let dirVector = createVector(deltaX,deltaY);
        dirVector.normalize();
        for(let i = 0; i < this.fireBallCount; i++){
            let vel = createVector(random((dirVector.x*30)-randomFactor,(dirVector.x*30)+randomFactor),
            random((dirVector.y*30)-randomFactor,(dirVector.y*30)+randomFactor));

            let radius = createVector(this.fireBallRadius*2,this.fireBallRadius*2);
            this.fireBalls[this.fireBalls.length] = new FireBall(x,y,vel,this.fireBallRadius,radius,1);
        }
    }
    update(){
        for(let i = 0; i < this.fireBalls.length; i++){
            let current = this.fireBalls[i];
            current.update();
            if(current.finished()){
                this.fireBalls.splice(i,1);
                projectiles.splice(projectiles.indexOf(this.fireBalls[i]));
            }
        }
        if(this.fireBalls.length == 0){
            this.active = false;
        }
    }
}
class HotStreak extends Ability{
    constructor(){
        super();
        this.active = false;
        this.burn = true;
        this.duration = 2;
        this.speed = 30;
        this.toggle = true;
        this.direction;

        this.fires = [];    
    } 
    activate(dirBlocked,x,y){
        this.active = !this.active;
        if(dirBlocked != "only negative Y"){
            this.active = false;
        } 
        else{
            this.direction = (mouseX > x) ? 1:-1;
            this.decay();
            this.fires[this.fires.length] = new Fire(x,y,2,0.25); 
        }
    } 
    update(x,y){
        if(this.active){
            if(this.duration > 1.75){
                character.velocity.x = this.speed*this.direction;
            } else {
                character.freeMove = true;
            }
            if(random() > 0.7){
                this.fires[this.fires.length] = new Fire(x,y,3,0.25); 
                this.fires[this.fires.length-1].decay();
            }
            for(let i = 0; i < this.fires.length; i++){
                this.fires[i].update();
                if(!this.fires[i].alive){
                    this.fires.splice(i,1);
                }
            }
            if(this.fires.length == 0){
                this.active = false;
            }
        }

    }
    decay(){
        setTimeout(() => {
            if(this.duration > 0){
                this.duration -= 0.25;
                this.decay();
            } else {
                this.active = false;
                character.freeMove = true;
                for(let i=0; i < this.fires.length;i++){
                    this.fires[i].die();
                }
                this.fires.fireballs = [];
            }
        },250)
    } 
}
// traps 
class FireTrap{
    constructor(x,y,duration,dmg){
        this.position = createVector(x,y);
        this.duration = duration;
        this.dmg = dmg;
        this.fireBalls = [];
        this.activated = false;
        this.maxFireBalls = 10;
        this.active = false;
    }
    place(){
        this.decay();
        this.active = true;
    }
    update(){
        if(this.activated){
            for(let i = 0; i < this.fireBalls.length; i++){
                let current = this.fireBalls[i];
                current.update();
                if(current.finished()){
                    this.fireBalls.splice(i,1);
                    projectiles.splice(projectiles.indexOf(this.fireBalls[i]));
                }
            }
            if(this.fireBalls.length == 0){
                this.active = false;
            }
        } else {
            this.show();
            if(this.duration <= 0){
                this.activate();
            }
        }
    }
    activate(){
        if(!this.activated){
            this.activated = true;
            let size = createVector(50,50);
            for(let i = 0; i < this.maxFireBalls; i++){
                let dir = createVector(random(-30,30),random(-30,30));
                this.fireBalls[this.fireBalls.length] = new FireBall(this.position.x,this.position.y,
                dir,25, size,this.dmg)
            }

        }
    }
    show(){
        fill(255,50,50);
        rect(this.position.x,this.position.y,screen.width*0.05,20);
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