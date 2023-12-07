const app = getApp();
const logs = require("../../../../utils/logs");
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../libs/we-lodash'
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')
const filter = require('../../../../utils/loginFilter');

Page(filter.loginCheck(true, app, {
  data: {
    preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面

    sysMsgNum:0,//系统消息
    serviceMsgNum:0,//客服消息

  },
  initData()
  {
    return new Promise((resolve, reject) => {
      let _timestamp = (new Date()).valueOf();
      axios.get("Message/typeList", {

        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') +  _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
          reject([]);
        }
      }).catch((err) => {
        reject([]);
      });
    })

  },
  onLoad(e) {
    let that = this;

    //1.消息条数统计
    this.initData().then(val=>{
       let _ObjSysMsg = _.find(val.list, {type: 0});//系统消息
      let _ObjServiceMsg = _.find(val.list, {type: 1});//客服消息
      that.setData({
        sysMsgNum:_ObjSysMsg.unreadCount,
        serviceMsgNum:_ObjServiceMsg.unreadCount,
      })
    })
  new Promise(() => {
    //2.是否打开了订阅消息
    wx.getSetting({
      withSubscriptions: true,
      success: res => {
        let {
          authSetting = {},
            subscriptionsSetting: {
              mainSwitch = false,
              itemSettings = {}
            } = {}
        } = res;

        if (authSetting['scope.subscribeMessage'] || mainSwitch) {
          //util.toast('用户手动开启同意了，订阅消息');
          that.setData({
            subScriptionsShow: false
          })
        } else {
          //util.toast("您没有同意授权订阅消息，预约失败")
          that.setData({
            subScriptionsShow: true
          })
        }
      }
    });
  })
  },
  //打开订阅消息设置
  subScriptionsCofig(e) {
    const that = this;
    wx.openSetting({
      success: (r) => {
        //再次检查
        wx.getSetting({
          withSubscriptions: true,
          success: res => {
            let {
              authSetting = {},
                subscriptionsSetting: {
                  mainSwitch = false,
                  itemSettings = {}
                } = {}
            } = res;

            if (authSetting['scope.subscribeMessage'] || mainSwitch) {
              that.setData({
                subScriptionsShow: false
              }, () => {
                util.toast("打开订阅消息提醒成功")
              })
            } else {

              that.setData({
                subScriptionsShow: true
              }, () => {
                util.toast("建议您打开订阅消息提醒功能")
              })
            }
          }
        });
      }
    })
  },
  onShow(e) {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

  },
  NavigateTo(e) {
    let _url = e.currentTarget.dataset.href || e.target.dataset.href;
    let _msgtype = e.currentTarget.dataset.msgtype || e.target.dataset.msgtype;
    if (util.isNull(_url)) {
      return;
    }
    wx.navigateTo({
      url: _url+"?type="+_msgtype,
    })
  },
//返回有修改时刷新页面
  callBackReturn(_object) {
      let that = this;
      //1.消息条数统计
    this.initData().then(val=>{
      let _ObjSysMsg = _.find(val.list, {type: 0});//系统消息
      let _ObjServiceMsg = _.find(val.list, {type: 1});//客服消息
      that.setData({
        sysMsgNum:_ObjSysMsg.unreadCount,
        serviceMsgNum:_ObjServiceMsg.unreadCount,
      })
    })
  }
}))