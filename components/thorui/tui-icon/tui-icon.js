Component({
  externalClasses:['tui-icon-class'],
  options: {
    addGlobalClass: true
  },
  properties: {
    name: {
      type: String,
      value: ''
    },
    customPrefix: {
      type: String,
      value: ''
    },
    size: {
      type: Number,
      optionalTypes:[String],
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
    index: {
      type: Number,
      value: 0
    }
  },
  data: {
    g_color:wx.$tui && wx.$tui.tuiIcon.color,
    g_size:wx.$tui && wx.$tui.tuiIcon.size,
    g_unit: wx.$tui && wx.$tui.tuiIcon.unit
  },
  methods: {
    handleClick() {
      this.triggerEvent('click', {
        index: this.data.index
      });
    }
  }
})