// 缓存最多页数
const MAX_CACHE_PAGEINDEX = 8;
//缓存页签数量
const MAX_CACHE_PAGE = 8;

const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')
const filter = require('../../../utils/loginFilter');

Page(filter.loginCheck(true, app, { 
    // Page({
    data: {
        preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面
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
        tabAfterSaleIndex: 3, //标记哪个索引是售后，方便有申请售后后，让其数据重新加载
        tabBars: [{
                name: '全部课程',
                id: 'yule'
            },
            {
                name: '团课',
                id: 'yule'
            },
            {
                name: '私教课',
                id: 'sports'
            },
            {
                name: '训练营',
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
        actionType: 0, //操作类型 在data-ac 中带入

        showActionSheet: false,
        tips: "定单删除后无法恢复，您确认删除吗？",
        actionItemList: [{
            text: "确认删除",
            color: "#E3302D"
        }],
        maskClosable: true, //可以点击外部任意地方关闭
        color: "#9a9a9a",
        size: 26,
        isCancel: true,
    },

    //订单查看
    orderShow(e) {
        //source 0是团课 1私教 2集训 ，以后传就是TYPE了
        let _source = e.currentTarget.dataset.source || e.target.dataset.source || 0; //0为修正数字时获取不到
        let _id = e.currentTarget.dataset.id || e.target.dataset.id;
        // let _idx = e.currentTarget.dataset.idx || e.target.dataset.idx;//索引，用于详情页操作后返回
        if (!util.isNull(_id) && util.isNumber(_id)) {
            wx.navigateTo({
                url: '../show/index?source=' + _source + '&detailID=' + _id,
            })
        }

    },
    scheduleCourses(e) {
        let _courseid = e.currentTarget.dataset.courseid || e.target.dataset.courseid || 0; //教练ID
        let _orderid = e.currentTarget.dataset.orderid || e.target.dataset.orderid || 0; //订单ID，不要了,但是传过去吧
        let _orderno = e.currentTarget.dataset.orderno || e.target.dataset.orderno || 0; //订单ID，不要了     
        if (util.isNull(_courseid) || _courseid == 0 || util.isNull(_orderno) || _orderno == 0) {
            return;
        }

        let that = this;
        const pushReservationTmplIds = app.globalData.subscribeMsg.agreeConfirmation.tID; //预约确认通知
        const _url = '../user/course/scheduleCourses/index?courseID=' + _courseid + '&orderID=' + _orderid + '&orderNo=' + _orderno;
        if (wx.requestSubscribeMessage) {
            wx.requestSubscribeMessage({
                tmplIds: [pushReservationTmplIds],
                success(res) {
                    if (res[pushReservationTmplIds] === 'accept') {

                        that.submitClock(_url);
                        //   } else if (res[pushReservationTmplIds] === 'reject') {
                    } else if (res[pushReservationTmplIds] === 'reject') {
                        // 用户历史操作有设置了拒绝 or 关闭了订阅消息的主（总）开关，导致无法推送
                        // console.log(res, '0 拒绝 or 关闭了订阅消息的主（总）开关---');
                        that.guideOpenSubscribeMessage(pushReservationTmplIds, _url);
                    } else {
                        wx.showToast({
                            title: '授权订阅消息有误',
                            icon: 'none'
                        });
                    }
                },
                fail(res) {
                    // 20004:用户关闭了主开关，无法进行订阅,引导开启
                    if (res.errCode == 20004) {
                        // console.log(res, 'fail:用户关闭了主开关，无法进行订阅,引导开启---');
                        that.guideOpenSubscribeMessage(pushReservationTmplIds, _url);
                    }
                }
            });
        } else {
            wx.showToast({
                title: '请更新您微信版本，来获取订阅消息功能',
                icon: 'none'
            });
        }
    },
    submitClock(_url) {
        wx.navigateTo({
            url: _url,
        })
    },
    guideOpenSubscribeMessage(_pushReservationTmplIds, _url) {
        wx.showModal({
            content: '检测到您没有开启订阅消息的权限，是否去设置？',
            confirmText: "确认",
            cancelText: "取消",
            success: (res) => {
                //点击“确认”时打开设置页面
                if (res.confirm) {
                    wx.openSetting({
                        success: (r) => {
                            this.guidSubscribeMessageAuthAfter(_pushReservationTmplIds, _url);
                        }
                    })
                } else {
                    util.toast("您已拒绝订阅消息授权，无法预约")
                }
            }
        })
    },
    guidSubscribeMessageAuthAfter(_pushReservationTmplIds, _url) {
        //let pushReservationTmplIds= "WOxzrpkwYFx4Kv7nqop48wVNqSy9FOHnFG0wKOF3a70";
        //引导用户 开启订阅消息 之后，「openSetting」 接口暂时不会返回，用户手动设置后的状态，所以采用「getSetting」接口重新进行查询
        wx.getSetting({
            withSubscriptions: true,
            success: res => {
                let {
                    authSetting = {},
                        subscriptionsSetting: {
                            mainSwitch = false,
                            itemSettings = {}
                        } = {}
                } = res;

                if (
                    (authSetting['scope.subscribeMessage'] || mainSwitch) &&
                    itemSettings[_pushReservationTmplIds] === 'accept'
                ) {
                    this.submitClock(_url);
                    //用户手动开启同意了，订阅消息
                } else {
                    util.toast("您没有同意授权订阅消息，预约失败")
                }
            }
        });
    },



    //查看发票
    invoiceDetail() {
        logs.log("查看发票")

    },

    onShow(e) {
        if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

    },
    onLoad: function (options) {

        let _tab = options.tab;
        if(!util.isNull(_tab))
        {
 
                this.getDataJson(_tab).then(_thisData => {
                    let listData;
                    if(util.isNull(_thisData.data)||_thisData.data.count===0){
                        listData = this.initNotData(),
                        _.set(listData,`[${_tab}].isLoading`,false);
                        _.set(listData,`[${_tab}].noData`,true);
                        this.setData({
                            tabIndex :_tab,
                            newsList:  listData            
                        })
                    }else{
                        listData =this.initData(_thisData,Number(_tab));
                        _.set(listData,`[${_tab}].isLoading`,false);
                        _.set(listData,`[${_tab}].noData`,false);
                        this.setData({   
                            newsList: listData,
                            tabIndex :_tab             
                        })
                    }
                    
      
                }, function (err) { 
                    
                });
      
        }else{
            this.getDataJson(this.data.tabIndex).then(_thisData => {
                this.setData({
                    newsList: this.initData(_thisData,this.data.tabIndex)
                })
            }, function (err) { 
                
            });
        }

    },
    /*
    获取数据
    source //-1全部 0=团课，1=私教课，2=集训课
    */
    getDataJson(_source = -1, _pageIndex = 1) {
        let that = this;
        _source = _source - 1;
        let _payState = 2; //0全部 1待支付 2已支付 3售后
        //let _source = 1; //-1全部 0=团课，1=私教课，2=集训课
        let _timestamp = (new Date()).valueOf();
        let config = {
            source: _source,

            payState: _payState, //0全部 1待支付 2已支付 3售后
            pageSize: 10,
            pageIndex: _pageIndex,

            userID: wx.getStorageSync('USERID'),
            TIMESTAMP: _timestamp,
            FKEY: md5util.md5(wx.getStorageSync('USERID') + _payState.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        };
        return new Promise((resolve, reject) => {
            axios.get("MyClass/detailList", config, {
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
                    let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
                    resolve(util.jsonTestParse(_data));
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
    initData(_defaultData,_tabindex) {
        //小鱼加获取初始第一屏数据,只有这里时机合适
        let ary = [];
        for (let i = 0, length = this.data.tabBars.length; i < length; i++) {
            let aryItem = {
                loadingText: '正在加载...',
                refreshing: false,
                refreshText: '',
                data: [],
                //isLoading: true,
                pageIndex: 1,
                lastPage: 1, //小鱼加，数据来的最大页
                noData: false, //小鱼加 有没有数据，默认不显示
            };
            //只有指定的tab先填充数据
            //if (i === this.data.tabIndex) {
            if (i === _tabindex|| this.data.tabIndex) {
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
            this.getList(index);
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
    orderController(_orderNo, _orderSource, _url) {
        let that = this;
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get(_url, {
                orderNo: _orderNo,
                type: _orderSource,
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') + _orderSource.toString() + _orderNo.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
    actionButtons(e) {
        let that = this;
        //"dataset":{"ac":"2","id":"course126D20230924213251SCOqZIdo","index":0}}
        let _detailID = e.currentTarget.dataset.id || e.target.dataset.id;
        let _orderSource = e.currentTarget.dataset.source || e.target.dataset.source; ////操作的订单所属类型   
        let _detailIndex = e.currentTarget.dataset.index || e.target.dataset.index;
        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        let _actionType = e.currentTarget.dataset.ac || e.target.dataset.ac;

        //参数安全验证
        if (
            util.isNull(_detailID) ||
            !util.isNumber(_detailID) ||
            util.isNull(_detailIndex) ||
            !util.isNumber(_detailIndex) ||
            _detailIndex < 0) {
            util.toast("订单信息有误,无法操作！", null, null, (e) => {
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
                })
            });
        }
        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        switch (Number(_actionType)) {
            case 0: //删除
                that.setData({
                    actionDeletSelectID: _detailID, //选择删除的ID
                    actionOrderSource: _orderSource, //操作的订单所属类型                    
                    actionDeletSelectIndex: _detailIndex, //选择删除的在数组的索上
                    actionType: 0, //操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{
                        text: "确认删除",
                        color: "#E3302D"
                    }],
                    showActionSheet: true
                })
                break;
            case 1: //重新支付
                that.setData({
                    actionDeletSelectID: _detailID, //选择ID
                    actionOrderSource: _orderSource, //操作的订单所属类型    
                    actionDeletSelectIndex: _detailIndex, //选择删除的在数组的索上
                    actionType: 1, //操作类型 在data-actiontype 中带入
                    tips: "操作将完成本订单的付款，您确认支付吗？",
                    actionItemList: [{
                        text: "确认支付",
                        color: "#E3302D"
                    }],
                    showActionSheet: true
                })
                break;
            case 2: //退款
                that.setData({
                    actionDeletSelectID: _detailID, //ID
                    actionOrderSource: _orderSource, //操作的订单所属类型    
                    actionDeletSelectIndex: _detailIndex, //选择删除的在数组的索上
                    actionType: 2, //操作类型 在data-actiontype 中带入
                    tips: "退款会影响您的正常课程，您确认退款吗？",
                    actionItemList: [{
                        text: "确认退款",
                        color: "#E3302D"
                    }],
                    showActionSheet: true
                })
                break;
            default:
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
                })
                break;
        }
    },

    //#region 面板操作
    //面板点击 操作 确认
    actionItemClick(e) {
        //console.log(e.detail)
        //{index: 0, text: "确认删除", color: "#E3302D"}
        let that = this;
        let _detailID = this.data.actionDeletSelectID;
        let _orderSource = this.data.actionOrderSource; ////操作的订单所属类型   
        let _detailIndex = this.data.actionDeletSelectIndex;
        let _actionType = this.data.actionType; /*0删除 1支付 2退款 3撤销退款（暂不启用） */

        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        switch (Number(_actionType)) {
            case 0:
                this.confirmDelete(_detailID, _orderSource, _detailIndex); //确认删除
                break;
            case 1:
                this.confirmRepay(_detailID, _orderSource, _detailIndex); //确认支付
                break;
            case 2:
                this.confirmRefund(_detailID, _orderSource, _detailIndex); //确认退款
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
            actionType: 0, //操作类型 在data-actiontype 中带入
            tips: "定单删除后无法恢复，您确认删除吗？",
            actionItemList: [{
                text: "确认删除",
                color: "#E3302D"
            }],
            showActionSheet: false
        })
    },
    //#endregion 面板操作


    //#region 操作确认后动作区
    //0删除
    confirmDelete(_detailID, _orderSource, _detailIndex) {
        let that = this;
        //删除
        this.orderController(_detailID, _orderSource, 'CourseOrder/delOrder').then(val => {
            let _tabIndex = this.data.tabIndex;
            var _newsList = this.data.newsList[_tabIndex].data;
            _.pullAt(_newsList, _detailIndex); // 移除
            util.toast("删除订单成功", null, null, (e) => {
                this.setData({
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
                })
            });
        }, function (err) { 
            util.toast(err, null, null, (e) => {
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
                })
            });
        })
    },

    //1支付
    confirmRepay(_detailID, _orderSource, _detailIndex) {
        let that = this;
        let _tabIndex = this.data.tabIndex;
        var _newsList = this.data.newsList[_tabIndex].data;
        //唤起支付
        this.orderController(_detailID, _orderSource, 'CourseOrder/orderPay').then(val => {
            //{"timeStamp":"1696321263","nonceStr":"xxczfUKDW8iHvdtdtxOUt8Wqv1Chb4Zj","package":"prepay_id=wx031621035967171c803da52ae1efd30000","paySign":"Isq+Nv78bL4IXtlx0ft82dIA93+IVOhgV2hXP1flU16dbsBGcCnuLxmPDY39c2jTMCEqjJY9qktG2iO6Pe4D41TV8lBlcbKMd+68kD0ZuKRz7\/sNDD62gjnYGsJKWfVizBnMqKPoEXuMaZZw1\/0zGzryCdIt\/hxFIuGZRUVIpikqwDWmXJLqkcJ9XRzcH1KaDtwYddP9MXprShaPmZDP8hC7Bbquhdj8PLnjVpuIhopOa\/qga2tJ1\/RsI+VR++PF1psuyHfQCHrj77dafWZvbpsG9fG0RYkkDx9z\/+7vvDlnXlrFvaynejOX+1g73FI7O40CB\/54ojgPBHOuapSb\/Q==","orderno":"22102023100316204590"}}
            //#region 开始支付
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
                            actionType: 0, //操作类型 在data-actiontype 中带入
                            tips: "定单删除后无法恢复，您确认删除吗？",
                            actionItemList: [{
                                text: "确认删除",
                                color: "#E3302D"
                            }],
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
                            actionType: 0, //操作类型 在data-actiontype 中带入
                            tips: "定单删除后无法恢复，您确认删除吗？",
                            actionItemList: [{
                                text: "确认删除",
                                color: "#E3302D"
                            }],
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
                actionType: 0, //操作类型 在data-actiontype 中带入
                tips: "定单删除后无法恢复，您确认删除吗？",
                actionItemList: [{
                    text: "确认删除",
                    color: "#E3302D"
                }],
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
                    const {
                        data
                    } = res;
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
    confirmRefund(_detailID, _orderSource, _detailIndex) {
        let that = this;

        this.orderController(_detailID, _orderSource, 'CourseOrder/refund').then(val => {
            let _tabIndex = this.data.tabIndex;
            var _newsList = this.data.newsList[_tabIndex].data;
            _.pullAt(_newsList, _detailIndex); // 移除
            util.toast("成功提交订单退款申请", null, null, (e) => {
                this.setData({
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
                    actionType: 0, //操作类型 在data-actiontype 中带入
                    tips: "定单删除后无法恢复，您确认删除吗？",
                    actionItemList: [{
                        text: "确认删除",
                        color: "#E3302D"
                    }],
                    showActionSheet: false
                })
            });
        })
    },

    //#endregion 操作确认后动作区

    //子页返回，调用本页命令
    callBackReturn(_object) {
        //#region  1.子页有返回错误信息
        //{"backParentErr":"您的课程有误"}
        let _backParentErr = _object.backParentErr || '';
        if (!util.isNull(_backParentErr)) {
            util.toast(_backParentErr);
            return;
        }
        //#endregion 1.子页有返回错误信息
        let index = this.data.tabIndex;
        var tab = this.data.newsList[index];
        if (tab.refreshing) return;
        this.setData({
            [`newsList[${index}].refreshing`]: true,
            [`newsList[${index}].refreshText`]: '正在刷新...'
        }, () => {
            this.getList(index, true);
            this.setData({
                pulling: true,
                [`newsList[${index}].refreshing`]: false,
                [`newsList[${index}].refreshText`]: '刷新成功',
                [`newsList[${index}].refreshFlag`]: false
            }, () => {
                setTimeout(() => {
                    this.setData({
                        pulling: false
                    })
                }, 500);
            })

        })

    },
    //无课程跳去买
    gobuy(e){
        let _url = '/pages/course/personal/index';
        if(this.data.tabIndex==3){
            _url="/pages/course/camp/index";//训练营
        }else if(this.data.tabIndex==2)
        {
            _url="/pages/course/personal/index";//私
        }else if(this.data.tabIndex==1)
        {
            _url="/pages/course/group/index";//团
        }
        else{
             _url="/pages/course/index/index";//首
        }
        wx.reLaunch({
          url: _url,
        })
        
    }
}))