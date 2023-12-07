Component({
  properties: {
    //内容区域宽度
    width: {
      type: String,
      value: '100%'
    },
    //内容区域高度，type=2时生效且需要传入具体值，高度值要低于实际内容高度
    height: {
      type: String,
      value: 'auto'
    },
    //padding值，type=2时生效
    padding: {
      type: String,
      value: '0'
    },
    //内容区域背景色
    backgroundColor: {
      type: String,
      value: 'transparent'
    },
    //小鱼加，圆角，可以是0 0 0 0格式
    radius:{
      type: String,
      value: '0'
    },
    //文本字体大小 rpx
    size: {
      type: Number,
      optionalTypes:[String],
      value: 32
    },
    //文本字体颜色
    color: {
      type: String,
      value: '#333'
    },
    //文本内容是否加粗 
    bold: {
      type: Boolean,
      value: false
    },
    //隐藏类型：1-文本超出设定行数隐藏，2-渐变隐藏
    type: {
      type: Number,
      optionalTypes:[String],
      value: 1
    },
    //超出多少行开始隐藏，type=1时生效
    lineClamp: {
      type: Number,
      optionalTypes:[String],
      value: 2
    },
    //clip|ellipsis|string,参考CSS text-overflow 属性
    textOverflow: {
      type: String,
      value: 'ellipsis'
    },
    //渐变隐藏遮罩背景色,与页面或内容区域背景色保持一致
    gradientColor: {
      type: String,
      value: '#fff'
    },
    //移除渐变隐藏，显示全部内容，type=2时生效
    removeGradient: {
      type: Boolean,
      value: false
    },
    //索引值
    index: {
      type: Number,
      value: 0
    }
  },
  methods: {
    handleClick(e) {
      this.triggerEvent('click', {
        index: this.data.index
      })
    }
  }
})