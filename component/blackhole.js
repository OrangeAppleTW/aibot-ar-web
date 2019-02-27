/**
 * 自動觸發：將玩家傳送到指定位置
 */
AFRAME.registerComponent('blackhole', {
    schema: {
        toX: { type: 'number', default: 0 },
        toZ: { type: 'number' , default: 0 },
        torward: {type: 'number', default: 0 },
    },

    init: function () {
        this.el.active = this.active.bind(this);
    },

    active: function (sys) {
        sys.playerPos.x = this.data.toX;
        sys.playerPos.z = this.data.toZ;
        sys.player.setAttribute('position', `${this.data.toX + 0.5} 0.5 ${-this.data.toZ + 0.5}`);
    }
});