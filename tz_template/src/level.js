//var level
//стартовый номер уровня
//, n_level = 1
//var rubber
//, score
//, shot_breaks
//, blocks = []
//, big_blocks = 0;
//инициализация стартовых параметров уровня
var levelData = {

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
    __initLevel(goals) {
        this.__score = 0;
        controller.__shots = 0;
        return scene
            .__addChildBox('level' + this.__number)
            .__setAliasesData(controller)
    },

    __changeScore(dscore) {
        this.__score += dscore;
        BUS.__post(__ON_SCORE_CHANGED);
    },

    __addBlock(block) {
        if (block.__needBreaks) this.__big_blocks++;
        else {

        }
        this.__blocks.push(block);
    },

    __removeBlock(block) {
        removeFromArray(block, this.__blocks);
        block.__node.__removeFromParent();
        if (block.__needBreaks) this.__big_blocks--;

        looperPostOne(awakeBlocks);

    },

    __checkGoal() {
        if (this.__big_blocks == 0) {
            setTimeout(() => {
                show_win();
            }, 1)
        }
    }
}

function awakeBlocks() {

    $each(blocks, b => {
        b.__ph_awake();
    });
}

function initBlocks(node) {
    var body = node.__ph_body;
    if (body && !body.isStatic) {
        levelData.__addBlock(new Block(node, 1, BIG_BLOCK_HP, 100))
    }
}
/*
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
}*/

/*function reloadLevel() {
    if (n_level < 4) {
        closeWindow('win')
        level.__clearChildNodes();
        initLevel();
    }
}*/

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