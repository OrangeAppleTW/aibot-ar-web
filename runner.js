/**
 * 執行程式轉化為指令操控物件
 * 介面和遊戲場景的中介
 */
class Runner {

    constructor (sys) {
        
        this.commands = [];
        this.idx = 0;
        this.sys = sys;
        this.running = false;

        // 合法的指令名稱
        this.accpetCmd = ['R', 'L', 'M', 'B', '?', 'J', 'S'];
        
        // 合法的物品名稱，用來判斷「？」指令參數是否合法
        this.acceptItem = [];

        this.sys.addEvent('execDone', () => {
            this.execute();
        });
        this.sys.addEvent('execFail', () => {
            this.pause();
            alert('程式出錯啦！')
        });
        this.sys.addEvent('success', () => {
            this.pause();
        });
        this.sys.addEvent('message', (message) => {
            console.log(message);
        })
    }

    loadScript (commands) {
        this.commands = commands;
    }

    runScript () {
        this.idx = 0;
        this.running = true;
        this.sys.reset();
        setTimeout(()=>{
            this.execute(); // suck XDDD
        }, 500)
        
    }

    pause () {
        this.running = false;
    }

    execute () {
        if (this.running === false) return;
        if (this.idx >= this.commands.length) return;
        let cmd = this.commands[this.idx];
        this.idx++;

        if (cmd === 'M') this.sys.exec('stepForward');
        if (cmd === 'B') this.sys.exec('stepBack');
        if (cmd === 'L') this.sys.exec('turnLeft');
        if (cmd === 'R') this.sys.exec('turnRight');
        if (cmd === '-') this.sys.exec('pickup');
        if (cmd === '+') this.sys.exec('drop');
        if (cmd === 'S') this.pause();
        if (cmd[0] == 'J') {
            setTimeout(()=>{
                this.idx = Number(cmd.slice(1));
                this.execute()
            }, 300);
        }
        if (cmd.indexOf('?J') !== -1) {
            setTimeout(()=>{
                
                let condition = cmd.split('?J')[0];
                let target = cmd.split('?J')[1];
                let bool = this.sys.exec('check', condition);
                if (bool) this.idx = Number(target);
                this.execute();
            }, 300);
        }
    }
}