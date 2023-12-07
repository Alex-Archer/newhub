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
    

    dropdownlistIcon:false,//下拉是否显示图标
    dropdownIndex:4,
    dropdownIndexText:"开通至今",

    dropdownlistData: [{
        name: "今日收益",
        icon: "wechat",
        color: "#80D640",
        size: 30
      }, {
        name: "昨日收益",
        icon: "alipay",
        color: "#00AAEE",
        size: 30
      }, {
        name: "近7天内",
        icon: "bankcard-fill",
        color: "#ff7900",
        size: 28
      }, {
        name: "近1月内",
        icon: "wechat",
        color: "#80D640",
        size: 30
      }, {
        name: "开通至今",
        icon: "alipay",
        color: "#00AAEE",
        size: 30
      }],


      dropdownShow: false,

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
     
  },
  //下拉选择
  dropDownList(e) {
    let that = this;
    let index = Number(e.currentTarget.dataset.index)
    if (index !== -1) {
        //util.toast("index：" + index);
        let thisName = this.data.dropdownlistData[Number(index)].name;
        this.setData({
            dropdownIndexText: thisName,
            dropdownIndex: index,
        })
    }
    this.setData({
      dropdownShow: !this.data.dropdownShow
    })
  },
}))