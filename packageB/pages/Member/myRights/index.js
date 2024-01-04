const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
var md5util = require('../../../../utils/md5.js')
var apis = require('../../../../utils/apis.js')  

// Page(filter.loginCheck(true, app, {
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userEdit: '',
    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,
    //preventOnShow: true, 
    globalURL: app.globalData.globalURL,
    //地区选择
    seen: true, // 小眼睛
    formtType:0,//默认选中综合瑜伽馆  

    //提交表单
    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,
  },
  href(e){
    console.log(e);
    let hrefs = e.currentTarget.dataset.url
    wx.navigateTo({
      url: hrefs,
    })
  },
  //获取用户信息
  getUserInfo(){
    wx.showLoading({
      title: '加载中...',
    })
    let _timestamp = (new Date()).valueOf();
    let _config = {
      userID: wx.getStorageSync('USERID'),
      thisPage: 'home',
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5("home" + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }
    apis.gets("User/indexPub", _config,true).then(res => {
      this.setData({
        userEdit:res.user
      })
      wx.hideLoading()
    }).catch((err) => {
    });
  },
  //获取优惠券的数量
  getPackagenum(){
    let _timestamp = (new Date()).valueOf();
    let _config = {
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }
    apis.get("CouponApi/getUserCouponCount", _config,{
        "Content-Type": 'applciation/json',
    },true).then(res => {
      this.setData({
        packageNum:res
      })
    }).catch((err) => {
    });
  },
  //获取卡的数量
  getCardnum(){
    let _timestamp = (new Date()).valueOf();
    let _config = {
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }
    apis.get("CardItemOrderApi/getUserCardCount", _config,{
        "Content-Type": 'applciation/json',
    },true).then(res => {
      this.setData({
        cardNum:res
      })
    }).catch((err) => {
    });
  },
  async initData(){
    await this.getUserInfo()
    await this.getPackagenum()
    await this.getCardnum()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initData()
  },
  // 小眼睛点击
  eyeStatus() {
    let _seen = this.data.seen 
    let _balance = (this.data.userEdit.integral).toString().replace(/[\S]/g,'*')
    _seen = !_seen;//小眼睛的变化
    this.setData({
      seen:_seen,
      integral:_balance
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
    //if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 
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


  //#region 下拉选择区域

  toArr(object) {
    let arr = [];
    for (let i in object) {
      arr.push(object[i].text);
    }
    return arr;
  },
  //#endregion 下拉选择区域END
 onPageScroll(e) {
    this.setData({
      scrollTop:e.scrollTop
    })
  },
  back() {
    wx.navigateBack();
  },
// }))
})