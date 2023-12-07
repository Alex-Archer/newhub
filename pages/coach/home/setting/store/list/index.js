const app = getApp();
const logs = require("../../../../../../utils/logs");
import axios from '../../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../../../libs/we-lodash'
var md5util = require('../../../../../../utils/md5.js')
var util = require('../../../../../../utils/util.js')
const filter = require('../../../../../../utils/loginFilter'); //1.登录验证

Page(filter.loginCheck(true, app, { 
  data: {
    preventOnShow:true,//3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面

    storeList: [],
    loading: true,

    showActionSheet: false,
    tips: "取消服务场馆后需重新申请,您确认取消吗？",
    actionItemList: [{ text: "确认取消服务此馆",color: "#E3302D"}],
    maskClosable: true, //可以点击外部任意地方关闭
    color: "#9a9a9a",
    size: 26,
    isCancel: true,

    selectID:0,
    selectIndex:-1,//数组的索引
    refreshParent:false,

    noDataShow:false,
    
  },
  /*
    获取数据
    payType 0全部 1待支付 2已支付 3售后
    */
   getDataJson(_pageIndex = 1) {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    let config = {
        pageSize: 10,
        pageIndex: _pageIndex,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    };
    return new Promise((resolve, reject) => {
        axios.get("Coach/myStore", config, {
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
                resolve(_data);
            } else {
                reject([]);
            }
        }).catch((err) => {
            reject([]);
        });
    })
},
onShow(e){
    if(this.data.preventOnShow) return;//5.登录验证  需要登录时，阻止ONSHOW 

},
  onLoad: function (options) {
    let that = this;
    this.getDataJson(1).then(list => {
        if(list.total>0){
            that.setData({
                storeList:list.data,
                loading:false
            })
        }else{
             that.setData({
                noDataShow:true,
                loading:false
            })           
        }

    })
  },
  
  //========================
  //增选场馆
  selectStore(){
      wx.navigateTo({
        url: '../point/index',
      })

  },
  closeActionSheet(){
    this.setData({
        showActionSheet: false,
        selectID:0,
        refreshParent:false,//返回需要刷新父窗
    })
},
  //取消服务按钮
  actionButtons(e){
    const that = this;
    let _selectID = e.currentTarget.dataset.id || e.target.dataset.id;
    let _selectIndex = e.currentTarget.dataset.index || e.target.dataset.index;
    if(!util.isNull(_selectID)){
        that.setData({
            showActionSheet: true,
            selectID:_selectID,
            selectIndex:_selectIndex,            
        })
    }else{
        util.toast("数据有误", null, null, (e) => {
            this.setData({
                showActionSheet: false,
                selectID:0,
                selectIndex:-1,
            })
        });
    }
  },
  confirmDel(){
    const that = this;
    const _delID = this.data.selectID;
    const _selectIndex = this.data.selectIndex;

    this.delController(_delID).then(val => {
        //移除LIST
        var _List = this.data.storeList;
        _.pullAt(_List, _selectIndex); // 移除

        util.toast("删除服务场馆成功", null, null, (e) => {
            
            this.setData({
                showActionSheet: false,
                refreshParent:true,//返回需要刷新父窗
                storeList:_List,
                noDataShow:!util.isNull(this.data.storeList)?false:true,
                selectID:0,
                selectIndex:-1,//数组的索引
            })
        });

    },function(err){
        util.toast(err, null, null, (e) => {
            that.setData({
                showActionSheet: false,
                refreshParent:true,//返回需要刷新父窗
                noDataShow:!util.isNull(this.data.storeList)?false:true,
                selectID:0,
                selectIndex:-1,//数组的索引
            })
        });
    })
  },
  delController(_id){
    return new Promise((resolve, reject) => {
        let _timestamp = (new Date()).valueOf();
        axios.get("Coach/delStore", {
            storeId: _id,
            userID: wx.getStorageSync('USERID'),
            TIMESTAMP: _timestamp,
            FKEY: md5util.md5(wx.getStorageSync('USERID') +_id.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
 
                resolve("ok");
            } else {
                reject(res.data.message);
            }

        }).catch((err) => {
            reject("数据处理有误");
        });
    });

  },
  openLocation(e){
    let item = e.currentTarget.dataset;
    const latitude = Number(item.lat);
    const longitude = Number(item.lng);
    wx.openLocation({
        name: item.title,
        address: item.address,
        latitude,
        longitude,
        scale: 18
    });
  },

  //其它更新返回
callBackReturn(_object) {

    let that = this;
    this.getDataJson(1).then(list => {
        if(list.total>0){
            that.setData({
                storeList:list.data,
                loading:false,
                noDataShow:false,
            })
        }else{
             that.setData({
                noDataShow:true,
                loading:false
            })           
        }

    })

},
/**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

        //if(this.data.refreshParent){//是否需要刷新
            // 页面卸载时触发
            //触发用户中心更新头像昵称
            let pages = getCurrentPages(); //获取页面栈
            if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
            {
                let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
                prePage.callBackReturn({
                    //headimgurl: this.data.headimgurl,
                    //nickname:this.data.nickname
                    storefrontCount:this.data.storeList?this.data.storeList.length.toString():"0"||"0",
                }); //调用上一个页面实例对象的方法
            }   
        //}
    },
}))
