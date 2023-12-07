const app = getApp();
const logs = require("../../../utils/logs");
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../utils/md5.js')
var util = require('../../../utils/util.js')

const filter = require('../../../utils/loginFilter');
const thisData = [
    {"title":"sb"},
    {"title":"sb"},
    {"title":"sb"},
    {"title":"sb"},
    {"title":"sb"},

    {"title":"sb"},
    {"title":"sb"},
    {"title":"sb"},
]
Page(filter.loginCheck(true, app, {

  /**
   * 页面的初始数据
   */
  data: {
    preventOnShow: true, 

    refreshing:false,//是否刷新中
    logArray:[],

    noData:true,
    pageIndex:1,//
    lastPage:2,//最多页

    isLoading:true,//是否加载数据中

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let that = this;

    //没数据把 noData 设为true
    setTimeout(() => {
        that.setData({
            //logArray:thisData||[],
            isLoading:false,

        })
    }, 1000);

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow(e) {
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


  //下拉刷新
  onrefresh()
  {
    logs.log("下拉刷新")
    this.setData({
        refreshing: true
    })
    //if (this.data.refreshing) return;
    setTimeout(() => {
        this.setData({
            refreshing: false
        })
    }, 500);
  },
  //上拉加载更多
  loadMore(e) {
      return;
      logs.log("上拉加载更多");
      let that = this;

    that.setData({
        isLoading:true,
    },()=>{
        setTimeout(()=>{
            if(this.data.pageIndex>=2){
                that.setData({
                    isLoading:false,
        
                })
            }else{
                that.setData({
                    pageIndex:this.data.pageIndex+1,
                    logArray:this.data.logArray.concat(thisData),
                    isLoading:false,
        
                })
            }
        },1000)
    })

  }
}))