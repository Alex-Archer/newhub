const app = getApp();
const logs = require("../../../../utils/logs");
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../libs/we-lodash'
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')
const filter = require('../../../../utils/loginFilter');

Page(filter.loginCheck(true,app,{

  /**
   * 页面的初始数据
   */
  data: {
    preventOnShow:true,//3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面

  },
  onLoad(e){

  },
  onShow(e){
      if(this.data.preventOnShow) return;//5.登录验证  需要登录时，阻止ONSHOW 

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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


}))