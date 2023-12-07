var util = require('util.js');
function validateDateExpires(accessExpires) {
  const currentTime = Date.now(); //13位时间戳 1693376939413
  let _accessExpires = new Date(Date.parse(accessExpires.replace(/-/g, "/"))).getTime(); //加上000为13位的时间戳 1693372853000
  if (currentTime > _accessExpires) {
    return true;
  } else {
    return false;
  }
}
// 获取当前页面    
function getPageInstance() {
  var pages = getCurrentPages();
  return pages[pages.length - 1];
}

/**
 * 登录检测 Fish 2023 08 22
 * @param {*} isRedirect 表示登录完要不要返回
 * @param {*} app getApp()
 * @param {*} pageObj  页面必须包含 onLoad(e){......}
 */
function loginCheckOnLoad(isRedirect = false, app, pageObj) {

  if (pageObj.onLoad) {
    let _onLoad = pageObj.onLoad;
    pageObj.onLoad = function (options) {
      this.preventOnShow = true;
      const currentInstance = getPageInstance();

      let pageTitle = "";
      try {
        pageTitle = __wxConfig.page["" + currentInstance.route + ".html"].window.navigationBarTitleText;
        if (!util.isNull(pageTitle)) {
          wx.setNavigationBarTitle({
            title: ''
          })
        }
      } catch (e) {}

      const toPage = currentInstance.route || currentInstance.__route__ || currentInstance.__displayReporter.route;
      let loginURL = app.globalData.loginPage || "/pages/user/login/index";

      if (!util.isNull(toPage)) {
        if (toPage.startsWith("/")) {
          loginURL = loginURL + "?url=" + toPage;
        } else {
          loginURL = loginURL + "?url=/" + toPage;
        }
      }
      if (isRedirect) {
        loginURL = loginURL + "&Redirect=true";
      }

      //1.常规检测
      let tokenCache = wx.getStorageSync('Token');
      let userID = wx.getStorageSync("USERID");
      let userMobil = wx.getStorageSync("MOBILE"); //用户手机号作为唯一登录
      let isLogin = wx.getStorageSync("LOGING"); //用加密的用户OPENID 暂时不加密
      if (
        util.isNull(tokenCache) ||
        util.isNull(userID) ||
        util.isNull(userMobil) ||
        util.isNull(isLogin)
      ) {
        //跳转到登录页
        if (isRedirect) {
          wx.redirectTo({
            url: loginURL
          })

        } else {
          wx.reLaunch({
            url: loginURL
          });
        }
        return false;
      }
      //2.检测是否从登录页登录过 必须有，后期考虑在登录页 加密 再验证
      if (isLogin != "true") {
        //跳转到登录页
        if (isRedirect) {
          wx.redirectTo({
            url: loginURL
          })

        } else {
          wx.reLaunch({
            url: loginURL
          });
        }
        return false;
      }

      //3.TOKEN是否过期
      if (validateDateExpires(tokenCache.refreshexpires)) {
        //跳转到登录页
        if (isRedirect) {
          wx.redirectTo({
            url: loginURL
          })

        } else {
          wx.reLaunch({
            url: loginURL
          });
        }
        return false;
      } else {
        //正常加载信息
        this.setData({
          preventOnShow: false
        })
        //登完还原标题
        if (!util.isNull(pageTitle)) {
          wx.setNavigationBarTitle({
            title: pageTitle
          })
        }
        _onLoad.call(currentInstance, options);
        return;
      }

    }
  }
  return pageObj;
}

module.exports = {
  loginCheck: loginCheckOnLoad
}