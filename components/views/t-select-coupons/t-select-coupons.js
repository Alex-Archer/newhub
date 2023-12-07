
Component({
  properties: {
    couponList: {
      type: Array,
      value: [{}, {}, {}, {}, {}]
    },
    //控制显示
    show: {
      type: Boolean,
      value: false
    },
    page: {
      type: Number,
      value: 1
    }
  },
  data: {
    //webURL: "https://www.thorui.cn/wx"
    webURL: ""
  },
  methods: {
    close() {
      this.triggerEvent('close', {});
    },
    btnConfirm() {
      this.close();
    }
  }
})
