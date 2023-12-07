const global = wx.$tui && wx.$tui.color;
Component({
  properties: {
    //是否显示
    show: {
      type: Boolean,
      value: false
    },
    width: {
      type: String,
      value: "84%"
    },
		backgroundColor: {
			type: String,
			value: '#fff'
		},
    padding: {
      type: String,
      value: "40rpx 64rpx"
    },
    radius: {
      type: String,
      value: "24rpx"
    },
    //标题
    title: {
      type: String,
      value: ""
    },
    //内容
    content: {
      type: String,
      value: ""
    },
    //内容字体颜色
    color: {
      type: String,
      value: "#999"
    },
    //内容字体大小 rpx
    size: {
      type: Number,
      value: 28
    },
    //形状 circle, square
    shape: {
      type: String,
      value: 'square'
    },
    button: {
      type: Array,
      value: [{
        text: "取消",
        type: "red",
        plain: true //是否空心
      }, {
        text: "确定",
        type: "red",
        plain: false
      }]
    },
    //点击遮罩 是否可关闭
    maskClosable: {
      type: Boolean,
      value: true
    },
    //是否显示mask
    isMask: {
      type: Boolean,
      value: true
    },
    maskColor: {
      type: String,
      value: 'rgba(0, 0, 0, 0.6)'
    },
    //淡入效果，自定义弹框插入input输入框时传true
    fadeIn: {
      type: Boolean,
      value: false
    },
    //自定义弹窗内容
    custom: {
      type: Boolean,
      value: false
    },
		//容器z-index
		zIndex:{
			type: Number,
			value: 9997
		},
		//mask z-index
		maskZIndex:{
			type: Number,
			value: 9990
		}
  },
  data:{
    colors:{
      'primary': (global && global.primary) || '#5677fc',
      'green': (global && global.success) || '#07c160',
      'warning': (global && global.warning) || '#ff7900',
      'danger': (global && global.danger) || '#EB0909',
      'red': (global && global.danger) || '#EB0909',
      'pink': (global && global.pink) || '#f74d54'
    }
  },
  methods: {
    handleClick(e) {
      if (!this.data.show) return;
      const dataset = e.currentTarget.dataset;
      this.triggerEvent('click', {
        index: Number(dataset.index)
      });
    },
    handleClickCancel() {
      if (!this.data.maskClosable) return;
      this.triggerEvent('cancel');
    },
    stop(){}
  }
})