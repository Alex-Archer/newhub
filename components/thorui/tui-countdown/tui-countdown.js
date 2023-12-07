Component({
  externalClasses: ["tui-countdown-class"],
  properties: {
    //数字框宽度
    width: {
      type: Number,
      value: 32
    },
    //数字框高度
    height: {
      type: Number,
      value: 32
    },
    //数字框border颜色
    borderColor: {
      type: String,
      value: '#333'
    },
    //数字框背景颜色
    backgroundColor: {
      type: String,
      value: '#fff'
    },
    //数字框字体大小
    size: {
      type: Number,
      value: 24
    },
    //数字框字体颜色
    color: {
      type: String,
      value: '#333'
    },
    //是否缩放 0.9
    scale: {
      type: Boolean,
      value: false
    },
    //冒号大小
    colonSize: {
      type: Number,
      value: 28
    },
    //冒号颜色
    colonColor: {
      type: String,
      value: '#333'
    },
    //剩余时间 (单位：秒)
    time: {
      type: String,
      optionalTypes: [Number],
      value: 0,
      observer(val) {
        this.clearTimer()
        this.doLoop();
      }
    },
    //是否包含天
    days: {
      type: Boolean,
      value: false
    },
    //是否包含小时
    hours: {
      type: Boolean,
      value: true
    },
    //是否包含分钟
    minutes: {
      type: Boolean,
      value: true
    },
    //是否包含秒
    seconds: {
      type: Boolean,
      value: true
    },
    //单位用英文缩写表示 仅seconds秒数有效
    unitEn: {
      type: Boolean,
      value: false
    },
    //是否展示为冒号,false为文字
    isColon: {
      type: Boolean,
      value: true
    },
    //是否返回剩余时间
    returnTime: {
      type: Boolean,
      value: false
    },
    //是否显示毫秒
    isMs: {
      type: Boolean,
      value: false
    },
    msWidth: {
      type: Number,
      value: 32
    },
    msSize: {
      type: Number,
      value: 24
    },
    msColor: {
      type: String,
      value: '#333'
    }
  },
  data: {
    countdown: null,
    d: '0',
    h: '00',
    i: '00',
    s: '00',
    //此处若从9到1，结束需要特殊处理
    ms: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    ani: false
  },
  lifetimes: {
    attached: function () {
      this.clearTimer()
      let seconds = Number(this.data.time || 0);
      if (seconds > 0) {
        this.doLoop();
      }
    },
    detached: function () {
      this.clearTimer()
    }
  },
  methods: {
    clearTimer() {
      clearInterval(this.data.countdown)
      this.data.countdown = null;
    },
    endOfTime(isStop = false) {
      this.setData({
        ani: false
      })
      this.clearTimer()
      if(!isStop){
        this.triggerEvent('end', {});
      }
    },
    doLoop(time = 0) {
      this.setData({
        ani: true
      })
      let seconds =time || Number(this.data.time || 0);
      this.countDown(seconds);
      this.data.countdown = setInterval(() => {
        seconds--
        if (seconds < 0) {
          this.endOfTime()
          return
        }
        this.countDown(seconds)
        if (this.data.returnTime) {
          this.triggerEvent('time', {
            seconds: seconds
          });
        }
      }, 1000)
    },
    countDown(seconds) {
      let [day, hour, minute, second] = [0, 0, 0, 0];
      if (seconds > 0) {
        day = this.data.days ? Math.floor(seconds / (60 * 60 * 24)) : 0;
        hour = this.data.hours ? Math.floor(seconds / (60 * 60)) - day * 24 : 0;
        minute = this.data.minutes ? Math.floor(seconds / 60) - hour * 60 - day * 24 * 60 : 0;
        second = Math.floor(seconds) - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60;
      }
      hour = hour < 10 ? '0' + hour : hour;
      minute = minute < 10 ? '0' + minute : minute;
      second = second < 10 ? '0' + second : second;
      this.setData({
        d: day,
        h: hour,
        i: minute,
        s: second
      })
    },
    reset(seconds = 0) {
      let time = seconds || Number(this.data.time || 0);
      this.clearTimer();
      if (time > 0) {
        this.doLoop(time);
      }
    }
  }
})