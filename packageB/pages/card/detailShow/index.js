const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../utils/util.js')
var md5util = require('../../../../utils/md5.js')
const filter = require('../../../../utils/loginFilter'); 
var apis = require('../../../../utils/apis.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    balanceNum: '',
    couponSelectID: '', //优惠券的id
    referralCode: '', // 顾问码
    cla: '', // 卡项id
    loading: true,
    objData: {}, // 会员等级
    globalURL: app.globalData.globalURL,
    listData:[], // 列表信息
    messData: '', // 支付时使用的信息
    nowmoney: '', // 最后付钱金额
    inputNowMoney: '', // 金额
    selected: '', // 是否选中
    couponShow: false, 
    cuponPrice: '',
    typeListIndex: 0, //默认选中
    typeList: [
    ], //优惠券列表

    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,

    classTitle:'',

    countdown: '06', // 倒计时时间
    show: false,
    time: 6,
    agreeContent:'1.参与aoben shared yoga集训营的用户，具有完全的法律行为能力，同意遵守相关管理规章制度，应接受aoben shared yoga集训营的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守aoben shared yoga集训营的相关规定。1.参与aoben shared yoga集训营的用户，具有完全的法律行为能力，同意遵守相关管理规章制度，应接受aoben shared yoga集训营的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守aoben shared yoga集训营的相关规定。',
    //是否同意协议
    agreecheckbox:false,

  },
  // 获取优惠券
  getuserPackage(){
    let _timestamp = (new Date()).valueOf();
    let _config = {
      // 
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
      coursePackageType: this.data.typeid,
      coursePackageId: this.data.cla,
    }
    apis.get('/MarketingCenter/getUserCoupon', _config, {
      "Content-Type": 'applciation/json'
    }, true).then(res => {
      // 判断是否有优惠券
      if(!res){
        this.setData({
          getpackage: '0'
        })
      }else{
        this.setData({
          getpackage: '1'
        })
      }
      this.setData({
        typeList: res,
      })
    }).catch(err => {
      console.log(err);
    })
  },
  //关闭优惠选择
  couponTypeClose(e) {
    console.log(e);
    let that = this;
    let _detail = e.detail;
    if (_detail) {
      let _selectIndex = _detail.selectIndex;
      let _nowmoney = that.getNowmoney(this.data.nowmoney,that.data.typeList[_selectIndex].price);
      that.setData({
        couponShow: false,
        couponSwitch: true, //使用优惠
        typeListIndex: _selectIndex,
        cuponPrice: '￥'+Number(that.data.typeList[_selectIndex].price)/100+'',
        couponSelectID: that.data.typeList[_selectIndex].coupon_id,
        couponSelectTitle: "已选择" + that.data.typeList[_selectIndex].title + "兑换该课程",
        nowmoney: _nowmoney/100,
      })
    } else {
      this.setData({
        couponShow: false
      })
    }
  },
  // 使用瑜伽币折扣
  getyoga(nowdal,reduce){
    console.log("原价:"+nowdal,"瑜伽币价格:"+reduce);
    nowdal = Number(nowdal) - Number(reduce)
    if(nowdal<0){
      nowdal = 0
    }
    return nowdal
  },
  // 选择优惠券,进行相减。传现价和优惠券抵扣价格
  getNowmoney(nowdal,reduce){
    console.log("原价:"+nowdal,"优惠券价格:"+reduce);
    nowdal = Number(nowdal) - Number(reduce)
    if(nowdal<0){
      nowdal = 0
    }
    return nowdal
  },
  // 金额进行会员折扣,传现价和会员折扣
  getDiscountMoney(nowdal,discount){
    console.log("原价:"+nowdal,"折扣:"+discount);
    nowdal = (Number(nowdal) * Number(discount)).toFixed(2)
    if(nowdal<0){
      nowdal = 0
    }
    return nowdal
  },
  // 阅读
  handyue() {
    this.setData({
      show: false,
      countdown: '06', // 初始化值
      time: 6,
      agreecheckbox: true,
    })
  },
  //协议选框点击
  checkboxChange(e) {
    console.log(e.detail);
    let _agree = e.detail.value || [];
    this.setData({
      agreecheckbox: util.isNull(_agree) ? false : true,
    })
  },
  // 显示协议
  xieyiClick(e) {
    let intve = setInterval(() => {
      let minute = this.data.time;
      minute < 10 && minute > 0 ? minute = '0' + minute : '';
      this.setData({
        countdown: minute,
        time: this.data.time - 1
      })
      if (this.data.time < 0) {
        clearInterval(intve)
      }
    }, 1000);
    this.setData({
      show: true,
    })
  },
  // 获取顾问码
  inputEven(e) {
    this.setData({
      referralCode: e.detail
    })
  },
  // 获取瑜伽币
  inputMoney(e) {
    let _balanceNum = Number(e.detail)
    let _nowmoney = this.data.nowmoney
    let zongBalance = Number(this.data.objData.balance/100)
    if(_balanceNum>zongBalance){
      _balanceNum = zongBalance
    }
    let _inputNowMoney = this.getyoga(_nowmoney,_balanceNum)
    this.setData({
      inputNowMoney:_inputNowMoney,
      balanceNum: _balanceNum,
    })
  },
  //支付按钮
  btnPay(){
    // this.setData({
    //   nowmoney: this.data.inputNowMoney
    // })
    if(!this.data.agreecheckbox)
    {
      util.toast("请先阅读并接受会员卡协议",null,null,()=>{})
      return
    }
    let that = this;
    let _timestamp = (new Date()).valueOf();
    let _typeid = that.data.typeid;
    let _cla = that.data.cla;
    let _couponSelectID = that.data.couponSelectID;
    let _nowmoney = that.data.nowmoney*100;
    let _referralCode = that.data.referralCode;
    let _discountId = that.data.messData.id;
    let _totalBalance = that.data.balanceNum*100;
    let _config = {
      type: _typeid,
      coursePackageId:_cla,
      discountId: _discountId,
      couponIds: _couponSelectID,
      totalBalance: _totalBalance,
      checkPrice: _nowmoney,
      refereePhone: _referralCode,
      userID: wx.getStorageSync('USERID'),
      FKEY: md5util.md5(wx.getStorageSync('USERID') +_cla.toString()+_discountId.toString()+ _couponSelectID.toString()+_totalBalance.toString()+_nowmoney.toString()+_referralCode.toString()+ _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
      TIMESTAMP: _timestamp,
    }
    apis.posts('CardItemOrderApi/creatOrder',_config,true).then(async (res) =>{
      // this.getOrderStatu()
      const payRes = await util.wxPayment(res)
      console.log(payRes);
      if (payRes.errMsg == 'requestPayment:ok') {
        wx.showToast({
          title: '支付成功',
          duration: 1500
        });
        wx.navigateTo({
          url: '/packageA/pages/order/list/index', // 订单页面
        })
      }
    }).catch(err=>{
      console.log(err);
      // util.toast(err.data.message,null,null)
    })
  },
  // 订单支付完的查询
  getOrderStatu(){
    let _timestamp = (new Date()).valueOf();
    let _config = {
      coursePackageType:this.data.typeid,
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
    }
    apis.gets('CardItemOrderApi/getUserCardItem?',_config).then(res=>{
      console.log(res);
    })
  },
  initNavigation(e) {
    this.setData({
        top: e.detail.top
    })
  },
  xuanClick(e){
    let _obj = e.currentTarget.dataset.obj
    let index = e.currentTarget.dataset.index
    let money = ''
    money = this.getDiscountMoney(_obj.price,this.data.objData.discount);
    if(this.data.cuponPrice){
      money = this.getNowmoney(money,this.data.typeList[this.data.typeListIndex].price)
      // money = Number(money) - this.data.typeList[this.data.typeListIndex].price
    }
    this.setData({
      messData: _obj,
      nowmoney: money/100,
      selected:index
    })
    
  },
  courseDetail(val){
    let _config = {
      course_package_id: val
    }
    apis.get('/CoursePackage/discountbyPidPub', _config, {
      "Content-Type": 'applciation/json'
    }, false).then(obj => {
      let _list = []
      let active = ''
      let money = '' //显示总金额
      let selected = '' //选中最后一个
      selected = _.findLastIndex(obj, function(o) { return o.selected == true; });
      obj.forEach(el => {
        el.price = Number(el.price / 100)
        if(el.selected){
          active = el
          money = this.getDiscountMoney(el.price,this.data.objData.discount);
        }
        _list.push(el)
      });
      if(this.data.cuponPrice){
        money = this.getNowmoney(money,this.data.typeList[this.data.typeListIndex].price)
      }
      // 出现NAN是由于接口请求过慢
      if(isNaN(money)){
        wx.showToast({
          title: '网络波动，请刷新页面后重试',
          icon:'none'
        })
        return
      }
      this.setData({
        listData:_list,
        messData: active,
        nowmoney: money/100,
        selected: selected
      })
    })
  },
  // 获取会员等级
  getuserLV(){
    let _timestamp = (new Date()).valueOf()
    let _config = {
      userID: wx.getStorageSync('USERID'),
      FKEY: md5util.md5(wx.getStorageSync('USERID') +  _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
      TIMESTAMP: _timestamp,
    }
    apis.get('/CoursePackage/getUserGrade', _config, {
      "Content-Type": 'applciation/json'
    }, true).then(obj => {
      // integral == 0是普通用户
      this.setData({
        objData:obj
      })
      // 获取到等级后,再调用其他接口
      this.courseDetail(this.data.cla);
    }).catch(err => {
    })
  },
  
  // 优惠券
  moreClick(){
    this.setData({
      couponShow: true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let _cla = options.cla||0;
    let _title = options.title;
    let _typeid = options.typeid;
    if(!util.isNull(_cla)&&_cla!=0)
    {
      this.setData({
        classTitle:_title,
        cla:_cla,
        typeid:_typeid,
        loading: false, // 骨架屏
      })
      this.getuserLV();
      this.getuserPackage();
    }else{
      wx.showToast({
        title: '请刷新页面后重试',
        icon: "none"
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  scanCode(e){
     wx.scanCode({
      onlyFromCamera: false, //禁止相册
      scanType: ['qrCode'], //只识别二维码
      success: (res) => {
          // 获取到扫描到的二维码内容
          const qrCodeContent = res.result;
   
      },
      fail: (error) => {
          console.log('扫描失败', error);
      }
    })
  }

})