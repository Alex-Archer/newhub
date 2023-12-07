const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')
const filter = require('../../../utils/loginFilter');
Page(filter.loginCheck(true, app, {
  data: {
    loading: true,
    preventOnShow: true, 

    title: '', //标题
    groupID: 0, //团课ID

    storefrontName: '',
    coachName: '', //教练名称，如果有

    startdate: 0,
    starttime: 0,
    endtime: 0,
    poster: '',
    type1Name: '',


    //insufficient: false,
    //show: false,

    couponShow: false,
    hasCoupon: false, //是否有优惠
    //选中的优惠
    couponSelectID: 0, //ID
    couponSelectTitle: "", //名称

    favourableShow: false, //优惠课程抵扣选择 栏显示
    discountShow: false, //折扣 栏显示
    exchangeSwitchShow: false, //兑换选项栏勾选 栏显示
    spareShow: false, //余额支付栏 显示

    couponSwitch: false, //是否使用兑换 ，默认使用
    couponSwitchDisabled: true, //使用兑换 是否禁用，默认为否



    balanceSwitch: false, //是否使用现金支付，默认不可以，当检测有足够现金时可用

    discount: 100, //商品折扣， 默认100无折扣
    goodsPrice: 0, //商品单价
    goodsNumber: 1, //商品数量
    totalGoods: 0, //商品总额  goodsPrice*goodsNumber
    amountPrice: 0, //合计 拼合所有活动折扣

    thisPay: 0, //最终实际支付 合计-余额

    totalBalance: 0, //用户现金余额
    /*
    实际需要支付,计算后得到
    1.使用课程兑换 则为0
    2.打折则 商品总额 totalGoods * 折扣/100 =
    3.使用余额支付 则为0，通知帐户扣除
    */
    payType: 0, //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
    payAmount: 0, //实付金额，当payType=1 和 2时生效

    subDisabled: true, //支付提交按钮
    PayLoading: false, //透明加载  tui-loading wx:if="{{PayLoading}}"
    PayLoadingTxt: '加载中', //加载动画文字

    typeList: [],
    typeListIndex: 0, //默认选中

  },
  //初始数据
  initLoad(_id = 1) {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    return new Promise((resolve, reject) => {
      axios.get("Course/detailInfo", {
        id: _id,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _id.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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

        if (res.data.code == 1) {

          resolve(res.data.data);
        } else {
          reject();
        }

      }).catch((err) => {
        reject();
      });
    }).catch(err => {
      reject();
    })
  },
  onLoad(options) {
    let that = this;
    let _id = options.id;
    let _title = decodeURIComponent(options.t);
    //需要验证
    if (util.isNull(_id) || util.isNull(_title)) {

      util.toast("参数有误",null,null,()=>{
        setTimeout((res) => {
          wx.navigateBack();
        }, 500);
      });
    }
    that.setData({
      title: _title,
      groupID: Number(_id),
    })

    //请求数据
    this.initLoad(_id).then(val => {

      let _goodsNumber = 1; //产口数量，一般只为1

      //要合并
      that.setData({
        title: val.title,
        storefrontName: val.storefrontName,
        coachName: val.coachName,
        startdate: val.startdate,
        starttime: val.starttime,
        endtime: val.endtime,
        poster: val.poster,
        type1Name: val.type1Name,
        typeList: val.offer.card, 




        //discount:100,//商品折扣， 默认100无折扣
        goodsPrice: val.price, //商品单价
        goodsNumber: _goodsNumber, //商品数量
        totalGoods: val.price * _goodsNumber, //商品总额  goodsPrice*goodsNumber
        //amountPrice:0,//合许
        //thisPay:0,//最终实际支付 合计-余额
        totalBalance: val.balance, //用户现金余额
      })

      //优惠==========================================
      //1.无任何offer信息
      if (util.isNull(val.offer)) {
        that.setData({
          favourableShow: false, //优惠显示
          discountShow: false, //折扣显示
          exchangeSwitchShow: false, //兑换选项勾选显示
          spareShow: true, //余额支付栏 显示 除了兑换都显示

          couponSwitch: false, //关闭使用兑换选择
          couponSwitchDisabled: true, //兑换选择禁用

          hasCoupon: false, //是否有优惠
          discount: val.offer.discounts, //商品折扣， 默认100无折扣
          couponSelectTitle: "无优惠",
          amountPrice: val.price * _goodsNumber, //合计

        })
      } else {
        //2.检查卡信息
        let couponList = val.offer.card;
        if (util.isNull(couponList) || couponList.length <= 0) {
          //无卡列表
          let _discount = val.offer.discounts;
          if (util.isNull(_discount) || _discount == 100) { //无打折
            that.setData({
              favourableShow: false, //优惠显示
              discountShow: false, //折扣显示
              exchangeSwitchShow: false, //兑换选项勾选显示
              spareShow: true, //余额支付栏 显示 除了兑换都显示

              couponSwitch: false, //关闭使用兑换选择
              couponSwitchDisabled: true, //兑换选择禁用

              hasCoupon: false, //是否有优惠
              discount: val.offer.discounts, //商品折扣， 默认100无折扣
              couponSelectTitle: "无优惠",
              amountPrice: val.price * _goodsNumber, //合计
            })
          } else { //有打折
            that.setData({
              favourableShow: false, //优惠显示
              discountShow: true, //折扣显示
              exchangeSwitchShow: false, //兑换选项勾选显示
              spareShow: true, //余额支付栏 显示 除了兑换都显示

              couponSwitch: false, //关闭使用兑换选择
              couponSwitchDisabled: true, //兑换选择禁用

              hasCoupon: true, //是否有优惠
              discount: _discount, //商品折扣， 默认100无折扣
              couponSelectTitle: _discount / 10 + "折 优惠",
              amountPrice: val.price * _goodsNumber * (_discount / 100), //合计
            })
          }

        } else {
          //有卡列表
          //卡列表能兑的为0 进行容错
          let _selectIndex = 0;
          that.setData({
            favourableShow: true, //优惠显示
            discountShow: false, //折扣显示
            exchangeSwitchShow: true, //兑换选项勾选显示
            spareShow: false, //余额支付栏 显示 除了兑换都显示
            couponSwitch: true, //是否使用兑换 ，默认使用
            couponSwitchDisabled: false, //使用兑换 是否禁用，默认为否

            hasCoupon: true,
            discount: val.offer.discounts, //商品折扣， 默认100无折扣,
            typeListIndex: _selectIndex,
            couponSelectID: couponList[_selectIndex].id,
            couponSelectTitle: "使用 " + couponList[_selectIndex].cardTitle + " 兑换 1节课程",
            amountPrice: 0, //合计
            thisPay: 0, //实付
          })
        }
      }

      this.thisPayCount(); //计算实付
      //移除骨架
      that.setData({
        loading: false,
        subDisabled: false, //可以提交
      })

    });

  },
  onShow(e) {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

  },
  chooseAddr() {
    wx.navigateTo({
      url: "../address/address"
    })
  },

  popupClose() {
    this.setData({
      show: false
    })
  },
  couponClose() {
    this.setData({
      couponShow: false
    })
  },

  invoice() {
    wx.navigateTo({
      url: "../invoice/invoice"
    })
  },

  //选择优惠 
  selectCoupon() {
    if (!this.data.hasCoupon) {
      return;
    }
    this.setData({
      couponShow: true
    })
  },
  //关闭优惠选择
  couponTypeClose(e) {
    let that = this;
    let _detail = e.detail;
    if (_detail && _detail.selectIndex) {
      let _selectIndex = _detail.selectIndex;
      this.setData({
        couponShow: false,
        couponSwitch: true, //使用优惠
        typeListIndex: _selectIndex,
        couponSelectID: that.data.typeList[_selectIndex].id,
        couponSelectTitle: "使用 " + that.data.typeList[_selectIndex].cardTitle + " 兑换 1节课程"

      })
    } else {
      this.setData({
        couponShow: false

      })
    }
  },
  //是否使用兑换
  couponSwitch(e) {

    let that = this;
    let _couponSwitch = this.data.couponSwitch; //是否使用兑换 ，默认使用
    let _couponSwitchDisabled = this.data.couponSwitchDisabled; //使用兑换 是否禁用，默认为否

    if (this.data.couponSwitch) { //TRUE切向关闭
      this.setData({
        //exchangeSwitchShow:false,//兑换选项勾选显示
        couponSwitch: !this.data.couponSwitch, //是否使用兑换 ，默认使用
        // couponSwitchDisabled: true, //使用兑换 是否禁用，默认为否

        //discountShow:this.data<100?true:false,//折扣显示
        favourableShow: false, //优惠显示
        spareShow: true, //余额支付栏 显示 除了兑换都显示
      })

      if (this.data.discount < 100) { //显示折扣

        this.setData({
          discountShow: true,
          amountPrice: this.data.totalGoods * (this.data.discount / 100), //打折
        })
      } else {
        this.setData({
          discountShow: false,
          amountPrice: this.data.totalGood, //不打折

        })
      }


      // discount: _discount, //商品折扣， 默认100无折扣
      //couponSelectTitle: _discount / 10 + "折 优惠",
      //amountPrice: val.price * _goodsNumber * (_discount / 100), //合计


    } else { //关闭切向 打开
      this.setData({
        //exchangeSwitchShow:true,//兑换选项勾选显示
        couponSwitch: !this.data.couponSwitch, //是否使用兑换 ，默认使用
        //couponSwitchDisabled: false, //使用兑换 是否禁用，默认为否

        discountShow: false, //折扣显示
        favourableShow: true, //优惠显示
        spareShow: false, //余额支付栏 显示 除了兑换都显示
        amountPrice: 0,
      })
    }
    this.thisPayCount(); //计算实付

  },
  thisPayCount() {

    let that = this;
    let _goodsPrice = this.data.goodsPrice; //单价
    let _goodsNumber = this.data.goodsNumber; //数量
    let _totalGoods = this.data.totalGoods; //商品总额
    let _discount = this.data.discount; //折扣
    let _amountPrice = this.data.amountPrice; //合计

    let _totalBalance = this.data.totalBalance; //余额
    let _thisPay = this.data.thisPay; //实付

    let _payType = 0; //payType: 0, //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）

    //1.兑换选项栏是否显示
    let _favourableShow = that.data.favourableShow;

    if (_favourableShow) {
      //兑换的
      that.setData({
        payType: _payType, //换的 //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
        thisPay: 0, //实付
      })
    } else {
      // 余额计算
      if (this.data.balanceSwitch) { //余额选中了
        let _isPayPrice = 0;
        if (_totalBalance == 0) { //没有余额
          _payType = 1; //1现金支付 //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
          _isPayPrice = _amountPrice;
        } else { //
          if (_totalBalance >= _amountPrice) { //余额 >=商品额度 = 实付为0
            _payType = 2; //2帐户扣除 //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
            _isPayPrice = 0;
          } else { //余额 < 商品额度
            _payType = 3; //组合 支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
            _isPayPrice = _amountPrice - _totalBalance;
          }
        }

        that.setData({
          payType: _payType,
          thisPay: _isPayPrice,
        })




      } else {
        that.setData({
          payType: 1, //1现金 //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
          thisPay: _amountPrice,
        })
      }

    }


  },
  //计算出实付
  //余额，商品额度
  countPrice(balancePrice, amountPrice) {
    if (balancePrice >= amountPrice) { //余额 >=商品额度 = 实付为0
      return 0;
    } else { //余额 < 商品额度 =  实付为  商品额度-余额
      return amountPrice - balancePrice;
    }
  },

  //各种价格显示
  countPriceShow() {
    
    let _payType = 0;



  },

  //是否使用余额
  balanceSwitch(e) {
    this.setData({
      balanceSwitch: !this.data.balanceSwitch,
      //thisPay: !this.data.balanceSwitch ? this.countPrice(this.data.totalBalance, this.data.amountPrice) : this.data.amountPrice,
    })

    this.thisPayCount();
  },

  //2.支付完，订单查询
  queryGroupOrder(orderNum) {
    const that = this;
    let _type= "0";      //;//0=团课，1=私教课，2=集训课
    var timestamp = (new Date()).valueOf();
    axios.post('CourseOrder/orderInfo', {
        type:_type,//;//0=团课，1=私教课，2=集训课
        orderNo: orderNum,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID')+ _type + orderNum + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          "Content-Type": 'application/json; charset=utf-8',
        }
      })
      .then((res) => {
        const {data} = res;
        let _data = util.jsonTestParse(data); //解决返回为字符串型JSON问题

        if (_data.code === 1 && _data.data.paytime > 0) { //表示支付完成了
          that.setData({
            PayLoading: false,
            PayLoadingTxt: '',
            subDisabled: true //禁止提交
          }, () => {
            util.toast("购买团课成功！", null, null, (e) => {
              setTimeout((res) => {
                wx.redirectTo({
                  url: '/packageA/pages/order/list/index',
                })
              }, 1000);
            });
          })
        } else { //虽然正常，但是服务端调用paytime没有时间
          ///购课程中心 packageA/pages/listCourse/index
          that.setData({
            PayLoading: false,
            PayLoadingTxt: '',
            subDisabled: true //禁止提交
          }, () => {
            util.toast("订单处理中...", null, null, (e) => {
              setTimeout((res) => {
                wx.redirectTo({
                  url: '/packageA/pages/order/list/index',
                })
              }, 1000);
            });
          })
        }
        return;
      })
      .catch((error) => {
        that.setData({
          PayLoading: false,
          PayLoadingTxt: '',
          subDisabled: true //禁止提交
        }, () => {
          util.toast("订单处理中...", null, null, (e) => {
            setTimeout((res) => {
              wx.redirectTo({
                url: '/packageA/pages/order/list/index',
              })
            }, 1000);
          });
        })

        return;
      });
  },

  //1.点击支付
  btnPay() {
    const that = this;
    that.setData({
      PayLoading: true,
      PayLoadingTxt: '请稍候...',
      subDisabled: true //禁止提交
    })

    //groupID:0,//团课ID
    // couponSelectID: 0, //选中的优惠卡ID
    // discount: 100, //商品折扣， 默认100无折扣
    // goodsPrice: 0, //商品单价
    // goodsNumber: 1, //商品数量
    // totalGoods: 0, //商品总额  goodsPrice*goodsNumber
    // amountPrice: 0, //合计 拼合所有活动折扣
    // thisPay: 0, //最终实际支付 合计-余额
    // totalBalance: 0, //用户现金余额
    // payType: 0, //支付方式0课程扣除，1现金支付 2帐户扣除 3组合（现金+余额）
    // payAmount: 0, //实付金额
    const _groupID = this.data.groupID; //团课ID
    const _goodsPrice = this.data.goodsPrice; //商品单价
    const _goodsNumber = this.data.goodsNumber; //商品数量
    const _totalGoods = this.data.totalGoods; //商品总额
    const _discount = this.data.discount; //商品折扣， 默认100无折扣
    const _amountPrice = this.data.amountPrice; //合计 拼合所有活动折扣
    const _totalBalance = this.data.totalBalance; //用户现金余额,瑜伽币
    const _couponSelectID = this.data.couponSelectID; //选中的优惠卡ID
    const _payType = this.data.payType; //支付方式0课程扣除，1现金支付 2帐户扣除 3组合（现金+余额）
    const _thisPay = this.data.thisPay; //实付金额
    //安检区
    if (util.isNull(_groupID) || Number(_groupID) <= 0) 
    {
      that.setData({
        PayLoading: false,
        PayLoadingTxt: '',
        subDisabled: true //禁止提交
      }, () => {
        util.toast("信息有误，请重新购买!", null, null, (e) => {
          setTimeout((res) => {
            wx.navigateBack();
          }, 500);
        });
      })
      return;
    }

    // this.queryGroupOrder("vip2D20230918153208SVoNhpSPhVOw6");
    // return;

    let _type= "0";      //;//0=团课，1=私教课，2=集训课
    //#region 支付开始
    new Promise((resolve, reject) => {
      //发送体
      let timestamp = (new Date()).valueOf();
      let postConfig = {
        type:_type,//;//0=团课，1=私教课，2=集训课
        groupID: _groupID, //团课ID
        goodsPrice: _goodsPrice, //商品单价
        goodsNumber: _goodsNumber, //商品数量
        totalGoods: _totalGoods, //商品总额
        discount: _discount, //商品折扣， 默认100无折扣
        amountPrice: _amountPrice, //合计 拼合所有活动折扣
        totalBalance: _totalBalance, //用户现金余额,瑜伽币
        couponSelectID: _couponSelectID, //选中的优惠卡ID
        payType: _payType, //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
        thisPay: _thisPay, //实付金额

        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _type +  _groupID.toString() + _couponSelectID.toString() + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }

      axios.post('CourseOrder/creatOrder', postConfig, {
          headers: {
            "Content-Type": 'application/json; charset=utf-8',
          }
        })
        .then((res) => {
          const {data} = res;
          let _data = util.jsonTestParse(data); //解决返回为字符串型JSON问题
          resolve(_data);
        })
        .catch((error) => {
          reject("出错")
        });
    }).then(res => { //定单开始付钱
      ////支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
      //0.优惠卡兑换 发送===========
      //{"groupID":40,"goodsPrice":6,"goodsNumber":1,"totalGoods":6,"discount":50,"amountPrice":0,"totalBalance":2,"couponSelectID":39,"payType":0,"thisPay":0,"userID":"60284c0ba714360657d42f3137661f93","TIMESTAMP":1695546504863,"FKEY":"f8e384950fdaac1fc028736e161753a4"}
      //返:{"code":1,"message":"恭喜您已成功预定了该课程"} 
      //1.完全人民币支付 发送===========
      //返:
      //2.余额瑜伽币扣除(瑜伽币完全大于等于应付) 发送===========
      //返:
      //3.组合（现金+余额：瑜伽币少于应付） 发送===========
      //返:

       //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
      if(_payType===0||_payType===2)
      {
        if (res.code == 1) {
          that.setData({
            PayLoading: false,
            PayLoadingTxt: '',
            subDisabled: true //禁止提交
          }, () => {
            util.toast("团课兑换成功!", null, null, (e) => {
              setTimeout((res) => {
                wx.redirectTo({
                  url: '/packageA/pages/order/list/index',
                })
              }, 1000);
            });
          })
          return;
        }else{
          that.setData({
            PayLoading: false,
            PayLoadingTxt: '',
            subDisabled: true //禁止提交
          }, () => {
            util.toast("团课兑换失败,请重新操作!", null, null, (e) => {
              setTimeout((res) => {
                wx.navigateBack();
              }, 500);
            });
          })
          return;
        }
      }
      //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
      else{//使用了1 或 3 涉及了人民币操作
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
                that.queryGroupOrder(orderNum); //去查订单状态,但是不一定成功
                return;
              } else {
                //util.toast("支付失败,请重新支付");
                that.setData({
                  PayLoading: false,
                  PayLoadingTxt: '',
                  subDisabled: true //禁止提交
                }, () => {
                  util.toast("支付失败,请至订单中心重新支付!", null, null, (e) => {
                    setTimeout((res) => {
                      wx.redirectTo({
                        url: '/packageA/pages/order/list/index',
                      })
                    }, 1000);
                  });
                })
                return;
              }
            },
            fail: function (err) {
              // 支付失败或取消支付后的回调函数
              //:{"errMsg":"requestPayment:fail cancel"} 
              if (err.errMsg = 'requestPayment:fail cancel') {
                //reject("取消支付")
                //util.toast("支付取消,请重新支付");
                that.setData({
                  PayLoading: false,
                  PayLoadingTxt: '',
                  subDisabled: true //禁止提交
                }, () => {
                  util.toast("支付取消,请至订单中心重新支付!", null, null, (e) => {
                    setTimeout((res) => {
                      wx.redirectTo({
                        url: '/packageA/pages/order/list/index',
                      })
                    }, 1000);
                  });
                })
                return;
              } else {

                that.setData({
                  PayLoading: false,
                  PayLoadingTxt: '',
                  subDisabled: true //禁止提交
                }, () => {
                  util.toast("支付失败,请至订单中心重新支付!", null, null, (e) => {
                    setTimeout((res) => {
                      wx.redirectTo({
                        url: '/packageA/pages/order/list/index',
                      })
                    }, 1000);
                  });
                })
                return;
              }
            }
          })
        } else {

          //util.toast("订单创建失败，请重新点击！");
          that.setData({
            PayLoading: false,
            PayLoadingTxt: '',
            subDisabled: true //禁止提交
          }, () => {
            util.toast("订单创建失败,请重新购买!", null, null, (e) => {
              setTimeout((res) => {
                wx.navigateBack();
              }, 1000);
            });
          })
          return;

        }
      }
    }).catch(err => {
      //util.toast("订单CATCH，请重新点击！");
      that.setData({
        PayLoading: false,
        PayLoadingTxt: '',
        subDisabled: true //禁止提交
      }, () => {
        util.toast("CATCH订单失败,请重新购买!", null, null, (e) => {
          setTimeout((res) => {
            wx.navigateBack();
          }, 1000);
        });
      })
      return;
    })
    //#endregion 支付结束
  },
}))