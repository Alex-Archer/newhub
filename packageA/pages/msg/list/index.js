const app = getApp();
const logs = require("../../../../utils/logs");
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../libs/we-lodash'
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')
const filter = require('../../../../utils/loginFilter');
Page(filter.loginCheck(true, app, {
  /**
   * 页面的初始数据
   */
  data: {
    preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面

    loadingText: '正在加载...',
    refreshing: false, //是否刷新中
    refreshText: '', //刷中的文字
    isLoading: true, //是否加载更多中
    pageSize: 10, //每页条数
    pageIndex: 0,
    lastPage: 0, //小鱼加，数据来的最大页
    noData: false, //小鱼加 有没有数据，默认不显示
    dataList: [],

    msgType:0,//0系统通知 1客服消息 2发货通知 3收货通知 4付款通知
  },
  /**
   * 获取数据
   * @param {*} _pageIndex 页码
   */
  getDataJson(_msgType,_pageIndex = 1) {
    return new Promise((resolve, reject) => {
      let _timestamp = (new Date()).valueOf();
      axios.get("Message/index", {

        type:_msgType,//消息类型

        pageSize: this.data.pageSize,
        pageIndex: _pageIndex,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _msgType.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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

  onLoad(e) {
    const that = this;
    let _msgType  =e.type||0;//0系统通知 1客服消息 2发货通知 3收货通知 4付款通知
    //1.初始数据
    let _pageIndex = 1;
    this.getDataJson(_msgType,_pageIndex).then(val => {
      that.setData({
        dataList: val.data,
        pageIndex: 1,
        lastPage: val.lastPage,
        isLoading: false,
        msgType:_msgType
      })
    }, function (err) {
      that.setData({
        dataList: [],
        pageIndex: 1,
        lastPage: 1,
        isLoading: false,
        noData: true,
        msgType:_msgType
      })
    });
  },
  onShow(e) {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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
  //上拉加载更多
  loadMore(e) {
    let thisPageIndex = this.data.pageIndex;
    if (thisPageIndex >= this.data.lastPage) {
      return;
    }
    this.setData({
      isLoading: true,
    }, () => {
      
      this.getDataJson(this.data.msgType,thisPageIndex + 1).then(val => {
        this.setData({
          dataList: this.data.dataList.concat(val.data),
          pageIndex: thisPageIndex + 1,
          isLoading: false
        })
      }, function (err) {
        this.setData({
          pageIndex: thisPageIndex + 1,
          isLoading: false
        })
      });
    })
  },
  //下拉刷新
  onrefresh(e) {
    let that = this;
    if (this.data.refreshing) return;
    this.setData({
      refreshing: true,
      refreshText: '正在刷新...'
    }, () => {
      let _pageIndex = 1;
      this.getDataJson(this.data.msgType,_pageIndex).then(val => {
        that.setData({
          dataList: val.data,
          pageIndex: _pageIndex,
          lastPage: val.lastPage,
          refreshing: false,
          refreshText: '刷新成功',
        })
      }, function (err) {
        that.setData({
          dataList: [],
          pageIndex: 1,
          lastPage: 1,
          noData: true,
          refreshing: false,
          refreshText: '刷新成功',
        })
      });
    })
  },
  /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
          //if(this.data.refreshParent){//是否需要刷新
              // 页面卸载时触发
              //触发用户中心更新头像昵称
              let pages = getCurrentPages(); //获取页面栈
              if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
              {
                  let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
                  prePage.callBackReturn({
                      //headimgurl: this.data.headimgurl,
                      //nickname:this.data.nickname
                  }); //调用上一个页面实例对象的方法
              }   
          //}
      },
}))