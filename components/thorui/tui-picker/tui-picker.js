Component({
  properties: {
    //数据层级
    layer: {
      type: Number,
      optionalTypes: [String],
      value: 1
    },
    //data数据
    pickerData: {
      type: Array,
      value: [],
      observer(val) {
        this.initData(-1, 0, 0)
        setTimeout(() => {
          this.setDefaultOptions()
        }, 50)
      }
    },
    //是否显示
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {
        this.setData({
          visible: newVal
        })
      }
    },
    //默认值，text集合
    value: {
      type: Array,
      value: [],
      observer(vals) {
        if (vals && vals.length > 0) {
          this.setDefaultOptions()
        }
      }
    },
    //设置选择器中间选中框的样式
    indicatorStyle: {
      type: String,
      value: 'height: 48px;'
    },
    //设置蒙层的样式
    maskStyle: {
      type: String,
      value: ''
    },
    //是否显示圆角
    radius: {
      type: Boolean,
      value: false
    },
    //header背景色
    headerBgColor: {
      type: String,
      value: '#fff'
    },
    //显示标题
    title: {
      type: String,
      value: ''
    },
    //标题字体大小
    titleSize: {
      type: Number,
      optionalTypes: [String],
      value: 34
    },
    //标题字体颜色
    titleColor: {
      type: String,
      value: '#333'
    },
    //确认按钮文本
    confirmText: {
      type: String,
      value: '确定'
    },
    //确认按钮文本颜色
    confirmColor: {
      type: String,
      value: ''
    },
    //取消按钮文本
    cancelText: {
      type: String,
      value: '取消'
    },
    //取消按钮文本颜色
    cancelColor: {
      type: String,
      value: '#888'
    },
    //按钮字体大小
    btnSize: {
      type: Number,
      optionalTypes: [String],
      value: 32
    },
    //按钮字体是否加粗
    bold: {
      type: Boolean,
      value: true
    },
    //内容背景色
    backgroundColor: {
      type: String,
      value: '#fff'
    },
    //内容字体颜色
    color: {
      type: String,
      value: '#333'
    },
    //picker内容字体大小 px
    size: {
      type: Number,
      optionalTypes: [String],
      value: 16
    },
    //点击遮罩 是否可关闭
    maskClosable: {
      type: Boolean,
      value: true
    },
    //自定义参数
    params: {
      type: Number,
      optionalTypes: [String],
      value: 0
    },
    zIndex: {
      type: Number,
      optionalTypes: [String],
      value: 998
    }
  },
  data: {
    visible: false,
    vals: [0],
    layer1__data: [],
    layer2__data: [],
    layer3__data: [],
    timer: null,
    isEnd: true,
    g_confirmColor: (wx.$tui && wx.$tui.color.primary) || '#5677fc'
  },
  lifetimes: {
    attached: function () {
      this.initData(-1, 0, 0);
      setTimeout(() => {
        this.setDefaultOptions()
      }, 50)
      this.setData({
        visible: this.data.show
      })
    }
  },
  methods: {
    hidePicker() {
      this.setData({
        visible: false
      })
      this.triggerEvent('hide', {
        params: this.data.params
      })
    },
    maskClick() {
      if (!this.data.maskClosable) return;
      this.hidePicker()
    },
    getValue(key = 'text', layer = 1) {
      let vals = this.data.vals;
      let data = this.data.pickerData;
      let result = ''
      if (layer === 1) {
        result = data[vals[0]][key]
      } else if (layer == 2) {
        if (data[vals[0]].children) {
          result = data[vals[0]].children[vals[1]][key]
        }
      } else {
        if (data[vals[0]].children && data[vals[0]].children[vals[1]].children) {
          result = data[vals[0]].children[vals[1]].children[vals[2]][key]
        }
      }
      return result;
    },
    loop() {
      if (this.data.isEnd) {
        this.pickerChange()
      } else {
        setTimeout(() => {
          this.loop()
        }, 50);
      }
    },
    picker() {
      this.loop() 
      this.hidePicker()
    },
    pickerChange() {
      let text = [];
      let value = [];
      let result = '';
      if (this.data.pickerData.length > 0) {
        if (this.data.layer == 1) {
          text = this.getValue();
          value = this.getValue('value');
          result = text;
        } else if (this.data.layer == 2) {
          text = [this.getValue(), this.getValue('text', 2)];
          value = [this.getValue('value'), this.getValue('value', 2)];
          result = text.join('');
        } else {
          text = [this.getValue(), this.getValue('text', 2), this.getValue('text', 3)];
          value = [this.getValue('value'), this.getValue('value', 2), this.getValue('value', 3)];
          result = text.join('');
        }
      }
      this.triggerEvent('change', {
        text: text,
        value: value,
        index: this.data.vals,
        result: result,
        params: this.data.params
      })
    },
    toArr(data) {
      let arr = [];
      if (data && data.length > 0) {
        for (let item of data) {
          arr.push(item.text);
        }
      }
      return arr;
    },
    checkChildrenData(data, layer, index, idx) {
      let arr = [];
      if (layer === 1) {
        if (data[index])
          arr = data[index].children || [];
      } else {
        if (data[index] && data[index].children && data[index].children[idx])
          arr = data[index].children[idx].children || [];
      }
      return arr;
    },
    setDefaultOptions() {
      let textArr = this.data.value;
      let vals = [];
      if (this.data.layer1__data.length > 0 && textArr.length > 0) {
        textArr.forEach((item, idx) => {
          let index = this.data[`layer${idx+1}__data`].indexOf(item);
          if (idx === 0) {
            this.setData({
              layer2__data: this.toArr(this.checkChildrenData(this.data.pickerData, 1, index))
            })
          } else if (idx === 1) {
            this.setData({
              layer3__data: this.toArr(this.checkChildrenData(this.data.pickerData, 2, vals[0],
                index))
            })
          }
          if (index === -1) {
            vals.push(0)
          } else {
            vals.push(index)
          }
        })
      } else {
        if (this.data.layer == 1) {
          vals = [0]
        } else if (this.data.layer == 2) {
          vals = [0, 0];
          this.setData({
            layer2__data: this.toArr(this.checkChildrenData(this.data.pickerData, 1, 0))
          })
        } else {
          vals = [0, 0, 0];
          this.setData({
            layer2__data: this.toArr(this.checkChildrenData(this.data.pickerData, 1, 0)),
            layer3__data: this.toArr(this.checkChildrenData(this.data.pickerData, 2, 0,
              0))
          })
        }
      }
      this.setData({
        vals: vals
      })
    },
    initData(layer, index, idx) {
      let data = this.data.pickerData;
      if (!data || data.length === 0){
        this.setData({
          layer1__data:[],
          layer2__data:[],
          layer3__data: []
        })
        return;
      }
      if (this.data.layer == 1) {
        this.setData({
          layer1__data: this.toArr(data)
        })
      } else if (this.data.layer == 2) {
        let obj = {
          layer2__data: this.toArr(this.checkChildrenData(data, 1, index))
        }
        if (layer === -1)
          obj.layer1__data = this.toArr(data)

        this.setData(obj)
      } else {
        let obj = {
          layer3__data: this.toArr(this.checkChildrenData(data, 2, index, idx))
        }
        if (layer === -1)
          obj.layer1__data = this.toArr(data)
        if (layer === 0 || layer === -1)
          obj.layer2__data = this.toArr(this.checkChildrenData(data, 1, index))

        this.setData(obj)
      }
    },
    columnPicker: function (e) {
      let value = e.detail.value;
      if (this.data.layer == 1) {
        this.layer__one(value)
      } else if (this.data.layer == 2) {
        this.layer__two(value)
      } else {
        this.layer__three(value)
      }
    },
    layer__one(value) {
      if (this.data.vals[0] !== value[0]) {
        this.setData({
          vals: value
        })
      }
    },
    layer__two(value) {
      if (this.data.vals[0] !== value[0]) {
        this.initData(0, value[0])
        this.setData({
          vals: [value[0], 0]
        })
      } else {
        this.setData({
          vals: value
        })
      }
    },
    layer__three(value) {
      if (this.data.vals[0] !== value[0]) {
        this.initData(0, value[0], 0)
        this.setData({
          vals: [value[0], 0, 0]
        })
      } else if (this.data.vals[1] !== value[1]) {
        this.initData(0, value[0], value[1])
        this.setData({
          vals: [value[0], value[1], 0]
        })
      } else {
        this.setData({
          vals: value
        })
      }
    },
    pickstart(e) {
      clearTimeout(this.data.timer)
      this.data.isEnd = false;
      this.triggerEvent('pickstart', {
        params: this.data.params
      })
    },
    pickend(e) {
      this.data.timer = setTimeout(() => {
        this.data.isEnd = true;
      }, 100)
      this.triggerEvent('pickend', {
        params: this.data.params
      })
    }
  }
})