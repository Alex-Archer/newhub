/**
 * logs
 * 日志记录
 * 作者：张小鱼
 * 2017-02-27 19:21:32
 * 2023 09 28 为了更醒目【title】 ， 增加打印前缀标题判断，没有则增加：
 * var logs = require('logs.js');//日志打印
 * logs.log("打印前缀标题" ,"打印内容", true[是否JSON格式化],true[是否打印日期]);
 * console: 打印前缀标题:打印内容 页面:pages/index/index  2020/5/12 上午9:48:04
 */
const debug = require('../config').debug;
var md5util = require('md5.js')

/**
 * 日志打印 
 * @param {*} title 标题
 * @param {*} msg 内容
 * @param {*} isJsonFormat 是否JSON格式化
 * @param {*} isData 是否显示日期时间
 * logs.log("打印标题", "这是日志内容",true,true)
 * 【打印标题】:"asdfasdf" 页面:pages/index/index  2023/12/4下午2:05:39
 */
function logs(title, msg, isJsonFormat, isData) {
 var that =this;
  if (debug) {
    var _msg = "";
    //标题前缀
    if (title) {
      //_msg = title;
      _msg = !title.includes('【')?"【"+title+"】":title;
    }
    if (msg) {
      //数据需要JSONS格式化
      if (isJsonFormat) {
        _msg = _msg + ":" + JSON.stringify(msg);
      } else {
        _msg = _msg + ":" + msg;
      }
    }
    //页面地址
    var pages = getCurrentPages();
    if (pages!=null&&pages!=""&&pages.length>0) {
      var lastIndex = pages.length; //取数组最后一个页面
      _msg = _msg + " 页面:" + pages[lastIndex - 1].route;
    }
    //是否显示时间
    if (isData) {
      _msg = _msg + '  ' + new Date().toLocaleString();
    }
    console.log(_msg);
  }
}


/**
 * 发送 网站日志
 * @param {*} title 标题
 * @param {*} msg 内容
 * @param {*} _appURL 页面地址
 */
function wLogs(title, msg ,_appURL=null) {
  if(_appURL == null){
    _appURL = getApp().globalData.requestUrl;
  }
  //不影响其它的渲染
  var promise = new Promise(function(resolve, reject) {
    var _USERID = wx.getStorageSync('USERID');
    var timestamp = (new Date()).valueOf();
    var tokenCache = wx.getStorageSync('OAUTH');
    var pages = getCurrentPages();//取数组最后一个页面 pages[pages.length - 1].route

    wx.request({
      url: _appURL + '/api/Index/sendLog.html',
      data: {
        USERID: _USERID,
        MSG: JSON.stringify(msg),
        TITLE:title,
        PAGE: (pages!='')?pages[pages.length - 1].route:'',
        TIMESTAMP: timestamp,
        FKEY: md5util.md5(_USERID.toString() + '' + timestamp.toString() + '' + tokenCache.access_token)
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值 
      },
      success: function(res) {
        resolve("网站日志发送完成:" + JSON.stringify(res.data));
      },
      fail: function(err) {
        reject(err);
      }
    });
  });

  promise.then(function(codes) {
    logs(codes);
  });
  //这里加入异步发送日志END=============
}
module.exports = {
  log: logs,
  wLog: wLogs //网站日志
}