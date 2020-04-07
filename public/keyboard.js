document.addEventListener('keydown', keyDownHandle,false);
document.addEventListener('keyup',keyUpHandle,false);
document.addEventListener('mousemove',mouseHandle,false);
function keyDownHandle(event) {
    switch(event.keyCode) {
        case 87: // jump
            character.jump();
        case 32: // jump
            character.jump();
            break
        case 83: // dodge
            character.dodge();
            break
        case 65:
            character.moveleft = true;
            character.moveright = false;
            break
        case 68:
            character.moveright = true;
            character.moveleft = false;
            break
        case 49:
            if(scene == "gameplay"){
                character.executeAbilityOne();
            }
            break;
        case 50:
            if(scene == "gameplay"){
                character.executeAbilityTwo();
            }
            break;
        case 51:
            if(scene == "gameplay"){
                character.executeAbilityThree();
            }
            break;
        case 52:
            if(scene == "gameplay"){
                character.executeAbilityFour();
            }
            break;
    }
}
function keyUpHandle(event) {
    switch(event.keyCode) {
        case 65:
            character.moveleft = false;
            break
        case 68:
            character.moveright = false;
            break
    }
}
function mouseHandle(event) {

}
function mouseClicked(){
    if(scene == "gameplay"){
        character.basicAttack();
    }
}