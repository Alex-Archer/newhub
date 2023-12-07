Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    list: {
      type: Array,
      value: [],
      observer(val) {
        this.initData(val)
      }
    },
    height: {
      type: Number,
      optionalTypes: [String],
      value: 600
    },
    radius: {
      type: Number,
      optionalTypes: [String],
      value: 24
    },
    title: {
      type: String,
      value: '请选择'
    },
    titleSize: {
      type: Number,
      optionalTypes: [String],
      value: 32
    },
    titleColor: {
      type: String,
      value: '#333'
    },
    fontWeight: {
      type: Number,
      optionalTypes: [String],
      value: 400
    },
    multiple: {
      type: Boolean,
      value: false
    },
    background: {
      type: String,
      value: '#fff'
    },
    padding: {
      type: String,
      value: '30rpx'
    },
    //选择框选中后颜色
    checkboxColor: {
      type: String,
      value: ''
    },
    borderColor: {
      type: String,
      value: '#ccc'
    },
    isCheckMark: {
      type: Boolean,
      value: false
    },
    checkmarkColor: {
      type: String,
      value: '#fff'
    },
    reverse: {
      type: Boolean,
      value: false
    },
    dividerLine: {
      type: Boolean,
      value: true
    },
    dividerColor: {
      type: String,
      value: '#EEEEEE'
    },
    bottomLeft: {
      type: Number,
      optionalTypes: [String],
      value: 30
    },
    highlight: {
      type: Boolean,
      value: true
    },
    iconWidth: {
      type: Number,
      optionalTypes: [String],
      value: 48
    },
    //v2.9.0+
    iconBgColor:{
      type:String,
      value:'#F8F8F8'
    },
    size: {
      type: Number,
      optionalTypes: [String],
      value: 30
    },
    color: {
      type: String,
      value: '#333'
    },
    btnText: {
      type: String,
      value: '确定'
    },
    btnBackground: {
      type: String,
      value: ''
    },
    btnColor: {
      type: String,
      value: '#fff'
    },
    maskBackground: {
      type: String,
      value: 'rgba(0,0,0,.6)'
    },
    maskClosable: {
      type: Boolean,
      value: false
    },
    zIndex: {
      type: Number,
      optionalTypes: [String],
      value: 1000
    }

  },
  data: {
    itemList: [],
    index: -1,
    g_primary:(wx.$tui && wx.$tui.color.primary) || '#5677fc'
  },
  lifetimes: {
    attached: function () {
      this.initData(this.data.list)
    }
  },
  methods: {
    initData(vals) {
      vals = JSON.parse(JSON.stringify(vals))
      if (vals && vals.length > 0) {
        if (typeof vals[0] !== 'object') {
          vals = vals.map(item => {
            return {
              text: item,
              checked: false,
              disabled: false
            }
          })
        } else {
          vals.map((item, index) => {
            item.checked = item.checked || false
            if (!this.data.multiple && item.checked) {
              this.setData({
                index: index
              })
            }
          })
        }
        this.setData({
          itemList: vals
        })
      }
    },
    itemClick(e) {
      let index = Number(e.currentTarget.dataset.index)
      let vals = [...this.data.itemList]
      let item = vals[index]
      if(item && item.disabled) return;
      if (this.data.multiple) {
        item.checked = !item.checked;
      } else {
        vals.forEach((item, idx) => {
          if (index === idx) {
            item.checked = true
          } else {
            item.checked = false
          }
        })
        this.setData({
          index: index
        })
      }
      this.setData({
        itemList: vals
      })
    },
    handleClick() {
      if (this.data.multiple) {
        let items = []
        this.data.itemList.forEach((item, idx) => {
          if (item.checked) {
            items.push(this.data.list[idx])
          }
        })
        this.triggerEvent('confirm', {
          options: items
        })
      } else {
        let index = this.data.index;
        this.triggerEvent('confirm', {
          index: index,
          options: index === -1 ? '' : this.data.list[index]
        })
      }

    },
    maskClose() {
      if (!this.data.maskClosable) return;
      this.handleClose()
    },
    handleClose() {
      this.triggerEvent('close', {})
    },
    stop() {}
  }
})