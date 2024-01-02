var app = getApp();
var apis = require('../../../../utils/apis.js')
var md5util = require('../../../../utils/md5.js')
Page({

  /**
   * 组件的初始数据
   */
  data: {
    scrollViewHeight: 0, // scroll-view的高度
    couponList: [],
  },
  /**
   * 组件的方法列表
   */
    onLoad(option) {
      this.fetchScrollH();
      this.getPackageList();
    },
    delete(e){
      console.log(点击删除);
    },
    getPackageList(){
      let _timestamp = (new Date()).valueOf();
      let _config = {
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }
      apis.gets('CouponApi/getUserCoupon',_config,true).then(val =>{
        this.setData({
          couponList:val
        })
      }).catch(err => {

      })
    },
    // 获取滑动视图高度
    fetchScrollH () {
      const {
        windowHeight
      } = wx.getSystemInfoSync();
      console.log(windowHeight)
      const query = this.createSelectorQuery();
      query.select('.coupon_min').boundingClientRect()
      query.exec((res) => {
        console.log(res)
        this.setData({
          scrollViewHeight: windowHeight - res[0].top,
        });
      })
    },
})