/**
 * 自動觸發：停止程式指令、傳送訊息「碰撞到障礙物啦！」
 */
AFRAME.registerComponent('rock', {
    init: function () {
        this.el.beforeActive = this.beforeActive;
    },

    beforeActive: function (sys) {
        sys.emit('message', '撞到石頭了！');
        sys.emit('execFail');
    }
});