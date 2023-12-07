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
    subDisabled:true,//禁止提交按钮 
    buyed:true,//是否购买了，对就返回 order:true/false  ----团课可以一直购买,让陈工那order一直返回false 就可以一直买了

    banner: [],//幻灯 没有就用封面加入

    groupInfo: null, //课程信息
    groupTitle: '',
    groupID: '',
    groupUser: [],
    registerednum: 0, //已约人数

    //弹窗
    show: false,
    transShow: false,
    mode: ['fade'],
    styles: {
      'backgroundColor': 'rgba(0,0,0,0)'
    },
    //弹窗END

    //约课规则隐
    removeGradient: false,

    //商品介绍隐
    removeGradientContent:false, 

    ISCOACH:false,//是否是教练
  },
  readmore() {
    this.setData({
      removeGradient: !this.data.removeGradient
    })
  },

  readmoreContent() {
    this.setData({
      removeGradientContent: !this.data.removeGradientContent
    })
  },  
  //弹窗
  coachPopup(e) {
    let dataset = e.currentTarget.dataset
    let mode = dataset.mode.split(',')
    console.log(mode)
    let mask = dataset.mask
    let backgroundColor = `styles.backgroundColor`
    if (mask == 1) {
      this.setData({
        [backgroundColor]: 'rgba(0,0,0,0.4)'
      })
    } else {
      this.setData({
        [backgroundColor]: 'rgba(0,0,0,0)'
      })
    }
    setTimeout(() => {
      this.setData({
        mode: mode,
        transShow: !this.data.transShow
      })
    }, 20);
  },
  onTap() {
    this.setData({
      transShow: false,
      show: false
    })
  },
  //弹窗END 
  goToStore() {
    wx.navigateTo({
      url: '/pages/store/show/index',
    })

  },
  //初始数据
  initLoad(_id = 1) {
   
    return new Promise((resolve, reject) => {
      //let that = this;
      axios.get("CoursePersonal/detailInfoPub", {
        id: _id,
        userID: wx.getStorageSync('USERID'),
        userNum: 8, //报名人数列几个 
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
    let id = options.id;

    this.initLoad(id).then(val => {

      let _banner=this.data.banner;
      if(util.isNull(val.picture)){//没有就调用封面
        _banner=[{
          "poster":val.poster
        }
      ]
      }else{
        _banner = val.picture;
      }

      //移除骨架
      that.setData({
        banner:_banner,
        groupInfo: val,
        groupTitle: val.title,
        groupID: val.id,
        registerednum: 0,


        buyed:val.order,//是否购买过
        //sameTime:val.sameTime,//'06:00-09:00' 有的话会输出名称开始时间结束时间 ，在sameTime 同天是否有冲突时间，有的话暂时禁买
        loading: false,
        subDisabled:(val.order||val.enrollstate==0)?true:false, //可以提交了 ,已购买 和 排除中的除外

        ISCOACH:util.isNull(wx.getStorageSync('ISCOACH'))?false:true,//是否是教练
      })
    })

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


  detailBuy(e){
    wx.redirectTo({
      url: '/pages/course/personalSubOrder/index?id='+this.data.groupID+'&t='+encodeURIComponent(this.data.groupTitle)
  })
  },
   
})