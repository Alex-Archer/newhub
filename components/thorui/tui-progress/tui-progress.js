Component({
  properties: {
    //百分比 0-100
    percent: {
      type: Number,
      optionalTypes: [String],
      value: 0,
      observer(val) {
        this.darwProgress()
      }
    },
    //右侧是否显示百分比
    showInfo: {
      type: Boolean,
      value: false
    },
    //圆角大小
    radius: {
      type: String,
      value: '8rpx'
    },
    //右侧百分比字体大小 rpx
    size: {
      type: Number,
      value: 28
    },
    //右侧百分比颜色
    color: {
      type: String,
      value: '#333'
    },
    //右侧百分比宽度
    percentWidth: {
      type: Number,
      value: 96
    },
    //进度条线条宽度 rpx
    width: {
      type: Number,
      value: 8
    },
    //已选进度条颜色,可渐变
    activeColor: {
      type: String,
      value: ''
    },
    //未选择的进度条的颜色
    backgroundColor: {
      type: String,
      value: '#EBEBEB'
    },
    //进度增加1%所需毫秒数
    duration: {
      type: Number,
      value: 15
    }
  },
  data: {
    percentage: 0,
    translateX: '-100%',
    time: 0,
    g_activeColor:(wx.$tui && wx.$tui.color.primary) || '#5677fc'
  },
  lifetimes: {
    ready: function () {
      this.darwProgress()
    }
  },
  methods: {
    darwProgress() {
      let percent = Number(this.data.percent);
      percent = percent > 100 ? 100 : percent;
      let time = this.data.duration * Math.abs(percent - this.data.percentage) / 1000
      if (percent < this.data.percentage && (this.data.percentage - percent) > 30) {
        //后百分比数大于30时 时间缩短
        time = time / 2
      }
      setTimeout(() => {
        this.triggerEvent('activeend', {})
      }, time)
      this.setData({
        time: time,
        percentage: percent,
        translateX: (100 - percent) + '%'
      })
    }
  }
})