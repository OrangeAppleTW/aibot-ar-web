/**
 * 觸發：根據玩家移動的方向判斷後方是否為空，可以就能被推動
 */
AFRAME.registerComponent('box', {
    schema: {
    },

    init: function () {
        this.el.active = this.active.bind(this);
        this.el.beforeActive = this.beforeActive.bind(this);
    },

    beforeActive: function (grid) {

        let x = grid.playerPos.x;
        let z = grid.playerPos.z;
        let rotationY = grid.player.components.rotation.data.y;
        rotationY = rotationY%360;
        
        if (rotationY < 0) rotationY += 360;
        if (rotationY === 0) {
            if (grid.grid[x][z + 1] != undefined) return grid.emit('execFail');
            grid.grid[x][z + 1] = grid.grid[x][z];
            grid.grid[x][z] = undefined;
            grid.positionAnimate(this.el, 0, 1);
        }
        if (rotationY === 90) {
            if (grid.grid[x - 1][z] != undefined) return grid.emit('execFail');
            grid.grid[x - 1][z] = grid.grid[x][z];
            grid.grid[x][z] = undefined;
            grid.positionAnimate(this.el, -1, 0);
        }
        if (rotationY === 180) {
            if (grid.grid[x][z - 1] != undefined) return grid.emit('execFail');
            grid.grid[x][z - 1] = grid.grid[x][z];
            grid.grid[x][z] = undefined;
            grid.positionAnimate(this.el, 0, -1);
        }
        if (rotationY === 270) {
            if (grid.grid[x + 1][z] != undefined) return grid.emit('execFail');
            grid.grid[x + 1][z] = grid.grid[x][z];
            grid.grid[x][z] = undefined;
            grid.positionAnimate(this.el, 1, 0);
        }
    },

    active: function (sys) {
        console.log('搬移完成!')
    },
});