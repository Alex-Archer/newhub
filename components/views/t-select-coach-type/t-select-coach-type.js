
Component({
  properties: {
    typeList: {
      type: Array,
      value: []
    },
    typeListIndex: {
      type: Number,
      value: 0,
      observer(newVal) {
        //属性的 observer监听器
        this.initData() //1.必须，不然选项也不会默认选中
      }
    },    
    //控制显示
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {//属性的 observer监听器
        this._setIndex()////2.必须，不然选项也不会默认选中
        
      }
    },
    page: {
      type: Number,
      value: 1
    }
  },
  data: {
    selectIndex:0,
    tempIndex:0,//只是选择，但是没有确定时
  },
  //定义生命周期
  lifetimes: {
    //// 在组件实例进入页面节点树时执行
    attached: function () {
      this.initData()
    },
    //// 在组件实例被从页面节点树移除时执行
    detached: function() {
    },
  },
  //数据监听器  数据监听器和属性的 observer 相比，数据监听器更强大且通常具有更好的性能。
  //https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/observer.html
  observers: {
    /*
    //'type,minDate,maxDate,initStartDate,initEndDate': function (type, minDate, maxDate) {
    'typeListIndex': function (typeListIndex) { 
      console.log("000000000000数据有变"+typeListIndex)
      this.setData({
        lastSelectIndex:typeListIndex
      })
    },
    */
  },
  
  methods: {
    _setIndex()
    {
      //妈的必须放在这里，不然点选其它项后并未提交，但是重开后还是点选未提交的
      this.setData({
        selectIndex:this.data.selectIndex
      })
      // console.log("333333333_"+this.data.lastSelectIndex)
      // console.log("44444444_"+this.data.typeListIndex)
      //console.log("888888_"+this.data.selectIndex)
    },
    initData() {
      //console.log("666666666",this.data.typeListIndex)
      this.setData({
        selectIndex:this.data.typeListIndex
      })
    },
    radiochange(e){
      //console.log(JSON.stringify(e))
      let that = this;
      //{"type":"change","timeStamp":117880,"target":{"id":"","offsetLeft":0,"offsetTop":10,"dataset":{}},"currentTarget":{"id":"","offsetLeft":0,"offsetTop":10,"dataset":{}},"mark":{},"detail":{"value":"0"},"mut":false,"_userTap":true}
      let index = e.detail.value || that.data.tempIndex;
      console.log(index)
      that.setData({
        tempIndex:index
      })
    },
    close() {
      this.triggerEvent('close');
    },
    btnConfirm(e) {
      let that = this;

      let sIndex = that.data.tempIndex;
      //this.close();
      this.triggerEvent('close', {
        selectIndex:sIndex
      });
    }
  }
})
