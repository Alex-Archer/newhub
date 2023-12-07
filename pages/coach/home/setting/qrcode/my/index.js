const app = getApp();
const logs = require("../../../../../../utils/logs");
import _ from '../../../../../../libs/we-lodash'
import axios from '../../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../../../utils/util.js')
var md5util = require('../../../../../../utils/md5.js')
const filter = require('../../../../../../utils/loginFilter');
const qrCode = require('../../../../../../libs/weapp-qrcode.js');
Page(filter.loginCheck(true, app, {  

  /**
   * 页面的初始数据
   */
  data: {
    preventOnShow: true, 

    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,

    showCode: false, //android上conver-view盖不住canvas的bug,可以做平台判断
    qrcode_w: 200,

    formCoachID: 0, //课程ID
    formScene: 0, //scene 场景设定  0.或空-去到个人主页 1.推广-转到私教课程推广页有分成  2.学员签到-需有教练ID、学员ID、课程ID

    imagePath: '', //虽然canvas可以生成，但是为了考虑兼容性，还是双保险
    loadingCodes: true,
    headimgurl:'',//用户头像
    nickname:'',//用户昵称

  },
  //返回
  goBack() {
    wx.navigateBack();

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideHomeButton();
    var that = this;
    let _coachID = options.coachID || 0;
    let _scene = options.scene || 0; //scene 场景设定  0.或空-去到个人主页 1.推广-转到私教课程推广页有分成  2.学员签到-需有教练ID、学员ID、课程ID


    this.getUserInfo().then(val=>{
      that.setData({
        headimgurl:val.headimgurl,//用户头像
        nickname:val.nickname,//用户昵称
      })
    })


    this.setData({
      formCoachID: _coachID,
      formScene: _scene,
    }, () => {

      new Promise(() => {
        this.getDataCode(_coachID, _scene).then(val => {
          if (!util.isNull(val)) {
            let _codeStr = val.string;
            var base64Image = val.string // 后台返回的base64数据
            var imgData = base64Image.replace(/[\r\n]/g, '') // 将回车换行换为空字符''
            that.setData({
                imagePath:imgData,
                loadingCodes: false
            })
          }
        })
      })



    })


  },
  /**
   * 二维码生成  https://blog.csdn.net/LY__lyxka/article/details/126102406
   * 比默认的好用 有 callback
   * @param {*} _codeConten 
   */
  createCode(_codeConten) {
    let that = this;
    new qrCode('myQrcode', {
      text: _codeConten,
      width: 200, //canvas 画布的宽
      height: 200, //canvas 画布的高
      padding: 0, // 生成二维码四周自动留边宽度，不传入默认为0
      correctLevel: qrCode.CorrectLevel.L, // 二维码可辨识度
      colorDark: "#333333",
      colorLight: "#FFFFFF",
      callback: (res) => {
        //工具回调数据
        //将图片路劲放入data中，显示在wxml的image标签上
        that.setData({
          imagePath: res.path,
          loadingCodes: false
        })
      }
    })

  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideLoading();
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


  
  onReady() {
    
  },
  /**
   * 请求生成 二维码的内空
   * @param {*} _coachID 课程ID
   * @param {*} _sceneID 场景值 //scene 场景设定  0.或空-去到个人主页 1.推广-转到私教课程推广页有分成  2.学员签到-需有教练ID、学员ID、课程ID
   * 返回的 id 、time、 scene 加密
   */
  getDataCode(_coachID, _sceneID = 0) {
    return new Promise((resolve, reject) => {
      let _timestamp = (new Date()).valueOf();
      axios.get("QrCode/newQr", {
        id: _coachID,
        scene: _sceneID,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _sceneID.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          "Content-Type": 'applciation/json',
        },
        interceptors: {
          request: true, 
          response: true 
        },
        
        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
          resolve(util.jsonTestParse(_data));
        } else {
          reject();
        }
      }).catch((err) => {
        reject();
      });
    })
  },
  //获取个人信息
  getUserInfo() {
    return new Promise((resolve,reject)=>{
    let _timestamp = (new Date()).valueOf();
    axios.get("coach/baseInfo", {
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }, {
        headers: {
            "Content-Type": 'applciation/json',
        },
        
        validateStatus(status) {
            return status === 200;
        },
    }).then(res => {
        let _res = res.data;
        if (_res.code == 1) {
          resolve(_res.data)
        }else{
          reject(_res.message);
        }

    }).catch((err) => {
      reject(err);
    });
  })
  },
}))