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
class ArrowShoot extends Ability{
    constructor(){
        super();
        this.active = false;
        this.cooldown = 0.5;
        this.currentcooldown = 0;
    }
    activate(x,y){
        this.active = true;
        let deltaX = (mouseX - x)/1;
        let deltaY = (y - mouseY)/-1;
        let dirVector = createVector(deltaX,deltaY);
        dirVector.normalize();
        dirVector.x *= 60;
        dirVector.y *= 60;
        this.arrow = new Arrow(x,y,dirVector,5);
        this.arrow.decay();
        this.currentcooldown = this.cooldown;
        setTimeout(() => {
            this.currentcooldown -= 0.5;
            console.log("COOLDOWN IS BACK BABEY");
        },500)
    }
    update(){
        this.arrow.update();
        this.active = this.arrow.active;
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
        this.speed = 40;
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
            this.fires[this.fires.length] = new Fire(x,y,2,0.5); 
            this.fires[this.fires.legth-1].decay();
        }
    } 
    update(x,y){
        if(this.active){
            if(this.duration > 1.75){
                character.velocity.x = this.speed*this.direction;
            } else {
                character.freeMove = true;
            }
            if(random() > 0.7 && this.duration > 1){
                this.fires[this.fires.length] = new Fire(x,y,3,0.25); 
                this.fires[this.fires.length-1].decay();
            }
            if(this.fires.length == 0){
                this.active = false;
            }
        }
        for(let i = 0; i < this.fires.length; i++){
            this.fires[i].update();
            if(!this.fires[i].alive){
                this.fires.splice(i,1);
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
                // for(let i=0; i < this.fires.length;i++){
                //     this.fires[i].die();
                // }
                // this.fires.fireballs = [];
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
class ShieldOfFire extends Ability{
    constructor(){
        super();
        this.active = false;
        this.toggle = true;
        this.fireball; 
        this.x;
        this.y; 
        this.dir = createVector(0,0);
        this.size;
        this.dmg = 1;
    } 
    activate(x,y,size){
        this.x = x;
        this.y = y;
        this.active = !this.active;
        this.size = size;
        if(this.active){
            this.fireball = new FireBall(this.x,this.y,this.dir,this.size.x/2,this.size,this.dmg);
            this.doTheDamage();
        } else {
            this.disable();
        }
    }
    update(){
        if(this.active){
            console.log("updating ability 4");
            this.fireball.position.x = character.position.x;
            this.fireball.position.y = character.position.y;
            this.fireball.alpha = 200;
            this.fireball.show();
        } else { 
            this.disable();
        }
    } 
    disable(){
        projectiles.splice(this.fireball,1);
        this.active = false;
    }
    doTheDamage(){
        setTimeout(() => {
            projectiles.splice(this.fireball,1);
            this.fireball = new FireBall(this.x,this.y,this.dir,this.size.x/2,this.size,this.dmg);
            this.fireball.update();
            if(this.active){
                this.doTheDamage();
            }
        },100)

    }
}
