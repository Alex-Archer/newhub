const elId = `tui_${Math.ceil(Math.random() * 10e5).toString(36)}`
const elId_box = `tui_${Math.ceil(Math.random() * 10e5).toString(36)}`
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    //通告栏高度
    height: {
      type: Number,
      optionalTypes:[String],
      value: 72
    },
    content: {
      type: String,
      value: '',
      observer(val) {
        setTimeout(() => {
          this.initAnimation()
        }, 50);
      }
    },
    //字体大小 rpx
    size: {
      type: Number,
      optionalTypes:[String],
      value: 28
    },
    color: {
      type: String,
      value: ''
    },
    bold: {
      type: Boolean,
      value: false
    },
    backgroundColor: {
      type: String,
      value: '#fff8d5'
    },
    //scrollable为false时使用,['20rpx','30rpx','20rpx','30rpx']=>[上，右，下，左],为了兼容nvue
    padding: {
      type: Array,
      value: []
    },
    //是否单行
    single: {
      type: Boolean,
      value: false
    },
    //是否滚动，添加后控制单行效果取消
    scrollable: {
      type: Boolean,
      value: false,
      observer(val) {
        if (val) {
          setTimeout(() => {
            this.initAnimation()
          }, 50);
        }
      }
    },
    //每秒滚动速度（距离） 默认 100px/s
    speed: {
      type: Number,
      value: 100
    },
    //backwards: 动画从头开始播；forwards：动画从结束点开始播
    activeMode: {
      type: String,
      value: 'backwards'
    },
    //是否需要左侧slot内容
    isLeft: {
      type: Boolean,
      value: false
    },
    //是否需要右侧slot内容
    isRight: {
      type: Boolean,
      value: false
    },
    //是否固定在顶部
    isFixed: {
      type: Boolean,
      value: false
    },
    //isFixed为true时top值
    top: {
      type: String,
      value: '0'
    },
    //自定义参数
    params: {
      type: Number,
      optionalTypes:[String],
      value: 0
    }
  },
  data: {
    elId: elId,
    elId_box: elId_box,
    noticeWidth: 0,
    boxWidth: 0,
    animationDuration: 'none',
    animationPlayState: 'paused',
    animationDelay: '0s',
    g_color:(wx.$tui && wx.$tui.color.warning) || '#ff7900'
  },
  lifetimes: {
    ready: function () {
      setTimeout(() => {
        this.initAnimation()
      }, 50);
    }
  },
  methods: {
    initAnimation() {
      if (!this.data.content || this.data.content == '') return;
      if (this.data.scrollable) {
        let query = [],
          boxWidth = 0,
          noticeWidth = 0;
        let noticeQuery = new Promise((resolve, reject) => {
          wx.createSelectorQuery()
            .in(this)
            .select(`#${this.data.elId}`)
            .boundingClientRect()
            .exec(ret => {
              this.setData({
                noticeWidth: ret[0].width
              })
              resolve()
            })
        })
        if (this.data.activeMode === 'forwards') {
          let boxQuery = new Promise((resolve, reject) => {
            wx.createSelectorQuery()
              .in(this)
              .select(`#${this.data.elId_box}`)
              .boundingClientRect()
              .exec(ret => {
                this.setData({
                  boxWidth: ret[0].width
                })
                resolve()
              })
          })
          query.push(boxQuery)
        }
        query.push(noticeQuery)
        Promise.all(query).then(() => {
          this.setData({
            animationDuration: `${this.data.noticeWidth / this.data.speed}s`
          })
          if (this.data.activeMode === 'forwards') {
            this.setData({
              animationDelay: `-${this.data.boxWidth / this.data.speed}s`
            })
          }
          setTimeout(() => {
            this.setData({
              animationPlayState: 'running'
            })
          }, 1000)
        })
      }
    },
    onClick() {
      this.triggerEvent('click', {
        params: this.data.params
      })
    },
    leftClick() {
      this.triggerEvent('leftClick', {
        params: this.data.params
      })
    },
    rightClick() {
      this.triggerEvent('rightClick', {
        params: this.data.params
      })
    }
  }
})