
// прототип геймплея

options.__soundDisabled = 0;

var __ON_SCORE_CHANGED = '__ON_SCORE_CHANGED'
    , __ON_BLOCK_NOT_BREAK = '__ON_BLOCK_NOT_BREAK'
    , __ON_BULLET_COLLISION = '__ON_BULLET_COLLISION'
    , BIG_BLOCK_HP = 100
    , BREAK_BLOCK_HP = 50;

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
                    n_level++;
                    BUS.__post(__ON_TAP);
                    reloadLevel();
                },
                __onTapHighlight: 1
            },

            button_retry: {
                __onTap() {
                    BUS.__post(__ON_TAP);
                    reloadLevel();
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
        BUS.__post(__ON_BULLET_COLLISION);
    }
}

function initBlocks(node) {
    var body = node.__ph_body;
    if (body && !body.isStatic) { // this is block
        node.__needBreaks = 1;
        big_blocks++;
        initCollision(body, node, BIG_BLOCK_HP, 100);
    }
}

//определение параметров уровня
function startLevel() {
    level.__scene = level.initLevel();
    setTimeout(a => {
        level.__scene.update(1);
        initBlocksCollision();
    })
}

BUS.__addEventListener(
    __ON_GAME_LOADED, a => {
        initLevel();
        return 1;
    }
);
