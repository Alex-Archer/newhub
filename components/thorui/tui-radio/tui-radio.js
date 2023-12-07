Component({
  options: {
    virtualHost: true
  },
  properties: {
    value: {
      type: String,
      value: ''
    },
    checked: {
      type: Boolean,
      value: false,
      observer(newVal) {
        this.setData({
          val: newVal
        })
      }
    },
    disabled: {
      type: Boolean,
      value: false
    },
    //radio选中背景颜色
    color: {
      type: String,
      value: ''
    },
    //radio未选中时边框颜色
    borderColor: {
      type: String,
      value: '#ccc'
    },
    //是否只展示对号，无边框背景
    isCheckMark: {
      type: Boolean,
      value: false
    },
    //对号颜色
    checkMarkColor: {
      type: String,
      value: '#fff'
    },
    scaleRatio: {
      type: Number,
      optionalTypes:[String],
      value: 1
    },
    //小鱼加
    padding: {
        type: String,
        value: '0'
      },
      margin: {
        type: String,
        value: '0'
      },
  },
  relations: {
    '../tui-radio-group/tui-radio-group': {
      type: 'ancestor'
    },
    '../tui-label/tui-label': {
      type: 'ancestor'
    }
  },
  lifetimes: {
    attached: function () {
      this.setData({
        val: this.data.checked
      })
    }
  },
  data: {
    val: false,
    g_color:(wx.$tui && wx.$tui.color.primary) || '#5677fc'
  },
  observers: {
    'val': function (newVal) {
      const group = this.getRelationNodes('../tui-radio-group/tui-radio-group')[0]
      if (newVal && group) {
        group.changeValue(this.data.value, this);
      }
    }
  },
  methods: {
    radioChange(e) {
      if (this.data.disabled || this.data.val) return;
      this.setData({
        val: true
      })
      this.triggerEvent('change', {
        checked: this.data.val,
        value: this.data.value
      })
    },
    labelClick() {
      this.radioChange()
    }
  }
})