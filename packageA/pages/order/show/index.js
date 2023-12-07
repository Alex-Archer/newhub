const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../utils/util.js')
var md5util = require('../../../../utils/md5.js')
const filter = require('../../../../utils/loginFilter');

Page(filter.loginCheck(true, app, {  

    /**
     * 页面的初始数据
     */
    data: {
        preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面
        pageErr: true,//页面在为false时才显示


        status: 1, //订单状态
        orderInfo: null,

         //删除确认
         actionOrderSource: -1, //操作的订单所属类型       
         actionDeletSelectID: 0, //选择删除的ID
         /*0删除 1支付 2退款 3撤销退款（暂不启用） */
         actionType:0,//操作类型 在data-ac 中带入

         //弹窗面板
         showActionSheet: false,
         tips: "定单删除后无法恢复，您确认删除吗？",
         actionItemList: [{ text: "确认删除",color: "#E3302D"}],
         maskClosable: true, //可以点击外部任意地方关闭
         color: "#9a9a9a",
         size: 26,
         isCancel: true,
         
         refreshParent:false,//返回父列表时是否要刷新

    },
    //初始数据
    initLoad(_orderNo,_source) {
        let that = this;
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get("CourseOrder/orderInfo", {
                orderNo: _orderNo,
                type:_source,
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') +_source.toString()+ _orderNo.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
            }, {
                headers: {
                    "Content-Type": 'applciation/json',
                },
                interceptors: {
                    request: true, 
                    response: true 
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
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const that = this;
        if (util.isNull(options)) {
            wx.navigateBack();
            return;
        }
        let _source = options.source;//source 0是团课 1私教 2集训 ，以后传就是TYPE了
        let _detailID = options.detailID;
        if (util.isNull(_detailID) || !util.isNumber(_detailID)) {
            wx.navigateBack();
            return;
        }

        this.initLoad(_detailID,_source).then(val => {
            if (util.isNull(val)) {
                wx.navigateBack();
                return;
            }
            that.setData({
                pageErr: false,
                orderInfo: val
            })
        }, function (reason) { 
            that.setData({
                pageErr: true
            }, () => {
                util.toast("订单信息有误", null, null, (e) => {
                    setTimeout((res) => {
                        wx.navigateBack();
                    }, 500);
                });
            })
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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

     //订单操作请求
     orderController(_orderNo,_orderSource,_url) { 
        let that = this;
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get(_url, {
                orderNo: _orderNo,
                type:_orderSource,
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') +_orderSource.toString()+ _orderNo.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
            }, {
                headers: {
                    "Content-Type": 'applciation/json',
                },
                interceptors: {
                    request: true, 
                    response: true 
                },
                
                validateStatus(status) {
                    return status === 200;
                },
            }).then(res => {
                if (res.data.code == 1) {
                    //resolve("ok");
                    resolve(res.data.data);
                } else {
                    reject(res.data.message);
                }

            }).catch((err) => {
                reject("数据处理有误");
            });
        }); 
    },
    //所有按钮操作
    ///*0删除 1支付 2退款 3撤销退款（暂不启用） */
    actionButtons(e){
        let that = this;
        //{"ac":"2","id":"47220231003133835322","source":2}
        let _detailID = e.currentTarget.dataset.id || e.target.dataset.id;
        let _orderSource = e.currentTarget.dataset.source || e.target.dataset.source;  ////操作的订单所属类型   
        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        let _actionType = e.currentTarget.dataset.ac || e.target.dataset.ac;

        //参数安全验证
        if (
            util.isNull(_detailID)||
            !util.isNumber(_detailID)) {
            util.toast("订单信息有误,无法操作！", null, null, (e) => {
                that.setData({
                    actionDeletSelectID: 0, //选择删除的ID
                    actionOrderSource: -1, //操作的订单所属类型

                    actionType:0,//操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                    showActionSheet: false
                })
            });
        }
        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        switch(Number(_actionType)){
            case 0:
                that.setData({
                    actionDeletSelectID: _detailID, //选择删除的ID
                    actionOrderSource: _orderSource, //操作的订单所属类型                    

                    actionType:0,//操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                    showActionSheet: true
                })
                break;
            case 1://重新支付
                that.setData({
                    actionDeletSelectID: _detailID, //选择ID
                    actionOrderSource: _orderSource, //操作的订单所属类型
                    actionType:1,//操作类型 在data-actiontype 中带入
                    tips: "操作将完成本订单的付款，您确认支付吗？",
                    actionItemList: [{ text: "确认支付",color: "#E3302D"}],
                    showActionSheet: true
                })
                break;
            case 2://退款
                that.setData({
                    actionDeletSelectID: _detailID, //选择删除的ID
                    actionOrderSource: _orderSource, //操作的订单所属类型    

                    actionType:2,//操作类型 在data-actiontype 中带入
                    tips: "退款会影响您的正常课程，您确认退款吗？",
                    actionItemList: [{ text: "确认退款",color: "#E3302D"}],
                    showActionSheet: true
                })
                break;
            default:
                that.setData({
                    actionDeletSelectID: 0, //选择删除的ID
                    actionOrderSource: -1, //操作的订单所属类型

                    actionType:0,//操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                    showActionSheet: false
                })
                break;
        }
    },

    //#region 面板操作
    //面板点击 操作 确认
    actionItemClick(e) 
    {
        //{index: 0, text: "确认删除", color: "#E3302D"}
        let that = this;
        let _detailID = this.data.actionDeletSelectID;
        let _orderSource = this.data.actionOrderSource;  ////操作的订单所属类型   
        //let _detailIndex = this.data.actionDeletSelectIndex;
        let _actionType = this.data.actionType;/*0删除 1支付 2退款 3撤销退款（暂不启用） */

        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        switch(Number(_actionType)){
            case 0:
                this.confirmDelete(_detailID,_orderSource);//确认删除
                break;
            case 1:
                this.confirmRepay(_detailID,_orderSource);//确认支付
                break;     
            case 2://退款
                this.confirmRefund(_detailID,_orderSource);//确认退款
                break;
            default:
                break;
        }
    },
    //面板关闭
    closeActionSheet(e) {
        this.setData({
            actionDeletSelectID: 0, //选择删除的ID
            actionOrderSource: -1, //操作的订单所属类型

            actionType:0,//操作类型 在data-actiontype 中带入
            tips: "定单删除后无法恢复，您确认删除吗？",
            actionItemList: [{ text: "确认删除",color: "#E3302D"}],
            showActionSheet: false
        })
    },
    //#endregion 面板操作


    //#region 操作确认后动作区
    //0删除
    confirmDelete(_detailID,_orderSource)
    {
        let that = this;
        //删除
        this.orderController(_detailID,_orderSource,'CourseOrder/delOrder').then(val => {
            that.setData({
                refreshParent: true,
                showActionSheet: false
            }, () => {
                util.toast("删除订单成功", null, null, (e) => {
                    setTimeout((res) => {
                        wx.navigateBack();
                    }, 1000);
                });
            })
        }, function (err) { 
            that.setData({
                refreshParent: false,
                showActionSheet: false
            }, () => {
                util.toast(err, null, null, (e) => {
                    setTimeout((res) => {
                        wx.navigateBack();
                    }, 1000);
                });
            })
        })
    },
//1支付
confirmRepay(_detailID,_orderSource)
    {
        let that = this;
        //唤起支付
        this.orderController(_detailID,_orderSource,'CourseOrder/orderPay').then(val => {

                //调起支付------------------
                var timestamp_ = val.timeStamp;
                var noncestr_ = val.nonceStr;
                var package_ = val.package;
                var paySign_ = val.paySign;
                var signType_ = "RSA";
                // 订单参数
                var orderNum = val.orderno; // 订单号
                wx.requestPayment({
                    timeStamp: timestamp_.toString(),
                    nonceStr: noncestr_,
                    package: package_,
                    signType: signType_,
                    paySign: paySign_,
                    success(res_pay) {
                        //勿使用requestPayment:ok的结果作为判断支付成功的依据
                        if (res_pay.errMsg == 'requestPayment:ok') {
                            //that.queryGroupOrder(orderNum,_orderSource); //去查订单状态,但是不一定成功
                            that.queryGroupOrder(orderNum, _orderSource).then(val => {
                                if (val == "ok") {
                                    that.setData({
                                        refreshParent: true,
                                        showActionSheet: false
                                    }, () => {
                                        util.toast("订单支付成功", null, null, (e) => {
                                            setTimeout((res) => {
                                                wx.navigateBack();
                                            }, 500);
                                        });
                                    })
                                } else {
                                    that.setData({
                                        refreshParent: true,
                                        showActionSheet: false
                                    }, () => {
                                        util.toast("订单查询失败", null, null, (e) => {
                                            setTimeout((res) => {
                                                wx.navigateBack();
                                            }, 500);
                                        });
                                    })
                                }
                            }, function (err) {
                               
                                that.setData({
                                    refreshParent: true,
                                    showActionSheet: false
                                }, () => {
                                    util.toast("订单查询失败", null, null, (e) => {
                                        setTimeout((res) => {
                                            wx.navigateBack();
                                        }, 500);
                                    });
                                })
                            })
                            return;
                        } else {
                            
                            that.setData({
                                refreshParent: true,
                                showActionSheet: false
                            }, () => {
                                util.toast("支付失败,请重新支付!", null, null, (e) => {
                                    setTimeout((res) => {
                                        wx.navigateBack();
                                    }, 500);
                                });
                            })
                            return;
                        }
                    },
                    fail: function (err) {
                        //:{"errMsg":"requestPayment:fail cancel"} 
                        if (err.errMsg = 'requestPayment:fail cancel') {
                            that.setData({
                                refreshParent: true,
                                showActionSheet: false
                            }, () => {
                                util.toast("支付取消,有效期内可重新支付!", null, null, (e) => {
                                    setTimeout((res) => {
                                        wx.navigateBack();
                                    }, 500);
                                });
                            })
                            return;
                        } else {
                            that.setData({
                                refreshParent: true,
                                showActionSheet: false
                            }, () => {
                                util.toast("支付取消,有效期内可重新支付!", null, null, (e) => {
                                    setTimeout((res) => {
                                        wx.navigateBack();
                                    }, 500);
                                });
                            })
                            return;
                        }
                    }
                })
           
            //#endregion  开始支付
        }, function (err) { 
            
            that.setData({
                refreshParent: true,
                showActionSheet: false
            }, () => {
                util.toast("支付请求失败,有效期内可重新支付!", null, null, (e) => {
                    setTimeout((res) => {
                        wx.navigateBack();
                    }, 500);
                });
            })

        })
    },
    //2.支付完，订单查询
  queryGroupOrder(orderNum, _type) {
      const that = this;
      //let _type= "2";      //;//0=团课，1=私教课，2=集训课return new Promise((resolve, reject) => {
      return new Promise((resolve, reject) => {
          var timestamp = (new Date()).valueOf();
          axios.post('CourseOrder/orderInfo', {
                  type: _type, //0=团课，1=私教课，2=集训课
                  orderNo: orderNum,
                  userID: wx.getStorageSync('USERID'),
                  TIMESTAMP: timestamp,
                  FKEY: md5util.md5(wx.getStorageSync('USERID') + _type + orderNum + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
              }, {
                  headers: {
                      "Content-Type": 'application/json; charset=utf-8',
                  }
              })
              .then((res) => {
                  const {data} = res;
                  let _data = util.jsonTestParse(data); //解决返回为字符串型JSON问题
                  if (_data.code === 1 && _data.data.paytime > 0) { //表示支付完成了
                      resolve("ok")
                  } else { //虽然正常，但是服务端调用paytime没有时间
                      resolve("no")
                  }
              })
              .catch((error) => {
                reject();
              });
      });
  },
    //2 退款
    confirmRefund(_detailID,_orderSource)
    {
        let that = this;
        this.orderController(_detailID,_orderSource,'CourseOrder/refund').then(val => {
            that.setData({
                refreshParent: true,
                showActionSheet: false
            }, () => {
                util.toast("成功提交订单退款申请", null, null, (e) => {
                    setTimeout((res) => {
                        wx.navigateBack();
                    }, 1000);
                });
            })
        }, function (err) { 
            //返回不刷
            that.setData({
                refreshParent: false,
                showActionSheet: false
            }, () => {
                util.toast(err, null, null, (e) => {
                    setTimeout((res) => {
                        wx.navigateBack();
                    }, 1000);
                });
            })
        })
    },

    //#endregion 操作确认后动作区

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

        if(this.data.refreshParent){//是否需要刷新
            // 页面卸载时触发
            //触发用户中心更新头像昵称
            let pages = getCurrentPages(); //获取页面栈
            if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
            {
                let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
                prePage.callBackReturn({
                    //headimgurl: this.data.headimgurl,
                    //nickname:this.data.nickname
                }); //调用上一个页面实例对象的方法
            }   
        }
    },
}))