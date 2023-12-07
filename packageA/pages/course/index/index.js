const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabbarShow:true,//底部菜单不与其它冲突默认关闭
    indexPage:false,//是否在首页，tabbar和别人不一样
    indexBackToTop: false,//是否返回顶部
    current: 2,//tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    tabBar: app.globalData.tabBar,//移除第一个元素

  },
// 底部菜单点击
tabbarSwitch(e) {
  //{"index":4,"pagePath":"/pages/my/my","verify":true}
  console.log('点击E:', JSON.stringify(e.detail))
  let isLogin = false
  if (e.detail.verify && !isLogin) {
    wx.showToast({
      title: '您还未登录，请先登录',
      icon: "none"
    })
  } else {
    console.log('当前点击了:', e.detail.index);
    // this.setData({
    //   current: e.detail.index
    // })
    // if(e.detail.index!=0){

    // }
    console.log('当前菜单:', this.data.current);
    if(e.detail.index!=this.data.current){
      wx.reLaunch({
        url: e.detail.pagePath
      })
    }
    // if(e.detail.index==2){
    //   wx.reLaunch({
    //     url: '/pages/moments/list/index',
    //   })
    // }
  }
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


})