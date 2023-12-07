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
    //左侧标题
    label: {
      type: String,
      value: ''
    },
    //标题字体大小
    labelSize: {
      type: Number,
      value: 0
    },
    labelColor: {
      type: String,
      value: ''
    },
    //label 最小宽度 rpx
    labelWidth: {
      type: Number,
      value: 140
    },
    clearable: {
      type: Boolean,
      value: false
    },
    //px
    clearSize: {
      type: Number,
      value: 15
    },
    clearColor: {
      type: String,
      value: '#bfbfbf'
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
      value: ''
    },
    //与官方input type属性一致
    type: {
      type: String,
      value: 'text'
    },
    password: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    },
    maxlength: {
      type: Number,
      optionalTypes:[String],
      value: 140
    },
    min: {
      type: Number,
      optionalTypes:[String],
      value: 'NaN'
    },
    max: {
      type: Number,
      optionalTypes:[String],
      value: 'NaN'
    },
    cursorSpacing: {
      type: Number,
      value: 0,
    },
    confirmType: {
      type: String,
      value: 'done'
    },
    confirmHold: {
      type: Boolean,
      value: false,
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
    holdKeyboard: {
      type: Boolean,
      value: false
    },
    autoBlur: {
      type: Boolean,
      value: false
    },
    //输入框字体大小 rpx
    size: {
      type: String,
      optionalTypes:[Number],
      value: 0
    },
    //输入框字体颜色
    color: {
      type: String,
      value: ''
    },
    // 是否显示 input 边框
    inputBorder: {
      type: Boolean,
      value: false
    },
    borderColor: {
      type: String,
      value: 'rgba(0, 0, 0, 0.1)'
    },
    //input是否显示为圆角
    isFillet: {
      type: Boolean,
      value: false
    },
    // 是否显示上边框
    borderTop: {
      type: Boolean,
      value: false
    },
    // 是否显示下边框
    borderBottom: {
      type: Boolean,
      value: true
    },
    //下边框线条是否有左偏移距离
    lineLeft: {
      type: Boolean,
      value: true
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
      value: ''
    },
    //输入框背景颜色
    backgroundColor: {
      type: String,
      value: ''
    },
    radius: {
      type: String,
      optionalTypes:[Number],
      value: -1
    },
    //输入框margin-top值 rpx
    marginTop: {
      type: String,
      optionalTypes:[Number],
      value: 0
    }
  },
  data: {
    placeholderStyl: '', 
    focused: false,
    danger:(wx.$tui && wx.$tui.tuiInput.requiredColor) || '#EB0909',
    g_radius: (wx.$tui && wx.$tui.tuiInput.radius) || 0,
    g_labelSize:(wx.$tui && wx.$tui.tuiInput.labelSize) || 32,
    g_labelColor:(wx.$tui && wx.$tui.tuiInput.labelColor) || '#333',
    g_size:(wx.$tui && wx.$tui.tuiInput.size) || 32,
    g_color:(wx.$tui && wx.$tui.tuiInput.color) || '#333',
    g_backgroundColor:(wx.$tui && wx.$tui.tuiInput.backgroundColor) || '#FFFFFF',
    g_padding:(wx.$tui && wx.$tui.tuiInput.padding) || '26rpx 30rpx'
  },
  lifetimes: {
    attached: function () {
      this.fieldPlaceholderStyle()
    },
    ready:function(){
      setTimeout(() => {
        this.setData({
          focused: this.data.focus
        })
      }, 100)
    }
  },
  methods: {
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
      const cVal = Number(value)
      if ((this.data.type === 'digit' || this.data.type === 'number') && !isNaN(cVal) && Number.isSafeInteger(cVal)) {
        const cVal = Number(value)
				let eVal = this.data.type === 'digit' ? value : cVal
        if (typeof cVal === 'number') {
          const min = Number(this.data.min)
          const max = Number(this.data.max)
          if (typeof min === 'number' && cVal < min) {
            eVal = min
          } else if (typeof max === 'number' && max < cVal) {
            eVal = max
          }
        }
        value = isNaN(eVal) ? value : eVal
      }
      const inputValue = event.detail.value !== '' ? value : ''
      this.triggerEvent('input', inputValue);
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
    onClear(event) {
      if(this.data.disabled) return;
      wx.hideKeyboard()
      this.triggerEvent('input', '');
      this.setData({
        value: ''
      })
    },
    fieldClick() {
      this.triggerEvent('click', {
        name: this.data.name
      });
    },
    onKeyboardheightchange(e) {
      this.triggerEvent('keyboardheightchange', e.detail)
    },
    trimStr(str) {
      return str.replace(/^\s+|\s+$/g, '');
    }
  }
})