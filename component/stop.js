/**
 * 物品
 * 自動觸發：傳送訊息「結束指令程式！」、將程式暫停
 */
AFRAME.registerComponent('item', {   
    init: function () {
        this.el.active = this.active.bind(this);
    },
    
    active: function (sys) {
        sys.emit('message', `結束指令程式！`);
        sys.emit('execFail');
    },
});