
// прототип геймплея

options.__soundDisabled = 0;

var __ON_SCORE_CHANGED = '__ON_SCORE_CHANGED' // расположить константы в алфавитном порядке
    , __ON_BLOCK_NOT_BREAK = '__ON_BLOCK_NOT_BREAK'
    , __ON_BULLET_OUT = '__ON_BULLET_OUT'
    , __ON_CONTINUE = '__ON_CONTINUE'
    , __ON_RETRY = '__ON_RETRY'
    , BIG_BLOCK_HP = 100
    , BREAK_BLOCK_HP = 50
    , level;

function looperPostOne(f, delay) {
    if (f.__posted > 0) {
        f.__posted = _clearTimeout(f.__posted);
    }

    if (!f.__posted) {
        if (delay) {
            f.__posted = _setTimeout(() => {
                f.__posted = 0;
                f();
            }, delay);
        } else {
            f.__posted = -1;
            looperPost(() => {
                f.__posted = 0;
                f();
            });
        };
    }
}

function relImpactSpeed(bodyA, bodyB) {
    var va = bodyA.velocity, vb = bodyB.velocity
        , v = new Vector2(va.x - vb.x, va.y - vb.y);
    return v.__length();
}


function show_win() {

    playSound('win');

    // todo: посчитать очки игрока и выдать звезды
    showWindow('win', wnd => {
        wnd.__setAliasesData({

            button_continue: {
                __onTap() {
                    BUS.__post(__ON_CONTINUE);
                },
                __onTapHighlight: 1
            },

            button_retry: {
                __onTap() {
                    BUS.__post(__ON_RETRY);
                },
                __onTapHighlight: 1
            }

        })
    })

}

function calculateDamage(speed, maxBreakDmg) {
    return floor(clamp((speed - 1) * (speed - 2), 0, maxBreakDmg));
}

function collisionBodyHandler(body, speed) {
    if (body) {
        if (body.__onCollision) body.__onCollision(speed);
        BUS.__post(__ON_BULLET_OUT);
    }
}

/*function initBlocks(node) {
    var body = node.__ph_body;
    if (body && !body.isStatic) { // this is block
        node.__needBreaks = 1;
        big_blocks++;
        initCollision(body, node, BIG_BLOCK_HP, 100);
    }
}*/

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
}

//определение параметров уровня
function startLevel() {
    level = levelData.__initLevel();
    setTimeout(a => {
        level.update(1);
        initBlocksCollision();
        // проходим по уровню и инициализируем блоки
        level.__traverse(initBlocks);
    })
}

function reloadLevel() {
    if (levelData.__number > 3) return;
    closeWindow('win');
    level.__clearChildNodes();
    startLevel();
}

BUS.__addEventListeners(
    __ON_GAME_LOADED, a => {
        startLevel();
        return 1;
    },
    __ON_CONTINUE, a => {
        levelData.__number++;
        reloadLevel();
    },
    __ON_RETRY, a => {
        reloadLevel();
    }
);
