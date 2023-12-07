const app = getApp();
const logs = require("../../../../utils/logs");
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')

const filter = require('../../../../utils/loginFilter'); //1.登录验证
Page(filter.loginCheck(true, app, { 

    /**
     * 页面的初始数据
     */
    data: { 
        preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面
        headimgurl: app.globalData.globalURL+'/miniprogram/url-img/my/mine_def_touxiang_3x.png', //显示
        nickname: '', //显示
        username: '', //用户名

        showActionSheet: false,
        maskClosable: true,
        tips: "退出登录会清除您的登录信息，确认退出吗？",
        itemList: [{
            text: "退出登录",
            color: "#E3302D"
        }],
        color: "#9a9a9a",
        size: 26,
        isCancel: true,

    },
    href(e) {
        let that = this;
        let _url = e.target.dataset.url || e.currentTarget.dataset.url;
        if (_url) {
            wx.navigateTo({
                url: _url,
            })
        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.hideHomeButton();
        this.getUserInfo();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 
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


    //退出登录点击
    itemClick(e) {

        //console.log(e.detail)
        //{index: 0, text: "退出登录", color: "#E3302D"}
        let that = this;
        let index = e.detail.index;
        if (index == 0) {
            //清理
            wx.removeStorage( {key: "lastCheckMyMiniProgram"});
            wx.removeStorage({key: "USERID"});
            wx.removeStorage({key: "MOBILE"});
            wx.removeStorage({key: "Token"});
            wx.removeStorage({key: "ISCOACH"});
            wx.removeStorage({
                key: 'LOGING',
                success(res) {
                    console.log(res)
                    that.closeActionSheet();
                    wx.reLaunch({
                        url: '/pages/user/home/index',
                    })
                }
            })

        }


    },
    openActionSheet(e) {
        this.setData({
            showActionSheet: true
        })
    },
    closeActionSheet(e) {
        this.setData({
            showActionSheet: false
        })
    },
    //获取个人信息
    getUserInfo() {
        let that = this;
        let _timestamp = (new Date()).valueOf();
        axios.get("User/baseInfo", {
            userID: wx.getStorageSync('USERID'),
            TIMESTAMP: _timestamp,
            FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }, {
            headers: {
                "Content-Type": 'applciation/json',
            },
            
            validateStatus(status) {
                return status === 200;
            },
        }).then(res => {
            let _res = res.data;
            if (_res.code == 1) {
                let _headimgurl = _res.data.headimgurl ? _res.data.headimgurl : that.data.headimgurl;
                let _username = _res.data.username;
                let _nickname = _res.data.nickname ? _res.data.nickname : _res.data.username;

                that.setData({
                    headimgurl: _headimgurl,
                    username: _username,
                    nickname: _nickname
                })



            }

        }).catch((err) => {
            util.toast(err.response.data.message || "获取数据有误");
            wx.navigateBack();
            return;
        });
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        // 页面卸载时触发
        //触发用户中心更新头像昵称
        let pages = getCurrentPages(); //获取页面栈
        if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
        {
            let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
            prePage.callBackReturn({
                headimgurl: this.data.headimgurl,
                nickname:this.data.nickname
            }); //调用上一个页面实例对象的方法
        }
    },
    //其它更新返回
    callBackReturn(_object) {
        //{"headimgurl":"https://temp-.....a589a0a8d9ee.jpg","nickname":"弓长23"} 
        let that = this;
        if(!util.isNull(_object)){
            if(_object.headimgurl!=that.data.headimgurl){
                that.setData({
                    headimgurl:_object.headimgurl
                })
            }
            if(_object.nickname!=that.data.nickname){
                that.setData({
                    nickname:_object.nickname
                })
            }
        }
    }
}))