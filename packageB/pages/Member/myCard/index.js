// packageB/pages/Member/myCard/index.js
const app = getApp();
var md5util = require('../../../../utils/md5.js')
var apis = require('../../../../utils/apis.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardList: [],
  },
// 已购卡
getCardList(){
  let _timestamp = (new Date()).valueOf();
  let _coursePackageType = '0' // 当展示全部卡的时候,后台反馈这个字段不传
  let _config={
    userID: wx.getStorageSync('USERID'),
    coursePackageType: _coursePackageType.toString(),
    TIMESTAMP: _timestamp,
    FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
  }
  let _time = (new Date().getTime())
  apis.gets('/CardItemOrderApi/getUserCardItem',_config,true).then(val => {
    val.forEach(el => {
      // 算出剩余多少节
      el.remaining = el.course_quantity - el.course_used_quantity 
      el.days = (el.expire_time - _time) / (1000*3600*24);
      el.months = Math.floor(el.days % 365 / 30);
    });
    this.setData({
      cardList:val
    })
  },function(err){
    console.log(err);
  })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getCardList()
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