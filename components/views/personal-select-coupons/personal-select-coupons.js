import _ from '../../../libs/we-lodash'
Component({
  properties: {
    usingCoupons:{
      type:Boolean,
      value:false,
      observer(newVal) {
        //属性的 observer监听器
        this.initData() //1.必须，不然选项也不会默认选中
      }
    },
    couponsList: {
      type: Array,
      value: []
    },
    // couponsListIndex: {
    //   type: Number,
    //   value: 0,
    //   observer(newVal) {
    //     //属性的 observer监听器
    //     this.initData() //1.必须，不然选项也不会默认选中
    //   }
    // },    
    // //控制显示
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {//属性的 observer监听器
        //this._setIndex()////2.必须，不然选项也不会默认选中
        this.initData() //1.必须，不然选项也不会默认选中
        
      }
    },
    // page: {
    //   type: Number,
    //   value: 1
    // }
  },
  data: {
    //radioValue:-1,//不使用优惠券 默认没选中 1为选中
    useCoupons:false,//使用优惠券
    //selectDetailList:[],//选中的券


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
    // _setIndex()
    // {
    //   //妈的必须放在这里，不然点选其它项后并未提交，但是重开后还是点选未提交的
    //   this.setData({
    //     selectIndex:this.data.selectIndex
    //   })
    //   // console.log("333333333_"+this.data.lastSelectIndex)
    //   // console.log("44444444_"+this.data.typeListIndex)
    //   //console.log("888888_"+this.data.selectIndex)
    // },
    initData() {
      //console.log("666666666",this.data.usingCoupons.toString())
      let _usingCoupons = this.data.usingCoupons;

      if(!_usingCoupons){
        let tempArr =this.data.couponsList;//临时数组
        _.each(tempArr, (x,index) => {//全部不选中
            x.checked=false;
        });
        this.setData({
          useCoupons:false,
          couponsList:tempArr,
        })
      }else{
        this.setData({
          useCoupons:true
        })
      }

    },
    //
    radiochange(e){
      console.log(JSON.stringify(e))
      let that = this;
      let _value = e.detail.value;
      if(_value=="notUseCoupons")
      {
        let tempArr =this.data.couponsList;//临时数组
        //console.log(JSON.stringify(tempArr));
        _.each(tempArr, x => {//全部不选了
            x.checked= false
        });
  
        that.setData({
          useCoupons:false,
          selectDetailList:[],//没有列表了
          couponsList:tempArr
        })

      }


    },
    _modifyDetailList(selectArr){
      let tempArr =this.data.couponsList;//临时数组
      let that = this;
      _.each(tempArr, (x,index) => {
          //是否选中
          //console.log(index+"_"+_.includes(selectArr, ""+index+"").toString());
          x.checked=_.includes(selectArr, ""+index+"");//存在则true 反之false
      });
      that.setData({
        couponsList:tempArr
      })
    },
    checkboxChange(e){
      let that = this;
      //{"type":"change","timeStamp":283038,"target":{"id":"checkboxGroup","offsetLeft":0,"offsetTop":64,"dataset":{}},"currentTarget":{"id":"checkboxGroup","offsetLeft":0,"offsetTop":64,"dataset":{}},"mark":{},"detail":{"value":[]},"mut":false,"_userTap":true}
      let selectDetailID = e.detail.value;
      
      if(selectDetailID&&selectDetailID.length>0){
        console.log(JSON.stringify(selectDetailID));
        this._modifyDetailList(selectDetailID);
        that.setData({
          useCoupons:true,
          selectDetailList:selectDetailID,//有列表了
        })
      }else{
        console.log("都不选了");
        let tempArr =this.data.couponsList;//临时数组
        _.each(tempArr, (x,index) => {//全部不选中
            x.checked=false;
        });
        that.setData({
          useCoupons:false,
          selectDetailList:[],//没有列表了
          selectDetailList:tempArr,
        })
      }

    },
    close() {
      this.triggerEvent('close');
    },
    btnConfirm(e) {
      //let tempArr =this.data.couponsList
      console.log(JSON.stringify(this.data.couponsList));
      //let that = this;

      //let sIndex = that.data.tempIndex;
      //this.close();
      this.triggerEvent('close', {
        //selectIndex:sIndex
        returnCoupons:this.data.couponsList
      });
    }
  }
})
