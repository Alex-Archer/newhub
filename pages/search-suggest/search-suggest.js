const app = getApp();
const md5util = require('../../utils/md5.js');
const logs = require('../../utils/logs.js'); //日志打印
import _ from '../../libs/we-lodash'

const QQMapWX = require('../../libs/qqmap-wx-jssdk.1.2.js');
import tui from '../../common/httpRequest'

Page({
  data: {
    keywords: '',
    qqmapsdk: app.globalData.MapQQ.MapSDK,
    key: app.globalData.MapQQ.MapKey,
    loading: false,
    pageIndex: 1,
    result: [],
    pullUpOn: true
  },
  onLoad: function (options) {
    this.data.qqmapsdk = new QQMapWX({
			key: this.data.key
		});
  },
  search(input) {
    if (!this.data.keywords && !input) {
      tui.toast('请输入搜索地点');
      return;
    }
    this.setData({
      pageIndex:1,
      pullUpOn:true,
      result:[],
      loading:true
    },()=>{
      this.getSuggest(this.data.keywords);
    })
  },
  inputChange(e) {
    this.setData({
      keywords:e.detail.value
    })
    this.search(true);
  },
  clearInput() {
    this.setData({
      keywords:''
    })
  },
  getSuggest(keywords) {
    this.data.qqmapsdk.getSuggestion({
      keyword: keywords,
      page_index: this.data.pageIndex,
      success: res => {
        let data = res.data || [];
        this.setData({
          result:this.data.result.concat(data),
          pageIndex:this.data.pageIndex+1,
          loading:false,
        })
        if (data.length < 10) {
          this.setData({
            pullUpOn:false
          })
        }
      },
      fail: res => {
        this.setData({
          loading:false
        })
        console.log(res);
      }
    });
  },
  
  choose(e) {
    let index=Number(e.currentTarget.dataset.index)
    if (this.data.result.length === 0) return;
    let item = this.data.result[index];
    let pages=getCurrentPages()
    let page = pages[pages.length - 2];
    page.getLocationBySearch({
      ...item.location,
      keywords: item.title
    })
    setTimeout(() => {
      wx.navigateBack();
    }, 0);
  },
  onReachBottom: function () {
    if (!this.data.pullUpOn || this.data.loading) return;
    this.setData({
      loading:true
    })
		this.getSuggest(this.data.keywords);
  },

})