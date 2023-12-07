const app = getApp();
const logs = require("../../../utils/logs");
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../utils/md5.js')
var util = require('../../../utils/util.js')
const filter = require('../../../utils/loginFilter');

Page(filter.loginCheck(true, app, {

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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


  extractAction(){
      wx.navigateTo({
        url: '../extract/index',
      })
  },
  topJump(e) {
    let _this = this;
    let _dataset = e.currentTarget.dataset;
    let _islogin = _dataset.islogin;
    let _navigate = _dataset.navigate;
    let _url = _dataset.url;
    if (_islogin) {
        //检测用户头像、昵称、手机
        //let _u = _this.data.user;
        let _uMobile = wx.getStorageSync('MOBILE');
        if (!_uMobile || util.isNull(_uMobile)) {
            wx.navigateTo({
                url: '/pages/user/login/index',
            })
            return;


        } else {
            if (_navigate) {
                wx.navigateTo({
                    url: _url,
                })
            } else {
                wx.reLaunch({
                    url: _url
                })
            }
        }
    } else {
        if (_navigate) {
            wx.navigateTo({
                url: _url,
            })
        } else {
            wx.reLaunch({
                url: _url
            })
        }
    }
},
}))