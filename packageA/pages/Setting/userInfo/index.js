const app = getApp();
const logs = require("../../../../utils/logs");
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')
const filter = require('../../../../utils/loginFilter');
// 性别枚举  
const Gender = {
    UNKNOWN: 0,
    MALE: 1,
    FEMALE: 2
}
// 获取性别文字
function getGenderText(genderValue) {
    if (genderValue === Gender.MALE) {
        return '男';
    }
    if (genderValue === Gender.FEMALE) {
        return '女';
    }
    return '保密';
}

Page(filter.loginCheck(true, app, {
    // Page({
    data: {
        preventOnShow: true, 
        headimgurl: app.globalData.globalURL+'/miniprogram/url-img/my/mine_def_touxiang_3x.png', //显示
        nickname: '', //显示
        username: '', //用户名

        sexShow: false,
        sexText: "保密", //显示
        sexValue: ['保密'], //SexItems 默认选中项
        SexItems: [{
            text: "保密",
            value: "0"
        }, {
            text: "男",
            value: "1"
        }, {
            text: "女",
            value: "2"
        }],

        //生日选择
        type: 2, //年月日
        startYear: 1970,
        endYear: 2023,
        cancelColor: '#888',
        color: '#5677fc',
        //setDateTime: '',
        birthday: '1970-08-28', //初始日期 选择中用
        birthdayText: '1970-08-28', //显示用
        unitTop: false,
        radius: false


    },
    onReady: function (options) {
        this.dateTime = this.selectComponent("#tui-dateTime-ctx")
    },
    onShow(e) {
        if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

    },

    onLoad(e) {
        this.getUserInfo();
    },
    //跳转修改昵称
    jumpNickname(e) {

        let that = this;
        let _nickname = that.data.nickname || that.data.username;
        wx.navigateTo({
            url: '../nickname/index?nickname=' + (util.isNull(_nickname) ? '' : encodeURIComponent(_nickname))
        })
    },
    //修改头像
    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail

        //===========================
        var timestamp = (new Date()).valueOf();
        axios('User/modifyHead', {  
                method: 'POST',
                upload: true,
                data: {
                    // 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
                    name: 'file',
                    // 这是额外的 formData 属性
                    userID: wx.getStorageSync('USERID'),
                    filePath: avatarUrl,// 要上传文件资源的路径 (本地路径)
                    TIMESTAMP: timestamp,
                    FKEY: md5util.md5(wx.getStorageSync('USERID') + timestamp.toString() + app.globalData.APP_INTF_SECRECT)

                },
            },{
                headers:
                 {
                   "Content-Type": 'applciation/json',
                 }
            }
            
            )
            .then((res) => {
                let _res = JSON.parse(res.data);//图片上传得来的有反斜的需要格式化
                if(_res.code == 1 && !util.isNull(_res.headimgurl)){
                    this.setData({
                        headimgurl: _res.headimgurl
                    })
                }else{
                    util.toast(_res.message);
                    return;
                }
            })
            .catch((error) => {
            });

    },
    //性别
    selectSex() {
        this.setData({
            sexShow: true
        })
    },
    hideSex(e) {
        this.setData({
            sexShow: false
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

                let _sex = _res.data.sex;
                let _sexText = getGenderText(_sex);
                let _birthdayText = _res.data.birth ? _res.data.birth : "未设置";
                let _birthday = _res.data.birth ? _res.data.birth : "1999-01-01";
                that.setData({
                    headimgurl: _headimgurl,
                    username: _username,
                    nickname: _nickname,
                    sexText: _sexText,
                    sexValue: [_sexText],
                    birthdayText: _birthdayText,
                    birthday: _birthday,
                })



            }

        }).catch((err) => {
        });
    },
    //修改区=========================

    //1.修改性别
    changeSex(e) {
        let that = this;
        //{"text":"保密","value":"0","index":[0],"result":"保密","params":0} 
        if (e.detail.text == that.data.sexText) {
            //util.toast("本次无修改");
            return;
        }
        let _sex = e.detail.value;
        let _userID = wx.getStorageSync('USERID');
        let _timestamp = (new Date()).valueOf();
        axios.post('User/modifyBaseInfo', {
                // userName: '',
                // nickName: '',
                // birth:"",
                sex: _sex,
                userID: _userID,
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(_userID + _sex + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                // 校验状态码
                validateStatus(status) {
                    return status === 200;
                },
            }, )
            .then((response) => {
                let _res = response.data;
                if (_res.code == 1) {
                    let _sex = _res.data.sex;
                    let _sexText = getGenderText(_sex);
                    that.setData({
                        sexText: _sexText,
                        sexValue: [_sexText] //默认选中
                    })
                } else {
                    util.toast(_res.message);
                    return;
                }
            })
            .catch((error) => {
                util.toast(error.response.data.message || "修改失败");
                return;
            });

    },
    //生日选择展现
    showDate: function (e) {
        this.dateTime.show();
    },
    //2.修改生日
    changeDate(e) {
        // this.setData({
        //   Birthday: e.detail.result
        // })
        let that = this;
        //{"text":"保密","value":"0","index":[0],"result":"保密","params":0} 
        //{"year":1999,"month":"01","day":"01","result":"1999-01-01"} 
        // birthday: '1970-08-28', //初始日期 选择中用
        // birthdayText: '1970-08-28', //显示用
        if (e.detail.result == that.data.birthdayText) {
            //util.toast("本次无修改");
            return;
        }
        let _birthday = e.detail.result;
        if (util.isNull(_birthday)) {
            util.toast("日期必须选择");
            return;
        }

        /*
          /api/User/modifyBaseInfo
          更新用户资料
          需要更新哪一项就传哪一项目，可以多传
          userName:用户名，必需是字母（和数字）组合，首字符必需字母
          nickName：昵称
          sex：0=未设置，1=男，2=女
          birth：出生日期 1980-02-02
        */
        let _userID = wx.getStorageSync('USERID');
        let _timestamp = (new Date()).valueOf();
        axios.post('User/modifyBaseInfo', {
                // userName: '',
                // nickName: '',
                birth: _birthday,
                //sex: _sex,
                userID: _userID,
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(_userID + _birthday + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                // 校验状态码
                validateStatus(status) {
                    return status === 200;
                },
            }, )
            .then((response) => {
                let _res = response.data;
                if (_res.code == 1) {
                    let _birth = _res.data.birth;
                    // birthday: '1970-08-28', //初始日期 选择中用
                    // birthdayText: '1970-08-28', //显示用
                    that.setData({
                        birthdayText: _birth ? _birth : "未设置",
                        birthday: _birth ? _birth : "1999-01-01" //默认选中
                    })
                } else {
                    util.toast(_res.message);
                    return;
                }
            })
            .catch((error) => {
                util.toast(error.response.data.message || "修改失败");
                return;
            });



    },
    callbackNickName(nickName) {
        let that = this;
        if (!util.isNull(nickName)) {
            that.setData({
                nickname: nickName
            })

        }


    },
    //修改区=========================END
    changeSex_bak(e) { //复用备
        let that = this;
        //{"text":"保密","value":"0","index":[0],"result":"保密","params":0} 
        if (e.detail.text == that.data.sexText) {
            util.toast("本次无修改");
            return;
        }
        let _sex = e.detail.value;
        //{"text":"男","value":"1","index":[0],"result":"男","params":0}
        /*
          /api/User/modifyBaseInfo
          更新用户资料
          需要更新哪一项就传哪一项目，可以多传
          userName:用户名，必需是字母（和数字）组合，首字符必需字母
          nickName：昵称
          sex：0=未设置，1=男，2=女
          birth：出生日期 1980-02-02 
        */
        let _userID = wx.getStorageSync('USERID');
        let _timestamp = (new Date()).valueOf();
        axios.post('User/modifyBaseInfo', {
                // userName: '',
                // nickName: '',
                // birth:"",
                sex: _sex,
                userID: _userID,
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(_userID + _sex + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            }, )
            .then((response) => {
				
			})
            .catch((error) => {
               
            });


        this.setData({
            sexText: e.detail.result
        })
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

}))