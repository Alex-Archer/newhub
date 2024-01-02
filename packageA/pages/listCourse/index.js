// 缓存最多页数
const MAX_CACHE_PAGEINDEX = 8;
//缓存页签数量
const MAX_CACHE_PAGE = 8;
const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')
const filter = require('../../../utils/loginFilter');
const apis = require('../../../utils/apis');

Page(filter.loginCheck(true, app, {
  // Page({
  data: {
    scrollViewHeight: 0, // scroll-view的高度
    preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面
    pageIndex: 1,
    loadding: false,
    pullUpOn: true,
    cardList: [
      // {
      // "data": [],
      // "isLoading": true,
      // "lastPage": 1,
      // "loadingText": "正在加载...",
      // "noData": false,
      // "pageIndex": 1,
      // "refreshText": "",
      // "refreshing": false
    // }
  ], //初始写组数据,为了有加载效果,
    cacheTab: [],
    tabIndex: 0,
    tabBars: [{
        name: '全部课卡',
        id: 'yule'
      },
      {
        name: '团课卡',
        id: 'yule'
      },
      {
        name: '私教课卡',
        id: 'sports'
      },
      // {
      //   name: '训练营',
      //   id: 'domestic'
      // }
    ],
    scrollInto: '',
    pulling: false,
  },
  // 已购卡
  getCardList(e) {
    wx.showLoading({
      title: '加载中...',
    })
    let _timestamp = (new Date()).valueOf();
    let _coursePackageType = e // 当展示全部卡的时候,后台反馈这个字段不传
    let _config = {
      userID: wx.getStorageSync('USERID'),
      coursePackageType: _coursePackageType,
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
    }
    let _time = (new Date().getTime())
    apis.gets('/CardItemOrderApi/getUserCardItem', _config, true).then(val => {
      val.forEach(el => {
        // 算出剩余多少节
        el.remaining = el.course_quantity - el.course_used_quantity
        el.days = (el.expire_time - _time) / (1000 * 3600 * 24);
        el.months = Math.floor(el.days % 365 / 30);
      });
      this.setData({
        cardList: val
      })
      wx.hideLoading()
    }, function (err) {
      console.log(err);
    })
  },

  onShow(e) {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

  },
  onLoad: function (options) {
    this.getCardList()
  },
  /**
   * 获取数据 - 下拉刷新 上拉加载更多合用
   * @param {*} index  tab的索引，配合了获取的类型  payState: _payType, //0全部 1待支付 2已支付 3售后
   * @param {*} refresh  是否下拉刷新,true:下拉刷新    false：上拉加载更多
   */
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
        this.getCardList(index);
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
      this.getCardList(index, true);
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
    this.setData({
      tabIndex:index
    })
    this.getCardList(index);
  },
  //1.2 显示区左右滑动
  tabChange(e) {
    if (e.detail.source == 'touch') {
      let index = e.target.current || e.detail.current;
      this.getCardList(index);
    }
  },
  //无课程跳去买
  gobuy(e) {
    let _url = '/packageB/pages/card/index/index';
    // if (this.data.tabIndex == 3) {
    //   _url = "/pages/course/camp/index"; //训练营
    // } else if (this.data.tabIndex == 2) {
    //   _url = "/pages/course/personal/index"; //私
    // } else if (this.data.tabIndex == 1) {
    //   _url = "/pages/course/group/index"; //团
    // } else {
    //   _url = "/pages/course/index/index"; //首
    // }
    wx.reLaunch({
      url: _url,
    })

  }
}))