let timer;
Component({
  externalClasses: ['tui-tips-class'],
  properties: {
    //top bottom center
    position: {
      type: String,
      value: "top"
    },
		backgroundColor: {
			type: String,
			value: 'rgba(0, 0, 0, 0.7)'
		},
		color: {
			type: String,
			value: '#fff'
		},
		size: {
			type: Number,
			value: 30
		}
  },
  data: {
    show: false,
    msg: "无法连接到服务器~"
  },
  lifetimes: {
    detached: function() {
      clearTimeout(timer);
      timer = null;
    }
  },
  methods: {
    showTips: function(options) {
      const { duration = 2000} = options;
      clearTimeout(timer);
      this.setData({
        show: true,
        msg: options.msg
      }, () => {
        timer = setTimeout(() => {
          this.setData({
            show: false
          }, () => {
            clearTimeout(timer);
            timer = null;
          })
        }, duration)
      })
    }
  }
})