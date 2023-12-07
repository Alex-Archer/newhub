const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    loading: true,
    globalURL: app.globalData.globalURL,
    list:[],//

    banner: ['img-8.png', 'img-8.png', 'img-8.png'],
    storePopupShow:false,//场地上弹窗
    timePopupShow:false,//时间弹窗

    uInfo:null,//教练信息
    courseList:[],//团 营列表
    storeList:[],//场馆列表
    timeList:[],//时间列表
  },
  //去购买
  gobuy(e){
    wx.navigateTo({
      url: '/pages/coach/Order/submit/index',
    })

  },
  //上课场地
  openStoreList: function(e) {
    this.setData({
      storePopupShow: true
    })
  },
  hideStoreList: function() {
    this.setData({
      storePopupShow: false
    })
  },
  //上课时间
  openTimeList: function(e) {
    this.setData({
      timePopupShow: true
    })
  },
  hideTimeList: function() {
    this.setData({
      timePopupShow: false
    })
  },
  //初始数据
  initLoad(_coachId) {
   
    return new Promise((resolve, reject) => {
      //let that = this;
      let _timestamp = (new Date()).valueOf();
      axios.get("Coach/baseInfoPub", {
        //coachId: _coachId,
        userId: _coachId,
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(_coachId +  _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
        if (res.data.code == 1) {

          resolve(res.data.data);
        } else {
          reject();
        }

      }).catch((err) => {
        reject();
      });
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let that = this;
    let _uid = options.uid||'';
    if(util.isNull(_uid))
    {
        util.toast("信息有误",null,null,()=>{
           setTimeout(() => {
            wx.navigateBack();
           }, 500);
        })
        return;
    }
    this.initLoad(_uid).then(val=>{
        that.setData({
            loading: false,
            uInfo:{
                nickname:val.nickname,
                headimgurl:val.headimgurl,
                group:val.group,
            },
            timeList:val.courseTime,
            courseList:val.courseList,
            storeList:val.storeList,
            list: [{
                text: '累计上课',
                value: val.coursenum+'节'
              }, {
                text: '证书',
                value: val.certificateCount+'本',
                page:'/pages/coach/view/certificate/index?uid='+val.userId
              }, {
                text: '好评率', 
                value: val.positivenum+'%'
              }],
        })
        
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //this.selectComponent("#tui_column_3").draw(this.data.options3.dataset, this.data.options3.yAxisVal.formatter)
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


  itemClick(e){
     
     let _index = e.detail.index;//
     let _to = this.data.list[_index].page;
      wx.navigateTo({
       url: _to,
     })

  },
  //课程详情
  groupShow(e) {
  
    let registerednum = e.currentTarget.dataset.registerednum||e.target.dataset.registerednum;//已报人数
    let peoplenum = e.currentTarget.dataset.peoplenum||e.target.dataset.peoplenum;//报满人数

    if(Number(registerednum)>=Number(peoplenum))
    {
        util.toast("该团课人数已满");
        return;

    }    
    let currentID=e.currentTarget.dataset.id||e.target.dataset.id;
    wx.navigateTo({
      url: '/pages/course/group_show/index?id='+currentID,
    })
  },
  dSubscribe(e){
      wx.navigateTo({
        url: '/packageA/pages/listCourse/index?tab=2',
      })
  }
})