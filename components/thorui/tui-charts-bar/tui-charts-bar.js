Component({
  properties: {
    //图表宽度 rpx
    width: {
      type: Number,
      optionalTypes:[String],
      value: 600
    },
    //图例，说明
    legend: {
      type: Object,
      value: {
        show: false,
        size: 24,
        color: '#333'
      }
    },
    tooltip: {
      type: Boolean,
      value: false
    },
    //x轴数据，如果不传则默认使用min,max值计算
    // {
    // 	value: 0,
    // 	color: "#a0a0a0"
    // }
    xAxis: {
      type: Array,
      value: [],
      observer(newVal) {
        this.init()
      }
    },
    //x轴最小值
    min: {
      type: Number,
      value: 0
    },
    //x轴最大值
    max: {
      type: Number,
      value: 100
    },
    //x轴分段递增数值 
    splitNumber: {
      type: Number,
      value: 20
    },
    //分割线
    splitLine: {
      type: Object,
      value: {
        //分割线颜色,不显示则将颜色设置为transparent
        color: "#e3e3e3",
        type: "dashed"
      }
    },
    xAxisLineColor: {
      type: String,
      //不显示则将颜色设置为transparent
      value: '#e3e3e3'
    },
    xAxisLabel: {
      type: Object,
      value: {
        show: true,
        color: "#333",
        size: 24
      }
    },
    yAxis: {
      type: Array,
      value: []
    },
    //柱状条高度
    columnBarHeight: {
      type: Number,
      optionalTypes:[String],
      value: 32
    },
    //y轴刻度线
    yAxisTick: {
      type: Object,
      value: {
        width: '12rpx',
        //不显示则将颜色设置为transparent
        color: '#e3e3e3'
      }
    },
    //y轴线条
    yAxisLine: {
      type: Object,
      value: {
        color: '#e3e3e3',
        //y轴item的padding值
        itemPadding: '30rpx 0'
      }
    },
    yAxisLabel: {
      type: Object,
      value: {
        show: true,
        color: "#333",
        size: 24
      }
    },
    yAxisVal: {
      type: Object,
      value: {
        show: true,
        color: "#333",
        size: 24
      }
    },
    //默认选中y轴索引
    currentIndex: {
      type: Number,
      value: -1,
      observer(newVal) {
        if (newVal != this.data.activeIndex) {
          this.setData({
            activeIndex: newVal
          })
        }
      }
    },
    //是否堆叠展示
    isStack: {
      type: Boolean,
      value: false
    },
    //柱状条点击效果：1-出现背景，2-高亮显示，其他变暗 3-无效果
    clickEffect: {
      type: Number,
      value: 1
    },
    /*
    	 柱状条的端点样式
    	 round	向线条的每个末端添加圆形线帽
    	 square	向线条的每个末端添加正方形线帽
    	*/
    columnCap: {
      type: String,
      value: 'square'
    },
    isMinus: {
      type: Boolean,
      value: true
    }
  },
  data: {
    sections: 0,
    xAxisData: [],
    activeIndex: -1,
    activeIdx: -1,
    tooltips: [],
    tooltipShow: false,
    timer: null,
    xAxisValArr: [],
    leftArr: [],
    /*========options============*/
    /*
      name: '', 
      color: '',
      source: []
      colorFormatter:Function
    */
    dataset: [],
    yAxisValFormatter: null,
    maxValue: 1
  },
  lifetimes: {
    attached: function () {
      this.init()
      this.setData({
        activeIndex: this.data.currentIndex
      })
    },
    detached: function () {
      this.clearTimer()
    }
  },
  methods: {
    generateArray(start, end) {
      return Array.from(new Array(end + 1).keys()).slice(start);
    },
    getXAxisVal(index) {
      let showVal = '';
      let val = 0;
      if (this.data.dataset.length === 1) {
        val = this.data.dataset[0].source[index]
        showVal = val;
      } else if (this.data.dataset.length > 1) {
        let arr = []
        this.data.dataset.forEach(item => {
          arr.push(item.source[index])
        })
        val = arr
      }
      if (this.data.yAxisVal.formatter && typeof this.data.yAxisVal.formatter === 'function') {
        showVal = this.data.yAxisVal.formatter(val)
      } else if (this.data.yAxisValFormatter && typeof this.data.yAxisValFormatter === 'function') {
        showVal = this.data.yAxisValFormatter(val)
      }
      return showVal
    },
    getBarColor(val, color, colorFormatter) {
      let bgColor = color;
      if (colorFormatter && typeof colorFormatter === 'function') {
        let formatColor = colorFormatter(val)
        if (formatColor) {
          bgColor = formatColor
        }
      }
      return bgColor
    },
    getLeft(index) {
      let arr = [0]
      let total = 0
      this.data.dataset.forEach(item => {
        arr.push(item.source[index])
        total += item.source[index]
      })
      return (((this.data.isStack ? total : Math.max(...arr)) - this.data.min) / (this.data.maxValue - this.data.min)) * this.data.width + 'rpx'
    },
    init() {
      let sections = this.data.xAxis.length - 1;
      let xAxis = this.data.xAxis;
      if (sections <= 0) {
        sections = Math.ceil((this.data.max - this.data.min) / this.data.splitNumber)
        let sectionsArr = this.generateArray(0, sections)
        xAxis = sectionsArr.map(item => {
          return {
            value: item * this.data.splitNumber + this.data.min
          }
        })
      }
      this.setData({
        maxValue: sections <= 0 ? xAxis[xAxis.length - 1].value : this.data.max
      })
      let xAxisValArr = []
      let leftArr = []
      this.data.yAxis.forEach((item, index) => {
        xAxisValArr.push(this.getXAxisVal(index))
        leftArr.push(this.getLeft(index))
      })
      let dataset = [...this.data.dataset]
      dataset.map((item, index) => {
        let source = [...item.source]
        item.colors = source.map((val, idx) => {
          return this.getBarColor(val, item.color, item.colorFormatter)
        })
      })
      this.setData({
        dataset: dataset,
        xAxisValArr: xAxisValArr,
        leftArr: leftArr,
        xAxisData: xAxis,
        sections: sections + 1
      })
    },
    clearTimer() {
      clearTimeout(this.data.timer)
      this.data.timer = null;
    },
    tooltipHandle(index) {
      let data = [...this.data.dataset]
      let tooltips = []
      data.forEach(item => {
        let color = item.color;
        if (item.colorFormatter && typeof item.colorFormatter === 'function') {
          color = item.colorFormatter(item.source[index])
        }
        tooltips.push({
          color: color,
          name: item.name,
          val: item.source[index]
        })
      })
      this.clearTimer()
      this.setData({
        tooltips: tooltips,
        tooltipShow: true
      })
      this.data.timer = setTimeout(() => {
        this.setData({
          tooltipShow: false
        })
      }, 5000)
    },
    onBarTap(e) {
      const dataset = e.currentTarget.dataset;
      const index = Number(dataset.index)
      const idx = Number(dataset.idx)
      this.setData({
        activeIndex: index,
        activeIdx: idx
      })
      this.tooltipHandle(index);
      this.triggerEvent('click', {
        datasetIndex: idx,
        sourceIndex: index,
        ...this.data.dataset[idx]
      })
    },
    /*
    dataset：柱状图表数据
    yAxisValFormatter :格式化柱状条顶部value值（此处传值是为了做兼容处理）
    */
    draw(dataset, yAxisValFormatter) {
      this.data.yAxisValFormatter = yAxisValFormatter || null;
      this.setData({
        dataset: dataset || []
      })
      this.init();
    }
  }
})