const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
// 缓存最多页数
const MAX_CACHE_PAGEINDEX = 3;
// 缓存页签数量
const MAX_CACHE_PAGE = 3;
const groupData = [
  {
    title: '空中瑜伽-打造完美曲线',
    des:"张珊珊 30分钟 10人预约",
    coverImg: "/miniprogram/url-img/store/img-3.png",
    coverBg: "/miniprogram/url-img/store/box-1.png",    
    startDate:"2023-08-21",
    startTime:"17:00",
    endTime:"21:00",
    coachName:"张珊珊",//教练
    classDuration:"30",//上课时长
    appointmentsNumber:10,//10人预约
    isReservation:true,//是否已预约
    classesBegin:"",//已经开始上课，无法约，没开始就为空
  },
  {
    title: '瑜伽基本功-柔韧拉伸'
  },
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '空中瑜伽-打造完美曲线'
  }
  ,
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '空中瑜伽-打造完美曲线'
  },
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '空中瑜伽-打造完美曲线'
  },
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '空中瑜伽-打造完美曲线'
  },
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '空中瑜伽-打造完美曲线'
  },
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '空中瑜伽-打造完美曲线'
  },
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '空中瑜伽-打造完美曲线'
  },
  {
    title: '身心放松-即可缓解疲劳'
  },
  {
    title: '空中瑜伽-打造完美曲线'
  }
];
Page({
  data: {

    globalURL: app.globalData.globalURL,

    //底部菜单
    flag: true, //首页加载动画
    tabbarShow: true, //底部菜单不与其它冲突默认关闭

    indexPage: false, //是否在首页，tabbar和别人不一样
    indexBackToTop: true, //是否返回顶部
    current: 3, //tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    tabBar: app.globalData.tabBar,
    safeAreaBottom: app.globalData.safeAreaBottom,
    
    //三个选择中项
    tabTypeIndex: 3,//顶部大分类 默认认选择项
    tabDateIndex: 1,//日期选择模块 日期默认选中项
    tabLeftIndex: 0, //左边分类 默认选中 预设当前项的值


    //顶部类型选择
    typeScrollInto: '',//选择后运动到的位置
    typeBars: 
    [
      {
        name: '找课程',
        id:"0",
        path: '/pages/course/index/index',
      },
      {
        name: '团课',
        id:"1",
        path: '/pages/course/group/index',
      },
      {
        name: '私教',
        id:"2",
        path: '/pages/course/personal/index',
      },
      {
        name: '包月私教',
        id:"3",
        path: '/pages/course/personalMon/index',
      },
      // {
      //   name: '集训营',
      //   id:"4",
      //   path: '/pages/course/camp/index',
      // }
    ],
    //顶部类型选择END




pageIndex: 1,//好像不用


    
    newsList: [],
    cacheTab: [],
    dateBars: [{
        name: '20',
        id: 'wynb',
        weekday:'日',
        date:'2023-08-20',
        number:0,
        dot:false
        
      },
      {
        name: '21',
        id: 'yule',
        weekday:'今天',
        date:'2023-08-21',
        number:10,
        dot:true
      },
      {
        name: '22',
        id: 'sports',
        weekday:'明天',
        date:'2023-08-22',
        number:20,
        dot:false
      },
      {
        name: '23',
        id: 'domestic',
        weekday:'三',
        date:'2023-08-23',
        number:13,
        dot:true
      },
      {
        name: '24',
        id: 'finance',
        weekday:'四',
        date:'2023-08-24',
        number:0,
        dot:false
      },
      {
        name: '25',
        id: 'keji',
        weekday:'五',
        date:'2023-08-25',
        number:0,
        dot:false
      },
      {
        name: '26',
        id: 'education',
        weekday:'六',
        date:'2023-08-26',
        number:0,
        dot:false
      },
      {
        name: '27',
        id: 'car',
        weekday:'日',
        date:'2023-08-27',
        number:0,
        dot:false
      }
    ],
    dateScrollInto:'',//选择后运动到的位置
    //日期选择块END

    // 左边类型选择 TAB
    scrollViewId: "id_0",//左边TAB滚动到的位置 scroll-into-view
    leftBars: [
      ['8:00','已结束'],
      ['9:00','已结束'],
      ['13:00',''],
      ['14:00','已约满'],
      ['15:00',''],
      ['16:00',''],
      ['19:00',''],
      ['20:00',''],
      ['21:00','']
    ],
    // 左边类型选择 TAB end
    
    

    //下拉排序块
    searchKey: '', //搜索关键词
    width: 200, //header宽度
    height: 64, //header高度
    inputTop: 0, //搜索框距离顶部距离
    arrowTop: 0, //箭头距离顶部距离
    dropScreenH: 0, //下拉筛选框距顶部距离
    attrData: [],
    attrIndex: -1,
    dropScreenShow: false,
    scrollTop: 0,
    tabIndex: 0, //顶部筛选索引
    isList: false, //是否以列表展示  | 列表或大图
    drawer: false,
    drawerH: 0, //抽屉内部scrollview高度
    selectedName: '综合',
    selectH: 0,
    dropdownList: [{
      name: '综合',
      selected: true
    },
    {
      name: '价格升序',
      selected: false
    },
    {
      name: '价格降序',
      selected: false
    }
  ],
  attrArr: [{
    name: '新品',
    selectedName: '新品',
    isActive: false,
    list: []
  },
  {
    name: '品牌',
    selectedName: '品牌',
    isActive: false,
    list: [{
        name: 'trendsetter',
        selected: false
      },
      {
        name: '维肯（Viken）',
        selected: false
      },
      {
        name: 'AORO',
        selected: false
      },
      {
        name: '苏发',
        selected: false
      },
      {
        name: '飞花令（FHL）',
        selected: false
      },
      {
        name: '叶梦丝',
        selected: false
      },
      {
        name: 'ITZOOM',
        selected: false
      },
      {
        name: '亿魅',
        selected: false
      },
      {
        name: 'LEIKS',
        selected: false
      },
      {
        name: '雷克士',
        selected: false
      },
      {
        name: '蕊芬妮',
        selected: false
      },
      {
        name: '辉宏达',
        selected: false
      },
      {
        name: '英西达',
        selected: false
      },
      {
        name: '戴为',
        selected: false
      },
      {
        name: '魔风者',
        selected: false
      },
      {
        name: '即满',
        selected: false
      },
      {
        name: '北比',
        selected: false
      },
      {
        name: '娱浪',
        selected: false
      },
      {
        name: '搞怪猪',
        selected: false
      }
    ]
  },
  {
    name: '类型',
    selectedName: '类型',
    isActive: false,
    list: [{
        name: '线充套装',
        selected: false
      },
      {
        name: '单条装',
        selected: false
      },
      {
        name: '车载充电器',
        selected: false
      },
      {
        name: 'PD快充',
        selected: false
      },
      {
        name: '数据线转换器',
        selected: false
      },
      {
        name: '多条装',
        selected: false
      },
      {
        name: '充电插头',
        selected: false
      },
      {
        name: '无线充电器',
        selected: false
      },
      {
        name: '座式充电器',
        selected: false
      },
      {
        name: '万能充',
        selected: false
      },
      {
        name: '转换器/转接线',
        selected: false
      },
      {
        name: 'MFI苹果认证',
        selected: false
      },
      {
        name: '转换器',
        selected: false
      },
      {
        name: '苹果认证',
        selected: false
      }
    ]
  },
  {
    name: '适用手机',
    selectedName: '适用手机',
    isActive: false,
    list: [{
        name: '通用',
        selected: false
      },
      {
        name: 'vivo',
        selected: false
      },
      {
        name: 'OPPO',
        selected: false
      },
      {
        name: '魅族',
        selected: false
      },
      {
        name: '苹果',
        selected: false
      },
      {
        name: '华为',
        selected: false
      },
      {
        name: '三星',
        selected: false
      },
      {
        name: '荣耀',
        selected: false
      },
      {
        name: '诺基亚5',
        selected: false
      },
      {
        name: '荣耀4',
        selected: false
      },
      {
        name: '诺基',
        selected: false
      },
      {
        name: '荣耀',
        selected: false
      },
      {
        name: '诺基亚2',
        selected: false
      },
      {
        name: '荣耀2',
        selected: false
      },
      {
        name: '诺基',
        selected: false
      }
    ]
  }
],
  //下拉排序块

  //筛选点击================
  proDropList: [{
    list: [{
      name: "trendsetter",
      selected: false
    }, {
      name: "维肯（Viken）",
      selected: false
    }, {
      name: "AORO",
      selected: false
    }, {
      name: "苏发",
      selected: false
    }, {
      name: "飞花令（FHL）",
      selected: false
    }, {
      name: "叶梦丝",
      selected: false
    }, {
      name: "ITZOOM",
      selected: false
    }, {
      name: "亿魅",
      selected: false
    }, {
      name: "LEIKS",
      selected: false
    }, {
      name: "雷克士",
      selected: false
    }, {
      name: "蕊芬妮",
      selected: false
    }, {
      name: "辉宏达",
      selected: false
    }, {
      name: "英西达",
      selected: false
    }, {
      name: "戴为",
      selected: false
    }, {
      name: "魔风者",
      selected: false
    }, {
      name: "即满",
      selected: false
    }, {
      name: "北比",
      selected: false
    }, {
      name: "娱浪",
      selected: false
    }, {
      name: "搞怪猪",
      selected: false
    }]
  }, {
    list: [{
      name: "线充套装",
      selected: false
    }, {
      name: "单条装",
      selected: false
    }, {
      name: "车载充电器",
      selected: false
    }, {
      name: "PD快充",
      selected: false
    }, {
      name: "数据线转换器",
      selected: false
    }, {
      name: "多条装",
      selected: false
    }, {
      name: "充电插头",
      selected: false
    }, {
      name: "无线充电器",
      selected: false
    }, {
      name: "座式充电器",
      selected: false
    }, {
      name: "万能充",
      selected: false
    }, {
      name: "转换器/转接线",
      selected: false
    }, {
      name: "MFI苹果认证",
      selected: false
    }, {
      name: "转换器",
      selected: false
    }, {
      name: "苹果认证",
      selected: false
    }]
  }, {
    list: [{
      name: "通用",
      selected: false
    }, {
      name: "vivo",
      selected: false
    }, {
      name: "OPPO",
      selected: false
    }, {
      name: "魅族",
      selected: false
    }, {
      name: "苹果",
      selected: false
    }, {
      name: "华为",
      selected: false
    }, {
      name: "三星",
      selected: false
    }, {
      name: "荣耀",
      selected: false
    }, {
      name: "诺基亚5",
      selected: false
    }, {
      name: "荣耀4",
      selected: false
    }, {
      name: "诺基",
      selected: false
    }, {
      name: "荣耀",
      selected: false
    }, {
      name: "诺基亚2",
      selected: false
    }, {
      name: "荣耀2",
      selected: false
    }, {
      name: "诺基",
      selected: false
    }]
  }],
  proDropData: [],
  proDropIndex: -1,
  dropShow: false,
  dropHeaderShow:false,//下拉闪屏小鱼试解决


  scrollTop: 0,
  dropdownlistData: [{
    name: "微信支付",
    icon: "wechat",
    color: "#80D640",
    size: 30
  }, {
    name: "支付宝支付",
    icon: "alipay",
    color: "#00AAEE",
    size: 30
  }, {
    name: "银行卡支付",
    icon: "bankcard-fill",
    color: "#ff7900",
    size: 28
  }, {
    name: "微信支付",
    icon: "wechat",
    color: "#80D640",
    size: 30
  }, {
    name: "支付宝支付",
    icon: "alipay",
    color: "#00AAEE",
    size: 30
  }, {
    name: "银行卡支付",
    icon: "bankcard-fill",
    color: "#ff7900",
    size: 28
  }],
  dropdownShow: false,
  popupShow: false,
  shareList: [{
    share: [{
      name: "QQ",
      icon: "qq",
      color: "#07BDFD",
      size: 34
    }, {
      name: "微信",
      icon: "wechat",
      color: "#80D640"
    }, {
      name: "朋友圈",
      icon: "moments",
      color: "#80D640",
      size: 32
    }, {
      name: "支付宝",
      icon: "alipay",
      color: "#00AAEE"
    }, {
      name: "新浪微博",
      icon: "sina",
      color: "#F9C718"
    }, {
      name: "小程序",
      icon: "applets",
      color: "#2BA348"
    }, {
      name: "钉钉",
      icon: "dingtalk",
      color: "#2DA0F1"
    }, {
      name: "浏览器打开",
      icon: "explore-fill",
      color: "#1695F7"
    }, {
      name: "邮件",
      icon: "mail-fill",
      color: "#2868E5"
    }]
  }, {
    operate: [{
      name: "投诉",
      icon: "warning",
      size: 30
    }, {
      name: "复制链接",
      icon: "link",
      size: 28
    }, {
      name: "刷新",
      icon: "refresh",
      size: 30
    }, {
      name: "搜索内容",
      icon: "search-2",
      size: 28
    }]
  }],
  //右下角数据区
  newsList: [],
  pulling: false,

  //吸顶区==================START
    //1.顶部类型选择
    typeNavTop:0,//顶部距离
    isTypeNavFixed:false,//是否吸顶
    //2.搜索框的定位
    isSearchFixed:false,
    searchNavTop:0,
    //3.日期选择块
    isDataFixed:false,
    dataNavTop:0,
    //4.筛选
    isDropdowFixed:false,
    dropdowNavTop:0,

  //吸顶区==================END


  },
  //店面详情
  goToStore(){
    wx.navigateTo({
      url: '/pages/store/show/index',
    })
  },
  //教练详情
  goToCoach(e){
    wx.navigateTo({
      url: '/pages/coach/index/index',
    })
  },
  onLoad: function (options) {
    wx.hideHomeButton({
      complete:()=>{
        console.log("99999")
      }
    })

    setTimeout(() => {
      wx.getSystemInfo({
        success: res => {
          this.setData({
            height: res.windowHeight - res.windowWidth / 750 * 92
          });
        }
      });
    }, 50);

    let obj = wx.getMenuButtonBoundingClientRect();
    this.setData({
      width: obj.left,
      height: obj.top + obj.height + 8,
      inputTop: obj.top + (obj.height - 30) / 2,
      arrowTop: obj.top + (obj.height - 32) / 2,
      searchKey: options.searchKey || ""
    }, () => {
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            //略小，避免误差带来的影响
            dropScreenH: this.data.height * 750 / res.windowWidth + 186,
            drawerH: res.windowHeight - res.windowWidth / 750 * 100 - this.data.height
          })
        }
      })
    });

    setTimeout(() => {
      this.setData({
        newsList: this.randomfn()
      })
    }, 50);
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    let cur = e.currentTarget.dataset.current;
    if (this.data.tabLeftIndex == cur) {
      return false;
    } else {
      this.setData({
        tabLeftIndex:cur
      },()=>{
        this.checkCor();
      })
     
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.tabLeftIndex > 3) {
      this.setData({
        scrollViewId:`id_${this.data.tabLeftIndex - 2}`
      })
    } else {
      this.setData({
        scrollViewId:'id_0'
      })
    }
  },
  detail(e) {
    wx.navigateTo({
      url: '../productDetail/productDetail'
    });
  },
  productList(e) {
    let key = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../productList/productList?searchKey=' + key
    });
  },
  search: function () {
    wx.navigateTo({
      url: '../../news/search/search'
    });
  },
  
