function initBullet(wp) {
    var bullet = level.__addChildBox({
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
    }).update();
    if (bullet.__ph_body) {
        ph_Body.setVelocity(bullet.__ph_body, rubber.__velocity);
    }
}

BUS.__addEventListener(
    __ON_BULLET_OUT, e => {
        if (bullet) {
            if (bullet.__ph_body) {
                bullet.__dmg = floor(ph_Body
                    .getVelocity(bullet.__ph_body)
                    .__length());
                score += ((shot_breaks) ? 1 : -1) * bullet.__dmg;
            }
            BUS.__post(__ON_SCORE_CHANGED);

            bullet.__removeFromParent();
        }
    }
);