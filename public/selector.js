let selectors = [];
let selectImg;
let particleDirection = "right";
let scaleX = screen.width/1920;
let scaleY = screen.height/1080;
class Selector{
    constructor(x,y,width,height){
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        selectors.push(this);
    }
    show(){
        blendMode(BURN);
        // image(selectImg,this.x,this.y,this.w,this.h);
        blendMode(BLEND);
    }
}
let selectHandle = function(button){
    buttons.forEach((item,index,array) => {
        item.checkHover();
        item.clicked();
        if(item.hovering){
            particles[particles.length] = new Particle(0,random(buttons[index].top,buttons[index].bottom),particleDirection);
            selectors[index].show();
        }        
    });
}

let lastHover;
let selectHandleNoParticle = function(button){
    let selectedAnItem = false;
    buttons.forEach((item,index,array) => {
        item.checkHover();
        item.clicked(); 
        if(item.hovering){
            selectedAnItem = true;
            if(lastHover != index){
                socket.emit("new-character-selected",{index:index,room:roomId});
            }
            //tint(255, 127);
            //image(characterSelected[index],-12,605,1072*scaleX,314*scaleY);
            
            let menu = document.getElementById("myCharSelect");
            menu.style.backgroundImage =  "url('Web Assets/Character Selected/char" + index + ".png')" 
            menu.style.width = screen.width + "px";
            menu.style.height = screen.height + "px";
            menu.style.backgroundSize = "100% 100%";
            console.log("changing the background url");
            console.log(menu.style.backgroundImage);
            menu.style.display = "block";
            //menu.style.opacity = "0.5";
            //tint(255,255);
            lastHover = index;
        }
    });
    if(!selectedAnItem){
        let menu = document.getElementById("myCharSelect");
        menu.style.display = "none";
    }
}
let selectHandleLocked = function(){
    let menu = document.getElementById("myCharSelect");
    menu.style.display = "none";
    particles[particles.length] = new Particle(random(0,800*scaleX),screen.height,"up-left");
    loadEnemySelector();
}
let selectHandleStatReady = function(){
    buttons.forEach((item,index,array) => {
        item.checkHover();
        item.clicked();
        if(item.hovering){
            particles[particles.length] = new Particle(random(0,screen.width),screen.height,"up");
        }        
    });    
}