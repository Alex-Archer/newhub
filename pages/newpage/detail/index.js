// pages/newpage/detail/index.js
const app = getApp();
var apis = require('../../../utils/apis.js')
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    loading: true, // 骨架屏
    editCourse:{}, // 课程详情的全部信息
    loadingData: true, // 卡列表加载中
    resulut: '', // 选择卡后展示的名称
    orderNumber: '', // 卡的订单编号(不懂为啥用这个传)
    typeid: '', // 是团课还是私教的 1是团课,2是私教
    // 弹框
    popupShow: false, 
    globalURL: app.globalData.globalURL,
    //轮播主件
    topBanner: [
      // app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721",
      // app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721",
      // app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721"
    ],
    cardList: [],
    removeGradient: false,
    rulearrow: false,
    agreecheckbox:false, // 协议同意
    countdown: '06', // 倒计时时间
    show: false,
    time: 6,
  },
  
  btnyuyue(){
    if(!this.data.agreecheckbox){
      util.toast("请先阅读并接受会员卡协议",null,null,()=>{
        this.setData({
          removeGradientContent:true,//展开协议
        },()=>{
          //移动到底部
          wx.createSelectorQuery().select('.agree-label').boundingClientRect(function (rect) {
            // 使页面滚动到底部
            wx.pageScrollTo({
              scrollTop: rect.bottom
            })
          }).exec();
        })
      })
      return
    }
    let _timestamp = (new Date()).valueOf();
    if(!_orderNumber){
      wx.showToast({
        title: '请先选择课卡进行预约',
        icon: 'none',
      })
      return
    }
    let _orderNumber = this.data.orderNumber
    let _arrangeCourseId = this.data.editCourse.id
    let _resDate = this.getNowDate()
    let _resTime = this.getNowTime()
    let _config = {
      arrangeCourseId:_arrangeCourseId,
      orderNumber:_orderNumber,
      resDate:_resDate,
      resTime:_resTime,
      userID: wx.getStorageSync('USERID'),
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _arrangeCourseId + _orderNumber + _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
      TIMESTAMP: _timestamp,
    }
    apis.posts('bookedClass/bookGroupCourse',_config,true).then(res => {
      wx.navigateTo({
        url: '/packageA/pages/myCourse/index/index',
      })
    }).catch(err => {
      wx.showToast({
        title: err.message,
        icon: 'none',
      })
    })
  },
  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    const _cardList = this.data.cardList
    let _setData = e.detail.value.split("_")
    let _orderNumber= _setData[0]
    let resulut= _setData[1]
    this.setData({
      resulut,
      orderNumber:_orderNumber,
      cardList:_cardList
    })
  },
  // 已购卡
  getCardList(){
    this.setData({
      loadingData: true,
    })
    let _timestamp = (new Date()).valueOf();
    let _coursePackageType = this.data.typeid
    let _config={
      userID: wx.getStorageSync('USERID'),
      coursePackageType: _coursePackageType.toString(),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
    }
    let _time = (new Date().getTime())
    apis.get('/CardItemOrderApi/getUserCardItem',_config,{
      "Content-Type": 'applciation/json'
    },true).then(val => {
      val.forEach(el => {
        // 算出剩余多少节
        el.remaining = el.course_quantity - el.course_used_quantity 
        el.days = (el.expire_time - _time) / (1000*3600*24);
        el.months = Math.floor(el.days % 365 / 30);
      });
      this.setData({
        cardList:val,
        loadingData:false,
      })
    },function(err){
      console.log(err);
    })
  },
   //调用此方法显示弹层
  showPopup() {
  	this.setData({
  	  popupShow: true
  	})
  },
  hiddenPopup() {
  	this.setData({
  	  popupShow: false
  	})
  },
  // 详情的箭头点击
  readmore() {
    this.setData({
      removeGradient: !this.data.removeGradient
    })
  },
  // 规则的箭头点击
  readRulmore() {
    this.setData({
      rulearrow: !this.data.rulearrow
    })
  },
   // 全部课程详情
   courseEdit(id){
    let _config ={
      id: id
    }
    apis.get('CoursePackage/getCourseReferInfoByIdPub',_config,{
      "Content-Type": 'applciation/json'
    }).then(val =>{
      val.poster = val.poster.split(',')
      this.setData({
        editData: val,
        loading: false,
      })
    }).catch(err =>{
      console.log(err);
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let _course_id = options.editid;
    let _typeid = options.typeid;
    this.setData({
      typeid:_typeid
    })
    if(_typeid){
      await this.getCourseEdit(_course_id)
      await this.getCardList()
    }else{
      await this.courseEdit(_course_id)
      await this.getRule()
    }
  },
  // 约课规则
  getRule(){
    let _config={
      id:8
    }
    apis.get('/Article/detailInfoPub',_config,{
      "Content-Type": 'applciation/json'
    }).then(val => {
      this.setData({
        courseRule:val
      })
    }).catch(e => {
    })
  },
  // 约课课程详情
  getCourseEdit(course_id){
    let _config={
      id: course_id
    }
    apis.get('/Course/detailInfoPub',_config,{
      "Content-Type": 'applciation/json'
    }).then(val => {
      val.poster = val.poster.split(',');
      val.courseCancelTime = val.courseCancelTime/60/60;
      this.setData({
        editCourse:val,
        loading: false,
      })
    }).catch(e => {
    })
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
  // 显示协议
  xieyiClick(e) {
    let _title = e.currentTarget.dataset.num
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
      title: _title,
    })
  },
  //协议选框点击
  checkboxChange(e){
    let _agree = e.detail.value||[];
    this.setData({
      agreecheckbox:util.isNull(_agree)?false:true
    })
  },
  // 地图
  openLocation(e){
    let item = e.currentTarget.dataset;
    const latitude = Number(item.lat);
    const longitude = Number(item.lng);
    wx.openLocation({
        name: item.title,
        address: item.address,
        latitude,
        longitude,
        scale: 18
    });
  },
  // 获取当前时间
  getNowDate () {
    let now = new Date();
    let year = now.getFullYear(); //获取完整的年份(4位,1970-????)
    let month = now.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    let today = now.getDate(); //获取当前日(1-31)
    let nowData = ''
    nowData = year + '-' + this.fillZero(month) + '-' + this.fillZero(today)
    return nowData
  },
  getNowTime(){
    let now = new Date();
    let hour = now.getHours(); //获取当前小时数(0-23)
    let minute = now.getMinutes(); //获取当前分钟数(0-59)
    let nowTime = ''
    nowTime = this.fillZero(hour) + ':' + this.fillZero(minute)
    return nowTime
  },
  fillZero (str) {
    var realNum;
    if (str < 10) {
      realNum = '0' + str;
    } else {
      realNum = str;
    }
    return realNum;
  },
  // 拨打电话
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: this.data.editCourse.storefrontTel,
    })
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

  }
})