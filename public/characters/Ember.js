class Ember extends Character {
	constructor() {
		super();
		this.name = "Ember";
		this.buttonIndex = 0;
		this.fire = 0;
		this.mass = 1;
		this.basehp = 125;
		this.basespeed = 8;
		this.basepower = 20;
		this.baseresistance = 2;
		this.spriteIndex = 1;
		this.sprite = characterSprites[this.spriteIndex];
		this.ghost = false;
		this.weaponSprite = 0;
		this.hasWeapon = true;
		this.basicAttackFrameCount = 8;
		this.basicAttacking = false;
		this.weaponSpriteSize = 200;
		this.basicAnimation = weaponSpritesAnimations[this.weaponSprite];
		this.bodyType = "square";
		this.maxFire = 100;
		this.executePassive();
		this.fireburst = new FireBurst();
		this.hotstreak = new HotStreak();
		this.firetrap = new FireTrap();
		this.shieloffire = new ShieldOfFire();
		this.firetrapDuration = 7;
	}
	show() {
		this.updateAbilityFour();
		this.drawName();

		tint(this.opacity, 255);
		fill(52);
		rect(
			this.position.x - this.size.x / 2,
			this.position.y - this.size.y * 1.2,
			this.maxFire,
			20,
		);
		fill(255, 30, 30);
		rect(
			this.position.x - this.size.x / 2,
			this.position.y - this.size.y * 1.2,
			this.fire,
			20,
		);
		image(
			this.sprite,
			this.position.x,
			this.position.y,
			128 * scaleX,
			128 * scaleY,
		);
		tint(255, 255);

		this.drawWeapon(this.basicAnimation);
		this.basicAttackHandle();

		this.updateAbilityOne();
		this.updateAbilityTwo();
		this.updateAbilityThree();
	}
	sendCharacterData() {
		let health = this.hp / this.maxHealth;
		socket.emit("enemy-char-data", { percentHealth: health, room: roomId });
	}
	executeAbilityOne() {
		if (!this.fireburst.active && this.fire > 20) {
			this.fire -= 20;
			this.fireburst = new FireBurst();
			this.fireburst.activate(this.position.x, this.position.y);
		}
	}
	updateAbilityOne() {
		if (this.fireburst.active) {
			this.fireburst.update();
		}
	}
	executeAbilityTwo() {
		if (
			!this.hotstreak.active &&
			this.fire > 30 &&
			this.dirBlocked == "only negative Y"
		) {
			this.fire -= 30;
			this.hotstreak = new HotStreak();
			this.hotstreak.activate(
				this.dirBlocked,
				this.position.x,
				this.position.y + this.size.y / 2,
			);
			this.freeMove = false;
		} else {
			this.freeMove = true;
		}
	}
	updateAbilityTwo() {
		// if(this.hotstreak.active){
		this.hotstreak.update(
			this.position.x,
			this.position.y + this.size.y / 2,
		);
		// }
	}
	executeAbilityThree() {
		if (!this.firetrap.active && this.fire > 40) {
			this.fire -= 40;
			this.firetrap = new FireTrap(
				this.position.x - this.size.x / 2,
				this.position.y + this.size.y / 4,
				7,
				5,
			);
			this.firetrap.place();
		} else if (
			this.firetrap.active &&
			!this.firetrap.activated &&
			this.firetrap.duration < this.firetrapDuration - 1
		) {
			this.firetrap.activate();
		}
	}
	updateAbilityThree() {
		if (this.firetrap.active) {
			this.firetrap.update();
		}
	}
	executeAbilityFour() {
		if (this.fire > 5) {
			let sizeX = this.size.x * 3;
			let sizeY = this.size.y * 3;
			let totalSize = createVector(sizeX, sizeY);
			this.shieloffire.activate(
				this.position.x,
				this.position.y,
				totalSize,
			);
		}
	}
	updateAbilityFour() {
		if (this.fire > 5) {
			this.shieloffire.update();
			if (this.shieloffire.active) {
				this.fire -= 0.5;
			}
		} else {
			this.shieloffire.disable();
		}
	}
	executePassive() {
		setTimeout(() => {
			this.fire++;
			this.fire = constrain(this.fire, 0, this.maxFire);
			this.executePassive();
		}, 200);
	}
}
