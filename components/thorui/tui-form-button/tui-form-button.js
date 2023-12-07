const global=wx.$tui && wx.$tui.tuiFormButton;
Component({
  behaviors: ['wx://form-field-button'],
  properties: {
    //按钮背景色
    background: {
      type: String,
      value: ''
    },
    //按钮字体颜色
    color: {
      type: String,
      value: ''
    },
    //按钮禁用背景色
    disabledBackground: {
      type: String,
      value: ''
    },
    //按钮禁用字体颜色
    disabledColor: {
      type: String,
      value: ''
    },
    borderWidth:{
      type: String,
      value: '1rpx'
    },
    borderColor: {
      type: String,
      value: ''
    },
    // 宽度 rpx或 %
    width: {
      type: String,
      value: '100%'
    },
    //高度 rpx
    height: {
      type: String,
      value: ''
    },
    //medium 368*80 / small 240*80/ mini 116*64
    btnSize: {
      type: String,
      value: ''
    },
    //字体大小 rpx
    size: {
      type: String,
      optionalTypes:[Number],
      value: 0
    },
    bold: {
      type: Boolean,
      value: false
    },
    margin: {
      type: String,
      value: '0'
    },
    //圆角
    radius: {
      type: String,
      value: ''
    },
    plain: {
      type: Boolean,
      value: false
    },
    //link样式，去掉边框背景
    link: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    },
    loading: {
      type: Boolean,
      value: false
    },
    formType: {
      type: String,
      value: ''
    },
    openType: {
      type: String,
      value: ''
    },
    appParameter: {
      type: String,
      value: ''
    },
    index: {
      type: Number,
      optionalTypes:[String],
      value: 0
    }
  },
  data: {
    time: 0,
    g_height:(global && global.height) || '96rpx',
    g_background:(global && global.background) || '#5677fc',
    g_color:(global && global.color) || '#fff',
    g_radius:(global && global.radius) || '6rpx',
    g_size: (global && global.size) || 32
  },
  methods: {
    handleStart() {
      if (this.data.disabled) return;
      if (new Date().getTime() - this.data.time <= 150) return;
      this.setData({
        time:new Date().getTime()
      })
    },
    handleClick() {
      if (this.data.disabled) return;
      this.setData({
        time:0
      })
      this.triggerEvent('click', {
        index: Number(this.data.index)
      });
    },
    handleEnd() {
      if (this.data.disabled) return;
      setTimeout(() => {
        this.setData({
          time:0
        })
      }, 150);
    },
    bindgetuserinfo({
      detail = {}
    } = {}) {
      this.triggerEvent('getuserinfo', detail);
    },
    bindcontact({
      detail = {}
    } = {}) {
      this.triggerEvent('contact', detail);
    },
    bindgetphonenumber({
      detail = {}
    } = {}) {
      this.triggerEvent('getphonenumber', detail);
    },
    binderror({
      detail = {}
    } = {}) {
      this.triggerEvent('error', detail);
    },
    bindopensetting({
      detail = {}
    } = {}) {
      this.triggerEvent('opensetting', detail);
    },
    bindchooseavatar({
      detail = {}
    } = {}) {
      this.triggerEvent('chooseavatar', detail);
    },
    bindlaunchapp({
      detail = {}
    } = {}) {
      this.triggerEvent('launchapp', detail);
    }
  }
})