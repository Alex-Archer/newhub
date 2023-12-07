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

Page(filter.loginCheck(true, app, { 
    // Page({
    data: {
        preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面
        
        tabBarCurrent: 3,
        tabBar: app.globalData.coachTabBar,//教练菜单

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
        tabBars: [
            {
              name: '课程提醒',
              id: 'yule'
            },
            {
              name: '系统通知',
              id: 'sports'
            }
          ],
        scrollInto: '',
        showTips: false,
        navigateFlag: false,
        pulling: false,

        //删除确认
        //actionOrderSource: -1, //操作的订单所属类型       
        actionDeletSelectID: 0, //选择删除的ID
        actionDeletSelectIndex: -1, //选择删除的在数组的索上
        
        /*0删除 1支付 2退款 3撤销退款（暂不启用） */
        //actionType:0,//操作类型 在data-ac 中带入

        showActionSheet: false,
        tips: "取消预约后无法恢复，您确认取消吗？",
        actionItemList: [{ text: "确认取消预约",color: "#E3302D"}],
        maskClosable: true, //可以点击外部任意地方关闭
        color: "#9a9a9a",
        size: 26,
        isCancel: true, 
    },

    detailShow(e) {


    },

    onShow(e) {
        if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

    },
    onLoad: function (options) {
        
      
        //需要判断是否是教练
      if(util.isNull(wx.getStorageSync('ISCOACH')))
      {
          wx.reLaunch({
            url: "/pages/user/home/index"
          })
          return;
      }
        
        //#region  弹窗小提示，如果MSG不为空
        new Promise(()=>{
          let _msg= options.msg||'';
          if(!util.isNull(_msg)){
            util.toast(decodeURIComponent(_msg));
          }          
        })
        //#endregion 弹窗小提示，如果MSG不为空



        this.getDataJson(this.data.tabIndex).then(_thisData => {
            this.setData({
                newsList: this.initData(_thisData)
            })
        }, function (err) { 
            
        });

    },
    /*
    获取数据
    _state 0待上课 1已完成 2旷课
    */
    getDataJson(_Type = 0, _pageIndex = 1) {
        let that = this;
        let _msgType = _Type==0?2:0;
        let _timestamp = (new Date()).valueOf();
        let config = {
            type:_msgType,//消息类型

            pageSize: 10,
            pageIndex: _pageIndex,

            userID: wx.getStorageSync('USERID'),
            TIMESTAMP: _timestamp,
            FKEY: md5util.md5(wx.getStorageSync('USERID')  + _msgType.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        };
        return new Promise((resolve, reject) => {
            axios.get("Message/index", config, {
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
    courseController(_orderID,_url) {
        let that = this;
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get(_url, {
                id: _orderID,
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') + _orderID.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
    

    //#region 面板操作
//按钮操作
actionButtons(e)
{
    let that = this;
    let _detailID = e.currentTarget.dataset.id || e.target.dataset.id;
    let _detailIndex = e.currentTarget.dataset.index || e.target.dataset.index;//选择删除的在数组的索上

    let _expireDate = e.currentTarget.dataset.date || e.target.dataset.date;//开课日期
    let _expireTime = e.currentTarget.dataset.stime || e.target.dataset.stime;//开课时间
    //参数安全验证
    if (util.isNull(_detailID)||!util.isNumber(_detailID)||_expireDate<=0||_expireTime<=0) {
        util.toast("课程信息有误,无法操作！", null, null, (e) => {
            that.setData({
                actionDeletSelectID: 0, //选择删除的ID
                actionDeletSelectIndex: -1, //选择删除的在数组的索上
                showActionSheet: false
            })
        });
    }
    
   /**
    * 约课成功扣款或扣课时后，开课前2小时可免费取消，按结算方式原路退回。两小时后，若因顾客原因取消不退款，
    * 平台赠送100元现金抵用券入顾客余额。若是因老师原因取消，全额退还，并补偿顾客100元现金抵用券。
    * 并对该老师做出相应惩戒。
    */
    let _expireDateTime = _expireDate+_expireTime;
    let currentTime = Date.now(); //13位时间戳 1693376939413
    let _accessExpires =_expireDateTime*1000; 
    if(currentTime>_accessExpires)//已过期,无法取消
    {
      util.toast("已过期程无法取消！", null, null, (e) => {
          that.setData({
              actionDeletSelectID: 0, //选择删除的ID
              actionDeletSelectIndex: -1, //选择删除的在数组的索上
              showActionSheet: false,

              tips: "取消预约后无法恢复，您确认取消吗？",
              actionItemList: [{ text: "确认取消预约",color: "#E3302D"}],
              color: "#9a9a9a",
          })
      });
      return;
    }else{//未过期
      let expireTime = _accessExpires-currentTime;
      let expireHoure = expireTime/1000/60/60;//相差的小时数
      if(expireHoure<2){//2小时就要 开课了，取消是返
        that.setData({
          actionDeletSelectID: _detailID, //选择删除的ID
          actionDeletSelectIndex: _detailIndex, //选择删除的在数组的索上
          showActionSheet: true,
          tips: "开课前2小时内取消只能返瑜伽币，您确认取消吗？",
          actionItemList: [{ text: "确认取消预约",color: "#E3302D"}],
          color: "#9a9a9a",
        })
        return;
      }else{//2小时外免费取消
        that.setData({
          actionDeletSelectID: _detailID, //选择删除的ID
          actionDeletSelectIndex: _detailIndex, //选择删除的在数组的索上
          showActionSheet: true,
          tips: "取消预约后无法恢复，您确认取消吗？",
          actionItemList: [{ text: "确认取消预约",color: "#E3302D"}],
          color: "#9a9a9a",
        })
      }
    }



},
    //面板点击 操作 确认
    actionItemClick(e) 
    {
        let that = this;
        let _detailID = this.data.actionDeletSelectID;
        let _detailIndex = this.data.actionDeletSelectIndex;

        this.courseController(_detailID,'BookedClass/cancel').then(val => {
          let _tabIndex = this.data.tabIndex;
          var _newsList = this.data.newsList[_tabIndex].data;
          _.pullAt(_newsList, _detailIndex); // 移除
          util.toast("取消约课成功", null, null, (e) => {
              this.setData({
                  [`newsList[${_tabIndex}].data`]: _newsList,
                  actionDeletSelectID: 0, //选择删除的ID
                  actionDeletSelectIndex: -1, //选择删除的在数组的索上
                  showActionSheet: false,
                  tips: "取消预约后无法恢复，您确认取消吗？",
                  actionItemList: [{ text: "确认取消预约",color: "#E3302D"}],
                  color: "#9a9a9a",
              })
          });
        }, function (err) { 
          util.toast(err, null, null, (e) => {
              that.setData({
                  actionDeletSelectID: 0, //选择删除的ID
                  actionDeletSelectIndex: -1, //选择删除的在数组的索上
                  showActionSheet: false,
                  tips: "取消预约后无法恢复，您确认取消吗？",
                  actionItemList: [{ text: "确认取消预约",color: "#E3302D"}],
                  color: "#9a9a9a",
              })
          });
        })

    },
    //面板关闭
    closeActionSheet(e) {
        this.setData({
            actionDeletSelectID: 0, //选择删除的ID
            actionDeletSelectIndex: -1, //选择删除的在数组的索上
            showActionSheet: false,
            tips: "取消预约后无法恢复，您确认取消吗？",
            actionItemList: [{ text: "确认取消预约",color: "#E3302D"}],
            color: "#9a9a9a",
        })
    },
    //#endregion 面板操作

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
    // 底部菜单点击
  tabbarSwitch(e) {
    let isLogin = false
    if (e.detail.verify && !isLogin) {
      wx.showToast({
        title: '您还未登录，请先登录',
        icon: "none"
      })
    } else {

      if (e.detail.index != this.data.tabBarCurrent) {
        //临时用用
        if (e.detail.pagePath == "/pages/coach/home/door/index")
        {      

            wx.scanCode({
                onlyFromCamera: false,//禁止相册
                scanType:['qrCode'],//只识别二维码
                success: (res) => {
                    wx.showLoading();
                    // 获取到扫描到的二维码内容
                    const qrCodeContent = res.result;
                    logs.log("11111111111扫码内容",qrCodeContent,true)
                    //https://yoga.aoben.yoga/s=door&param=mac
                    //1.必须有网址
                    //2.必须有参数s
                    //3.必须有参数param
                    // const arrUrl="https://yoga.aoben.yoga";
                    const arrUrl=app.globalData.scanURL;
                    const found = qrCodeContent.indexOf(arrUrl) > -1;
  
                    if(!found){
                        wx.showToast({
                            title: '啥都不是，不处理',
                            icon: 'none'
                        })
                        return
                    }
                    let _action=util.getURLParam(qrCodeContent,"s");
                    let _actionTitle="";
                    switch(_action)
                    {
                        case "door"://开门 https://yoga.aoben.yoga/s=door&param=mac
                            _actionTitle="开门动作";
                            break;
                        case "getpass"://获取用户密码 https://yoga.aoben.yoga/s=getpass&param=MAC
                            _actionTitle="获取用户密码";
                            break;
                        case "cabinet"://开柜 https://yoga.aoben.yoga/s=cabinet&param=mac
                            _actionTitle="开柜";
                            break;            
                        case "coach"://教练分享 https://yoga.aoben.yoga/s=coach&param=2,str
                            _actionTitle="教练分享码";
                            break;
                        case "sign"://用户签到 https://yoga.aoben.yoga/s=sign&param=2,str
                            _actionTitle="用户签到";
                            break;            
                        default://啥都不是
                            _actionTitle="啥都不是";
                            break;
                    }
    
                    //联网去处理
                    wx.showToast({
                        title: _actionTitle,
                        icon: 'none'
                    })
                    return;
                    
                  },
                  fail: (error) => {
                    console.log('扫描失败', error);

                    // 根据扫描到的内容跳转到对应的页面
                    wx.navigateTo({
                        url: e.detail.pagePath,
                        success: () => {
                          console.log('跳转成功');
                        },
                        fail: (error) => {
                          console.log('跳转失败', error);
                          wx.showToast({
                              title: '跳转失败，请稍后重试',
                              icon:'none'
                          })
                        }
                      });
                  }
            }) 
            return;
        }
        //临时用用
        if (e.detail.pagePath == "/packageA/pages/order/list/index")
        {
          wx.navigateTo({
            url: e.detail.pagePath,
          })

        } else {
          wx.reLaunch({
            url: e.detail.pagePath
          })
        }
      }
    }
  },
}))