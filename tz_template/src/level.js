//var level
//стартовый номер уровня
//, n_level = 1
var rubber
//, score
//, shot_breaks
//, blocks = []
//, big_blocks = 0;
//инициализация стартовых параметров уровня
var level = {

    //номер уровня
    __number: 1,

    //счёт уровня
    __score: 0,

    //ледяные блоки
    __blocks: [],

    //количество больших блоков
    __big_blocks: 0,

    //количество очков для 1/2/3 звёзд за уровень
    __star_goals: [],

    //инициализация уровня
    initLevel(goals) {
        __score = 0;
        controller.__shots = 0;
        return scene
            .__addChildBox('level' + this.__number)
            .__setAliasesData(controller)
    }
}

function initLevel() {

    score = 0;
    // добавляем первый уровень на сцену
    level = scene
        .__addChildBox('level_' + n_level)
        .__setAliasesData({

            rubber(node) {
                rubber = node;
            },

            userInputArea: {
                __dragDist: 1,
                __drag(x, y, dx, dy) {
                    // натягиваем резинку
                    var wp = this.__worldPosition.__clone()
                        , vmouse = new Vector2(x, y)
                        , dmouse = vmouse.sub(wp)
                        , strength = dmouse.__length()
                        , angle = clamp((dmouse.__angle() - PI) * RAD2DEG, -75, 30);

                    this.__dmouse = new Vector2(strength * Math.cos(angle * DEG2RAD), strength * Math.sin(angle * DEG2RAD));
                    rubber.__parent.__rotate = -angle;
                    rubber.__width = strength;
                },
                __dragStart() {
                    rubber.__killAllAnimations();
                    shot_breaks = 0;
                },
                __dragEnd() {

                    playSound('punch');

                    // отпускаем резинку
                    rubber.__anim({
                        __width: 10
                    }, 0.4, 0, easeElasticO);
                    var wp = this.__worldPosition
                        , bullet = level.__addChildBox({
                            __effect: 'tail',
                            __img: 'circle1',
                            __size: [28, 28],
                            __ofs: [wp.x, wp.y, -20],
                            __physics: {
                                __isStatic: false,
                                __friction: 130,
                                __frictionAir: 0.2,
                                __frictionStatic: 500,
                                __restitution: 10,
                                __density: 4,
                                __bodyType: 1
                            }
                        }).update()
                        , velocity = this.__dmouse.__multiplyScalar(0.2);

                    if (bullet.__ph_body) {
                        ph_Body.setVelocity(bullet.__ph_body, velocity);
                    }

                    // пуля исчезает через 2 сек либо после столкновения
                    _setTimeout(() => {
                        bullet.__removeFromParent();
                    }, 2);

                    BUS.__addEventListener(
                        __ON_BULLET_COLLISION, e => {
                            if (bullet) {
                                var body = bullet.__ph_body;
                                if (body) {
                                    var dmg = floor(velocity.__length());
                                    score += ((shot_breaks) ? 1 : -1) * dmg;
                                    BUS.__post(__ON_SCORE_CHANGED);
                                }
                                bullet.__removeFromParent();
                            }
                        }
                    );

                }
            }
        });


    _setTimeout(a => {
        level.update(1);
        initBlocksCollision();
    }, 0.01);
}

function reloadLevel() {
    if (n_level < 4) {
        closeWindow('win')
        level.__clearChildNodes();
        initLevel();
    }
}

// настраиваем коллизии для отработки повреждения блоков
function initBlocksCollision() {
    ph_Events.on(ph_Engine, 'collisionStart', (event) => {
        var pairs = event.pairs, i, pair, bodyA, bodyB, speed;
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            bodyA = pair.bodyA;
            bodyB = pair.bodyB;
            speed = relImpactSpeed(bodyA, bodyB);

            collisionBodyHandler(bodyA, speed);
            collisionBodyHandler(bodyB, speed);
        }
    });
    // проходим по уровню и инициализируем блоки
    level.__scene.__traverse(initBlocks);
}

function addBreakBlock(x, y, velocity) {
    var breack_block = level.__addChildBox({
        __img: 'break_' + randomInt(1, 9),
        __ofs: [x, y, -20],
        __rotate: randomInt(0, 360),
        __physics: {
            __isStatic: false,
            __friction: 10,
            __frictionAir: 1,
            __frictionStatic: 50,
            __restitution: 0,
            __density: 1,
            __bodyType: 1
        }
    });
    looperPost(a => {
        if (breack_block.__ph_body) {
            var v = new Vector2(velocity.x + randomFloat(-10, 10), velocity.y + randomFloat(-8, 3));
            ph_Body.setVelocity(breack_block.__ph_body, v);
            _setTimeout(() => {
                if (breack_block.__ph_body) {
                    initCollision(breack_block.__ph_body, breack_block, BREAK_BLOCK_HP, floor(v.__length()));
                    _setTimeout(() => {
                        if (!breack_block.__destructed) {
                            removeBlock(breack_block);
                        }
                    }, randomFloat(5, 10));
                }
            }, 1);
        }
    });
}

function awakeBlocks() {

    $each(blocks, b => {
        b.__ph_awake();
    });
}

function removeBlock(block) {
    removeFromArray(block, blocks);
    var size = block.__size, v = block.__ph_body.velocity;

    block.__removeFromParent();

    looperPostOne(awakeBlocks);


    if (block.__needBreaks) {

        breakSound(1)

        // done: учитывается вращение блока
        var step = 50,
            bx = block.__x - size.x / 2,
            by = block.__y - size.y / 2,
            bsin = Math.sin(block.__rotate * DEG2RAD),
            bcos = Math.cos(block.__rotate * DEG2RAD);

        for (var x = 0; x < size.x; x += step) {
            for (var y = 0; y < size.y; y += step) {
                var spawnx = (bx + x) * bcos + (by + y) * bsin,
                    spawny = (bx + x) * bsin + (by + y) * bcos;
                addBreakBlock(spawnx, spawny, v);
            }
        }

        big_blocks--;
        if (big_blocks == 0) {
            _setTimeout(() => {
                show_win();
            }, 1);
        }
    } else {
        breakSound(0.5);
    }

}

function breakSound(chance) {
    if (random() > (1 - chance) && !windowManager.__hasOpenedWindow()) {
        playSound('break_' + randomInt(1, 4), 0, 0, 0.5);
    }
}

function initCollision(body, node, hp, dmgMax) {
    blocks.push(node);
    body.__hp = hp;
    body.__onCollision = (speed) => {
        var dmg = calculateDamage(speed, dmgMax);
        shot_breaks++;
        if (dmg && body.__hp) {
            // consoleLog('damage', dmg);
            body.__hp = mmax(0, body.__hp - dmg);
            if (!body.__hp && !windowManager.__hasOpenedWindow()) {
                body.__onCollision = 0;
                looperPost(a => {
                    removeBlock(node);
                    score += dmg;
                    BUS.__post(__ON_SCORE_CHANGED);
                });
            }
        }
    }
}

//остаётся в этом блоке
BUS.__addEventListener(
    __ON_SCORE_CHANGED, e => {
        if (level.__scene) {
            level.__scene.__setAliasesData({
                score_text: {
                    __text: level.__score
                }
            });
        }
    }
);