const app = getApp();
const logs = require("../../../../../utils/logs");
import axios from '../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../../utils/md5.js')
var util = require('../../../../../utils/util.js')

const filter = require('../../../../../utils/loginFilter'); //1.登录验证
// Page({
Page(filter.loginCheck(true, app, { 
  data: { 
    preventOnShow: true, 
    nickname: '',
    defautlNickName: '', //用于修改对比 
  },
  onShow(e) {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

  },
  onLoad(e) {
    let that = this;
    let _u = e.nickname ? decodeURIComponent(e.nickname) : "";
    if (!util.isNull(_u)) {
      that.setData({
        nickname: _u,
        defautlNickName: _u
      })
    }

  },
  //绑定进入
  bindFocus(e) {
 
    this.setData({
      nickname: e.detail.value
    })
  },  
  //绑定输入
  inputNickname(e) {
    this.setData({
      nickname: e.detail.value
    })
  },
  clearInput() {
    this.setData({
      nickname: ''
    })
  },

  //昵称官取成功
  bindNickNameReview(e){

  },

  //下面的 submitNickName 改成 FORM 提交了要
  formsubmit(e){
    let that = this;
    const _nickname = e.detail.value.nickname;
    

    //无修改
    if (_nickname == that.data.defautlNickName) {
      //util.toast("本次无修改");
      wx.navigateBack();
      return;
    }

    
    if (util.isNull(_nickname)) {
      util.toast("昵称必须填写");
      return;
    }

    let _userID = wx.getStorageSync('USERID');
    let _timestamp = (new Date()).valueOf();
    axios.post('User/modifyBaseInfo', {
        // userName: '',
        nickName: _nickname,
        //birth: _birthday,
        //sex: _sex,
        userID: _userID,
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(_userID + _nickname + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        // 校验状态码
        validateStatus(status) {
          return status === 200;
        },
      }, )
      .then((response) => {
        let _res = response.data;
 
        if (_res.code == 1) {
          let nickName = _res.data.nickname;
          // birthday: '1970-08-28', //初始日期 选择中用
          // birthdayText: '1970-08-28', //显示用
          that.setData({
            nickname: nickName,
            defautlNickName: nickName //用于修改对比
          })

          util.toast("昵称修改成功");
          //#region  调用父页更新
          
          let pages = getCurrentPages();//获取页面栈
          if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
          {
            let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
            prePage.callbackNickName(nickName);//调用上一个页面实例对象的方法
          }
          //#endregion   调用父页更新END




          wx.navigateBack();

        } else {
          util.toast(_res.message);
          wx.navigateBack();
          return;
        }
      })
      .catch((error) => {
        util.toast(error.response.data.message || "修改失败");
        wx.navigateBack();
        return;
      });

  },
  
  //提交昵称修改-这是菜单提交 改成上面FORM提交要
  submitNickName(e) {
    let that = this;
    let _nickname = that.data.nickname;

    //无修改
    if (_nickname == that.data.defautlNickName) {
      wx.navigateBack();
      return;
    }


    if (util.isNull(_nickname)) {
      util.toast("昵称必须填写");
      return;
    }

    let _userID = wx.getStorageSync('USERID');
    let _timestamp = (new Date()).valueOf();
    axios.post('User/modifyBaseInfo', {
        // userName: '',
        nickName: _nickname,
        //birth: _birthday,
        //sex: _sex,
        userID: _userID,
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(_userID + _nickname + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        // 校验状态码
        validateStatus(status) {
          return status === 200;
        },
      }, )
      .then((response) => {
        let _res = response.data;
        if (_res.code == 1) {
          let nickName = _res.data.nickname;
          // birthday: '1970-08-28', //初始日期 选择中用
          // birthdayText: '1970-08-28', //显示用
          that.setData({
            nickname: nickName,
            defautlNickName: nickName //用于修改对比
          })

          util.toast("昵称修改成功");
          //#region  调用父页更新
          
          let pages = getCurrentPages();//获取页面栈
          if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
          {
            let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
            prePage.callbackNickName(nickName);//调用上一个页面实例对象的方法
          }
          //#endregion   调用父页更新END




          wx.navigateBack();

        } else {
          util.toast(_res.message);
          wx.navigateBack();
          return;
        }
      })
      .catch((error) => {
        util.toast(error.response.data.message || "修改失败");
        wx.navigateBack();
        return;
      });


  }
}))