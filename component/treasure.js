/**
 * 判斷是否有對應的鑰匙
 */
AFRAME.registerComponent('treasure', {
    init: function () {
        this.el.active = this.active.bind(this);
        this.el.pickup = this.pickup.bind(this);
    },

    active: function (sys) {
        // do nothing...
    },

    pickup: function (sys) {
        // console.log('pick up key!');
        // this.el.setAttribute('visible', false);
        // sys.backpack.push('key');
    }
});