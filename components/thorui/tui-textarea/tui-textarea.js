Component({
  behaviors: ['wx://form-field-group'],
  options: {
    virtualHost: true,
    multipleSlots: true
  },
  properties: {
    //是否为必填项
    required: {
      type: Boolean,
      value: false
    },
    requiredColor: {
      type: String,
      value: ''
    },
    requiredTop: {
      type: String,
      value: '32rpx'
    },
    //左侧标题
    label: {
      type: String,
      value: ''
    },
    //标题字体大小
    labelSize: {
      type: Number,
      value: 32
    },
    labelColor: {
      type: String,
      value: '#333'
    },
    //label 最小宽度 rpx
    labelWidth: {
      type: Number,
      value: 140
    },
    //获取焦点
    focus: {
      type: Boolean,
      value: false,
      observer(val) {
        setTimeout(() => {
          this.setData({
            focused: val
          })
        }, 50)
      }
    },
    autoHeight: {
      type: Boolean,
      value: false
    },
    fixed: {
      type: Boolean,
      value: false
    },
    placeholder: {
      type: String,
      value: ''
    },
    placeholderStyle: {
      type: String,
      value: '',
      observer(val) {
        this.fieldPlaceholderStyle()
      }
    },
    //输入框名称
    name: {
      type: String,
      value: ''
    },
    //输入框值
    value: {
      type: String,
      value: '',
      observer(val) {
        const len = this.getCount(val.length)
        this.setData({
          count: len
        })
      }
    },
    disabled: {
      type: Boolean,
      value: false
    },
    maxlength: {
      type: Number,
      optionalTypes: [String],
      value: 140
    },
    cursorSpacing: {
      type: Number,
      value: 0,
    },
    showConfirmBar: {
      type: Boolean,
      value: true
    },
    cursor: {
      type: Number,
      value: -1
    },
    selectionStart: {
      type: Number,
      value: -1
    },
    selectionEnd: {
      type: Number,
      value: -1
    },
    adjustPosition: {
      type: Boolean,
      value: true
    },
    disableDefaultPadding: {
      type: Boolean,
      value: true
    },
    holdKeyboard: {
      type: Boolean,
      value: false
    },
    autoBlur: {
      type: Boolean,
      value: false
    },
    height: {
      type: String,
      value: '200rpx'
    },
    minHeight: {
      type: String,
      value: '200rpx'
    },
    //标题与输入框是否顶端对齐
    flexStart: {
      type: Boolean,
      value: false
    },
    //输入框字体大小 rpx
    size: {
      type: Number,
      value: 32
    },
    //输入框字体颜色
    color: {
      type: String,
      value: '#333'
    },
    // 是否显示 textarea 边框
    textareaBorder: {
      type: Boolean,
      value: false
    },
    //V2.3.0+
    borderColor: {
      type: String,
      value: 'rgba(0, 0, 0, 0.1)'
    },
    //V2.3.0+
    radius: {
      type: String,
      optionalTypes:[Number],
      value: 0,
      observer(val) {
        this.setData({
          borderRadius: Number(val)
        })
      }
    },
    // 是否显示上边框
    borderTop: {
      type: Boolean,
      value: true
    },
    // 是否显示下边框
    borderBottom: {
      type: Boolean,
      value: true
    },
    //下边框线条是否有左偏移距离
    lineLeft: {
      type: Boolean,
      value: false
    },
    // 是否自动去除两端的空格
    trim: {
      type: Boolean,
      value: true
    },
    textRight: {
      type: Boolean,
      value: false
    },
    //输入框padding值
    padding: {
      type: String,
      value: '26rpx 30rpx'
    },
    //输入框背景颜色
    backgroundColor: {
      type: String,
      value: '#FFFFFF'
    },
    //输入框margin-top值 rpx
    marginTop: {
      type: Number,
      value: 0
    },
    //是否显示底部输入长度计数
    isCounter: {
      type: Boolean,
      value: false
    },
    //计数文本颜色
    counterColor: {
      type: String,
      value: '#999'
    },
    //计数文本大小 rpx
    counterSize: {
      type: Number,
      value: 28
    }
  },
  data: {
    placeholderStyl: '',
    count: 0,
    focused: false,
    borderRadius: 0,
    g_requiredColor: (wx.$tui && wx.$tui.color.danger) || '#EB0909'
  },
  lifetimes: {
    attached: function () {
      const len = this.getCount(this.data.value.length)
      this.setData({
        count: len,
        borderRadius: Number(this.data.radius)
      })
      this.setData({
       
      })
      this.fieldPlaceholderStyle()
    },
    ready: function () {
      setTimeout(() => {
        this.setData({
          focused: this.data.focus
        })
      }, 100)
    }
  },
  data: {
    placeholderStyl: '',
    count: 0,
    focused: false
  },
  methods: {
    getCount(len) {
      const max = Number(this.data.maxlength)
      return len > max && max!==-1 ? max : len
    },
    fieldPlaceholderStyle() {
      if (this.data.placeholderStyle) {
        this.setData({
          placeholderStyl: this.data.placeholderStyle
        })
      } else {
        this.setData({
          placeholderStyl: `fontSize:${this.data.size}rpx`
        })
      }
    },
    onInput(event) {
      let value = event.detail.value;
      if (this.data.trim) value = this.trimStr(value);
      this.setData({
        count: value.length
      })
      this.triggerEvent('input', value);
    },
    onFocus(event) {
      this.triggerEvent('focus', event);
    },
    onBlur(event) {
      this.triggerEvent('blur', event);
    },
    onConfirm(e) {
      this.triggerEvent('confirm', e.detail.value);
    },
    fieldClick() {
      this.triggerEvent('click', {
        name: this.data.name
      });
    },
    onLinechange(e) {
      this.triggerEvent('linechange', e.detail)
    },
    onKeyboardheightchange(e) {
      this.triggerEvent('keyboardheightchange', e.detail)
    },
    trimStr(str) {
      return str.replace(/^\s+|\s+$/g, '');
    }
  }
})