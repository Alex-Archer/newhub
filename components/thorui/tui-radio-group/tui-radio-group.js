Component({
  behaviors: ['wx://form-field-group'],
  properties: {
    name: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: '',
      observer(val) {
        this.modelChange(val)
      }
    }
  },
  relations: {
    '../tui-radio/tui-radio': {
      type: 'descendant',
      linked: function (target) {
        this.data.childrens.push(target)
        if (this.data.value) {
          target.setData({
            val: this.data.value === target.data.value
          })
        }
      }
    }
  },
  data: {
    val: '',
    childrens: []
  },
  methods: {
    radioChange(e) {
      this.triggerEvent('change', e)
      this.setData({
        value: e.value
      })
      //留着此方法，只是为了统一其他框架写法，可以忽略
      this.triggerEvent('input', e.value)
    },
    changeValue(value, target) {
      if(this.data.val===value) return;
      this.setData({
        val: value
      })
      this.data.childrens.forEach(item => {
        if (item !== target) {
          item.setData({
            val: false
          })
        }
      })
      let e = {
        value: value
      }
      this.radioChange(e)
    },
    modelChange(value) {
      this.data.childrens.forEach(item => {
        if (item.data.value === value) {
          item.setData({
            val: true
          })
        } else {
          item.setData({
            val: false
          })
        }
      })
    }
  }
})