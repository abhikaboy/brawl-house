let menuMade = false;
let buttonYPos = Math.floor(screen.height/10);
let selectWidth = 500;
let selectHeight = screen.height/8;
let playMult = 3.6;
let loginMult = playMult+1.6;
let regMult = playMult+2.9;
let gaming = false;
let makeMenu = function(){
    let playButton = new Button(0,500,buttonYPos*playMult,(buttonYPos*playMult) + selectHeight, () => {
        scene = "match-making";
        let menu = document.getElementById("menu");
        menu.style.display = "none";
        socket.emit("playerInQueue",{username: "Suntex", id: socketId});
    });
    let loginButton = new Button(0,500,buttonYPos*loginMult,(buttonYPos*loginMult) + selectHeight, () => {
        //alert("the login button!");
    });
    let registerButton = new Button(0,500,buttonYPos*regMult,(buttonYPos*regMult) + selectHeight, () => {
        //alert("the register button!");
    });

    let playSelector = new Selector(0,buttonYPos*playMult,selectWidth,selectHeight);
    let loginSelector = new Selector(0,buttonYPos*loginMult,selectWidth,selectHeight);
    let registerSelector = new Selector(0,buttonYPos*regMult,selectWidth,selectHeight);
}

let selectScreen;
let statScreen;
let statScreenReady;
let characterSelected = [];
// 0 blue, 1 purple, 2 red, 3 shadow, 4 archer. 
let characters = [];
let played = false;
let makeWaitingScreen = function(){
    resetButtons();
    if(!played){
        let back = document.getElementById("waiting");
        let landing = document.getElementById("landing");
        back.style.display = "block";
        landing.style.display = "none";

    }
    background(0);
}
let makeCharacterSelect = function(){

    background(0); 
    let topRowY = 0.26*screen.height;
    let bottomRowY = 0.578*screen.height;
    let height = 0.14*screen.height;
    let space = .109*screen.width;
    let width = 0.138*screen.width;
    let archerLeft = 0.18*screen.width;
    let shadowLeft = 0.289*screen.width;
    let archerButton = new Button(archerLeft,archerLeft+width,topRowY,topRowY+height, () =>{
        character = new Archer();
        lockCharacter();
    });
    let necromancerButton = new Button(shadowLeft+width+space,shadowLeft+(width*2)+space,bottomRowY,bottomRowY+height, () => {
        character = new Necromancer();
        lockCharacter();      
    });
    let emberButton = new Button(archerLeft+width+space,archerLeft+(width*2)+space,topRowY,topRowY+height, () =>{
        character = new Ember();
        lockCharacter();
    });
    let swordsmanButton = new Button(archerLeft+(width*2)+(space*2),archerLeft+(width*3)+(space*2),topRowY,topRowY+height, () => {
        character = new Valor();
        lockCharacter(); 
    });
    let shadowButton = new Button(shadowLeft,shadowLeft+width,bottomRowY,bottomRowY+height, () => {
        character = new Shadow();
        lockCharacter();
    });

    loadEnemySelector();
}
let clearSelectors = function(){
    let menu = document.getElementById("theyCharSelect");
    menu.style.display = "none";
    menu = document.getElementById("myCharSelect");
    menu.style.display = "none";
}
let loadEnemySelector = function(){
    if(enemyCharacterSelected && scene == "character-select"){
        let menu = document.getElementById("theyCharSelect");
        menu.style.backgroundImage =  "url('Web Assets/Character Selected/char" + enemySelectedIndex + ".png')" 
        menu.style.width = screen.width + "px";
        menu.style.height = screen.height + "px";
        menu.style.backgroundSize = "100% 100%";
        menu.style.opacity = "0.5";
        console.log("changing the background url");
        console.log(menu.style.backgroundImage);
        menu.style.display = "block";
    } else {
        let menu = document.getElementById("theyCharSelect");
        menu.style.display = "none";

    }
}
let isCharacterLocked = false;
let lockCharacter = function(){
    scene = "character-waiting";
    document.getElementById("charSelect").style.backgroundImage = "url('/Web Assets/Character Selection/Character Selection Screen Waiting.jpg')"
    isCharacterLocked = true;
    socket.emit("character-locked",{character:character.name,room:roomId});
    if(enemyLocked){
        goToSkillSelect();
    }
}
let makeWaitingCharacterScreen = function(){
    let menu = document.getElementById("myCharSelect");
    background(0);
}

