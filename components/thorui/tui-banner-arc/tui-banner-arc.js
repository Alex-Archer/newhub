Component({
  options: {
    virtualHost: true
  },
  properties: {
    height: {
      type: String,
      optionalTypes:[Number],
      value: 400
    },
    percent: {
      type: String,
      optionalTypes:[Number],
      value: 120,
      observer(val){
        this.setData({
          width:this.getPercent(val)
        })
      }
    },
    background: {
      type: String,
      value: ''
    }
  },
  lifetimes:{
    attached:function(){
      this.setData({
        width:this.getPercent(this.data.percent)
      })
    }
  },
  data: {
    width: 120
  },
  methods: {
    getPercent(val) {
      //最低值120，尽量传偶数值
      val = Number(val || 0)
      return val < 120 ? 120 : val
    }
  }
})
