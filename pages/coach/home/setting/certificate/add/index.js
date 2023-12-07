const app = getApp();
const logs = require("../../../../../../utils/logs");
import axios from '../../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../../../libs/we-lodash'
var md5util = require('../../../../../../utils/md5.js')
var util = require('../../../../../../utils/util.js')
const filter = require('../../../../../../utils/loginFilter'); //1.登录验证

Page(filter.loginCheck(true, app, { 
  data: {
    preventOnShow: true, 
    refreshParent:false,

    desc: "",
    phone: "",
    //btnType: "primary"
    btnType: "default",

    //反馈类型
    typeShow: false,
    selectText: '请选择类型',
    selectValue:0,
    defaultTypeValue: ['综合图片'],
    typeItems: [{
      text: "综合图片",
      value: "0"
    }], //{text: "保密",value: "0"}....{text: "保密4",value: "4"}

    imageList: [],

    //提交按钮控制
    subText:'确认上传',
    subDisabled:false,
  },
  //类型选择出现
  typeShow() {
    this.setData({
      typeShow: true
    })

  },
  //类型选择关闭
  hideType() {
    this.setData({
      typeShow: false
    })

  },
  //类型选择
  changeType(e) {
    logs.log("【】", e.detail, true);
    //{"type":"change","timeStamp":7287,"target":{"id":"","dataset":{}},"currentTarget":{"id":"","dataset":{}},"mark":{},"detail":{"text":"服务人员问题","value":4,"index":[3],"result":"服务人员问题","params":0},"mut":false} 
    this.setData({
      selectText: e.detail.result,
      selectValue:e.detail.value,
      defaultTypeValue: [e.detail.result],
    })

  },
  onLoad: function (options) {
    this.setData({
      // btnType: options.page == 'mall' ? 'danger' : 'primary'
      btnType: options.page == 'mall' ? 'danger' : 'default'
    })

    //初始化反馈类型
    this.initFeedBackType();
  },
  onShow(e) {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

  },
  inputDesc(e) {
    this.setData({
      desc: e.detail.value
    })
  },
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  remove: function (e) {
    //移除图片
    console.log(e)
    let index = e.detail.index;
    let that = this;
    let _imageList = that.data.imageList;
    _.pullAt(_imageList, index); // 移除第一个
    that.setData({
      imageList: _imageList
    })

  },
  //上传
  uploadComplete(e) {
    console.log(e.detail)
    this.data.imageList = e.detail.imgArr
  },

  //提交时界面
  submitUI(text,disabled ){
    let that = this;
    that.setData({
      subText:text,
      subDisabled:disabled,
    })
  },

  submit() {
     const that = this;
     that.submitUI('提交中...',true);

    let _tid= this.data.selectValue;

    let _upload = util.isNull(this.data.imageList[0])?false:true;//1. 是否上传图片，有图的话必须打开，没图必须关闭


      that.submitUI('提交中...',true);
      //开始上传
      var timestamp = (new Date()).valueOf();
      axios('Coach/uploadCertificate', {
            method: 'POST',
            upload:  _upload,//2. 是否上传图片，有图的话必须打开，没图必须关闭
            dataType: 'json',
            data: {
              name: 'file',// 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
              filePath: this.data.imageList[0],// 要上传文件资源的路径 (本地路径)

              tid:_tid,//意见类型

              userID: wx.getStorageSync('USERID'),
              TIMESTAMP: timestamp,
              FKEY: md5util.md5(wx.getStorageSync('USERID') +_tid.toString()+ timestamp.toString() + app.globalData.APP_INTF_SECRECT)

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
          //{"code":1,"message":"感谢您的反馈，我们的工作人员将尽快处理"} 
          if(_data.code==1){
            that.setData({
                refreshParent:true
            },()=>{
                util.toast("图片上传成功！",null,null,()=>{
                    setTimeout((res) => {
                    wx.navigateBack();
                    }, 1000);
                });
            })

          }else{
            util.toast(_data.message);
            that.submitUI('确认上传',false);
            return;
          }
        })
        .catch((error) => {
          util.toast("上传失败，请返回重试！");
          that.submitUI('确认上传',false);
          return;
        });

      //开始上传  END          

  },
  //初始化反馈类型
  initFeedBackType() {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    axios.get("Coach/certificateTypePub", {
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
      logs.log("【上传类型数据获取 成功】", _res, true)
      //{"code":1,"message":"success","data":[{"id":1,"title":"小程序使用问题"},。。。。。{"id":10,"title":"其它问题"}]} 
      if (_res.code == 1) {

        //将 [{"id":1,"title":"小程序使用问题"},.......]
        //明天让服务端重写
        if (_res.data.length > 0) {

          /*{"id":10,"title":"其它问题"} 转成 {text: "保密",value: "0"}
          已让服务端重新生成标准,不再使用这里的转换
          let result = _.map(_res.data, item => ({
              text: item.title,
              value: item.id
          }));*/
          let result = _res.data;
          this.setData({
            typeItems: result,
            selectText: result[0].text,
            selectValue: result[0].value,
            defaultTypeValue: [result[0].text],

          })
        }


      }

    }).catch((err) => {
      logs.log("【私有数据获取 失败】 ERR", err, true)
    });
  },

  onUnload: function () {

    if(this.data.refreshParent){//是否需要刷新
        // 页面卸载时触发
        //触发用户中心更新头像昵称
        let pages = getCurrentPages(); //获取页面栈
        if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
        {
            let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
            prePage.callBackReturn({
                
            }); //调用上一个页面实例对象的方法
        }   
    }
},


}))