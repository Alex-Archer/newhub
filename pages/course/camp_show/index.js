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
    buyed:true,//是否购买了，对就返回 order:true/false

    sameTime:null,//有的话会输出名称开始时间结束时间 ，在sameTime 同天是否有冲突时间，有的话暂时禁买
    button: [{
        text: '确定',
        type: 'red'
    }],
    modalShow:false,

    campInfo:null,
    //商品介绍隐
    removeGradientContent:false,
    //注意事项更多
    removeGradient: false,

    campTitle: '',
    campID: '',

    mapLocation:null,//地图相关信息

    ISCOACH:false,//是否是教练
  },
    //注意事项更多
  readmore() {
    this.setData({
      removeGradient: !this.data.removeGradient
    })
  },
  //课程介始更多
  readmoreContent() {
    this.setData({
      removeGradientContent: !this.data.removeGradientContent
    })
  },  
goLocation(){

    let mapInfo = this.data.mapLocation;
    if(util.isNull(mapInfo))
    {
        return;
    }
  wx.openLocation({
    latitude: Number.parseFloat(mapInfo.lat),
    longitude: Number.parseFloat(mapInfo.lon),
    scale: mapInfo.zoom,
    name: decodeURIComponent(mapInfo.name),
    address: decodeURIComponent(mapInfo.address),
    success: function (r) {
      console.log("wx.openLocation:",r);
    }
  })
},
initLoad(detailID)
{

    let that = this;
    let _timestamp = (new Date()).valueOf();
    return new Promise((resolve, reject) => {
        axios.get("CourseCamp/detailInfoPub", {
            id: detailID,
            userID: wx.getStorageSync('USERID'),
            TIMESTAMP: _timestamp,
            //FKEY: md5util.md5(wx.getStorageSync('USERID') + _orderNo.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
            let _res = util.jsonTestParse(res.data); //解决返回为字符串型JSON问题
            if (_res.code == 1) {
                resolve(_res.data);
            } else {
                reject();
            }

        }).catch((err) => {
            reject();
        });
    });
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    if (util.isNull(options)) {
        wx.navigateBack();
        return;
    }
    let _detailID = options.detailID;
    if (util.isNull(_detailID) || !util.isNumber(_detailID)) {
        wx.navigateBack();
        return;
    }

    this.initLoad(_detailID).then(val => {
        // logs.log(null,val,true)
        if (util.isNull(val)) {
            wx.navigateBack();
            return;
        }
        that.setData({
            buyed:val.order,//是否购买过
            sameTime:val.sameTime,//'06:00-09:00' 有的话会输出名称开始时间结束时间 ，在sameTime 同天是否有冲突时间，有的话暂时禁买
            loading: false,
            subDisabled:(val.order||val.enrollstate==0)?true:false, //可以提交了 ,已购买 和 排除中的除外
            campInfo: val,
            campTitle: val.title,
            campID: val.id,
            mapLocation:{
                name :val.storefrontName,
                lat:val.storefrontLat,
                lon :val.storefrontLng,
                zoom:18,
                address:val.storefrontAddress
            },

            ISCOACH:util.isNull(wx.getStorageSync('ISCOACH'))?false:true,//是否是教练
        })
    }, function (reason) { 
        that.setData({
            pageErr: true
        }, () => {
            util.toast("信息有误", null, null, (e) => {
                setTimeout((res) => {
                    wx.navigateBack();
                }, 500);
            });
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
       //{"title":"打开心轮","startTime":1696111200,"endTime":1696114800}
    if(util.isNull(this.data.sameTime)){//无时间冲突
        wx.redirectTo({
            //url: '/pages/course/groupSubOrder/index?id='+this.data.campID+'&t='+encodeURIComponent(this.data.campTitle)
            url: '/pages/course/camp_buy/index?id='+this.data.campID+'&t='+encodeURIComponent(this.data.campTitle)
        })
    }else{//有时间冲突
        this.setData({
            modalShow:true
        })
        return;
    }

  },
  //课程冲突提示框
  modalClick(){
    this.setData({
        modalShow:false
    })
    return;
  },
  //课程冲突提示框
  modalhide(){
    this.setData({
        modalShow:false
    })
    return;
  },  
})