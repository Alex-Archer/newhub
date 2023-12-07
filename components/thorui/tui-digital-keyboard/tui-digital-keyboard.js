Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    zIndex: {
      type: Number,
      optionalTypes:[String],
      value: 996
    },
    backgroundColor: {
      type: String,
      value: '#F7F7F7'
    },
    //数字以及删除键字体颜色
    color: {
      type: String,
      value: '#1a1a1a'
    },
    keyBackground: {
      type: String,
      value: '#fff'
    },
    buttonText: {
      type: String,
      value: '确定'
    },
    buttonBackground: {
      type: String,
      value: ''
    },
    buttonColor: {
      type: String,
      value: '#fff'
    },
    //rpx
    buttonSize: {
      type: Number,
      optionalTypes:[String],
      value: 32
    },
    buttonFontBold: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    },
    //是否需要小数点
    isDecimal: {
      type: Boolean,
      value: true,
      observer(val){
        this.initData(val)
      }
    },
    //可自定义颜色，设置为true时，自定义设置失效
    darkMode: {
      type: Boolean,
      value: false
    }
  },
  data: {
    keyArr: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'],
    g_buttonBackground:(wx.$tui && wx.$tui.color.primary) || '#5677fc'
  },
  lifetimes:{
    attached:function(){
      this.initData(this.data.isDecimal)
    }
  },
  methods: {
    initData(val) {
      let keyArr = [...this.data.keyArr];
      if (val) {
        keyArr.splice(10, 1, '.')
      } else {
        keyArr.splice(10, 1, '')
      }
      this.setData({
        keyArr:keyArr
      })
    },
    handleClick(e) {
      if (!this.data.show) return;
      const keyVal = e.currentTarget.dataset.value;
      if (keyVal) {
        this.triggerEvent('click', {
          value: keyVal
        })
      }
    },
    backspace() {
      this.triggerEvent('backspace', {})
    },
    confirm() {
      if (this.data.disabled) return;
      this.triggerEvent('confirm', {})
    }
  }
})
