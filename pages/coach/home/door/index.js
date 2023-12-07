const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../utils/util.js')
var md5util = require('../../../../utils/md5.js')
const filter = require('../../../../utils/loginFilter');
Page(filter.loginCheck(true, app, { 

  /**
   * 页面的初始数据 
   */
  data: { 
    globalURL: app.globalData.globalURL,
    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,

    tabBarCurrent:2,
    tabBar: [{
      "pagePath": "/pages/coach/home/scheduleTable/index",
        "text": "首页",
        name: 'home',
        activeName: 'home-fill',
      },
      {
        
        "pagePath": "/pages/coach/home/schedule/index",
        "text": "日程",
        name: 'calendar',
        num: 1,
        activeName: 'calendar-fill',

        "hump": false,

      },
      {
        "pagePath": "/pages/coach/home/door/index",
        "text": "开门",
        name: 'qr-code',
        activeName: 'qr-code',
        "iconSize": '80',

        "hump": true,

      },
      {
        "pagePath": "/pages/coach/home/message/index",
        "text": "消息",
        name: 'message',
        activeName: 'message-fill',

        "hump": false,
        isDot: true
      },
      {
        "pagePath": "/pages/coach/home/index/index",
        "text": "我的",
        name: 'my',
        activeName: 'my-fill',

        "num": 2,
        "isDot": true,
        "verify": false
      }
    ],
  },
  //返回
  goBack(){
    wx.navigateBack();

  },
// 底部菜单点击
tabbarSwitch(e) {
  //{"index":4,"pagePath":"/pages/my/my","verify":true}
  logs.log("【tabbarSwitch 点击】",e.detail,true);
  let isLogin = false
  if (e.detail.verify && !isLogin) {
    wx.showToast({
      title: '您还未登录，请先登录',
      icon: "none"
    })
  } else {
    logs.log("【tabbarSwitch 当前菜单】",this.data.tabBarCurrent,true);
    if (e.detail.index != this.data.tabBarCurrent) {
      //临时用用
      if(e.detail.pagePath=="/packageA/pages/order/list/index")
      {
        wx.navigateTo({
          url: e.detail.pagePath,
        })

      }else{
      wx.reLaunch({
        url: e.detail.pagePath
      })
    }
    }
  }
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideHomeButton();
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
      wx.hideLoading();

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


   // 二维码生成工具
   couponQrCode(text, canvasId) {
    new qrCode(canvasId, {
      text: text,
      width: this.data.qrcode_w,
      height: this.data.qrcode_w,
      colorDark: "#333333",
      colorLight: "#FFFFFF",
      correctLevel: qrCode.CorrectLevel.H
    });
    if (canvasId == "couponQrcode0") {
      setTimeout(() => {
        if (!this.data.show) {
          this.setData({
            show: true
          })
        }
      }, 0)
    }
  },
  onReady() {
    let sys = wx.getSystemInfoSync()
    if (sys.system.indexOf('iOS') > -1 || sys.platform.indexOf('ios') > -1) {
      this.setData({
        show: true
      })
    }
    const W = sys.windowWidth;
    const rate = 750.0 / W;
    //利用比例将260rpx转换为px
    const qrcode_w = 260 / rate;
    this.setData({
      qrcode_w: qrcode_w
    }, () => {
      //this.couponQrCode("xyz0900100200", "couponQrcode0")
    });
  },
}))