const app = getApp();
const logs = require("../../../utils/logs");
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../libs/we-lodash'
var md5util = require('../../../utils/md5.js')
var util = require('../../../utils/util.js')

// pages/mini/scan/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    globalURL: app.globalData.globalURL,

        //胶囊位置
        statusBar: app.globalData.statusBar,
        customBar: app.globalData.customBar,
        navBarHeight: app.globalData.navBarHeight,
    //param:'',
    scene:'',//场景
    returnHtml:'',
    actionTitle:'',
    action:'',

    onHide:false,
    privacyArgee:false,//是否同意了隐私
    form_scancodeTime:'',
    action:'',
    param_param:'',

    openDoorHtml:'',//开门说明
    openErrMessage:'',


  },
  //返回
  goHome(){
    wx.reLaunch({
      url: '/pages/index/index',
  })

  },
  lockCofig(){

    wx.redirectTo({
      url: '/packageA/pages/Setting/accessControl/passAndFace/index',
    })
  },
  agree(e){
    let that =this;
    console.log("用户同意隐私授权, 接下来可以调用隐私协议中声明的隐私接口")
    this.setData({
      privacyArgee:true
    },()=>{

      app.getOpenID(false).then(resOpenID => {

        //无需用户登录，只需要有OPENID
        let _timestamp = (new Date()).valueOf();
        let _uid = wx.getStorageSync('USERID')||resOpenID;
        let config = {
          userID: _uid,
          TIMESTAMP: _timestamp,
          key:this.data.form_param,
          FKEY: md5util.md5(_uid + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }
        this.pageController("https://aoben.kshot.com/api/Door/qrCode",config,false).then(val=>{
          that.setData({
            openID:resOpenID,
            openDoorHtml:"开门成功",
            returnHtml:"CODE1正常："+JSON.stringify(val)
          });
        },function(err)
        {
          that.setData({
            openID:resOpenID,
            openDoorHtml:"开门失败",
            openErrMessage:'这是失败原因',
            returnHtml:"CODE 0出错："+JSON.stringify(err)
          });
  
        })
  
        
      })
    })
  },
  disagree(e){
    let that =this;
    //console.log("用户拒绝隐私授权, 未同意过的隐私协议中的接口将不能调用")
    this.setData({
      privacyArgee:false
    },()=>{
      wx.reLaunch({
        url: '/pages/index/index?msg='+encodeURIComponent("游客无法使用门禁功能")
      })
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query) {
    //如果有隐藏一次就去首页吧
    if(this.data.onHide){
        wx.reLaunch({
          url: '/pages/index/index',
        })
        return;
	}
	console.log
    const q = decodeURIComponent(query.q) // 获取到二维码原始链接内容
    //查看是否大写,如果不是大写就跳过
    const arrUrl=app.globalData.scanURL;
    if(q.indexOf("HTTPS://") < 0||q.indexOf(arrUrl) <0){
      return
    }
    

    const scancode_time = parseInt(query.scancode_time) // 获取用户扫码时间 UNIX 时间戳
    const that = this;
    let _action=util.getURLParam(q,"s");
    let _actionTitle="";

    let _returnHtml='';
    let _param =util.getURLParam(q,"param");
    switch(_action)
    {
        case "door"://开门 https://yoga.aoben.yoga/s=door&param=mac
            _returnHtml="去服务器验证门、用户、时间匹配后开门";
            _actionTitle="开门动作";
            break;
        case "getpass"://获取用户密码 https://yoga.aoben.yoga/s=getpass&param=MAC
            _returnHtml="用户密码：123455555，验证门MAC、扫码用户存在，没有设置密码时跳转到用户中心去设置";
            _actionTitle="获取用户密码";
            break;
        case "cabinet"://开柜 https://yoga.aoben.yoga/s=cabinet&param=mac
            _returnHtml="您打开的柜门是12号，验证门MAC、扫码用户存在，";
            _actionTitle="开柜";
            break;            
        case "coach"://教练分享 https://yoga.aoben.yoga/s=coach&param=2,str
            _returnHtml="教练分享码，跳转到课程购买,教练有分成";
            _actionTitle="教练分享码";
            break;
        case "sign"://用户签到 https://yoga.aoben.yoga/s=sign&param=2,str
            _returnHtml="教练出示 用户签到成功，在door中也可以加入签到";
            _actionTitle="用户签到";
            break;            
        default://啥都不是
            _returnHtml="啥都不是,直接转到HOME";
            _actionTitle="啥都不是";
            break;

    }
    that.setData({
      param_scancodeTime:util.formatDate("y-m-d h:i:s", scancode_time*1000,2),
      action:_action,
      form_param:_param,

      actionTitle:_actionTitle,
      returnHtml:_returnHtml,
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
    //如果有隐藏一次就去首页吧
    if(this.data.onHide){
        wx.reLaunch({
          url: '/pages/index/index',
        })
        return;
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
      this.setData({
        onHide:true,
      })

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
   *  本页动作
   * @param {*} _url 
   * @param {*} _config 
   * @param {*} _interceptors 是否经过拦截器
   */
  pageController(_url,_config,_interceptors=true) {

    return new Promise((resolve, reject) => {
        axios.post(_url, _config, {
            headers: {
                "Content-Type": 'applciation/json',
            },
            interceptors: {
                request: _interceptors, 
                response: _interceptors 
            },
            
            validateStatus(status) {
                return status === 200;
            },
        }).then(res => {
            if (res.data.code == 1) {
                let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
                resolve(_data);
            } else {
                reject(res.data.message);
            }
        }).catch((err) => {
            reject(err);
        });
    })
},
})