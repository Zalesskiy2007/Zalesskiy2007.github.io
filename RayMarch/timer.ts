export class _Timer {
    globalTime: number;
    globalDeltaTime: number;
    isPause: boolean;
    oldTime: number;
    pauseTime: number;
    localDeltaTime: number;
    localTime: number;
    startTime: number;
    frameCounter: number;
    oldTimeFPS: number;
    FPS: number;

    constructor() {
        this.globalTime = 0;
        this.globalDeltaTime = 0;
        this.isPause = false;
        this.oldTime = 0;
        this.pauseTime = 0;
        this.localDeltaTime = 0;
        this.localTime = 0;
        this.startTime = 0;
        this.frameCounter = 0;
        this.oldTimeFPS = 0;
        this.FPS = 30;
    }

    response() {
        const getTime = () => {
            const date = new Date();
            let t =
              date.getMilliseconds() / 1000.0 +
              date.getSeconds() +
              date.getMinutes() * 60;
            return t;
          };
        
          let t = getTime();
          // Global time
          this.globalTime = t;
          this.globalDeltaTime = t - this.oldTime;
          // Time with pause
          if (this.isPause) {
            this.localDeltaTime = 0;
            this.pauseTime += t - this.oldTime;
          } else {
            this.localDeltaTime = this.globalDeltaTime;
            this.localTime = t - this.pauseTime - this.startTime;
          }
          // FPS
          this.frameCounter++;
          if (t - this.oldTimeFPS > 3) {
            this.FPS = this.frameCounter / (t - this.oldTimeFPS);
            this.oldTimeFPS = t;
            this.frameCounter = 0;            
          }
          this.oldTime = t;
    }
}