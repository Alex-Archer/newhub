const app = getApp();
const logs = require("../../../../../utils/logs");
import axios from '../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../../libs/we-lodash'
var md5util = require('../../../../../utils/md5.js')
var util = require('../../../../../utils/util.js')

const filter = require('../../../../../utils/loginFilter');

Page(filter.loginCheck(true, app, {

  /**
   * 页面的初始数据 
   */
  data: {
    preventOnShow: true, 

    systemChecked: true, //系统通知 禁关

    agreeChecked: false, //约课提醒
    activityChecked: false, //活动提醒

    subScriptionsShow: false, //如果没打开订阅消息则显示

    subscribeMsg:app.globalData.subscribeMsg,
  },
  //获取个人设置
  getUserConfig() {
    return new Promise((resolve, reject) => {
      let _timestamp = (new Date()).valueOf();
      axios.get("User/myMsgConfig", {
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
          resolve(_res.data);
        } else {
          reject(_res.message)
        }

      }).catch((err) => {
        reject(err)
      });
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    //1.用户设置
    this.getUserConfig().then(val => {
      if(!util.isNull(val)&&_.has(val,"bookedClassOpen"))
      {
        let _agreeChecked = val.bookedClassOpen==1?true:false;//约课提醒
        let  _activityChecked = val.activityOpen==1?true:false;//活动提醒
        that.setData({
          agreeChecked:_agreeChecked,
          activityChecked:_activityChecked,
        })
      }

    }, function (err) {

    })
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


  /**
   * 1.约课提醒开关 - 增加订*消息 增不增加无所谓，但是设置动作必须完成
   * data-tid="{{subscribeMsg.agreeConfirmation.tID}}" data-msgtype="1" data-msgdata="agreeChecked" data-des="约课相关提醒" bindchange="switchAction" checked="{{agreeChecked}}" 
   * msgtype 1.预约确认通知  2. 活动开始提醒
   * @param {*} e 
   */
  switchAction(e){
    const that = this;
    const pushReservationTmplIds = e.currentTarget.dataset.tid||e.target.dataset.tid; //模板ID
    const _msgType = e.currentTarget.dataset.msgtype||e.target.dataset.msgtype; //模板类型
    const _msgDataName = e.currentTarget.dataset.msgdata||e.target.dataset.msgdata; //模板对应的data名称
    const _actionDes = e.currentTarget.dataset.des||e.target.dataset.des; //模板对应的data名称    
    wx.requestSubscribeMessage({
      tmplIds: [pushReservationTmplIds],
      success(res) {

       that.switchActionData(_msgType,_msgDataName,_actionDes);//不管对错都要操作的
      },
      fail(res) {
        that.switchActionData(_msgType,_msgDataName,_actionDes);//不管对错都要操作的

        // if (res.errCode == 20004) {// 20004:用户关闭了主开关，无法进行订阅,引导开启
        // }
      }
    });

  },
/**
 * 2. 约课提醒开关 - 正经动作都在这，上面的 订*消息 增不增加无所谓，但是这里的设置动作必须完成
 */
 switchActionData(_msgType,_msgDataName,_actionDes){
    let _switchChecked = this.data[_msgDataName];
    let that = this;
    this.changeController(_msgType,_switchChecked?0:1).then(val => {
      that.setData({
            [`${_msgDataName}`]: val==1?true:false
          }, () => {
            util.toast(_actionDes+(val==1?'打开成功':'关闭成功'));
          })
      }, function (err) {
          that.setData({
            [`${_msgDataName}`]: _switchChecked
          }, () => {
              util.toast(_actionDes+"操作失败");
          })
    })
  },
/**
 * 3. 约课提醒开关 - 消息开关动作提交
 * @param {*} _msgType   //1约课相关提醒   2.活动相关提醒
 * @param {*} _msgState  //0关 1开
 */
  changeController(_msgType,_msgState) 
  {
    return new Promise((resolve, reject) => {
        let _timestamp = (new Date()).valueOf();
        let config = {
            msgType:_msgType,
            msgState:_msgState,
            userID: wx.getStorageSync('USERID'),
            TIMESTAMP: _timestamp,
            FKEY: md5util.md5(wx.getStorageSync('USERID') + _msgType.toString()+_msgState.toString()+  _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }
        axios.post("User/modifyMsgConfig", config, {
            headers: {"Content-Type": 'applciation/json'},
            interceptors: {request: true, response: true},
            validateStatus(status) {return status === 200;}
        }).then(res => {
            if (res.data.code == 1) {
                resolve(res.data.data);
            } else {
                reject(res.data.message);
            }
        }).catch((err) => {
            reject("数据处理有误");
        });
    });
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

}))