// packageB/pages/card/index/index.js
var util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,

  },
  initNavigation(e) {
    this.setData({
        top: e.detail.top
    })
  },

  detailShow(e) {
    let _cla = e.currentTarget.dataset.cla||e.target.dataset.cla||0;
    if(util.isNull(_cla)||_cla==0)
    {
      return;
    }
    wx.navigateTo({
      url: '../detailShow/index?cla='+_cla,
    })
  },
  activityShow(){

// wx.redirectTo({
//   url: '../detailShow/index',
// })
wx.navigateTo({
  url: '../activityShow/index',
})
  }, 
  /*
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})