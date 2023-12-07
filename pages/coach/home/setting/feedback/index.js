
const app = getApp();
const logs = require("../../../../../utils/logs"); 
import _ from '../../../../../libs/we-lodash'
import axios from '../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../../utils/md5.js')
var util = require('../../../../../utils/util.js')  
const form = require("../../../../../libs/validation.js")

const filter = require('../../../../../utils/loginFilter');
Page(filter.loginCheck(true, app, {
  data: {
    preventOnShow: true, 
 
    desc: "",
    phone: "",
    //btnType: "primary"
    btnType: "default",

    //反馈类型
    typeShow: false,
    selectText: '请选择类型',
    selectValue:0,
    defaultTypeValue: ['综合问题'],
    typeItems: [{
      text: "综合问题",
      value: "0"
    }], //{text: "保密",value: "0"}....{text: "保密4",value: "4"}

    imageList: [],

    //提交按钮控制
    subText:'提交反馈',
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

    let rules = [{
      name: "desc",
      rule: ["required", "minLength:8", "maxLength:500"],
      msg: ["请输入问题描述", "问题描述必须8个或以上字符", "问题描述不能超过500个字符"]
    }, {
      name: "phone",
      rule: ["isMobile"],
      msg: ["请输入正确的手机号,不提供请留空"]
    }];
    let formData = {
      desc: this.data.desc,
      phone: this.data.phone
    }
    let checkRes = form.validation(formData, rules);

    let _mobile = this.data.phone;
    let _content= this.data.desc;
    let _tid= this.data.selectValue;

    let _upload = util.isNull(this.data.imageList[0])?false:true;//1. 是否上传图片，有图的话必须打开，没图必须关闭

    if (!checkRes) {
      that.submitUI('提交中...',true);
      //开始上传
      var timestamp = (new Date()).valueOf();
      axios('Feedback/detailEdit', {
            method: 'POST',
            upload:  _upload,//2. 是否上传图片，有图的话必须打开，没图必须关闭
            dataType: 'json',
            data: {
              name: 'file',// 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
              filePath: this.data.imageList[0],// 要上传文件资源的路径 (本地路径)

              tid:_tid,//意见类型
              content:_content,//意见内容
              mobile:_mobile,//手机号

              userID: wx.getStorageSync('USERID'),
              TIMESTAMP: timestamp,
              FKEY: md5util.md5(wx.getStorageSync('USERID') +_tid.toString()+_mobile.toString()+ timestamp.toString() + app.globalData.APP_INTF_SECRECT)

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

            util.toast("感谢您的反馈,我们将尽快处理！");
            setTimeout((res) => {
              wx.navigateBack();
            }, 1000);
            

          }else{
            util.toast(_data.message);
            that.submitUI('提交反馈',false);
            return;
          }
        })
        .catch((error) => {
          util.toast("反馈失败，请返回重试！");
          that.submitUI('提交反馈',false);
          return;
        });

      //开始上传  END          

    } else {
      util.toast(checkRes);
      that.submitUI('提交反馈',false);
    }
  },
  //初始化反馈类型
  initFeedBackType() {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    axios.get("Feedback/type", {
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
      logs.log("【反馈类型数据获取 成功】", _res, true)
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


}))