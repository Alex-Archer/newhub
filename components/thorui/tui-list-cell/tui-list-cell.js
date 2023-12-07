Component({
  externalClasses:['tui-list-class'],
  properties: {
    //是否有箭头
    arrow: {
      type: Boolean,
      value: false
    },
    //V2.3.0+
    arrowColor: {
      type: String,
      value: ''
    },
    //是否有点击效果
    hover: {
      type: Boolean,
      value: true
    },
    //隐藏线条
    unlined: {
      type: Boolean,
      value: false
    },
    //V2.3.0+
    lineColor: {
      type: String,
      value: ''
    },
    //线条左偏移距离
    lineLeft: {
      type: String,
      optionalTypes:[Number],
      value: -1
    },
    //线条右偏移距离
    lineRight: {
      type: String,
      optionalTypes:[Number],
      value: 0
    },
    padding: {
      type: String,
      value: ''
    },
    marginTop: {
      type: String,
      optionalTypes:[Number],
      value: 0
    },
    marginBottom: {
      type: String,
      optionalTypes:[Number],
      value: 0
    },
    //背景颜色
    backgroundColor: {
      type: String,
      value: '#fff'
    },
    //字体大小
    size: {
      type: Number,
      value: 0
    },
    //字体颜色
    color: {
      type: String,
      value: ''
    },
    //圆角值
    radius: {
      type: String,
      optionalTypes:[Number],
      value: 0
    },
    //箭头是否有偏移距离
    arrowRight: {
      type: String,
      optionalTypes:[Number],
      value: 30
    },
    index: {
      type: Number,
      value: 0
    }
  },
  data:{
    g_arrowColor:wx.$tui && wx.$tui.tuiListCell.arrowColor,
    g_lineColor:wx.$tui && wx.$tui.tuiListCell.lineColor,
    g_lineLeft:wx.$tui && wx.$tui.tuiListCell.lineLeft,
    g_padding:wx.$tui && wx.$tui.tuiListCell.padding,
    g_color:wx.$tui && wx.$tui.tuiListCell.color,
    g_size: wx.$tui && wx.$tui.tuiListCell.size
  },
  methods: {
    handleClick() {
			this.triggerEvent('click', {
				index: this.data.index
			});
		}
  }
})