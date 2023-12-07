Component({
  properties: {
    //显示文本
    text: {
      type: String,
      value: "正在加载..."
    },
    //loading 样式 ：1,2,3
    index: {
      type: Number,
      value: 1,
      observer(val){
        this.getBorderColor()
      }
    },
    //颜色设置，只有index=3时生效：primary，red，orange，green
    type: {
      type: String,
      value: "",
      observer(val){
        this.getBorderColor()
      }
    }
  },
  data:{
    borderColor:'transparent'
  },
  lifetimes:{
    attached:function(){
      this.getBorderColor()
    }
  }, 
  methods:{
    getBorderColor() {
      let color = 'transparent'
      if (this.data.index == 3 && this.data.type) {
        const global = wx.$tui && wx.$tui.color;
        color = {
          'primary': (global && global.primary) || '#5677fc',
          'red': (global && global.danger) || '#EB0909',
          'orange': (global && global.warning) || '#ff7900',
          'green': (global && global.success) || '#07c160'
        } [this.data.type]
      }
      this.setData({
        borderColor: color
      })
    }
  }
})