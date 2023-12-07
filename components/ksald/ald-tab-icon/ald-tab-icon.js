Component({
  externalClasses: ['ald-tab-icon'],
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 索引
    index: {
      type: Number,
      value: 0
    },
    // 图标名称
    name: {
      type: String,
      value: ''
    },
    // 自定议class名称
    customClass: {
      type: String,
      value: ''
    },
    size: {
      type: Number,
      optionalTypes: [String],
      value: 0
    },
    
    //px或者rpx
    unit: {
      type: String,
      value: ''
    },
    //小鱼加，文字
    content: {
      type: String,
      value: ''
    },
    // 内容文字大小
    contentsize: {
      type: Number,
      optionalTypes: [String],
      value: 0
    },    
    //内容文字大小单位
    contentunit: {
      type: String,
      value: ''
    }, 
    contentpadding: {
      type: String,
      value: '0'
    },  
    contentmargin: {
      type: String,
      value: "0"
    },  

    padding: {
      type: String,
      value: '0'
    },
    color: {
      type: String,
      value: ''
    },
    bold: {
      type: Boolean,
      value: false
    },
    margin: {
      type: String,
      value: "0"
    },


  },

  /**
   * 组件的初始数据
   */
  data: {
    g_color: wx.$tui && wx.$tui.tuiIcon.color,
    g_size: wx.$tui && wx.$tui.tuiIcon.size,
    g_unit: wx.$tui && wx.$tui.tuiIcon.unit
    // g_color:"#ccc",
    // g_size:12,
    // g_unit: "px"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleClick() {
      //返给调用页的 bind:tap="handleClickSB" ，"detail":{"index":得到this.data.index}
      //{"type":"tap","timeStamp":2650,"target":{"id":"","dataset":{}},"currentTarget":{"id":"","dataset":{}},"mark":{},"detail":{"index":9999},"mut":false}
      this.triggerEvent('click', {
        index: this.data.index
      });
      this.triggerEvent('tap', {
        index: this.data.index
      });      
    }
  }
})