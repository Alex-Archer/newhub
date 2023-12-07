const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../utils/md5.js')
var util = require('../../../utils/util.js')
const form = require("../../../libs/validation.js")
const filter = require('../../../utils/loginFilter');
Page(filter.loginCheck(true, app, { 

  /**
   * 页面的初始数据
   */
  data: {
    preventOnShow: true, 

    globalURL: app.globalData.globalURL,
    loading:true,

    nickname: null,
    headimgurl: null,
    vipName: "普通会员",
    vipExpireTime: 0, //会员 到期时间
    vipExpireTimeStr: '', //会员 到期时间 



    welcomeMessage: "",



    bottomShow: false, //默认不显示购买
    btnType: "warning",
    subDisabled: true,
    subText: "暂无会员可以购买", //支付0.01元 立即成为会员

    price: 0, //现价
    originalprice: 0, //原价
    buyCardID:0,//卡的动态ID，购买时需要传过去

  },
  //初始化会员卡
  initCard() {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    let _type = 1;
    let _tid = 4;
    axios.get("MembershipCard/cardList", {
      type: _type,
      tid: _tid,
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(_type.toString() + _tid.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }, {
      headers: {
        "Content-Type": 'applciation/json',
      },
      interceptors: {
        request: true, 
        response: false 
      },
      
      validateStatus(status) {
        return status === 200;
      },
    }).then(res => {

      if (res.data.code === 1) {
        const {
          data
        } = res.data;
        let _originalprice = data.originalprice; //原价
        let _price = data.price; //现价
        let _starttime = data.starttime; //开售时间
        let _endtime = data.endtime; //结束时间

        that.setData({
          price: _price, //现价
          originalprice: _originalprice, //原价
          buyCardID:data.id,//对应卡的ID，购买时必须传
        })

        // 当前时间戳 
        let now = Date.now();
        if (_endtime == 0) { //无结束时间
          if (now >= _starttime && _price > 0) {
            //可以购买
            that.setData({
              bottomShow: true, //默认不显示购买
              subDisabled: false,
              subText: "支付" + (_price/100) + "元  立即成为会员",
            })

          } else {
            //不可以购买
            that.setData({
              bottomShow: false, //默认不显示购买
              subDisabled: true,
              subText: "暂无会员可以购买",
            })
          }
        } else { //必须在时间段内 且价格不能为0
          if (now >= _starttime && now <= _endtime && _price) {
            //可以购买
            that.setData({
              bottomShow: true, //默认不显示购买
              subDisabled: false,
              subText: "支付" + (_price/100) + "元  立即成为会员",
            })
          } else {
            //不可以购买
            that.setData({
              bottomShow: false, //默认不显示购买
              subDisabled: true,
              subText: "暂无会员可以购买",
            })
          }
        }
      } else {
        //不可以购买
        that.setData({
          bottomShow: false, //默认不显示购买
          subDisabled: true,
          subText: "暂无会员可以购买",
          price: 99999999, //调大禁止购买
          originalprice: 9999999, //调大禁止购买
          buyCardID:0,//buyCardID:data.id,//对应卡的ID，购买时必须传 为0不让买
        })

      }

    }).catch(err => {
      //不可以购买
      that.setData({
        bottomShow: false, //默认不显示购买
        subDisabled: true,
        subText: "暂无会员可以购买",
        price: 99999999, //调大禁止购买
        originalprice: 9999999, //调大禁止购买
        buyCardID:0,//对应卡的ID，购买时必须传 为0不让买
      })
    })

  },
  //初始查询会员状态
  initLoad() {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    axios.get("/User/indexPub", {
      userID: wx.getStorageSync('USERID'),
      thisPage: "home",
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5("home" + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }, {
      headers: {
        "Content-Type": 'applciation/json',
      },
      interceptors: {
        request: true, 
        response: false 
      },
      
      validateStatus(status) {
        return status === 200;
      },
    }).then(res => {
      let _res = res.data;
      if (_res.code == 1) {
        const {
          user
        } = _res.data;
        if (util.isNull(user.nickname)) {
          util.toast("信息有误");
          setTimeout((res) => {
            wx.navigateBack();
          }, 1000);
          return;
        }
        let _headimgurl = user.headimgurl;
        if(util.isNull(_headimgurl)){
          _headimgurl = "/static/urlimg/hqq/icon-nickphoto.png";
        }

        that.setData({
          nickname: user.nickname,
          headimgurl: _headimgurl,          
          vipName: user.vipName,
          vipExpireTime: user.vipExpireTime,
          vipExpireTimeStr: user.vipExpireTime > 0 ? util.formatDate('y-m-d', user.vipExpireTime, 2, false) : '',
          // bottomShow:user.vipExpireTime>0?false:true,
          // subDisabled:user.vipExpireTime>0?true:false,
          welcomeMessage: util.welcomeMessage(user.nickname),
          loading:false,
        })

        if (user.vipExpireTime <= 0) {
          that.initCard(); //初始化会员卡
        }


      } else {
        util.toast(_res.message);
        setTimeout((res) => {
          wx.navigateBack();
        }, 1000);

      }

    }).catch((err) => {
      util.toast("请返回重新查看");
      setTimeout((res) => {
        wx.navigateBack();
      }, 1000);
    });

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initLoad(); //初始查询会员状态
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


  //支付完，订单查询
  queryOrder(orderNum) {
    const that = this;
    var timestamp = (new Date()).valueOf();
    axios.get('MembershipCardOrder/orderInfo', {
        orderno: orderNum,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + orderNum + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          "Content-Type": 'application/json; charset=utf-8',
        }
      })
      .then((res) => {
        const {
          data
        } = res;
        let _data = util.jsonTestParse(data); //解决返回为字符串型JSON问题

        that.setData({
          bottomShow: false,
          subDisabled: true, //禁止提交
        })
        if (_data.code === 1 && _data.data.paytime > 0) { //表示支付完成了

          util.toast("开通会员成功！");
          setTimeout((res) => {
            this.initLoad();
          }, 1000);
        } else {
          util.toast("订单处理中...");
          // setTimeout((res) => {
          //     wx.navigateBack();
          // }, 1000);
        }
        return;
      })
      .catch((error) => {
        util.toast("订单处理中...");
        return;
      });
  },
  // 发起支付
  Reqpay() {
    const that = this;
    that.setData({
      subDisabled: true //禁止提交
    })
    if (that.data.price <= 0||that.data.buyCardID<=0) {
      util.toast("信息有误，请重新购买!");
      setTimeout((res) => {
        wx.navigateBack();
      }, 1000);
      return;

    }
    new Promise((resolve, reject) => {
      var timestamp = (new Date()).valueOf();
      axios.get('MembershipCardOrder/creatOrder', {
          id: that.data.buyCardID,
          userID: wx.getStorageSync('USERID'),
          TIMESTAMP: timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }, {
          headers: {
            "Content-Type": 'application/json; charset=utf-8',
          }
        })
        .then((res) => {

          const {
            data
          } = res;
          let _data = util.jsonTestParse(data); //解决返回为字符串型JSON问题
          resolve(_data);
        })
        .catch((error) => {
          reject("出错")
        });
    }).then(res => { //定单开始付钱

      /*
        {
          "code": 1,
          "message": "订单创建成功",
          "data": {
            "timeStamp": "1695022329",
            "nonceStr": "Hg0LWBUzkHjhRnWSV7t",
            "package": "prepay_id=wx181532066f05a6e126e40000",
            "paySign": "hN9UGDn2c9Y5lAyHLC9vJZut774GSAWXvaQ==",
            "orderno": "vip2D20230918153208SVoNhpSPhVOw6"
          }
        }
      */

      if (res.code == 1) {
        //调起支付------------------
        var timestamp_ = res.data.timeStamp;
        var noncestr_ = res.data.nonceStr;
        var package_ = res.data.package;
        var paySign_ = res.data.paySign;
        var signType_ = "RSA";
        // 订单参数
        var orderNum = res.data.orderno; // 订单号
        wx.requestPayment({
          timeStamp: timestamp_.toString(),
          nonceStr: noncestr_,
          package: package_,
          signType: signType_,
          paySign: paySign_,
          success(res_pay) {
            //勿使用requestPayment:ok的结果作为判断支付成功的依据
            if (res_pay.errMsg == 'requestPayment:ok') {
              // 只能说 支付动作完成，不代表订单完成
              ////如需确定订单支付的真实结果请往下继续添加你的查询订单支付结果的逻辑
              that.queryOrder(orderNum); //去查订单状态,但是不一定成功
              return;
            } else {
              // // reject("支付失败,请重新支付!")
              util.toast("支付失败,请重新支付");
              that.setData({
                subDisabled: false //可以提交
              })
              return;
            }
          },
          fail: function (err) {
            // 支付失败或取消支付后的回调函数
            //:{"errMsg":"requestPayment:fail cancel"} 
            if (res.errMsg = 'requestPayment:fail cancel') {
              //reject("取消支付")
              util.toast("支付取消,请重新支付");
              that.setData({
                subDisabled: false //可以提交
              })
              return;
            } else {
              util.toast("支付失败,请重新支付");
              that.setData({
                subDisabled: false //可以提交
              })
              return;
            }
          }
        })
      } else {
        //{"code":0,"message":"您有一个相同订单还未支付，无需重复购买"}
        util.toast("订单创建失败，请重新点击！");
        that.setData({
          subDisabled: false //可以提交
        })
        return;

      }
    }).catch(err => {

      util.toast("订单CATCH，请重新点击！");
      that.setData({
        subDisabled: false //可以提交
      })
      return;
    })
  },


}))