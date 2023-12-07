Component({
  externalClasses: ['tui-grid-class'],
  properties: {
    cell: {
      type: Number,
      optionalTypes:[String],
      value: 3
    },
    backgroundColor: {
      type: String,
      value: "#fff"
    },
    //是否有点击效果
    hover: {
      type: Boolean,
      value: true
    },
    //是否需要底部线条
    bottomLine: {
      type: Boolean,
      value: true
    },
    //是否需要纵向边框线条
    border:{
      type: Boolean,
      value: true
    },
    index: {
      type: Number,
      value: 0
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClick() {
      this.triggerEvent('click', {
        index: this.data.index
      });
    }
  }
})