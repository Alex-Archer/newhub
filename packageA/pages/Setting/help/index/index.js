const app = getApp();
const logs = require("../../../../../utils/logs");
import _ from '../../../../../libs/we-lodash'
import axios from '../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../../utils/md5.js')
var util = require('../../../../../utils/util.js')
const filter = require('../../../../../utils/loginFilter');
Page(filter.loginCheck(true, app, {
  data: {
    preventOnShow: true, 

    webURL: 'https://ssl.aoben.yoga/extend/help/',
    show: false, 
    question: [], //文章列表 
    answer: "", //回答 infoShow
    infoShow: false, //显示窗
    answerTitle:'',//文章标题
    answerContent:'',//文章内容
  },
  //加载问题列表
  initQuestion() {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    axios.get("Article/listPub", {
      pageSize: 8,
      orderSet: 0,
      pageIndex: 1,
      typeClass: 5,
      content: 1,
      TIMESTAMP: _timestamp,
      userID: wx.getStorageSync('USERID'),
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
      if (_res.code === 1) {
        let _resdata = _res.data;
        this.setData({
          question: _resdata.data
        })
      } else {

        util.toast(_res.message);
        setTimeout((res) => {
          wx.navigateBack();
        }, 1000);
      }
    }).catch((err) => {
      util.toast("获取错误，请重新打开！");
      setTimeout((res) => {
        wx.navigateBack();
      }, 1000);
    });

  },
  onLoad() {
    this.initQuestion();
  },

  onShow() {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 
  },
  moreQuestion() {
    util.toast('暂无更多问题');
  },
  //拨打电话
  callBind(e) {
    let phone = e.currentTarget.dataset.call || e.target.dataset.call;
    if(util.isNull(phone))
    {
      util.toast('自动拨打出错！');
      return;
    }

    wx.makePhoneCall({
      phoneNumber:phone
    }).catch((err) => {
    })
  },
  online() {
    tui.toast('请添加8888888进行咨询', 3000);
  },
  //小弹窗关闭
  popupClose() {
    this.setData({
      infoShow: false, //显示窗
      answerTitle:'',//文章标题
      answerContent:'',//文章内容
    })    
  },
  //获取内容
  getAnswer(e) 
  {
    let that = this;
    wx.showLoading()
    let artID = Number(e.currentTarget.dataset.index || e.target.dataset.index);
    if(util.isNull(artID))
    {
      wx.hideLoading({
        success: () => {
          setTimeout((res) => {
            util.toast("获取错误，请重新打开！");
          }, 1000);
        }
      });
      return;

    }
    let _timestamp = (new Date()).valueOf();
    axios.get("Article/detailInfoPub", {
      id: artID,
      TIMESTAMP: _timestamp,
      userID: wx.getStorageSync('USERID'),
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }, {
      headers: {
        "Content-Type": 'applciation/json',
      },
      
      validateStatus(status) {
        return status === 200;
      },
    }).then(res => {
      wx.hideLoading();
      let _res = res.data;
      if (_res.code === 1) {
        let _resdata = _res.data;
        
        this.setData({
          answerTitle:_resdata.title,//文章标题
          answerContent:_resdata.content,//文章内容
          infoShow: true, //显示窗
        })
      } else {
        util.toast(_res.message);
        this.setData({
          infoShow: false, //显示窗
          answerTitle:'',//文章标题
          answerContent:'',//文章内容
        })        
      }
    }).catch((err) => {
      wx.hideLoading({
        success: () => {
          setTimeout((res) => {
            util.toast("获取错误，请重新打开！");
          }, 1000);
        }
      });
    });

  },
}))