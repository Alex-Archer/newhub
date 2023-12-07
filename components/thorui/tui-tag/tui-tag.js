Component({
  properties: {
    type: {
      type: String,
      value: 'primary',
      observer(val){
        this.initStyl()
      }
    },
    //小鱼加宽度
    width:{
      type: String,
      value: ''
    },
    //padding
    padding: {
      type: String,
      value: '16rpx 26rpx'
    },
    margin: {
      type: String,
      value: '0'
    },
    //文字大小 rpx
    size: {
      type: String,
      value: '28rpx'
    },
    // circle, square，circleLeft，circleRight
    shape: {
      type: String,
      value: 'square'
    },
    //是否空心
    plain: {
      type: Boolean,
      value: false,
      observer(val){
        this.initStyl()
      }
    },
    //点击效果
    hover: {
      type: Boolean,
      value: false
    },
    //缩放倍数
    scaleMultiple: {
      type: Number,
      value: 1
    },
    originLeft: {
      type: Boolean,
      value: false
    },
    originRight: {
      type: Boolean,
      value: false
    },
    index: {
      type: Number,
      value: 0
    }
  },
  data:{
    g_bg_color:'',
    g_color:'',
    g_border_color:''
  },
  lifetimes:{
    attached:function(){
      this.initStyl()
    }
  },
  methods: {
    hexToRGB(hex) {
      if (hex.length === 4) {
        let text = hex.substring(1, 4);
        hex = '#' + text + text;
      }
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : {};
    },
    getColorByType(type, isText, plain) {
      //primary， white， danger， warning， green， gray，black，light-blue，light-brownish，light-orange，light-green
      const global = wx.$tui && wx.$tui.color;
      let color = ''
      const _primary = this.hexToRGB((global && global.primary) || '#5677fc')
      const _blue = this.hexToRGB((global && global.blue) || '#007aff')
      const _warning = this.hexToRGB((global && global.warning) || '#ff7900')
      const _danger = this.hexToRGB((global && global.danger) || '#EB0909')
      const _green = this.hexToRGB((global && global.success) || '#07c160')
      const colors = {
        'primary': (global && global.primary) || '#5677fc',
        'white': '#fff',
        'danger': (global && global.danger) || '#EB0909',
        'red': (global && global.pink) || '#f74d54',
        'pink': (global && global.pink) || '#f74d54',
        'warning': (global && global.warning) || '#ff7900',
        'orange': (global && global.warning) || '#ff7900',
        'green': (global && global.success) || '#07c160',
        'blue': (global && global.blue) || '#007aff',
        'gray': '#ededed',
        'btn-gray': '#ededed',
        'black': '#000',
        'light-primary': `rgba(${_primary.r}, ${_primary.g}, ${_primary.b}, 0.08)`,
        'light-blue': `rgba(${_blue.r}, ${_blue.g}, ${_blue.b}, 0.08)`,
        'brownish': '#8a5966',
        'light-brownish': '#fcebef',
        'light-danger': `rgba(${_danger.r}, ${_danger.g}, ${_danger.b}, 0.08)`,
        'light-orange': `rgba(${_warning.r}, ${_warning.g}, ${_warning.b}, 0.08)`,
        'light-warning': `rgba(${_warning.r}, ${_warning.g}, ${_warning.b}, 0.08)`,
        'light-green': `rgba(${_green.r}, ${_green.g}, ${_green.b}, 0.08)`,
        'light-black': '#333',
        'translucent': 'rgba(0, 0, 0, 0.7)'
      }
      if (isText) {
        if (type && ~type.indexOf('light-') && type !== 'light-black') {
          const tp = type.replace('light-', '')
          color = colors[tp]
        } else if (type === 'white') {
          color = plain ? '#fff' : '#333'
        } else if (type === 'btn-gray') {
          color = '#999'
        } else {
          if (plain) {
            color = colors[type]
          } else {
            color = '#fff'
          }
        }
      } else {
        color = colors[type] || colors.primary
      }
      return color;
    },
    getBgColor(type, plain) {
      return plain ? 'transparent' : this.getColorByType(type)
    },
    getColor(type, plain) {
      return this.getColorByType(type, true, plain)
    },
    initStyl(){
       const type = this.data.type;
       const plain = this.data.plain;
       this.setData({
         g_bg_color:this.getBgColor(type,plain),
         g_color: this.getColor(type, plain),
         g_border_color: this.getBgColor(type)
       })
    },
    handleClick() {
      this.triggerEvent('click', { index: this.data.index });
    }
  }
})
