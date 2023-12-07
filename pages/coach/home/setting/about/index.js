const app = getApp();
const logs = require("../../../../../utils/logs");
import _ from '../../../../../libs/we-lodash'
import axios from '../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../../utils/md5.js')
var util = require('../../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    globalURL: app.globalData.globalURL,
    
    htmlSnip:'',
    
    noticeBarShow:false,//是否显示页面消息
    noticeBarContent:"自 2023-08-01 起至 2023-10-07，购买会员享受95折优惠。",

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initLoad();

  },
  initLoad(e){
    let that = this;
    let _timestamp = (new Date()).valueOf();
    axios.get("Article/detailInfoPub", {
      //id: 1,
      //id: 1,//ID优先
      alias:'about',
      TIMESTAMP: _timestamp,
      userID: wx.getStorageSync('USERID'),
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }, {
      headers: {
        "Content-Type": 'applciation/json',
      },
      interceptors: {
        request: false, 
        response: false  
      },
      
      validateStatus(status) {
        return status === 200;
      },
    }).then(res => {
      let _res = res.data;
      if (_res.code == 1) {
        that.setData({
          htmlSnip:_res.data.content
        })
      }else{
        util.toast(_res.message);
        setTimeout((res) => {
          wx.navigateBack();
        }, 1000);
      }

    }).catch((err) => {
      util.toast("请返回重新查看");
      setTimeout((res) => {
        wx.navigateBack();
      }, 1000);
    });

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

})