// 底部菜单点击
tabbarSwitch(e) {
    let _navigate = e.detail.navigate||false;
    let isLogin = false
    if (e.detail.verify && !isLogin) {
      wx.showToast({
        title: '您还未登录，请先登录',
        icon: "none"
      })
    } else {
      if (e.detail.index != this.data.current) {

        if (_navigate) {
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
//顶部大类点击 OK
tabTypeClick(e){
  let index = e.target.dataset.current || e.currentTarget.dataset.current;
  if(index == this.data.tabTypeIndex){
    return;
  }
  let path = e.target.dataset.path||e.currentTarget.dataset.path;
  wx.reLaunch({
    url: path,
  })
},
//选择大类 OK
switchTypeTab(index) {
  if (this.data.tabTypeIndex === index) return;
  
  //处理数据......
  
  let typeScrollInto = index - 1 < 0 ? 0 : index - 1;
  this.setData({
    tabTypeIndex: index,
    typeScrollInto: this.data.typeBars[typeScrollInto].id
  })

},


//日期选择点击
tabClick(e) {

  let index = e.target.dataset.current || e.currentTarget.dataset.current;
  this.switchTab(index);
},

//选择日期
switchTab(index) {
  if (this.data.tabDateIndex === index) return;
  
  //处理数据......
  
  let dateScrollInto = index - 1 < 0 ? 0 : index - 1;
  this.setData({
    tabDateIndex: index,
    dateScrollInto: this.data.dateBars[dateScrollInto].id
  })

},
//初始化数据
randomfn() {
  let ary = [];

    let aryItem = {
      loadingText: '正在加载...',
      refreshing: false,
      refreshText: '',
      data: [],
      isLoading: false,
      pageIndex: 1
    };
    // if (i === this.data.tabIndex) {
      // aryItem.pageIndex = 2;
      aryItem.data = aryItem.data.concat(groupData);
    //}
    ary.push(aryItem);
  return ary;
},
//模拟获取数据
getList(index, refresh) {
  let activeTab = this.data.newsList[index];
  let list = groupData || [];
  if (refresh) {
    activeTab.data = [];
    activeTab.loadingText = '正在加载...';
    activeTab.pageIndex = 2;
    activeTab.data = list || [];
  } else {
    activeTab.data = activeTab.data.concat(list);
    activeTab.pageIndex++;
    activeTab.isLoading = false;
    //根据实际修改判断条件
    if (activeTab.pageIndex > 3) {
      activeTab.loadingText = '没有更多了';
    }
  }
  this.setData({
    [`newsList[${index}]`]: activeTab
  })
},

//筛选点击proDropIndex: -1,
btnDropChange(e) {
  let index=Number(e.currentTarget.dataset.index)
  this.setData({
    proDropData: [...this.data.proDropList[index].list],
    proDropIndex:index,
    dropShow:true,
    dropdownShow:false
  })
},
btnSelected: function (e) {
  let index = e.currentTarget.dataset.index;
  let obj = this.data.proDropData[index];
  let key = `proDropData[${index}].selected`
  this.setData({
    [key]: !obj.selected
  })
},
reset() {
  let arr = this.data.proDropData;
  for (let item of arr) {
    item.selected = false;
  }
  this.setData({
    proDropData: arr
  })
},
btnCloseDrop() {

    this.setData({
        scrollTop: 0,
        dropShow: false,
        //proDropIndex: -1
    },()=>{ //小鱼解决闪屏
        setTimeout(() => {
            this.setData({
                dropHeaderShow:false
            })
            
        }, 200);
    })
  this.reset()
},
screen() {
  
},
dropDownList(e) {
  let index = Number(e.currentTarget.dataset.index)
  if (index !== -1) {
    tui.toast("index：" + index)
  }
  this.setData({
    dropdownShow: !this.data.dropdownShow
  })
},
popup: function () {
  this.setData({
    popupShow: !this.data.popupShow
  })
},

loadMore(e) {
  let index=0
  let activeTab = this.data.newsList[index];
  if (activeTab.pageIndex < 4 && !activeTab.isLoading) {
    let value = `newsList[${index}].isLoading`
    this.setData({
      [value]: true
    })
    setTimeout(() => {
      this.getList(index);
    }, 300);
  }
},

//页面滚动
onPageScroll(e)
{
  let scrollTop =parseInt(e.scrollTop);
  
  let isTypeNavFixed = scrollTop>this.data.typeNavTop;
  let isDataFixed = scrollTop>this.data.isDataFixed+50;

  // let isSearchFixed = scrollTop>=this.data.isSearchFixed;
  // let isDropdowFixed = scrollTop>=this.data.isDropdowFixed;
  if(this.data.isTypeNavFixed!=isTypeNavFixed){
    this.setData({
      isTypeNavFixed
    })
  }
  if(this.data.isDataFixed!=isDataFixed){
    this.setData({
      isDataFixed
    })
  }

},
onReady(e){
  //获取节点到顶部的距离
  wx.createSelectorQuery().select('#typeNavTop').boundingClientRect((rect)=>{
    if(rect&&rect.top){
      this.setData({
        typeNavTop:parseInt(rect.top)
      })
    }
  }).exec();
  // wx.createSelectorQuery().select('#typeNavTop').boundingClientRect((rect)=>{
  //   if(rect&&rect.top){
  //     this.setData({
  //       typeNavTop:parseInt(rect.top)
  //     })
  //   }
  // }).exec();
  // wx.createSelectorQuery().select('#searchNavTop').boundingClientRect((rect)=>{
  //   if(rect&&rect.top){
  //     this.setData({
  //       searchNavTop:parseInt(rect.top)
  //     })
  //   }
  // }).exec();
  wx.createSelectorQuery().select('#dataNavTop').boundingClientRect((rect)=>{
    if(rect&&rect.top){
      this.setData({
        dataNavTop:parseInt(rect.top)
      })
    }
  }).exec();
  // wx.createSelectorQuery().select('#dropdowNavTop').boundingClientRect((rect)=>{
  //   if(rect&&rect.top){
  //     this.setData({
  //       dropdowNavTop:parseInt(rect.top)
  //     })
  //   }
  // }).exec();
},
})