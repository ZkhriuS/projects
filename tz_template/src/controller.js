var MIN_SHOT_DEG = -75
    , MAX_SHOT_DEG = 30
    , controller = {
        rubber(node) {
            rubber = node;
        },

        userInputArea: {
            __dragDist: 1,
            __drag(x, y, dx, dy) {
                rubber.__pull(mousePull(this, new Vector2(x, y)));
            },
            __dragStart() {
                rubber.__killAllAnimations();
            },
            __dragEnd() {
                playSound('punch');

                // отпускаем резинку
                rubber.__anim({
                    __width: 10
                }, 0.4, 0, easeElasticO);

                initBullet(this.__worldPosition);
            }
        }
    }

//игрок растягивает мышкой объект
function mousePull(obj, vmouse) {
    obj.__dv = vmouse.sub(obj.__worldPosition.__clone());
    return {

        //величина натяжения ограничена областью объекта
        __strength: clamp(obj.__dv.__length(), 0, obj.__size.__length()),

        //можно ограничить броски в некоторых направлениях
        __angle: clamp(
            (obj.__dv.__angle() - PI) * RAD2DEG
            , MIN_SHOT_DEG
            , MAX_SHOT_DEG
        ),

        //результирующая скорость с учётом ограничений
        __velocity: (new Vector2(
            __strength * Math.cos(__angle * DEG2RAD)
            , __strength * Math.sin(__angle * DEG2RAD)
        )).__multiplyScalar(0.2)

    }

}