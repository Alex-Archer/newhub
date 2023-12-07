const app = getApp();
const logs = require("../../../utils/logs");
const _config = require('../../../config');
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../utils/md5.js')
var util = require('../../../utils/util.js')

const filter = require('../../../utils/loginFilter');

Page(filter.loginCheck(true, app, {
  data: {
    show: false,
    value: '',
    cursor: false,
    text: '转账',
    buttonBackground: '#5677fc',
    darkMode: false,
    isDecimal: true,

    buttonDisabled:true,
    balance:'0.00',

    isAdmin:wx.getStorageSync('USERID')=='60284c0ba714360657d42f3137661f93'?true:false,
  },

  //电子签
  cleckSign(){
    let id="yDSLKUUglmam5cUyCcu9j8eWBScqp9vy"
    let name ="张"
    let phone ="15370752212"
    let path =`pages/guide?from=SFY&to=MVP_CONTRACT_COVER&id=${id}&name=${name}&phone=${phone}`
    // wx.navigateToMiniProgram({
     wx.openEmbeddedMiniProgram({//半屏
    appId:"wx371151823f6f3edf", // 电子签小程序的appId wx371151823f6f3edf 测试 wxa023b292fd19d41d 正式
    path:path,
    envVersion:"release",
    success(res){
      //打开成功
    },
    })
  },
  onLoad(op){

  },
  focus() {
    this.setData({
      isDecimal:true,
      darkMode:false,
      buttonBackground:'#5677fc',
      text:'转账',
      cursor:true,
      show:true
    })
  },
  changeStyle() {
    this.setData({
      isDecimal:true,
      text:'确定',
      cursor:true,
      darkMode:false,
      buttonBackground:'#07c160',
      show:true
    })
  },
  changeMode() {
    this.setData({
      isDecimal:true,
      text:'确定',
      cursor:true,
      darkMode:true,
      show:true
    })
  },
  disabledDecimal() {
    this.setData({
      isDecimal:false,
      cursor:true,
      show:true
    })
  },
  keyTap(e) {
    console.log(e)
    let keyVal = e.detail.value;
    let value = this.data.value;
    if (~value.indexOf('.') && keyVal == '.') return;
    //最大9位，自行控制即可
    if (value.length == 9) {
      tui.toast('超过限制位数，不可输入')
      return
    }
    if (!this.data.value && keyVal == '.') {
      this.setData({
        value:'0.'
      })
    } else {
      this.setData({
        value:this.data.value + keyVal
      })
    }
  },
  backspace(e) {
    let val = this.data.value;
    if (val) {
      this.setData({
        value:val.substring(0, val.length - 1)
      })
    }
  },
  confirm(e) {
    this.setData({
      show:false,
      cursor:false
    })
    // util.toast('转账金额为：' + Number(this.data.value))
    util.toast('您的余额不够转帐')
  },

  goViewLog(){
      wx.navigateTo({
        url: '../log_extract/index',
      })
  },
}))