const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
Page({
  data: {
    //导航菜单
    flag: true, //首页加载动画
    tabbarShow: true, //底部菜单不与其它冲突默认关闭

    indexPage: false, //是否在首页，tabbar和别人不一样
    indexBackToTop: false, //是否返回顶部
    current: 4, //tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    tabBar: app.globalData.tabBar,
    safeAreaBottom: app.globalData.safeAreaBottom,


    top: 0, //标题图标距离顶部距离
    scrollTop: 0.5,


    gifSetting: {
      shake: false, // 是否开启下拉震动
      height: 70,
      background: {
        color: '#eeeeee',
        img: app.globalData.globalURL+'/miniprogram/loading_top.gif?v=202309192303'
      },
    },
  },
  
  onLoad(options) {

  },
  initNavigation(e) {
    this.setData({
      top:e.detail.top
    })
  },
  onPageScroll(e) {
    this.setData({
      scrollTop:e.scrollTop
    })
  },
  indexRestore(e){

  },
  indexRefresh(e){

  },
  indexScroll(e){
    this.setData({
      scrollTop:e.detail.detail.scrollTop//e.scrollTop
    })

  },
  indexLoadmore(e){

  },  
})