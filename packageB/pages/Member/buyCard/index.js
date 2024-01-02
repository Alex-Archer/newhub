const app = getApp();
const cityData = require('../../../../utils/picker.city.js')
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')
const form = require("../../../../libs/validation.js")
var apis = require('../../../../utils/apis.js')

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
    globalURL: app.globalData.globalURL,
    optionData: {},
    countdown: '06', // 倒计时时间
    show: false,
    time: 6,

    agreeContent: '1.参与aoben shared yoga集训营的用户，具有完全的法律行为能力，同意遵守相关管理规章制度，应接受aoben shared yoga集训营的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守aoben shared yoga集训营的相关规定。1.参与aoben shared yoga集训营的用户，具有完全的法律行为能力，同意遵守相关管理规章制度，应接受aoben shared yoga集训营的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守aoben shared yoga集训营的相关规定。',
    //preventOnShow: true, 
    //地区选择
    // selectList: cityData, //接口返回picker数据,此处就直接使用本地测试数据
    multiArray: [], //picker数据
    value: [0, 0, 0],
    text: "请选择您所处地区",
    id: "", //最终选择的城市ID

    formtType: 0, //默认选中综合瑜伽馆  

    //提交表单
    btnType: "warning",
    subText: '立即获取招募名额',

    //表单项
    phone: '',
    uname: '',

    //审核状态显示
    verifyBoxShow: false,
    // customerMobile:'',
    // customerWeixin:'',



    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,

    //是否同意协议
    agreeCheckbox: false,
    removeGradientContent: false, //协议是否展开
    id: '',
    coupon_package_group_id: '',
  },
  // 阅读
  handyue() {
    this.setData({
      show: false,
      countdown: '06', // 初始化值
      time: 6,
      agreeCheckbox: true,
    })
  },
  //协议选框点击
  checkboxChange(e) {
    console.log(e.detail);
    let _agree = e.detail.value || [];
    this.setData({
      agreeCheckbox: util.isNull(_agree) ? false : true,
    })
  },
  // 显示协议
  xieyiClick(e) {
    let _title = e.currentTarget.dataset.num
    let intve = setInterval(() => {
      let minute = this.data.time;
      minute < 10 && minute > 0 ? minute = '0' + minute : '';
      this.setData({
        countdown: minute,
        time: this.data.time - 1
      })
      if (this.data.time < 0) {
        clearInterval(intve)
      }
    }, 1000);
    this.setData({
      show: true,
      title: _title,
    })
  },
  packgroup() {
    let _config = {
      vip_package_id: this.data.id
    }
    apis.get('/CouponPackageGroup/getVipCouponByIdPub', _config, {
      "Content-Type": 'applciation/json'
    }, false).then(val => {
      console.log(val);
    })
  },
  swipFunct() {
    let _config = {}
    apis.get('/CouponPackageGroup/getVipCouponPackagePub', _config, {
      "Content-Type": 'applciation/json'
    }, false).then(val => {
      this.setData({
        coupon_package_group_id: val.coupon_package_group_id,
        poster: val.list_poster,
        reduce: Number(val.original_price) / 100,
        price: Number(val.price) / 100,
      })
    })
  },
  //支付按钮
  btnPay() {
    if (!this.data.agreeCheckbox) {
      util.toast("请先阅读并接受会员卡协议", null, null, () => {
        this.setData({
          removeGradientContent: true, //展开协议
        }, () => {
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
    this.unclick()
  },
  // 进行支付
  unclick() {
    let _timestamp = (new Date()).valueOf();
    let _packageid = this.data.coupon_package_group_id;
    let _Config = {
      userID: wx.getStorageSync('USERID'),
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _packageid + 0 + _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
      TIMESTAMP: _timestamp,
      id: _packageid,
      balance: 0
    }
    apis.posts("CouponPackageOrder/creatOrder", _Config, true)
      .then(async (res) => {
        const payRes = await util.wxPayment(res);
        console.log(payRes);
        if (payRes.errMsg == 'requestPayment:ok') {
          wx.showToast({
            title: '支付成功',
            duration: 1500
          });
          wx.redirectTo({
            // url: '/packageA/pages/order/list/index', // 订单页面
            url: '/packageB/pages/Member/myRights/index', // 成为会员页面
          })
        }
      }).catch((err) => {
        wx.showToast({
          title: err.message,
          icon: 'none',
        })
      });
  },
  //2.支付完，订单查询
  queryGroupOrder(orderNum, _type) {
    const that = this;
    //let _type= "2";      //;//0=团课，1=私教课，2=集训课return new Promise((resolve, reject) => {
    return new Promise((resolve, reject) => {
      var timestamp = (new Date()).valueOf();
      apis.posts('CourseOrder/orderInfo', {
          type: _type, //0=团课，1=私教课，2=集训课
          orderNo: orderNum,
          userID: wx.getStorageSync('USERID'),
          TIMESTAMP: timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + _type + orderNum + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }, {
        })
        .then((res) => {
        })
        .catch((error) => {
        });
    });
  },
  swichType(e) {
    let _type = e.currentTarget.dataset.type || e.target.dataset.type;
    this.setData({
      formtType: Number(_type)
    }, () => {
      this.getApplyState();
    })

  },
  //获取申请状态
  getApplyState() {
    let that = this;
    let _type = this.data.formtType;
    let _timestamp = (new Date()).valueOf();
    axios.get("Recruit/applyState", {
      type: _type,
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
        if (_verifyInfo.state === 0) { //0待确认 1处理中 2已处理
          this.submitUI("您的申请等待官方确认中", true);
        } else if (_verifyInfo.state === 1) {
          this.submitUI("您的申请官方正在处理中", true);
        } else if (_verifyInfo.state === 2) {
          this.submitUI("您的申请官方已处理", true);
        } else {
          this.submitUI("立即获取招募名额", false);
        }

      } else {
        //尝试可以申请
        this.submitUI("立即获取招募名额", false);
      }
    }).catch((err) => {
      //尝试可以申请
      this.submitUI("立即获取招募名额", false);
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      isvip: options.isvip,
      firstbuy: options.firstbuy,
    })
    this.swipFunct()
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
  initNavigation(e) {
    this.setData({
      top: e.detail.top
    })
  },
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  back() {
    wx.navigateBack();
  },

  readmoreContent() {
    this.setData({
      removeGradientContent: !this.data.removeGradientContent
    })
  },
  // 到时候要删掉
  myRights() {
    wx.redirectTo({
      url: '../myRights/index',
    })
  }


  // }))
})