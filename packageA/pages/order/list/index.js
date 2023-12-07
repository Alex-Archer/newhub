// 缓存最多页数
const MAX_CACHE_PAGEINDEX = 8;
// 缓存页签数量
const MAX_CACHE_PAGE = 8;

const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../utils/util.js')
var md5util = require('../../../../utils/md5.js')
const filter = require('../../../../utils/loginFilter'); 
Page({//订单中心不允许登录后查看，不然过不了
// Page(filter.loginCheck(true, app, { //2.登录验证 
    // Page({
    data: {
        //preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面

        newsList: [
          {
            "data": [],
            "isLoading": true,
            "lastPage": 1,
            "loadingText": "正在加载...",
            "noData": false,
            "pageIndex": 1,
            "refreshText": "",
            "refreshing": false
          }
        ],//初始写组数据,为了有加载效果,
        cacheTab: [],
        tabIndex: 0,
        tabAfterSaleIndex:3,//标记哪个索引是售后，方便有申请售后后，让其数据重新加载
        tabBars: [{
                name: '全部',
                id: 'yule'
            },
            {
                name: '待支付',
                id: 'sports'
            },
            {
                name: '已支付',
                id: 'domestic'
            },
            {
                name: '售后',
                id: 'domestic'
            }
        ],
        scrollInto: '',
        showTips: false,
        navigateFlag: false,
        pulling: false,

        //删除确认
        actionOrderSource: -1, //操作的订单所属类型       
        actionDeletSelectID: 0, //选择删除的ID
        actionDeletSelectIndex: -1, //选择删除的在数组的索上
        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        actionType:0,//操作类型 在data-ac 中带入

        showActionSheet: false,
        tips: "定单删除后无法恢复，您确认删除吗？",
        actionItemList: [{ text: "确认删除",color: "#E3302D"}],
        maskClosable: true, //可以点击外部任意地方关闭
        color: "#9a9a9a",
        size: 26,
        isCancel: true, 

        isLogin:false,//官方要求没登录也可以看到订单中心
    },

    //订单查看
    orderShow(e) {
        //source 0是团课 1私教 2集训 ，以后传就是TYPE了
        let _source =  e.currentTarget.dataset.source || e.target.dataset.source||0;//0为修正数字时获取不到
        let _id = e.currentTarget.dataset.id || e.target.dataset.id;
        // let _idx = e.currentTarget.dataset.idx || e.target.dataset.idx;//索引，用于详情页操作后返回
        if (!util.isNull(_id) && util.isNumber(_id)) {
            wx.navigateTo({
                url: '../show/index?source='+_source+'&detailID=' + _id,
            })
        }

    },
    //查看发票
    invoiceDetail() {

    },

    onShow(e) {
        //if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

    },
    onLoad: function (options) {
        //1.常规检测
        let logined = true;
        let tokenCache = wx.getStorageSync('Token');
        let userID = wx.getStorageSync("USERID");
        let userMobil = wx.getStorageSync("MOBILE"); //用户手机号作为唯一登录
        let isLogined = wx.getStorageSync("LOGING"); //用加密的用户OPENID 暂时不加密
        if (
          util.isNull(tokenCache) ||
          util.isNull(userID) ||
          util.isNull(userMobil) ||
          util.isNull(isLogined)
        ) {
          logined = false;
        }else{
        //2.检测是否从登录页登录过 必须有，后期考虑在登录页 加密 再验证
        if (isLogined != "true") {
          logined = false;
        }

        //3.TOKEN是否过期
        if (util.validateDateExpires(tokenCache.refreshexpires)) {
          logined = false;
        } else {
          logined = true;
        }
      }

        





        if (!logined) {
          this.setData({
            isLogin: false,
            newsList: this.initNotData()
          })
          return;
        }
          this.getDataJson(this.data.tabIndex).then(_thisData => {
            this.setData({
              isLogin: true,
              newsList: this.initData(_thisData)
            })
          }, function (err) { 
            
          });
      

    },
    /*
    获取数据
    payType 0全部 1待支付 2已支付 3售后
    */
    getDataJson(_payType = 0, _pageIndex = 1) {
        let that = this;
        let _timestamp = (new Date()).valueOf();
        let config = {
            payState: _payType, //0全部 1待支付 2已支付 3售后
            pageSize: 10,
            pageIndex: _pageIndex,

            userID: wx.getStorageSync('USERID'),
            TIMESTAMP: _timestamp,
            FKEY: md5util.md5(wx.getStorageSync('USERID') + _payType.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        };
        return new Promise((resolve, reject) => {
            axios.get("OrderIndex/index", config, {
                headers: {
                    "Content-Type": 'applciation/json',
                },
                interceptors: {
                    request: true, 
                    response: true //是否经过向应拦截,在错误码正常情况下不起作用，只是出错不验证如401等
                },
                //提前拦截验证
                validateStatus(status) {
                    return status === 200;
                },
            }).then(res => {
                if (res.data.code == 1) {
                    let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
                    resolve(_data);
                } else {
                    reject([]);
                }
            }).catch((err) => {
                reject([]);
            });
        })
    },
    //3.1无数据
initNotData(){
  let ary = [];
  for (let i = 0, length = this.data.tabBars.length; i < length; i++) {
      let aryItem = {
          loadingText: '正在加载...',
          refreshing: false,
          refreshText: '',
          data: [],
          isLoading: false,
          pageIndex: 1,
          lastPage: 1, //小鱼加，数据来的最大页
          noData:true, //小鱼加 有没有数据，默认不显示
      };
      
      ary.push(aryItem);
  }
  return ary;
},
    //初始化
    initData(_defaultData) {
        //小鱼加获取初始第一屏数据,只有这里时机合适
        let ary = [];
        for (let i = 0, length = this.data.tabBars.length; i < length; i++) {
            let aryItem = {
                loadingText: '正在加载...',
                refreshing: false,
                refreshText: '',
                data: [],
                //isLoading: false,
                pageIndex: 1,
                lastPage: 1, //小鱼加，数据来的最大页
                noData: false, //小鱼加 有没有数据，默认不显示
            };
            //只有指定的tab先填充数据
            if (i === this.data.tabIndex) {
                aryItem.isLoading=false;
                aryItem.lastPage = _defaultData.lastPage;
                aryItem.pageIndex = 1;
                if (_defaultData.total > 0) {
                    aryItem.noData = false;
                } else {
                    aryItem.noData = true;
                }
                aryItem.data = aryItem.data.concat(_defaultData.data);
            } else {
                aryItem.isLoading=true;
                aryItem.pageIndex = 0;
            }

            ary.push(aryItem);
        }
        return ary;
    },

    /**
     * 获取数据 - 下拉刷新 上拉加载更多合用
     * @param {*} index  tab的索引，配合了获取的类型  payState: _payType, //0全部 1待支付 2已支付 3售后
     * @param {*} refresh  是否下拉刷新,true:下拉刷新    false：上拉加载更多
     */
    getList(index, refresh) {
        let activeTab = this.data.newsList[index];
        let _pageIndex = refresh ? 0 : activeTab.pageIndex; //当前,如果是下拉刷新设为0，加1后正常
        this.getDataJson(index, _pageIndex + 1).then(list => {
            if (refresh) {
                activeTab.data = [];
                activeTab.loadingText = '正在加载...';
                activeTab.pageIndex = 1;
                activeTab.lastPage = list.lastPage;
                // activeTab.pageIndex = _pageIndex;
                //activeTab.pageIndex++;
                activeTab.data = list.data || [];
                if (list.total > 0) {
                    activeTab.noData = false;
                } else {
                    activeTab.noData = true;
                }

            } else {
                activeTab.data = activeTab.data.concat(list.data);
                activeTab.pageIndex++;
                activeTab.lastPage = list.lastPage;
                activeTab.isLoading = false;

                if (list.total > 0) {
                    activeTab.noData = false;
                } else {
                    activeTab.noData = true;
                }

                //根据实际修改判断条件
                if (activeTab.pageIndex >= list.lastPage) {

                    activeTab.loadingText = '没有更多了';
                }
            }
            this.setData({
                [`newsList[${index}]`]: activeTab
            })
        }, function (err) { 
            activeTab.data = [];
            activeTab.loadingText = '正在加载...';
            activeTab.isLoading = false;
            activeTab.pageIndex = 1;
            activeTab.lastPage = 1;
            activeTab.noData = true;
            that.setData({
                [`newsList[${index}]`]: activeTab
            })
        });
    },


    //上拉加载更多
    loadMore(e) {
        let index = this.data.tabIndex
        let activeTab = this.data.newsList[index];
        if (activeTab.pageIndex < activeTab.lastPage && !activeTab.isLoading) {
            let value = `newsList[${index}].isLoading`
            this.setData({
                [value]: true
            })
            setTimeout(() => {
                this.getList(index);
            }, 300);
        }
    },
    //下拉刷新
    onrefresh(e) {
        let index = this.data.tabIndex;
        var tab = this.data.newsList[index];
        if (tab.refreshing) return;

        //未登录不给看
        if (!this.data.isLogin) {
          this.setData({
              pulling: true,
              [`newsList[${index}].refreshing`]: false,
              [`newsList[${index}].refreshText`]: '刷新成功',
              [`newsList[${index}].refreshFlag`]: false
          })
          return;
        }
        //未登录不给看 END

        this.setData({
            [`newsList[${index}].refreshing`]: true,
            [`newsList[${index}].refreshText`]: '正在刷新...'
        })

        setTimeout(() => {
            this.getList(index, true);
            this.setData({
                pulling: true,
                [`newsList[${index}].refreshing`]: false,
                [`newsList[${index}].refreshText`]: '刷新成功',
                [`newsList[${index}].refreshFlag`]: false
            })
            // wx.showToast({
            //     title: '刷新成功',
            //     icon: 'none'
            // });
            setTimeout(() => {
                this.setData({
                    pulling: false
                })
            }, 500);
        }, 500);
    },

    //#region 菜单点击
    //1.1 点击菜单
    tabClick(e) {
        let index = e.target.dataset.current || e.currentTarget.dataset.current;
        this.switchTab(index);
    },
    //1.2 显示区左右滑动
    tabChange(e) {
        if (e.detail.source == 'touch') {
            let index = e.target.current || e.detail.current;
            this.switchTab(index);
        }
    },
    //2.数据
    switchTab(index) {
        if (this.data.tabIndex === index) return;
        if (this.data.newsList[index].data.length === 0) {
            this.setData({
                [`newsList[${index}].isLoading`]: true,
                [`newsList[${index}].noData`]: false,                
            })

            
            //未登录不给看
            if (!this.data.isLogin) {
              this.setData({
                  [`newsList[${index}].isLoading`]: false,
                  [`newsList[${index}].noData`]: true,                
              })
            }else{
              this.getList(index);
            }
          //未登录不给看 END
        }
        // 缓存 tabId
        if (this.data.newsList[this.data.tabIndex].pageIndex > MAX_CACHE_PAGEINDEX) {
            let isExist = this.data.cacheTab.indexOf(this.data.tabIndex);
            if (isExist < 0) {
                this.data.cacheTab.push(this.data.tabIndex);
            }
        }
        let scrollIndex = index - 1 < 0 ? 0 : index - 1;
        this.setData({
            tabIndex: index,
            scrollInto: this.data.tabBars[scrollIndex].id
        })

        // 释放 tabId
        if (this.data.cacheTab.length > MAX_CACHE_PAGE) {
            let cacheIndex = this.data.cacheTab[0];
            this.clearTabData(cacheIndex);
            this.data.cacheTab.splice(0, 1);
        }
    },
    //#endregion 菜单点击



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
                    response: true //是否经过向应拦截,在错误码正常情况下不起作用，只是出错不验证如401等
                },
                //提前拦截验证
                validateStatus(status) {
                    return status === 200;
                },
            }).then(res => {
                if (res.data.code == 1) {
                    // resolve("ok");
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
    actionButtons(e)
    {
        let that = this;
        //"dataset":{"ac":"2","id":"course126D20230924213251SCOqZIdo","index":0}}
        let _detailID = e.currentTarget.dataset.id || e.target.dataset.id;
        let _orderSource = e.currentTarget.dataset.source || e.target.dataset.source;  ////操作的订单所属类型   
        let _detailIndex = e.currentTarget.dataset.index || e.target.dataset.index;
        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        let _actionType = e.currentTarget.dataset.ac || e.target.dataset.ac;

        //参数安全验证
        if (
            util.isNull(_detailID)||
            !util.isNumber(_detailID)||
            util.isNull(_detailIndex) ||
            !util.isNumber(_detailIndex) ||
            _detailIndex < 0) {
            util.toast("订单信息有误,无法操作！", null, null, (e) => {
                that.setData({
                    actionDeletSelectID: 0, //选择删除的ID
                    actionOrderSource: -1, //操作的订单所属类型
                    actionDeletSelectIndex: -1, //选择删除的在数组的索上
                    actionType:0,//操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                    showActionSheet: false
                })
            });
        }
        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        switch(Number(_actionType)){
            case 0://删除
                that.setData({
                    actionDeletSelectID: _detailID, //选择删除的ID
                    actionOrderSource: _orderSource, //操作的订单所属类型                    
                    actionDeletSelectIndex: _detailIndex, //选择删除的在数组的索上
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
                        actionDeletSelectIndex: _detailIndex, //选择删除的在数组的索上
                        actionType:1,//操作类型 在data-actiontype 中带入
                        tips: "操作将完成本订单的付款，您确认支付吗？",
                        actionItemList: [{ text: "确认支付",color: "#E3302D"}],
                        showActionSheet: true
                    })
                    break;
            case 2://退款
                that.setData({
                    actionDeletSelectID: _detailID, //ID
                    actionOrderSource: _orderSource, //操作的订单所属类型    
                    actionDeletSelectIndex: _detailIndex, //选择删除的在数组的索上
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
                    actionDeletSelectIndex: -1, //选择删除的在数组的索上
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
        //console.log(e.detail)
        //{index: 0, text: "确认删除", color: "#E3302D"}
        let that = this;
        let _detailID = this.data.actionDeletSelectID;
        let _orderSource = this.data.actionOrderSource;  ////操作的订单所属类型   
        let _detailIndex = this.data.actionDeletSelectIndex;
        let _actionType = this.data.actionType;/*0删除 1支付 2退款 3撤销退款（暂不启用） */

        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        switch(Number(_actionType)){
            case 0:
                this.confirmDelete(_detailID,_orderSource,_detailIndex);//确认删除
                break;
            case 1:
                this.confirmRepay(_detailID,_orderSource,_detailIndex);//确认支付
                break;                
            case 2:
                this.confirmRefund(_detailID,_orderSource,_detailIndex);//确认退款
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
            actionDeletSelectIndex: -1, //选择删除的在数组的索上
            actionType:0,//操作类型 在data-actiontype 中带入
            tips: "定单删除后无法恢复，您确认删除吗？",
            actionItemList: [{ text: "确认删除",color: "#E3302D"}],
            showActionSheet: false
        })
    },
    //#endregion 面板操作


    //#region 操作确认后动作区
    //0删除
    confirmDelete(_detailID,_orderSource,_detailIndex)
    {
        let that = this;
        //删除
        this.orderController(_detailID,_orderSource,'CourseOrder/delOrder').then(val => {
            let _tabIndex = this.data.tabIndex;
            var _newsList = this.data.newsList[_tabIndex].data;
            _.pullAt(_newsList, _detailIndex); // 移除
            util.toast("删除订单成功", null, null, (e) => {
                this.setData({
                    [`newsList[${_tabIndex}].data`]: _newsList,
                    actionDeletSelectID: 0, //选择删除的ID
                    actionOrderSource: -1, //操作的订单所属类型
                    actionDeletSelectIndex: -1, //选择删除的在数组的索上
                    actionType:0,//操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                    showActionSheet: false
                })
            });
        }, function (err) { 
            util.toast(err, null, null, (e) => {
                that.setData({
                    actionDeletSelectID: 0, //选择删除的ID
                    actionOrderSource: -1, //操作的订单所属类型
                    actionDeletSelectIndex: -1, //选择删除的在数组的索上
                    actionType:0,//操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                    showActionSheet: false
                })
            });
        })
    },
    
//1支付
confirmRepay(_detailID,_orderSource,_detailIndex)
    {
        let that = this;
        let _tabIndex = this.data.tabIndex;
        var _newsList = this.data.newsList[_tabIndex].data;
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
                                    _.set(_newsList, `[${_detailIndex}].paytime`, 700); //反正大于0就行,支付按钮就消失了
                                    that.setData({
                                        [`newsList[${_tabIndex}].data`]: _newsList,
                                        actionDeletSelectID: 0, //选择删除的ID
                                        actionOrderSource: -1, //操作的订单所属类型
                                        actionDeletSelectIndex: -1, //选择删除的在数组的索上
                                        actionType: 0, //操作类型 在data-actiontype 中带入
                                        tips: "定单删除后无法恢复，您确认删除吗？",
                                        actionItemList: [{
                                            text: "确认删除",
                                            color: "#E3302D"
                                        }],
                                        showActionSheet: false
                                    }, () => {
                                        util.toast("订单支付成功", null, null);
                                    })
                                } else {
                                    that.setData({
                                        actionDeletSelectID: 0, //选择删除的ID
                                        actionOrderSource: -1, //操作的订单所属类型
                                        actionDeletSelectIndex: -1, //选择删除的在数组的索上
                                        actionType: 0, //操作类型 在data-actiontype 中带入
                                        tips: "定单删除后无法恢复，您确认删除吗？",
                                        actionItemList: [{
                                            text: "确认删除",
                                            color: "#E3302D"
                                        }],
                                        showActionSheet: false
                                    }, () => {
                                        util.toast("订单支付成功", null, null);
                                    })
                                }
                            }, function (err) {
                                that.setData({
                                    actionDeletSelectID: 0, //选择删除的ID
                                    actionOrderSource: -1, //操作的订单所属类型
                                    actionDeletSelectIndex: -1, //选择删除的在数组的索上
                                    actionType: 0, //操作类型 在data-actiontype 中带入
                                    tips: "定单删除后无法恢复，您确认删除吗？",
                                    actionItemList: [{
                                        text: "确认删除",
                                        color: "#E3302D"
                                    }],
                                    showActionSheet: false
                                }, () => {
                                    util.toast("订单查询失败", null, null);
                                })
                            })
                            return;
                        } else {
                            that.setData({
                                actionDeletSelectID: 0, //选择删除的ID
                                actionOrderSource: -1, //操作的订单所属类型
                                actionDeletSelectIndex: -1, //选择删除的在数组的索上
                                actionType: 0, //操作类型 在data-actiontype 中带入
                                tips: "定单删除后无法恢复，您确认删除吗？",
                                actionItemList: [{
                                    text: "确认删除",
                                    color: "#E3302D"
                                }],
                                showActionSheet: false
                            }, () => {
                                util.toast("支付失败,请至订单中心重新支付!", null, null);
                            })
                            return;
                        }
                    },
                    fail: function (err) {
                        //:{"errMsg":"requestPayment:fail cancel"} 
                        if (err.errMsg = 'requestPayment:fail cancel') {
                            that.setData({
                                actionDeletSelectID: 0, //选择删除的ID
                                actionOrderSource: -1, //操作的订单所属类型
                                actionDeletSelectIndex: -1, //选择删除的在数组的索上
                                actionType:0,//操作类型 在data-actiontype 中带入
                                tips: "定单删除后无法恢复，您确认删除吗？",
                                actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                                showActionSheet: false
                            }, () => {
                                util.toast("支付取消,有效期内可重新支付!", null, null);
                            })
                            return;
                        } else {
                            that.setData({
                                actionDeletSelectID: 0, //选择删除的ID
                                actionOrderSource: -1, //操作的订单所属类型
                                actionDeletSelectIndex: -1, //选择删除的在数组的索上
                                actionType:0,//操作类型 在data-actiontype 中带入
                                tips: "定单删除后无法恢复，您确认删除吗？",
                                actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                                showActionSheet: false
                            }, () => {
                                util.toast("支付失败,有效期内可重新支付!", null, null);
                            })
                            return;
                        }
                    }
                })
           
            //#endregion  开始支付
        }, function (err) { 
            that.setData({
                actionDeletSelectID: 0, //选择删除的ID
                actionOrderSource: -1, //操作的订单所属类型
                actionDeletSelectIndex: -1, //选择删除的在数组的索上
                actionType:0,//操作类型 在data-actiontype 中带入
                tips: "定单删除后无法恢复，您确认删除吗？",
                actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                showActionSheet: false
            }, () => {
                util.toast("支付请求失败,请重新支付!", null, null);
                return;
            });

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
    confirmRefund(_detailID,_orderSource,_detailIndex)
    {
        let that = this;

        this.orderController(_detailID,_orderSource,'CourseOrder/refund').then(val => {
            let _tabIndex = this.data.tabIndex;
            var _newsList = this.data.newsList[_tabIndex].data;
            _.pullAt(_newsList, _detailIndex); // 移除
            util.toast("成功提交订单退款申请", null, null, (e) => {
                this.setData({
                    [`newsList[${_tabIndex}].data`]: _newsList,
                    
                    actionDeletSelectID: 0, //选择删除的ID
                    actionOrderSource: -1, //操作的订单所属类型
                    actionDeletSelectIndex: -1, //选择删除的在数组的索上
                    actionType:0,//操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                    showActionSheet: false,

                    //清掉 售后 栏的数据，这样用户过去就会获取最新数据
                    [`newsList[${this.data.tabAfterSaleIndex}].data`]: [],
                    [`newsList[${this.data.tabAfterSaleIndex}].loadingText`]: "正加加载...",   
                    [`newsList[${this.data.tabAfterSaleIndex}].pageIndex`]: 0 
                })
            });
        }, function (err) { 
            util.toast(err, null, null, (e) => {
                that.setData({
                    actionDeletSelectID: 0, //选择删除的ID
                    actionOrderSource: -1, //操作的订单所属类型
                    actionDeletSelectIndex: -1, //选择删除的在数组的索上
                    actionType:0,//操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{ text: "确认删除",color: "#E3302D"}],
                    showActionSheet: false
                })
            });
        })
    },
    
    //#endregion 操作确认后动作区

    //详情页返回
    callBackReturn(_object) {
        let index = this.data.tabIndex;
        var tab = this.data.newsList[index];
        if (tab.refreshing) return;
        this.setData({
            [`newsList[${index}].refreshing`]: true,
            [`newsList[${index}].refreshText`]: '正在刷新...'
        },()=>{
            this.getList(index, true);
            this.setData({
                pulling: true,
                [`newsList[${index}].refreshing`]: false,
                [`newsList[${index}].refreshText`]: '刷新成功',
                [`newsList[${index}].refreshFlag`]: false
            },()=>{
                setTimeout(() => {
                    this.setData({
                        pulling: false
                    })
                }, 500);
            })

        })
    },
    //登录后才可以出数据
    //order字符串单独处理返回，迎合TX上架要求
    //https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncement&key=11669729383k7cis&version=1&lang=zh_CN&platform=2
    extend(e){
       wx.redirectTo({
         url: '/pages/user/login/index?url=order',//order字符串单独处理返回，迎合TX上架要求
       })
    }
})