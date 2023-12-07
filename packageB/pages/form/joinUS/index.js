const app = getApp();
const cityData = require('../../../../utils/picker.city.js')
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')  
const form = require("../../../../libs/validation.js")

const filter = require('../../../../utils/loginFilter'); 
// Page(filter.loginCheck(true, app, {
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,

    //preventOnShow: true, 
    globalURL: app.globalData.globalURL,
    //地区选择
    selectList: cityData, //接口返回picker数据,此处就直接使用本地测试数据
    multiArray: [], //picker数据
    value: [0, 0, 0],
    text: "请选择您所处地区",
    id: "",//最终选择的城市ID

    formtType:0,//默认选中综合瑜伽馆  

    //提交表单
    btnType: "warning",
    subText:'立即获取招募名额',
    subDisabled:false,

    //表单项
    phone:'',
    uname:'',

    //审核状态显示
    verifyBoxShow:false,
    // customerMobile:'',
    // customerWeixin:'',

    

    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,
  },
  swichType(e){
    let _type = e.currentTarget.dataset.type||e.target.dataset.type;
    this.setData({
      formtType:Number(_type)
    },()=>{
      this.getApplyState();
    })

  },
  //获取申请状态
getApplyState(){
  let that = this;
  let _type = this.data.formtType;
  let _timestamp = (new Date()).valueOf();
  axios.get("Recruit/applyState", {
    type:_type,
    userID: wx.getStorageSync('USERID'),
    TIMESTAMP: _timestamp,
    FKEY: md5util.md5(wx.getStorageSync('USERID') + _type.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
      if(_verifyInfo.state===0){//0待确认 1处理中 2已处理
        this.submitUI("您的申请等待官方确认中",true);
      }
      else if(_verifyInfo.state===1){
        this.submitUI("您的申请官方正在处理中",true);
      }
      else if(_verifyInfo.state===2){
        this.submitUI("您的申请官方已处理",true);
      }      
      else{
        this.submitUI("立即获取招募名额",false);
      }
      
    }else{
      //尝试可以申请
      this.submitUI("立即获取招募名额",false);
    }
  }).catch((err) => {
    //尝试可以申请
    this.submitUI("立即获取招募名额",false);
  });
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    new Promise(()=>{
      let multiArray = [
        this.toArr(this.data.selectList),
        this.toArr(this.data.selectList[0].children),
        this.toArr(this.data.selectList[0].children[0].children)
      ]
      this.setData({
        multiArray: multiArray
      })
    })
    new Promise(()=>{
      this.getApplyState();//获取状态
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
    //if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 
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
     name: "phone",
     rule: ["required","isMobile"],
     msg: ["联系手机号必须填写", "请输入正确的手机号"]
   },
    {
     name: "uname",
     rule: ["required", "maxLength:6"],
     msg: ["请输入您的联系称呼", "您的称呼太长了"]
   },
      {
      name: "id",
      rule: ["required"],
      msg: ["请选择所属区域"]
    }
  ];
   let formData = {
    uname: this.data.uname,
    phone: this.data.phone,
    id: this.data.id
  }
   let checkRes = form.validation(formData, rules);

   if (!checkRes) {
     that.submitUI('提交中,请稍候...',true);

     let _mobile = this.data.phone;
     let _nickName= this.data.uname;
     let _cityId= this.data.id; 
     let _type = this.data.formtType;   //0=综合瑜伽馆，1=精品包月教练，2=私教考证

     
     //开始提交
     var timestamp = (new Date()).valueOf();
     axios('Recruit/apply', {
           method: 'POST',
           data: {
            type:_type,
             nickName: _nickName,
             mobile: _mobile,
             cityId:_cityId,
             userID: wx.getStorageSync('USERID'),
             TIMESTAMP: timestamp,
             FKEY: md5util.md5(wx.getStorageSync('USERID') + _type.toString() +_cityId.toString()+_nickName.toString()+_mobile.toString()+ timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
           that.submitUI('立即获取招募名额',false);
           return;
         }
       })
       .catch((error) => {
         util.toast("提交失败，请重试！");
         that.submitUI('立即获取招募名额',false);
         return;
       });

     //开始上传  END          

   } else {
     util.toast(checkRes);
     that.submitUI('立即获取招募名额',false);
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
// }))
})