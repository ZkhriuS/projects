
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
            .__addChildBox('level_' + this.__number)
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

//остаётся в этом блоке
BUS.__addEventListener(
    __ON_SCORE_CHANGED, e => {
        if (level) {
            level.__setAliasesData({
                score_text: {
                    __text: levelData.__score
                }
            });
        }
    }
);