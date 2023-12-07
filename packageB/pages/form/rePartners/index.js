const app = getApp();
const cityData = require('../../../../utils/picker.city.js')
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')  
const form = require("../../../../libs/validation.js")

const filter = require('../../../../utils/loginFilter');
Page(filter.loginCheck(true, app, {

  /**
   * 页面的初始数据
   */
  data: {
    preventOnShow: true, 
    globalURL: app.globalData.globalURL,
    //地区选择
    selectList: cityData, //接口返回picker数据,此处就直接使用本地测试数据
    multiArray: [], //picker数据
    value: [0, 0, 0],
    text: "请选择您所处地区",
    id: "",//最终选择的城市ID

    //提交表单
    btnType: "default",
    subText:'立即申请',
    subDisabled:true,

    //表单项
    phone:'',
    uname:'',

    //审核状态显示
    verifyBoxShow:false,

    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,
  },
  //获取申请状态
getApplyState(){
  let that = this;
  let _timestamp = (new Date()).valueOf();
  axios.get("Coach/applyState", {
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
      let _verifyInfo = _res.data;
      if(_verifyInfo.state===0){//0审核中 1通过 2未通过
        this.submitUI("有审核中的申请",true);

        that.setData({
          verifyBoxShow:true,
          verifyInfo:_verifyInfo,
        })
      }
      else if(_verifyInfo.state===1){

        this.submitUI("恭喜通过审核",true);
        that.setData({
          verifyBoxShow:true,
          verifyInfo:_verifyInfo,
        })
      }
      else{
        this.submitUI("立即申请",false);
        that.setData({
          verifyBoxShow:false
        })
      }
      
    }else{
      //尝试可以申请
      this.submitUI("立即申请",false);
      that.setData({
        verifyBoxShow:false
      })
    }
  }).catch((err) => {
    //尝试可以申请
    this.submitUI("立即申请",false);
    that.setData({
      verifyBoxShow:false
    })
  });
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getApplyState();
    
    let multiArray = [
      this.toArr(this.data.selectList),
      this.toArr(this.data.selectList[0].children),
      this.toArr(this.data.selectList[0].children[0].children)
    ]
    this.setData({
      multiArray: multiArray
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

  //#region 下拉选择区域

  toArr(object) {
    let arr = [];
    for (let i in object) {
      arr.push(object[i].text);
    }
    return arr;
  },
  changePicker(e){
    let value = e.detail.value;
    if (this.data.selectList.length > 0) {
      let provice = this.data.selectList[value[0]].text
      let city = this.data.selectList[value[0]].children[value[1]].text
      let district = this.data.selectList[value[0]].children[value[1]].children[value[2]].text
      this.setData({
        text:provice + " " + city + " " + district,
        id:this.data.selectList[value[0]].children[value[1]].children[value[2]].value
      })
    }
  },
  columnPicker: function (e) {
    //第几列 下标从0开始
    let column = e.detail.column;
    //第几行 下标从0开始
    let value = e.detail.value;
    if (column === 0) {
      let multiArray = [
        this.data.multiArray[0],
        this.toArr(this.data.selectList[value].children),
        this.toArr(this.data.selectList[value].children[0].children)
      ];
      this.setData({
        multiArray:multiArray,
        value:[value, 0, 0]
      })
    } else if (column === 1) {
      let multiArray = [
        this.data.multiArray[0],
        this.data.multiArray[1],
        this.toArr(this.data.selectList[this.data.value[0]].children[value].children)
      ];
      this.setData({
        multiArray:multiArray,
        value:[this.data.value[0], value, 0]
      })
    }
  },
  //#endregion 下拉选择区域END

  //提交时界面
  submitUI(text,disabled ){
    let that = this;
    that.setData({
      subText:text,
      subDisabled:disabled,
    })
  },
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  inputUname(e) {
    this.setData({
      uname: e.detail.value
    })
  },  
  //提交表单
  submit() {
    const that = this;
    that.submitUI('提交中...',true);

   let rules = [
    {
      name: "id",
      rule: ["required"],
      msg: ["请选择所属区域"]
    },
    {
     name: "uname",
     rule: ["required", "maxLength:6"],
     msg: ["请输入您的联系称呼", "您的称呼太长了"]
   }, {
     name: "phone",
     rule: ["required","isMobile"],
     msg: ["联系手机号必须填写", "请输入正确的手机号"]
   }];
   let formData = {
    uname: this.data.uname,
    phone: this.data.phone,
    id: this.data.id
  }
   let checkRes = form.validation(formData, rules);
   if (!checkRes) {
     that.submitUI('提交中...',true);

     let _mobile = this.data.phone;
     let _nickName= this.data.uname;
     let _cityId= this.data.id; 
     
     //开始提交
     var timestamp = (new Date()).valueOf();
     axios('Coach/apply', {
           method: 'POST',
           data: {
             nickName: _nickName,
             mobile: _mobile,
             cityId:_cityId,

             userID: wx.getStorageSync('USERID'),
             TIMESTAMP: timestamp,
             FKEY: md5util.md5(wx.getStorageSync('USERID') +_cityId.toString()+_nickName.toString()+_mobile.toString()+ timestamp.toString() + app.globalData.APP_INTF_SECRECT)
           },
         }, {
           headers: {
             "Content-Type": 'application/json; charset=utf-8',
           }
         }

       )
       .then((res) => {
         const {data} = res;
         let _data = util.jsonTestParse(data);//解决返回为字符串型JSON问题
         if(_data.code==1){
           util.toast(_data.message);
           setTimeout((res) => {
             wx.navigateBack();
           }, 1000);
         }else{
           util.toast(_data.message);
           that.submitUI('立即申请',false);
           return;
         }
       })
       .catch((error) => {
         util.toast("申请失败，请返回重试！");
         that.submitUI('立即申请',false);
         return;
       });
     //开始上传  END          

   } else {
     util.toast(checkRes);
     that.submitUI('立即申请',false);
   }
 },
 initNavigation(e) {
    this.setData({
      top:e.detail.top
    })
  },
 onPageScroll(e) {
    this.setData({
      scrollTop:e.scrollTop
    })
  },
  back() {
    wx.navigateBack();
  },
}))