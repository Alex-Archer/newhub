const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')  
const form = require("../../../../libs/validation.js")
const filter = require('../../../../utils/loginFilter');
Page(filter.loginCheck(true, app, { 

  /**
   * 页面的初始数据
   */
  data: {
    preventOnShow: true, 

    content:'',//文章内容
    bottomShow:false,
    btnType:"default",
    subDisabled:false,
    subText:"了解详情",
    href:'/packageB/pages/form/examCoach/index',

    //定单
    orderno:'',//定单号
    orderPayed:false,//定单是否支付完成

  },
  NavigateTo(e){
    let _url = e.currentTarget.dataset.href||e.target.dataset.href;
    if(util.isNull(_url))
    {
      return;
    }
    wx.navigateTo({
      url: _url,
    })
  },
  initLoad(e){
    let that = this;
    let _timestamp = (new Date()).valueOf();
    axios.get("Article/detailInfoPub", {
      //id: 6,//ID优先
      alias:'examcoach',
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
        wx.setNavigationBarTitle({
          title: _res.data.title
        })

        //动态导航栏色
        //https://developers.weixin.qq.com/miniprogram/dev/api/ui/navigation-bar/wx.setNavigationBarColor.html
        wx.setNavigationBarColor({
          frontColor: '#ffffff',//前景颜色值，包括按钮、标题、状态栏的颜色，仅支持 #ffffff 和 #000000
          backgroundColor: '#886c5a',//导航栏背景色 背景颜色值，有效值为十六进制颜色

          backgroundColorTop: '#886c5a', // 顶部窗口的背景色为白色
          backgroundColorBottom: '#886c5a', // 底部窗口的背景色为白色

          animation: { //动画效果
            duration: 400,
            timingFunc: 'easeIn'
          },
          //#region 
          // success: () => {
          //   console.log('导航栏背景颜色设置成功')
          // },
          // fail: () => {
          //   console.log('导航栏背景颜色设置失败')
          // },
          // complete: () => {
          //   console.log('导航栏背景颜色设置结束')
          // },
          //#endregion
        })



        that.setData({
          content:_res.data.content
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      this.initLoad();
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
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW
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