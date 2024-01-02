// packageB/pages/card/index/index.js
var util = require('../../../../utils/util.js')
const app = getApp()
var apis = require('../../../../utils/apis.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,
    //轮播主件
    topBanner: [
      app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721",
      app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721",
      app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721"
    ],
  },
  cardClick(){
    wx.navigateTo({
      url: `/packageB/pages/Member/buyCard/index?id=${this.data.id}`,
      // ?reduce=${this.data.reduce}&price=${this.data.price}
    })
  },
  initNavigation(e) {
    this.setData({
      top: e.detail.top
    })
  },

  detailShow(e) {
    console.log(e);
    let _cla = e.currentTarget.dataset.cla || e.target.dataset.cla || 0;
    let _title = e.currentTarget.dataset.title;
    let type = e.currentTarget.dataset.packagetype;
    if (util.isNull(_cla) || _cla == 0) {
      return;
    }
    wx.navigateTo({
      url: '../detailShow/index?cla=' + _cla +'&title='+_title+'&typeid='+type,
    })
  },
  activityShow() {

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
    this.cardList()
  },
  cardList() {
    let _config = ''
    apis.get('/CoursePackage/coursePackagePub', _config, {
      "Content-Type": 'applciation/json'
    }, false).then(obj => {
      let arrList = [];
      // 先遍历对象拿到里面的对象
      for (let key in obj) {
        arrList.push(obj[key].lowerLevel)
      }
      let newarrList = [];
      // 再次遍历数组,然后拿到里层的对象
      arrList.forEach(el => {
        for (let key in el) {
          newarrList.push(el[key])
        }
      });
      this.setData({
        newarrList: newarrList,
      })
    }, )
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