const app = getApp();
const filter = require('../../../../utils/loginFilter');
Page(filter.loginCheck(true,app,{ 

  /**
   * 页面的初始数据
   */
  data: {
    preventOnShow:true,

    lists: ["公司", "家", "学校", "其他"]
  },
  onShow(e){
          if(this.data.preventOnShow) return;//5.登录验证  需要登录时，阻止ONSHOW 
    
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