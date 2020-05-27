class Ability {
  constructor() {
    this.active;
    this.burn;
    this.duration = 5;
    this.cooldown;
    this.toggle;
  }
  update() {}
  show() {}
  activate() {}
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.25;
      this.duration -= 0.25;
      if (this.currentcooldown <= 0) {
        console.log("off cooldown!");
      } else {
        this.decay();
      }
    }, 250);
  }
}
class Sneak extends Ability {
  constructor() {
    super();
    this.active = false;
    this.toggle = true;
    this.cooldown = 5;
    this.currentcooldown = 0;
  }
  activate() {
    this.currentcooldown = this.cooldown;
    this.active = true;
    character.fading = true;
    character.fadingIn = false;
    this.decay();
  }
  update() {
    // uh idk?
    if (character.fadingIn && this.active) {
      character.position.x = enemyEntities[0].x + 120;
      character.position.y = enemyEntities[0].y;
      this.active = false;
    }
  }
  decay() {
    setTimeout(() => {
      if (this.currentcooldown > 0) {
        this.currentcooldown -= 0.25;
        this.decay();
      }
    }, 250);
  }
}
class ShadowForm extends Ability {
  constructor() {
    super();
    this.active = false;
    this.toggle = true;
    this.cooldown = 6;
    this.currentcooldown = 0;
  }
  activate() {
    this.currentcooldown = this.cooldown;
    this.active = !this.active;
    character.inShadow = this.active;
    character.transitioning = true;
    if (character.inShadow) {
      this.shadowDecay();
      character.speed *= 1.75;
    } else {
      character.speed /= 1.75;
    }
  }
  update() {}
  shadowDecay() {
    setTimeout(() => {
      character.shadow -= 0.25;
      if (this.active) {
        this.shadowDecay();
      }
    }, 250);
  }
}
class Blink extends Ability {
  constructor() {
    super();
    this.active = false;
    this.toggle = true;
    this.cooldown = 4;
    this.currentcooldown = 0;
  }
  activate() {
    console.log("ACTIVATING");
    this.currentcooldown = this.cooldown;
    this.active = true;
    character.fading = true;
    character.fadingIn = false;
    this.decay();
  }
  update() {
    // uh idk?
    if (character.fadingIn && this.active) {
      let range = 375 * scaleX;
      let distance = dist(
        mouseX,
        mouseY,
        character.position.x,
        character.position.y
      );
      if (distance < range) {
        character.position.x = mouseX;
        character.position.y = mouseY;
      } else {
        let delta = createVector(mouseX, mouseY);
        delta.sub(character.position.x, character.position.y);
        delta.normalize();
        delta.mult(range);
        character.position.add(delta);
        this.active = false;
      }
    }
  }
  decay() {
    setTimeout(() => {
      if (this.currentcooldown > 0) {
        this.currentcooldown -= 0.25;
        this.decay();
      }
    }, 250);
  }
}
class SlashDash extends Ability {
  constructor() {
    super();
    this.active = false;
    this.toggle = true;
    this.size;
    this.dmg = 10;
    this.cooldown = 5;
    this.currentcooldown = 0;
    this.dashing = false;
    this.castLocation;
    this.needsToReturn = false;
    this.velocity;
    this.damageProjectile;
    this.dashLocation;
    this.isDone = false;
    this.setZero = false;
  }
  activate(x, y) {
    if (!this.needsToReturn) {
      this.active = true;
      this.castLocation = createVector(x, y);
      this.dashing = true;
      this.needsToReturn = true;
      this.dashLocation = createVector(mouseX, mouseY);
      this.damageProjectile = new InvisbleAttack(3);
      setTimeout(() => {
        this.setZero = true;
        this.damageProjectile.die();
      }, 100);
    } else {
      this.currentcooldown = this.cooldown;
      this.needsToReturn = false;
      this.dashing = true;
      this.damageProjectile = new InvisbleAttack(10);
      setTimeout(() => {
        this.setZero = true;
        this.damageProjectile.die();
        this.isDone = true;
      }, 100);
      this.decay();
    }
    console.log(this.dashing);
  }
  update() {
    // uh idk?
    if (this.active) {
      ellipse(this.castLocation.x, this.castLocation.y, 30, 30);
      this.damageProjectile.update();
    }
  }
  getVelocity() {
    // going out
    if (this.needsToReturn) {
      let deltaX = this.dashLocation.x - character.position.x;
      let deltaY = this.dashLocation.y - character.position.y;
      let forceVector = createVector(deltaX, deltaY);
      forceVector.normalize();
      forceVector.mult(100);
      if (this.setZero) {
        forceVector.mult(0);
        this.dashing = false;
        this.setZero = false;
      }
      this.velocity = forceVector;
    } else {
      // returning
      let deltaX = this.castLocation.x - character.position.x;
      let deltaY = this.castLocation.y - character.position.y;
      let forceVector = createVector(deltaX, deltaY);
      forceVector.normalize();
      forceVector.mult(100);
      if (this.setZero) {
        forceVector.mult(0);
        this.dashing = false;
        this.active = false;
        this.setZero = false;
      }
      this.velocity = forceVector;
    }
    console.log(this.dashing);
    return this.velocity;
  }
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.25;
      if (this.currentcooldown <= 0) {
        console.log("off cooldown!");
      } else {
        this.decay();
      }
    }, 250);
  }
}
class Slam extends Ability {
  constructor() {
    super();
    this.active = false;
    this.toggle = false;
    this.dmg = 10;
    this.cooldown = 4;
    this.currentcooldown = 0;
    this.dashing = false;
    this.velocity;
    this.damageProjectiles = [];
    this.reachedBottom = false;
    this.slamming;
    this.duration = 2;
  }
  activate() {
    this.active = true;
    this.currentcooldown = this.cooldown;
    this.slamming = true;
    this.decay();
  }
  update() {
    if (this.duration <= 0) {
      this.active = false;
      this.duration = 0;
    }
    if (this.reachedBottom && this.slamming) {
      this.slamming = false;
      for (let i = -1; i <= 1; i += 2) {
        this.damageProjectiles.push(
          new WindAttack(
            character.position.x,
            character.position.y,
            createVector(50 * i, 0),
            7
          )
        );
        this.damageProjectiles[
          this.damageProjectiles.length - 1
        ].checkPlatforms = false;
        if (character.powered) {
          this.damageProjectiles[this.damageProjectiles.length - 1].powerup();
        }
      }
    }
    this.damageProjectiles.forEach((projectile) => {
      projectile.update();
      if (!projectile.active) {
        this.active = false;
        this.damageProjectiles.splice(
          this.damageProjectiles.indexOf(projectile),
          1
        );
      }
    });
  }
  getVelocity() {
    let vel = createVector(0, 85 * scaleY);
    return vel;
  }
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.25;
      this.duration -= 0.25;
      if (this.currentcooldown <= 0) {
        console.log("off cooldown!");
      } else {
        this.decay();
      }
    }, 250);
  }
}
class WindBlessing extends Ability {
  constructor() {
    super();
    this.active = false;
    this.toggle = false;
    this.dmg = 10;
    this.cooldown = 5;
    this.currentcooldown = 0;
    this.dashing = false;
    this.velocity;
    this.damageProjectiles = [];
    this.reachedBottom = false;
    this.slamming;
    this.duration = 1.5;

    this.preSpeed;
    this.preJump;
  }
  activate() {
    this.active = true;
    this.currentcooldown = this.cooldown;
    this.decay();
    character.powered = true;
    this.preSpeed = character.speed;
    this.preJump = character.jumpPower;
    character.speed *= 2;
    character.jumpPower *= 1.2;
    character.mass = 1;
  }
  update() {
    if (this.duration > 0) {
    } else {
      this.active = false;
      character.speed = this.preSpeed;
      character.jumpPower = this.preJump;
      character.mass = 1;
      character.powered = false;
    }
  }
}
class SkeletonSummon extends Ability {
  constructor() {
    super();
    this.active = false;
    this.cooldown = 1; // 7
    this.currentcooldown = 0;
    this.skeleton;
  }
  activate(x, y) {
    this.active = true;
    let xcord = random(0, screen.width);
    let ycord = random(300, screen.height);
    this.skeleton = new Skeleton(xcord, ycord);
    this.currentcooldown = this.cooldown;
    console.log("ACTIVATING");
    entities.push(this.skeleton);
    this.decay();
  }
  update() {
    if (this.skeleton.alive == false) {
      this.active = false;
    }
  }
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.25;
      if (this.currentcooldown <= 0) {
        console.log("off cooldown!");
      } else {
        this.decay();
      }
    }, 250);
  }
}
class GraveRevival extends Ability {
  constructor() {
    super();
    this.active = false;
    this.cooldown = 1; // 7
    this.currentcooldown = 0;
  }
  activate() {
    this.active = true;
    this.currentcooldown = this.cooldown;
    for (let i = 0; i < graves.length; i++) {
      let x = graves[i].position.x;
      let y = graves[i].position.y;
      if (graves[i].entity == "Skeleton") {
        let skeleton = new Skeleton(x, y);
        skeleton.hp = 10;
        skeleton.damage = 1;
        skeleton.graveDropChance = 0;
        entities.push(skeleton);
      }
      entities.splice(entities.indexOf(graves[i]), 1);
      console.log(entities);
      console.log("After Splice");
      graves.splice(i, 1);
    }
    console.log("ACTIVATING");
    this.decay();
  }
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.25;
      if (this.currentcooldown <= 0) {
        console.log("off cooldown!");
      } else {
        this.decay();
      }
    }, 250);
  }
}
class Impulse extends Ability {
  constructor() {
    super();
    this.active = false;
    this.toggle = true;
    this.fireball;
    this.dir = createVector(0, 0);
    this.size;
    this.dmg = 10;
    this.cooldown = 10;
    this.currentcooldown = 0;
  }
  activate(x, y, size) {
    this.x = x;
    this.y = y;
    this.active = true;
    this.size = size;
    this.lifesteal = new LifeSteal(x, y, this.size.x / 2, this.size, this.dmg);
    this.currentcooldown = this.cooldown;
    this.decay();
  }
  update() {
    if (this.active) {
      console.log("updating ability 3");
      this.lifesteal.update();
      console.log(this.lifesteal.radius);
      if (this.lifesteal.radius < 20) {
        this.disable();
      }
    }
  }
  disable() {
    projectiles.splice(this.lifesteal, 1);
    this.active = false;
  }
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.25;
      if (this.currentcooldown <= 0) {
        console.log("off cooldown!");
      } else {
        this.decay();
      }
    }, 250);
  }
}
class VampireSwarm extends Ability {
  constructor() {
    super();
    this.active = false;
    this.cooldown = 1; // 7
    this.currentcooldown = 0;
    this.bats = [];
  }
  activate(x, y) {
    this.active = true;
    this.currentcooldown = this.cooldown;
    console.log("ACTIVATING");
    this.decay();
    this.spawn();
  }
  update() {
    // if(this.skeleton.alive == false){
    //     this.active = false;
    // }
  }
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.25;
      if (this.currentcooldown <= 0) {
        console.log("off cooldown!");
      } else {
        this.decay();
      }
    }, 250);
  }
  spawn() {
    setTimeout(() => {
      if (this.bats.length < 5) {
        console.log("Spawning Bat");
        this.bats[this.bats.length] = new VampireBat(mouseX, mouseY);
        entities.push(this.bats[this.bats.length - 1]);
        this.spawn();
      }
    }, 1000);
  }
}
class ArrowShoot extends Ability {
  constructor() {
    super();
    this.active = false;
    this.cooldown = 0.5;
    this.currentcooldown = 0;
  }
  activate(x, y) {
    this.active = true;
    let deltaX = (mouseX - x) / 1;
    let deltaY = (y - mouseY) / -1;
    let dirVector = createVector(deltaX, deltaY);
    dirVector.normalize();
    dirVector.x *= 90;
    dirVector.y *= 90;
    this.arrow = new Arrow(x, y, dirVector, 7.5);
    this.arrow.decay();
    this.currentcooldown = this.cooldown;
    setTimeout(() => {
      this.currentcooldown -= 0.5;
      console.log("COOLDOWN IS BACK BABEY");
    }, 500);
  }
  update() {
    this.arrow.update();
    this.active = this.arrow.active;
  }
}
class MultiShot extends Ability {
  constructor() {
    super();
    this.active = false;
    this.cooldown = 5;
    this.currentcooldown = 0;
    this.arrows = [];
  }
  activate(x, y) {
    this.active = true;
    let deltaX = (mouseX - x) / 1;
    let deltaY = (y - mouseY) / -1;
    // tan = opposite / adjacent
    for (let i = 0; i < 3; i++) {
      let dirVector = createVector(deltaX, deltaY);
      dirVector.normalize();
      if (Math.abs(dirVector.y) > Math.abs(dirVector.x)) {
        dirVector.x *= 30 + i * 80;
        dirVector.y *= 40;
      } else {
        dirVector.x *= 60;
        dirVector.y *= 10 + i * 50;
      }
      this.arrows[this.arrows.length] = new Arrow(x, y, dirVector, 7.5);
      this.arrows[this.arrows.length - 1].decay();
    }
    this.currentcooldown = this.cooldown;
    this.decay();
  }
  update() {
    this.active = false;
    for (let i = 0; i < this.arrows.length; i++) {
      this.arrows[i].update();
      if (this.arrows[i].active) {
        this.active = true;
      }
    }
  }
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.5;
      console.log("COOLDOWN IS BACK BABEY");
      if (this.currentcooldown > 0) {
        this.decay();
      }
    }, 500);
  }
}
class Grapple extends Ability {
  constructor() {
    super();
    this.active = false;
    this.attached = false;
    this.cooldown = 5;
    this.currentcooldown = 0;
    this.duration = 2;
    this.dir;
    this.hook;
  }
  activate(x, y) {
    this.active = true;
    let deltaX = (mouseX - x) / 10;
    let deltaY = (y - mouseY) / -10;
    this.dir = createVector(deltaX, deltaY);
    this.currentcooldown = this.cooldown;
    this.dir.normalize();
    this.hook = new GrappleHook(x, y, this.dir);
  }
  update() {
    this.hook.update();
    this.attached = this.hook.attached;
  }
  getForce() {
    return this.hook.getForce();
  }
  decay() {
    setTimeout(() => {
      this.currentcooldown -= 0.25;
      this.duration -= 0.25;
      if (this.duration <= 0) {
        this.active = false;
        this.hook.kill();
      }
      if (this.currentcooldown <= 0) {
        this.currentcooldown = 0;
      } else {
        this.decay();
      }
    }, 250);
  }
}
class ArtemisBow extends Ability {
  constructor() {
    super();
    this.active = false;
    this.cooldown = 10;
    this.currentcooldown = 0;
    this.duration = 3;

    this.arrows = [];

    this.wait = 150;
    this.canShoot = true;
  }
  activate() {
    this.currentcooldown = this.cooldown;
    this.active = true;
  }
  update() {
    for (let i = 0; i < this.arrows.length; i++) {
      this.arrows[i].update();
      if (!this.arrows[i].active) {
        this.arrows.splice(i, 1);
      }
    }
  }
  shoot(x, y) {
    if (this.canShoot) {
      let deltaX = (mouseX - x) / 1;
      let deltaY = (y - mouseY) / -1;
      let dirVector = createVector(deltaX, deltaY);
      dirVector.normalize();
      dirVector.x *= 150;
      dirVector.y *= 150;
      this.arrows[this.arrows.length] = new ArtemisArrow(x, y, dirVector, 3);
      this.arrows[this.arrows.length - 1].decay();
      this.canShoot = false;
      setTimeout(() => {
        this.canShoot = true;
      }, this.wait);
    }
  }
  decay() {
    setTimeout(() => {
      if (this.duration > 0) {
        this.duration -= 0.25;
        this.decay();
      } else if (this.currentcooldown > 0) {
        this.currentcooldown -= 0.25;
        this.decay();
      } else {
      }
    }, 250);
  }
}
class FireBurst extends Ability {
  constructor() {
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
  activate(x, y) {
    this.active = true;
    let randomFactor = 10;
    let deltaX = (mouseX - x) / 10;
    let deltaY = (y - mouseY) / -10;
    let dirVector = createVector(deltaX, deltaY);
    dirVector.normalize();
    for (let i = 0; i < this.fireBallCount; i++) {
      let vel = createVector(
        random(
          dirVector.x * 30 - randomFactor,
          dirVector.x * 30 + randomFactor
        ),
        random(dirVector.y * 30 - randomFactor, dirVector.y * 30 + randomFactor)
      );

      let radius = createVector(
        this.fireBallRadius * 2,
        this.fireBallRadius * 2
      );
      this.fireBalls[this.fireBalls.length] = new FireBall(
        x,
        y,
        vel,
        this.fireBallRadius,
        radius,
        1
      );
    }
  }
  update() {
    for (let i = 0; i < this.fireBalls.length; i++) {
      let current = this.fireBalls[i];
      current.update();
      if (current.finished()) {
        this.fireBalls.splice(i, 1);
        projectiles.splice(projectiles.indexOf(this.fireBalls[i]));
      }
    }
    if (this.fireBalls.length == 0) {
      this.active = false;
    }
  }
}
class HotStreak extends Ability {
  constructor() {
    super();
    this.active = false;
    this.burn = true;
    this.duration = 2;
    this.speed = 50;
    this.toggle = true;
    this.direction;

    this.fires = [];
  }
  activate(dirBlocked, x, y) {
    this.active = !this.active;
    if (dirBlocked != "only negative Y") {
      this.active = false;
    } else {
      this.direction = mouseX > x ? 1 : -1;
      this.decay();
      // this.fires[this.fires.length] = new Fire(x,y,2,0.5);
      // this.fires[this.fires.legth-1].decay();
    }
  }
  update(x, y) {
    if (this.active) {
      if (this.duration > 1.75) {
        character.velocity.x = this.speed * this.direction;
      } else {
        character.freeMove = true;
      }
      if (random() > 0.7 && this.duration > 1) {
        this.fires[this.fires.length] = new Fire(x, y, 3, 0.5);
        this.fires[this.fires.length - 1].decay();
      }
      if (this.fires.length == 0 && this.duration < 1) {
        this.active = false;
      }
    }
    for (let i = 0; i < this.fires.length; i++) {
      this.fires[i].update();
      if (!this.fires[i].alive) {
        this.fires.splice(i, 1);
      }
    }
  }
  decay() {
    setTimeout(() => {
      if (this.duration > 0) {
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
    }, 250);
  }
}
class FireTrap {
  constructor(x, y, duration, dmg) {
    this.position = createVector(x, y);
    this.duration = duration;
    this.dmg = dmg;
    this.fireBalls = [];
    this.activated = false;
    this.maxFireBalls = 10;
    this.active = false;
  }
  place() {
    this.decay();
    this.active = true;
  }
  update() {
    if (this.activated) {
      for (let i = 0; i < this.fireBalls.length; i++) {
        let current = this.fireBalls[i];
        current.update();
        if (current.finished()) {
          this.fireBalls.splice(i, 1);
          projectiles.splice(projectiles.indexOf(this.fireBalls[i]));
        }
      }
      if (this.fireBalls.length == 0) {
        this.active = false;
      }
    } else {
      this.show();
      if (this.duration <= 0) {
        this.activate();
      }
    }
  }
  activate() {
    if (!this.activated) {
      this.activated = true;
      let size = createVector(50, 50);
      for (let i = 0; i < this.maxFireBalls; i++) {
        let dir = createVector(random(-30, 30), random(-30, 30));
        this.fireBalls[this.fireBalls.length] = new FireBall(
          this.position.x,
          this.position.y,
          dir,
          25,
          size,
          this.dmg
        );
      }
    }
  }
  show() {
    fill(255, 50, 50);
    rect(this.position.x, this.position.y, screen.width * 0.05, 20);
  }
  decay() {
    setTimeout(() => {
      if (this.duration > 0) {
        this.duration -= 0.25;
        this.decay();
      } else {
        this.alive = false;
      }
    }, 250);
  }
}
class ShieldOfFire extends Ability {
  constructor() {
    super();
    this.active = false;
    this.toggle = true;
    this.fireball;
    this.x;
    this.y;
    this.dir = createVector(0, 0);
    this.size;
    this.dmg = 1;
  }
  activate(x, y, size) {
    this.x = x;
    this.y = y;
    this.active = !this.active;
    this.size = size;
    if (this.active) {
      this.fireball = new FireBall(
        this.x,
        this.y,
        this.dir,
        this.size.x / 2,
        this.size,
        this.dmg
      );
      this.doTheDamage();
    } else {
      this.disable();
    }
  }
  update() {
    if (this.active) {
      console.log("updating ability 4");
      this.fireball.position.x = character.position.x;
      this.fireball.position.y = character.position.y;
      this.fireball.alpha = 200;
      this.fireball.show();
    } else {
      this.disable();
    }
  }
  disable() {
    projectiles.splice(this.fireball, 1);
    this.active = false;
  }
  doTheDamage() {
    setTimeout(() => {
      projectiles.splice(this.fireball, 1);
      this.fireball = new FireBall(
        this.x,
        this.y,
        this.dir,
        this.size.x / 2,
        this.size,
        this.dmg
      );
      this.fireball.update();
      if (this.active) {
        this.doTheDamage();
      }
    }, 100);
  }
}
