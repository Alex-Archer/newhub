Component({
  options: {
    multipleSlots: true
  },
  properties: {
    //显示指定日期：2022-10-01 或 2022/10/01
    value: {
      type: String,
      value: '',
      observer(val) {
        if (val) {
          this.initDate(val)
        }
      }
    },
    background: {
      type: String,
      value: '#fff'
    },
    weekSize: {
      type: String,
      optionalTypes: [Number],
      value: 26
    },
    weekColor: {
      type: String,
      value: '#888'
    },
    dateSize: {
      type: String,
      optionalTypes: [Number],
      value: 34
    },
    dateColor: {
      type: String,
      value: '#333'
    },
    activeColor: {
      type: String,
      value: '#fff'
    },
    activeBackground: {
      type: String,
      value: ''
    },
    arrow: {
      type: Boolean,
      value: true
    },
    arrowColor: {
      type: String,
      value: ''
    }
  },
  data: {
    weeksArr: [],
    activeDate: '',
    g_primary: (wx.$tui && wx.$tui.color.primary) || '#5677fc'
  },
  lifetimes: {
    attached: function () {
      this.initDate(this.data.value)
    }
  },
  methods: {
    //初始化显示日期
    initDate(date) {
      let d = []
      if (date) {
        d = date.replace(/\-/g, '/').split('/')
      } else {
        let now = new Date();
        d = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
      }
      let year = Number(d[0])
      let month = Number(d[1])
      let day = Number(d[2])
      this.setData({
        activeDate: `${year}-${this.formatNum(month)}-${this.formatNum(day)}`
      })
      this.getWeekArr(year, month, day)
    },
    formatNum: function (num) {
      return num < 10 ? '0' + num : num + '';
    },
    //返回星期0-6 星期日-星期六
    getWeekday(year, month, day) {
      let date = new Date(`${year}/${month}/${day} 00:00:00`);
      return date.getDay();
    },
    getDate(date, d) {
      let dd = new Date(date)
      let timestamp = new Date(dd).setDate(dd.getDate() + d)
      let nd = new Date(timestamp)
      return [nd.getFullYear(), nd.getMonth() + 1, nd.getDate()]
    },
    getWeeksArr(date, arr) {
      let weeksArr = []
      let weeks = ['一', '二', '三', '四', '五', '六', '日'];
      arr.forEach((item, index) => {
        let d = this.getDate(date, item)
        weeksArr.push({
          year: d[0],
          month: d[1],
          day: d[2],
          week: weeks[index],
          date: `${d[0]}-${this.formatNum(d[1])}-${this.formatNum(d[2])}`
        })
      })
      return weeksArr
    },
    getWeekArr(year, month, day) {
      let weekday = this.getWeekday(year, month, day)
      let arr = [
        [-6, -5, -4, -3, -2, -1, 0],
        [0, 1, 2, 3, 4, 5, 6],
        [-1, 0, 1, 2, 3, 4, 5],
        [-2, -1, 0, 1, 2, 3, 4],
        [-3, -2, -1, 0, 1, 2, 3],
        [-4, -3, -2, -1, 0, 1, 2],
        [-5, -4, -3, -2, -1, 0, 1]
      ][weekday]
      let date = `${year}/${month}/${day} 00:00:00`
      this.setData({
        weeksArr: this.getWeeksArr(date, arr)
      })
    },
    nextWeek() {
      let item = this.data.weeksArr[this.data.weeksArr.length - 1]
      let date = `${item.year}/${item.month}/${item.day} 00:00:00`
      let d = this.getDate(date, 1)
      this.setData({
        weeksArr: this.getWeeksArr(`${d[0]}/${d[1]}/${d[2]} 00:00:00`, [0, 1, 2, 3, 4, 5, 6])
      })
    },
    prevWeek() {
      let item = this.data.weeksArr[0]
      let date = `${item.year}/${item.month}/${item.day} 00:00:00`
      let d = this.getDate(date, -1)
      this.setData({
        weeksArr: this.getWeeksArr(`${d[0]}/${d[1]}/${d[2]} 00:00:00`, [-6, -5, -4, -3, -2, -1, 0])
      })
    },
    dateClick(e) {
      let index=Number(e.currentTarget.dataset.index)
      let item = this.data.weeksArr[index]
      this.setData({
        activeDate: item.date
      })
      this.triggerEvent('click', item)
    }
  }
})