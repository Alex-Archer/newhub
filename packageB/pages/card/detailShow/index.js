const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../utils/util.js')
var md5util = require('../../../../utils/md5.js')
const filter = require('../../../../utils/loginFilter'); 
// 性别枚举  
const Classes= [
  {id:1,title:"初阶团课"},
  {id:2,title:"进阶团课"},
  {id:3,title:"集训营"},
  {id:4,title:"初阶私教"},
  {id:5,title:"进阶私教"},
  {id:6,title:"高级定制"},
]

// packageB/pages/card/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,

    classTitle:'',

    agreeContent:'1.参与aoben shared yoga集训营的用户，具有完全的法律行为能力，同意遵守相关管理规章制度，应接受aoben shared yoga集训营的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守aoben shared yoga集训营的相关规定。1.参与aoben shared yoga集训营的用户，具有完全的法律行为能力，同意遵守相关管理规章制度，应接受aoben shared yoga集训营的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守aoben shared yoga集训营的相关规定。',
    //是否同意协议
    agreecheckbox:false,
    removeGradientContent:false,//协议是否展开

  },
  readmoreContent() {
    this.setData({
      removeGradientContent: !this.data.removeGradientContent
    })
  }, 
  //协议选框点击
  checkboxChange(e)
  {
    let _agree = e.detail.value||[];
    this.setData({
      agreecheckbox:util.isNull(_agree)?false:true
    })
  },
  //支付按钮
  btnPay(){
    if(!this.data.agreecheckbox)
    {
      util.toast("请先阅读并接受会员卡协议",null,null,()=>{
        this.setData({
          removeGradientContent:true,//展开协议
        },()=>{
          //移动到底部
          wx.createSelectorQuery().select('.agree-label').boundingClientRect(function (rect) {
            // 使页面滚动到底部
            wx.pageScrollTo({
              scrollTop: rect.bottom
            })
          }).exec();
        })
      })
    }

  },
  initNavigation(e) {
    this.setData({
        top: e.detail.top
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _cla = options.cla||0;
    if(!util.isNull(_cla)&&_cla!=0)
    {
      const _items = _.find(Classes, {id: Number(_cla) });
      if(!util.isNull(_items)&&_.has(_items,"title"))
      {
        this.setData({
          classTitle:_items.title
        })
      }
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  scanCode(e){
     wx.scanCode({
      onlyFromCamera: false, //禁止相册
      scanType: ['qrCode'], //只识别二维码
      success: (res) => {
          // 获取到扫描到的二维码内容
          const qrCodeContent = res.result;
   
      },
      fail: (error) => {
          console.log('扫描失败', error);
      }
    })
  }

})