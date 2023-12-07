const app = getApp();
const logs = require("../../../../../utils/logs");
import axios from '../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../../libs/we-lodash'
var md5util = require('../../../../../utils/md5.js')
var util = require('../../../../../utils/util.js')

const filter = require('../../../../../utils/loginFilter');

Page(filter.loginCheck(true, app, {
    data: {
        preventOnShow: true, 
        faceimgurl: '/static/img/safe/fac.jpg', //显示
        displayDelButtom:false,//是否有图片删除按钮
        switchChecked: false,
        devicePass:true,//是否设了门禁密码

        imgMaxSize: 4, //图片最大上传
        imageFormat: ['jpg', 'png', 'gif'], //可上传图片类型，默认为空，不限制  Array<String> [jpg,png,gif]

        //密码面板
        passShow: false,
        numberArr: [],
        pwdArr: ["", "", "", "", "", ""],
        temp: ["", "", "", "", "", ""],
        passRadius: false,

        showActionSheet: false,
        tips: "识别图片删除后将无法使用刷脸开门,您确认删除吗？",
        actionItemList: [{
            text: "确认删除",
            color: "#E3302D"
        }],
        maskClosable: true, //可以点击外部任意地方关闭
        color: "#9a9a9a",
        size: 26,
        isCancel: true,
    },
    onReady: function (options) {
        //this.dateTime = this.selectComponent("#tui-dateTime-ctx")
    },
    onShow(e) {
        if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

    },

    onLoad(e) {

        this.getUserInfo();


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
                let _faceimgurl = _res.data.faceimgurl ? _res.data.faceimgurl : that.data.faceimgurl;
                let _faceopen = _res.data.faceopen ? _res.data.faceopen : "0";
                that.setData({
                    faceimgurl: _faceimgurl,
                    switchChecked:  _faceopen=="0"?false:true,
                    displayDelButtom:_faceimgurl=='/static/img/safe/fac.jpg'?false:true,
                    devicePass:_res.data.devicepassword,
                })
            }

        }).catch((err) => {
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
                //headimgurl: this.data.headimgurl,
                //nickname: this.data.nickname
            }); //调用上一个页面实例对象的方法
        }
    },
    //修改密码
    changeController(url,_value,type='face') {
    
        return new Promise((resolve, reject) => {

            let _timestamp = (new Date()).valueOf();
            let config = {
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                //FKEY: md5util.md5(wx.getStorageSync('USERID') +  _userFace.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
            }
            if (type == "face") {
                _.set(config, `useFace`, _value);
            } else {
                _.set(config, `password`, _value);
            }
            _.set(config, `FKEY`, md5util.md5(wx.getStorageSync('USERID') + _value.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT));

            axios.post(url, config, {
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



    //#region  密码面板
    switchKeyboard(e) {
        let length = e.currentTarget.dataset.length;
        let arr = ["", "", "", "", "", ""]
        let _passRadius = false
        if (length == 4) {
            arr = ["", "", "", ""]
            _passRadius = true
        }
        this.setData({
            pwdArr: arr,
            temp: arr,
            numberArr: [],
            passRadius: _passRadius,
            passShow: true
        })

    },
    closeKeyboard: function () {
        this.setData({
            passShow: false,
            numberArr: [],
            pwdArr: this.data.temp
        })
    },
    //密码强度验证
    verifyPassWord(s) {
        if (!/^\d{6}$/.test(s)) return "必须是6位数字"; // 不是6位数字
        if (/^(\d)\1+$/.test(s)) return "不可以全一样数字"; // 全一样
        
        var str = s.replace(/\d/g, function($0, pos) {
            return parseInt($0)-pos;
        });
        if (/^(\d)\1+$/.test(str)) return "禁止连续递增密码"; // 顺增
        
        str = s.replace(/\d/g, function($0, pos) {
            return parseInt($0)+pos;
        });
        if (/^(\d)\1+$/.test(str)) return "禁止连续递减密码"; // 顺减
        return "";
    },
    getPwd: function () {

        //判断并取出密码
        if (this.data.numberArr.length === this.data.pwdArr.length) {
            wx.showLoading({
                title: '密码修改中...',
                mask: true
            })
            let pwd = this.data.numberArr.join('')
            this.closeKeyboard();
            let _verifyPassWord = this.verifyPassWord(pwd);
            if(!util.isNull(_verifyPassWord))
            {
                util.toast(_verifyPassWord);
                return;
            }

            this.changeController("User/devicePassword",pwd,"pass").then(val => {
                wx.hideLoading().then(() => {
                    setTimeout(() => {
                        util.toast("新密码 " + pwd + " 修改成功");
                    }, 200);
                });


            }, function (err) {
                wx.hideLoading().then(() => {
                    setTimeout(() => {
                        util.toast("修改失败原因:" + err, 3000);
                    }, 200);
                });
            })
        }
    },
    keyboardClick: function (e) {
        
        let numberArr = this.data.numberArr;
        let pwdArr = this.data.pwdArr;
        let index = e.detail.index;
        if (numberArr.length === pwdArr.length || index == undefined) {
            return;
        }
        if (index == 9) { //取消键
            this.closeKeyboard();
            return;
        } else if (index == 11) {
            //退格键
            let len = numberArr.length;
            if (len) {
                pwdArr.splice(len - 1, 1, "");
            } else {
                pwdArr = this.data.temp;
            }
            numberArr.pop()
        } else if (index == 10) {
            numberArr.push(0);
            pwdArr.splice(numberArr.length - 1, 1, "●");
        } else {
            numberArr.push(index + 1);
            pwdArr.splice(numberArr.length - 1, 1, "●");
        }
        this.setData({
            numberArr: numberArr,
            pwdArr: pwdArr
        }, () => {
            this.getPwd();
        })
    },
    //#endregion  密码面板
    //是否启用人脸识别
    switchFace() {

        let _switchChecked = this.data.switchChecked;
        let that = this;
        const actionDes = !_switchChecked?"打开":"关闭";

        //检查是否有人脸
        if(actionDes=="打开"&&this.data.faceimgurl=="/static/img/safe/fac.jpg"){
            that.setData({
                switchChecked: _switchChecked
            }, () => {
                util.toast("打开前必须上传人脸照片");
            })
            return;
        }


        this.changeController('User/openFace',!_switchChecked?"1":"0",'face').then(val => {
            that.setData({
                switchChecked: !_switchChecked
            }, () => {
                util.toast(actionDes+"人脸识别成功");
            })


        }, function (err) {
            that.setData({
                switchChecked: _switchChecked
            }, () => {
                util.toast(actionDes+"人脸识别失败"+err);
            })
        })

    },
    //图片选择
    chooseImage: function () {

        let _this = this;
        wx.chooseMedia({
            mediaType: ['image'], //['image','video'], //['image','video'],
            count: 1,
            sizeType: ['original', 'compressed'], // //original 原图，compressed 压缩图，默认二者都有
            sourceType: ['album', 'camera'],
            success: function (e) {
                let _tempFiles = e.tempFiles[0];

                console.log("类型：" + e.tempFiles[0].fileType) //video image
                console.log("路径：" + e.tempFiles[0].tempFilePath)
                console.log("大小：" + e.tempFiles[0].size)

                console.log("res.tempFiles：" + JSON.stringify(e.tempFiles));

                let path = _tempFiles.tempFilePath;

                ////可上传图片类型，默认为空，不限制  Array<String> [jpg,png,gif]
                if (_tempFiles.fileType != 'image') {
                    if (_this.data.imageFormat.length > 0) {
                        let format = path.split(".")[(path.split(".")).length - 1];
                        if (_this.data.imageFormat.indexOf(format) == -1) {
                            let text = `只能上传 ${_this.data.imageFormat.join(',')} 格式图片！`
                            util.toast(text)
                            return;
                        }
                    } else {
                        let text = `只能上传图片！`
                        util.toast(text)
                        return;
                    }
                }


                //过滤超出大小限制图片
                let size = _tempFiles.size;

                if (_this.data.imgMaxSize * 1024 * 1024 < size) {
                    let err = `图片大小不能超过：${_this.data.imgMaxSize}MB`
                    util.toast(err)
                    return;
                }

                _this.uploadPic(path).then(val => {
                    //{"code":1,"message":"sucess","headimgurl":"https://temp-aoben-picture.oss-cn-shanghai.aliyuncs.com/app-images/2023/10/11/20231011%5C229b41d3d1e723d8baea21d3db29e833.png"}
                    _this.setData({
                        faceimgurl: val.faceimgurl,
                        switchChecked: true,
                        displayDelButtom:true,
                    }, () => {
                        util.toast("识别图片上传成功")

                    })

                }, function (err) {
                    util.toast("识别图片上传失败:" + err)
                })




            }
        })
    },
    //上传头像
    uploadPic(avatarUrl) {
        return new Promise((resolve, reject) => {
            var timestamp = (new Date()).valueOf();
            axios('User/modifyFace', {
                        method: 'POST',
                        upload: true,
                        data: {
                            // 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
                            name: 'file',
                            filePath: avatarUrl,
                            userID: wx.getStorageSync('USERID'),
                            TIMESTAMP: timestamp,
                            FKEY: md5util.md5(wx.getStorageSync('USERID') + timestamp.toString() + app.globalData.APP_INTF_SECRECT)

                        },
                    }, {
                        headers: {
                            "Content-Type": 'applciation/json',
                        }
                    }

                )
                .then((res) => {

                    let _res = JSON.parse(res.data); //图片上传得来的有反斜的需要格式化
                     if (_res.code == 1 && !util.isNull(_res.faceimgurl)) {
                        resolve(_res)
                    } else {
                        reject(_res.message);
                    }


                })
                .catch((error) => {
                    reject("上传失败")
                });
        })

    },

    closeActionSheet() {
        this.setData({
            showActionSheet: false,
        })
    },
    //删除图片
    actionButtons(e) {
        const that = this;
        that.setData({
            showActionSheet: true
        })
    },
    confirmDel() {
        const that = this;

        this.delController().then(val => {

            util.toast("删除人脸图片成功", null, null, (e) => {

                that.setData({
                    showActionSheet: false,
                    faceimgurl: '/static/img/safe/fac.jpg', //显示
                    switchChecked: false,
                    displayDelButtom:false,
                })
            });

        }, function (err) {
            util.toast(err, null, null, (e) => {
                that.setData({
                    showActionSheet: false,
                })

            });
        })
    },
    delController() {
        return new Promise((resolve, reject) => {
            let _timestamp = (new Date()).valueOf();
            axios.get("User/delFace", {
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') +  _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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

}))