const logs = require("../../../utils/logs");
Component({
  externalClasses: ['tn-color-iconsb'],
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 索引
    index: {
      type: Number,
      value: 0
    },
    //数据obj
    entity: {
        type: Object,
        value:{}
      },


  },
  lifetimes:{
    attached:function(){
      this.initData()
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    coachList: [],
    cacheHeadTab: [],
    headTabIndex: 0,
    currentPicture: 0,
    coachBars: [{
        name: '张美女',
        headImg:'/miniprogram/url-img/store/icon-storephoto.png',
        bgImg:'/miniprogram/url-img/store/b.png',
        des:'王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
        grade:'金牌教练',
        gradeIco:'vip-fill',
        picture:[
          "/miniprogram/url-img/store/swiper01.png",
          "/miniprogram/url-img/store/swiper02.png",
          "/miniprogram/url-img/store/swiper03.png"
        ],
        id: 'hot',
        badge:'热',
        badgeType:'red'//primary,warning,green,danger,white，black，gray,white_red
      },
      {
        name: '老王',
        headImg:'https://gd-hbimg.huaban.com/15964b4aa1d3aa228c6b9a93dbd69decb0e608bfa121-bDxfWm_fw1200',
        bgImg:'/miniprogram/url-img/store/b.png',
        des:'2王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
        grade:'金牌教练2',
        gradeIco:'vip-fill',
        picture:[
          "/miniprogram/url-img/store/swiper01.png",
          "/miniprogram/url-img/store/swiper02.png",
          "/miniprogram/url-img/store/swiper03.png"
        ],
        id: 'yule',
        badge:'火',
        badgeType:'warning'
      },
      {
        name: '小孙',
        headImg:'/miniprogram/url-img/store/icon-storephoto.png',
        bgImg:'/miniprogram/url-img/store/b.png',
        des:'3王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
        grade:'3金牌教练',
        gradeIco:'vip-fill',
        picture:[
          "/miniprogram/url-img/store/swiper01.png",
          "/miniprogram/url-img/store/swiper02.png",
          "/miniprogram/url-img/store/swiper03.png"
        ],
        id: 'sports',
        badge:'新',
        badgeType:'green'
      },
      {
        name: '司空见',
        headImg:'https://gd-hbimg.huaban.com/15964b4aa1d3aa228c6b9a93dbd69decb0e608bfa121-bDxfWm_fw1200',
        bgImg:'/miniprogram/url-img/store/b.png',
        des:'4王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
        grade:'4金牌教练',
        gradeIco:'vip-fill',
        picture:[
          "/miniprogram/url-img/store/swiper01.png",
          "/miniprogram/url-img/store/swiper02.png",
          "/miniprogram/url-img/store/swiper03.png"
        ],
        id: 'domestic',
        badge:'新',
        badgeType:'white_red'
      },
      {
        name: '大帅',
        headImg:'/miniprogram/url-img/store/icon-storephoto.png',
        bgImg:'/miniprogram/url-img/store/b.png',
        des:'5王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
        grade:'5金牌教练',
        gradeIco:'vip-fill',
        picture:[
          "/miniprogram/url-img/store/swiper01.png",
          "/miniprogram/url-img/store/swiper02.png",
          "/miniprogram/url-img/store/swiper03.png"
        ],
        id: 'finance'
      },
      {
        name: '小美',
        headImg:'https://gd-hbimg.huaban.com/15964b4aa1d3aa228c6b9a93dbd69decb0e608bfa121-bDxfWm_fw1200',
        bgImg:'/miniprogram/url-img/store/b.png',
        des:'6王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
        grade:'6金牌教练',
        gradeIco:'vip-fill',
        picture:[
          "/miniprogram/url-img/store/swiper01.png",
          "/miniprogram/url-img/store/swiper02.png",
          "/miniprogram/url-img/store/swiper03.png"
        ],
        id: 'keji'
      },
      {
        name: '大壮',
        headImg:'https://gd-hbimg.huaban.com/15964b4aa1d3aa228c6b9a93dbd69decb0e608bfa121-bDxfWm_fw1200',
        bgImg:'/miniprogram/url-img/store/b.png',
        des:'7王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
        grade:'7金牌教练',
        gradeIco:'vip-fill',
        picture:[
          "/miniprogram/url-img/store/swiper01.png",
          "/miniprogram/url-img/store/swiper02.png",
          "/miniprogram/url-img/store/swiper03.png"
        ],
        id: 'education'
      },
      {
        name: '小可爱',
        headImg:'/miniprogram/url-img/store/icon-storephoto.png',
        bgImg:'/miniprogram/url-img/store/b.png',
        des:'8王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
        grade:'8金牌教练',
        gradeIco:'vip-fill',
        picture:[
          "/miniprogram/url-img/store/swiper01.png",
          "/miniprogram/url-img/store/swiper02.png",
          "/miniprogram/url-img/store/swiper03.png"
        ],
        id: 'car'
      }
    ],
    coachScrollInto: '',
    // 缓存最多页数
    COACH_MAX_CACHE_PAGEINDEX : 3,
   // 缓存页签数量
   COACH_MAX_CACHE_PAGE : 3,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData(){
      setTimeout(() => {
        this.setData({
          coachList: this.randomfn()
        })
      }, 50);
    },
    change: function (e) {
      this.setData({
        currentPicture: e.detail.current
      })
    },
    tabClick(e) {
      let index = e.target.dataset.current || e.currentTarget.dataset.current;
      this.switchTab(index);
    },
    tabChange(e) {
      if (e.detail.source == 'touch') {
        let index = e.target.current || e.detail.current;
        this.switchTab(index);
      }
    },
    switchTab(index) {
      if (this.data.headTabIndex === index) return;
      if (this.data.coachList[index].data.length === 0) {
        this.getList(index);
      }
      // 缓存 tabId
      if (this.data.coachList[this.data.headTabIndex].pageIndex > this.data.COACH_MAX_CACHE_PAGEINDEX) {
        let isExist = this.data.cacheHeadTab.indexOf(this.data.headTabIndex);
        if (isExist < 0) {
          this.data.cacheHeadTab.push(this.data.headTabIndex);
        }
      }
      let scrollIndex = index - 1 < 0 ? 0 : index - 1;
      this.setData({
        headTabIndex: index,
        coachScrollInto: this.data.coachBars[scrollIndex].id
      })
  
      // 释放 tabId
      if (this.data.cacheHeadTab.length > this.data.COACH_MAX_CACHE_PAGE) {
        let cacheIndex = this.data.cacheHeadTab[0];
        this.clearTabData(cacheIndex);
        this.data.cacheHeadTab.splice(0, 1);
      }
    },
    handleClick() {
      //返给调用页的 bind:tap="handleClickSB" ，"detail":{"index":得到this.data.index}
      //{"type":"tap","timeStamp":2650,"target":{"id":"","dataset":{}},"currentTarget":{"id":"","dataset":{}},"mark":{},"detail":{"index":9999},"mut":false}
      this.triggerEvent('click', {
        index: this.data.index
      });
      this.triggerEvent('tap', {
        index: this.data.index
      });      
    },
    randomfn() {
      let ary = [];
      for (let i = 0, length = this.data.coachBars.length; i < length; i++) {
        let aryItem = {
          loadingText: '正在加载...',
          refreshing: false,
          refreshText: '',
          data: [],
          isLoading: false,
          pageIndex: 1
        };
        if (i === this.data.headTabIndex) {
          aryItem.pageIndex = 2;
          // aryItem.data = aryItem.data.concat(coachTesgData);
          // aryItem.data = aryItem.data.concat(this.data.headBars);
          aryItem.data =this.data.coachBars[this.data.headTabIndex];
        }
        ary.push(aryItem);
      }
      return ary;
    },
    getList(index, refresh) {
      let activeTab = this.data.coachList[index];
      //let list = coachTesgData || [];
       let list = this.data.coachBars[index] || [];   
       logs.log("【getList】",list,true)
      if (refresh) {
        activeTab.data = [];
        activeTab.loadingText = '正在加载...';
        activeTab.pageIndex = 2;
        activeTab.data = list || [];
      } else {
        // activeTab.data = activeTab.data.concat(list);
        activeTab.data = list;
        activeTab.pageIndex++;
        activeTab.isLoading = false;
        //根据实际修改判断条件
        if (activeTab.pageIndex > 3) {
          activeTab.loadingText = '没有更多了';
        }
      }
      this.setData({
        [`coachList[${index}]`]: activeTab
      })
    },
  }
})