/**
 * Skill Select
 */

let statSliders = [];
let statLabels = ["Health","Speed","Power","Resistance"];
let readyButton;
let enemyReadyToPlay = false;
let readyToPlay = false;
let validStats = true;
let makeStatSelectScreen = function(){
    let sliderColor;
    for(let i = 0; i < 4; i++){
        sliderColor = new HSBColor((i+1)*25,100,100);
        statSliders[statSliders.length] = new Slider(screen.width/4,200+i*100,screen.width/2,25,100,sliderColor,statLabels[i]);
    }
    readyButton = new Button(0,screen.width,screen.height*0.80,screen.height, () => {
        if(statRemaining < 0){
            validStats = false;
        } else {
            readyToPlay = true;
            socket.emit("ready-to-play",{room:roomId}); 
            if(enemyReadyToPlay){
                scene = "gameplay"; // ;) finally
                menuMade = false;
                makeGameplayScreen();
            } 
            if(!startGameCountdownStarted){
                startGameCountdown(); 
            }
        }
    });
}
let statTotal;
let statRemaining;
let drawStatSelectScreen = function(){
    statTotal = 0;
    for(let i = 0; i < statSliders.length; i++){
        statSliders[i].update();
        statSliders[i].show();
        statTotal += statSliders[i].value;
        statRemaining = 150-statTotal;
    }
    textAlign(CENTER,CENTER);
    textSize(50);
    if(statRemaining < 0){
        fill(255,20,20);
    } else {
        fill(255);
    }
    text(statRemaining + " Skill Points Remaining", screen.width/2,screen.height/1.4);
    if(startGameCountdownStarted){
        fill(255,255,255);
        text(timeLeft + " Seconds until game starts", screen.width/2,screen.height/10);
    }
    validStats = (statRemaining > 0) ? true:false;
    if(!validStats){
        fill(255,20,20);
        text("You have negative skill points!", screen.width/2,screen.height/8);
    } else {
        fill(255,255,255);
        text("Choose how you spread your skill points!", screen.width/2,screen.height/8);
    }
}
let goToSkillSelect = function(){
    console.log("We finna head to the skill selection thing");
    scene = "skill-select";
    let back = document.getElementById("charSelect");
    back.style.backgroundImage = "url('/Web Assets/Character Selection/Stat Pick.jpg')"
}

let timeLeft = 10;
let startGameCountdownStarted = false; 
let startGameCountdown = function(){
    if(scene != "gameplay"){
        setTimeout(() =>{
            startGameCountdownStarted = true;
            timeLeft -=1;
            if(timeLeft == 0){
                scene = "gameplay"; // ;) finally
                // add stats to the character 
                makeGameplayScreen();
            } else{
                startGameCountdown();
            }
        },1000)
    }
}
let readyHandle = function(){

}
/**
 * Gameplay Scenes
 */
let makeGameplayScreen = function(){
    resetButtons();
    let back = document.getElementById("charSelect");
    back.style.backgroundImage = "url('/Web Assets/Maps/map.jpg')";
    tint(255, 127);
    //background('rgba(0,0,0,0.3)');
    fill(0,0,0,200);
    rect(0,0,screen.width,screen.height);
    background(0,100);
    tint(255, 255);
    imageMode(CENTER);
    let statBuffs = character.parseStats(statSliders[0].value,statSliders[1].value,statSliders[2].value,statSliders[3].value);
    console.log(statBuffs);
    character.setStats(statBuffs);
    entities.push(character);
}
let drawGameplayScreen = function(){
    //fill(0,0,0,200);
    //rect(0,0,screen.width,screen.height);
    background(0);
    //tint(255, 255);
}