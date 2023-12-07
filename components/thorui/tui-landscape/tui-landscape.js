Component({
  properties: {
    //是否显示
    show: {
      type: Boolean,
      value: false
    },
    //显示内容区z-index
    zIndex: {
      type: Number,
      value: 1001
    },
    //是否需要关闭图标
    closeIcon: {
      type: Boolean,
      value: true
    },
    //关闭图标颜色
    iconColor: {
      type: String,
      value: '#fff'
    },
    //关闭图标大小 px
    iconSize: {
      type: Number,
      value: 25
    },
    //icon位置：1-底部 2-右上角 3-左上角
    position: {
      type: Number,
      optionalTypes:[String],
      value: 1
    },
    //关闭图标top值，position为2或3的时候生效
    iconTop: {
      type: String,
      value: '-120rpx'
    },
    //关闭图标bottom值，position为1的时候生效
    iconBottom: {
      type: String,
      value: '-120rpx'
    },
    //关闭图标left值，position为3的时候生效
    iconLeft: {
      type: String,
      value: '0'
    },
    //关闭图标right值，position为2的时候生效
    iconRight: {
      type: String,
      value: '0'
    },
    //点击遮罩是否可以关闭
    maskClosable: {
      type: Boolean,
      value: true
    },
    //是否需要遮罩
    mask: {
      type: Boolean,
      value: true
    },
    //遮罩背景色
    maskBgColor: {
      type: String,
      value: 'rgba(0,0,0,.6)'
    },
    //遮罩z-index值
    maskZIndex: {
      type: Number,
      value: 1000
    },
    //自定义参数
    params: {
      type: Number,
      optionalTypes:[String],
      value: 0
    }
  },
  methods: {
    close(e) {
      let isMask = Number(e.currentTarget.dataset.type)
      if (isMask == 1 && !this.data.maskClosable) return;
      this.triggerEvent('close', {
        params: this.data.params
      });
    }
  }
})