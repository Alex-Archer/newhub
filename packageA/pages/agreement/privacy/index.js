const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
      alias:'privacy',
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
      //{"code":1,"message":"success","data":{"id":1,"poster":"","title":"关于我们","content":"<p>尊敬的奥本瑜伽会员！亲爱的新会员，欢迎加入奥本瑜伽大家庭！我们非常高兴您选择了我们的瑜伽课程。奥本瑜伽致力于通过瑜伽练习改善人们的身心健康。我们的老师团队将全心全意为您提供专业的指导，助您掌握正确的瑜伽动作。在这里，您将融入一个友好、积极的练习环境，与志同道合的伙伴一起收获身心的平衡。希望瑜伽课程能给您的生活带来正能量。再次欢迎您，让我们开始这段身心舒展的瑜伽之旅吧！您可以通过反馈或者以下方式联系我！<\/p><p><span style=\"color: rgb(0, 112, 192);\">邮箱：222222@website.com<\/span><\/p><p><span style=\"color: rgb(0, 112, 192);\">客服电话：0512-12345678<\/span><\/p><p><span style=\"color: rgb(0, 112, 192);\">企服电话：800-88888888<\/span><\/p>","addtime":"2023-08-21 14:31:56"}}
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