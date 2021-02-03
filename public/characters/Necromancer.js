class Necromancer extends Character {
	constructor() {
		super();
		this.name = "Necromancer";
		this.buttonIndex = 1;
		this.mass = 1;
		this.basehp = 100; //100
		this.basespeed = 7;
		this.basepower = 10;
		this.baseresistance = 2;
		this.spriteIndex = 2;
		this.sprite = characterSprites[this.spriteIndex];
		this.ghost = false;
		this.bodyType = "square";
		this.weaponSprite = 2;
		this.weaponSpriteSize = 160;
		this.basicAttackFrameCount = 8;
		this.basicAttacking = false;
		this.basicAnimation = weaponSpritesAnimations[this.weaponSprite];

		this.summonSkeleAnimation = weaponSpritesAnimations[basicAttacks + 3];
		this.reviveGravesAnimation = weaponSpritesAnimations[basicAttacks + 4];
		this.impulseAnimation = weaponSpritesAnimations[basicAttacks + 5];
		this.summonBatsAnimation = weaponSpritesAnimations[basicAttacks + 6];

		this.skeletonSummon = new SkeletonSummon();
		this.graveRevival = new GraveRevival();
		this.impulse = new Impulse();
		this.summonBats = new VampireSwarm();

		this.currentAnimation = 0;
	}
	getSendableData() {
		let flipWeapon = this.position.x > mouseX ? true : false;
		let weaponNow = this.weaponSprite;
		let data = {
			x: this.position.x,
			opacity: this.opacity,
			y: this.position.y,
			name: this.name,
			sprite: this.spriteIndex,
			scale: scaleX,
			weaponSprite: weaponNow,
			animationFrame: this.weaponAnimationFrame,
			weaponPosX: this.weaponPos.x,
			weaponPosY: this.weaponPos.y,
			flipWeapon: flipWeapon,
			weaponRotation: this.weaponRotation,
			weaponSpriteSize: this.weaponSpriteSize,
		};
		return data;
	}
	show() {
		this.drawName();
		tint(this.opacity, 255);
		image(
			this.sprite,
			this.position.x,
			this.position.y,
			128 * scaleX,
			128 * scaleY,
		);

		if (this.currentAnimation == 0) {
			this.drawWeapon(this.basicAnimation);
		} else {
			switch (this.currentAnimation) {
				case 1:
					this.drawWeapon(this.summonSkeleAnimation);
					break;
				case 2:
					this.drawWeapon(this.reviveGravesAnimation);
					break;
				case 3:
					this.drawWeapon(this.impulseAnimation);
					break;
				case 4:
					this.drawWeapon(this.summonBatsAnimation);
					break;
			}
			if (frameCount % 2 == 0) {
				this.weaponAnimationFrame++;
			}
			if (this.weaponAnimationFrame == 7) {
				this.currentAnimation = 0;
				this.weaponAnimationFrame = 0;
			}
		}

		this.basicAttackHandle();
		this.updateAbilityThree();
		tint(255, 255);
	}
	sendCharacterData() {
		socket.emit("enemy-char-data", {
			percentHealth: this.hp / this.maxHealth,
			room: roomId,
		});
	}
	executeAbilityOne() {
		if (this.skeletonSummon.currentcooldown <= 0 && !this.basicAttacking) {
			this.currentAnimation = 1;
			this.skeletonSummon.active = true;
			this.skeletonSummon.activate(mouseX, mouseY);
		}
	}
	executeAbilityTwo() {
		if (this.graveRevival.currentcooldown <= 0 && !this.basicAttacking) {
			this.currentAnimation = 2;
			this.graveRevival.active = true;
			this.graveRevival.activate();
		}
	}
	executeAbilityThree() {
		if (this.impulse.currentcooldown <= 0 && !this.basicAttacking) {
			this.currentAnimation = 3;
			this.impulse.active = true;
			this.impulse.activate(
				this.position.x,
				this.position.y,
				createVector(this.size.x * 5, this.size.y * 5),
			);
		}
	}
	updateAbilityThree() {
		if (this.impulse.active) {
			this.impulse.update();
		}
	}
	executeAbilityFour() {
		if (this.summonBats.currentcooldown <= 0 && !this.basicAttacking) {
			this.currentAnimation = 4;
			this.summonBats.active = true;
			this.summonBats.activate();
		}
	}
}
