Component({
  externalClasses: ['tui-badge-class'],
  properties: {
    //primary,warning,green,danger,white，black，gray,white_red 
    type: {
      type: String,
      value: 'primary',
      observer(val){
        this.getBackground()
        this.getColor()
      }
    },
    //是否是圆点
    dot: {
      type: Boolean,
      value: false
    },
    margin: {
      type: String,
      value: '0'
    },
    //是否绝对定位
    absolute: {
      type: Boolean,
      value: false
    },
    top: {
      type: String,
      value: '-8rpx'
    },
    right: {
      type: String,
      value: '0'
    },
    //缩放比例
    scaleRatio: {
      type: Number,
      value: 1
    },
    //水平方向移动距离
    translateX: {
      type: String,
      value: '0'
    }
  },
  data:{
    g_typecolor:'',
    g_color: ''
  },
  lifetimes:{
     attached:function(){
       this.getBackground()
       this.getColor()
     }
  },
  methods: {
    getBackground() {
      const global = wx.$tui && wx.$tui.color;
      
      let color = {
        'primary': (global && global.primary) || '#5677fc',
        'green': (global && global.success) || '#07c160',
        'warning': (global && global.warning) || '#ff7900',
        'danger': (global && global.danger) || '#EB0909',
        'white': '#fff',
        'black': '#000',
        'gray': '#ededed',
        'red': (global && global.pink) || '#f74d54',
        'pink': (global && global.pink) || '#f74d54',
        'white_red': '#fff',
        'white_primary': '#fff',
        'white_green': '#fff',
        'white_warning': '#fff',
        'white_pink': '#fff'
      } [this.data.type]
      this.setData({
        g_typecolor: color
      })
    },
    getColor() {
      const global = wx.$tui && wx.$tui.color;
      let color = {
        'primary': '#fff',
        'green': '#fff',
        'warning': '#fff',
        'danger': '#fff',
        'white': '#333',
        'black': '#fff',
        'gray': '#999',
        'red': '#fff',
        'pink': (global && global.pink) || '#f74d54',
        'white_red': (global && global.danger) || '#EB0909',
        'white_primary': (global && global.primary) || '#5677fc',
        'white_green': (global && global.success) || '#07c160',
        'white_warning': (global && global.warning) || '#ff7900',
        'white_pink': (global && global.pink) || '#f74d54',
      } [this.data.type]
      this.setData({
        g_color: color
      })
    },
    handleClick() {
      this.triggerEvent('click', {});
    }
  }
})