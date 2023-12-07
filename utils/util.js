/**
 * 数据处理
 * @author echo.
 * @version 1.5.1
 * @FinalChanges Fisher 2023 04 02
 **/
const utils = {
  //去空格
  trim: function (value) {
    return value.replace(/(^\s*)|(\s*$)/g, "");
  },
  //内容替换
  replaceAll: function (text, repstr, newstr) {
    return text.replace(new RegExp(repstr, "gm"), newstr);
  },
  //格式化手机号码
  formatNumber: function (num) {
    return num.length === 11 ? num.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : num;
  },
  //金额格式化
  rmoney: function (money) {
    return parseFloat(money).toFixed(2).toString().split('').reverse().join('').replace(/(\d{3})/g, '$1,').replace(
      /\,$/, '').split('').reverse().join('');
  },
  // //日期格式化
  // formatDate: function (formatStr, fdate) {
  //   if (fdate) {
  //     if (~fdate.indexOf('.')) {
  //       fdate = fdate.substring(0, fdate.indexOf('.'));
  //     }
  //     fdate = fdate.toString().replace('T', ' ').replace(/\-/g, '/');
  //     var fTime, fStr = 'ymdhis';
  //     if (!formatStr)
  //       formatStr = "y-m-d h:i:s";
  //     if (fdate)
  //       fTime = new Date(fdate);
  //     else
  //       fTime = new Date();
  //     var month = fTime.getMonth() + 1;
  //     var day = fTime.getDate();
  //     var hours = fTime.getHours();
  //     var minu = fTime.getMinutes();
  //     var second = fTime.getSeconds();
  //     month = month < 10 ? '0' + month : month;
  //     day = day < 10 ? '0' + day : day;
  //     hours = hours < 10 ? ('0' + hours) : hours;
  //     minu = minu < 10 ? '0' + minu : minu;
  //     second = second < 10 ? '0' + second : second;
  //     var formatArr = [
  //       fTime.getFullYear().toString(),
  //       month.toString(),
  //       day.toString(),
  //       hours.toString(),
  //       minu.toString(),
  //       second.toString()
  //     ]
  //     for (var i = 0; i < formatArr.length; i++) {
  //       formatStr = formatStr.replace(fStr.charAt(i), formatArr[i]);
  //     }
  //     return formatStr;
  //   } else {
  //     return "";
  //   }
  // },
  
  //#region 日期格式化
  /**
	 * @desc 日期格式化
	 * @param formatStr 格式化字符串(y-m-d h:i:s)
	 * @param fdate 需要格式化日期
	 * @param type  fdate的格式：1-日期字符串(2017/12/04 12:12:12) 2-时间戳(1603676514690) 3-日期字符串，无连接符(20171204121212) 
	 * 4-new Date()时间格式(Thu Oct 01 2020 00:00:00 GMT+0800 (中国标准时间))
	 * @param isMs  时间戳精度是否为毫秒（精度是秒时传false），type=2时有效
	 **/
	formatDate: function (formatStr, fdate, type = 1, isMs = true) {
		let date = ""
		if (type === 3) {
			date = utils._formatTimeStr(fdate, formatStr)
		} else {
			date = utils._formatDate(formatStr, fdate, type, isMs)
		}
		return date;
	},
	_formatDate(formatStr, fdate, type = 1, isMs = true) {
		if (!fdate) return;
		let fTime, fStr = 'ymdhis';
		if (type === 4) {
			fTime = fdate;
		} else {
			fdate = fdate.toString()
			if (~fdate.indexOf('.')) {
				fdate = fdate.substring(0, fdate.indexOf('.'));
			}
			fdate = fdate.replace('T', ' ').replace(/\-/g, '/'); 
			if (!formatStr)
				formatStr = "y-m-d h:i:s";
			if (fdate) {
				if (type === 2) {
           fdate = isMs ? Number(fdate) : Number(fdate) * 1000
          
				}
				fTime = new Date(fdate);
			} else {
				fTime = new Date();
			}
		}
		console.log(fTime)
		var month = fTime.getMonth() + 1;
		var day = fTime.getDate();
		var hours = fTime.getHours();
		var minu = fTime.getMinutes();
		var second = fTime.getSeconds();
		month = month < 10 ? '0' + month : month;
		day = day < 10 ? '0' + day : day;
		hours = hours < 10 ? ('0' + hours) : hours;
		minu = minu < 10 ? '0' + minu : minu;
		second = second < 10 ? '0' + second : second;
		var formatArr = [
			fTime.getFullYear().toString(),
			month.toString(),
			day.toString(),
			hours.toString(),
			minu.toString(),
			second.toString()
		]
		for (var i = 0; i < formatArr.length; i++) {
			formatStr = formatStr.replace(fStr.charAt(i), formatArr[i]);
		}
		return formatStr;
	},
	/**
	 * @desc 格式化时间
	 * @param timeStr 时间字符串 20191212162001
	 * @param formatStr 需要的格式 如 y-m-d h:i:s | y/m/d h:i:s | y/m/d | y年m月d日 等
	 **/
	_formatTimeStr: function (timeStr, formatStr) {
		if (!timeStr) return;
		timeStr = timeStr.toString()
		if (timeStr.length === 14) {
			let timeArr = timeStr.split('')
			let fStr = 'ymdhis'
			if (!formatStr) {
				formatStr = 'y-m-d h:i:s'
			}
			let formatArr = [
				[...timeArr].splice(0, 4).join(''),
				[...timeArr].splice(4, 2).join(''),
				[...timeArr].splice(6, 2).join(''),
				[...timeArr].splice(8, 2).join(''),
				[...timeArr].splice(10, 2).join(''),
				[...timeArr].splice(12, 2).join('')
			]
			for (let i = 0; i < formatArr.length; i++) {
				formatStr = formatStr.replace(fStr.charAt(i), formatArr[i])
			}
			return formatStr
		}
		return timeStr
  },
  //#endregion 日期格式化

  rgbToHex: function (r, g, b) {
    return "#" + utils.toHex(r) + utils.toHex(g) + utils.toHex(b)
  },
  toHex: function (n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return "00";
    n = Math.max(0, Math.min(n, 255));
    return "0123456789ABCDEF".charAt((n - n % 16) / 16) +
      "0123456789ABCDEF".charAt(n % 16);
  },
  hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /*旧的移来================= */

  /**
   * 过滤空字符串, null, undefined
   * @param  {Object} data [description]
   * @return {[type]}      [description]
   */
  filterEmpty(data) {
    data = data || {}
    let obj = {};
    Object.keys(data).forEach(key => {
      let item = data[key]
      if (item !== '' && item !== undefined && item !== null)
        obj[key] = item
    })
    return obj;
  },
  //过滤特殊字符
  stripscript(s) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“’。，、？] ")
    var rs = "";
    for (var i = 0; i < s.length; i++) {
      rs = rs + s.substr(i, 1).replace(pattern, '&lt;');
    }
    return rs;
  },
  //去除htmltag
  removeHTMLTag(str) {
    if (!str) return '';
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
    //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
    str = str.replace(/ /ig, ''); //去掉
    return str;
  },
  //变量url化
  params2Query(params) {
    params = params || {}
    return Object.keys(this.filterEmpty(params))
      .map(key => {
        let v = params[key]
        return key + '=' + (typeof v !== 'object' ? v : JSON.stringify(v))
      })
      .join('&')
  },
  //rpx 转 px
  rpx2px(rpx) {
    let app = getApp()
    let screenWidth
    if (app && app.globalData.system) {
      screenWidth = app.globalData.system.screenWidth
    } else {
      screenWidth = wx.getSystemInfoSync().screenWidth
    }
    return Math.round(screenWidth / 750 * rpx);
  },


  toast(text, duration, success,callback) {
    wx.showToast({
      title: text,
      icon: success ? 'success' : 'none',
      duration: duration || 2000,
      //小鱼增加回调
      /*
        util.toast("res.message",null,null,(e)=>{
          logs.log("【弹出后回调】"+e);
          setTimeout((res) => {
            logs.log("【弹出后回调】"+e);
          }, 500);
        });
      */
      success: function () {
        typeof callback == "function" && callback("SB");
      }
    })
  },

  /*旧的移来===END============== */

  //参数获取
  getURLParam(url, key) {
    return decodeURIComponent((new RegExp('[?|&]' + key + '=' + '([^&;]+?)(&|#|;|$)', "ig").exec(url) || [, ""])[1].replace(/\+/g, '%20')) || null;
  },


  /**
     * 	判断空值，包括{}和[]，空为true，否则为false  用小鱼改写的吧

    isNull(value) {
      if (value == null || value == undefined) return true
      if (utils.isString(value)) {
        if (value.trim().length == 0) return true
      } else if (utils.isArray(value)) {
        if (value.length == 0) return true
      } else if (utils.isObject(value)) {
        for (let name in value) return false
        return true
      }
      return false;
  	},

     * 判断是否为字符串类型，是为true，否则为false



     * 判断是否为字符串类型，是为true，否则为false
   
    isString(value) {
      return value != null && value != undefined && value.constructor == String
  	},

     * 	判断是否为数组类型，是为true，否则为false

    isArray(value) {
      return value != null && value != undefined && value.constructor == Array
    },


     * 	判断是否为对象类型，是为true，否则为false
     
    isObject(value) {
      return value != null && value != undefined && value.constructor == Object
    },*/

  /*小鱼区 */

  /**
   * 	判断空值，包括{}和[]，空为true，否则为false
   */

  isNull(value) {
    /*
    if (value == null || value == undefined) return true
    if (this.judgeString(value)) {
      if (value.trim().length == 0) return true
    } else if (this.judgeArray(value)) {
      if (value.length == 0) return true
    } else if (this.judgeObject(value)) {
      for (let name in value) return false
      return true
    }
    return false;
    */
    //if (value == null || value == undefined) return true
    //小鱼上面的改写
    if (value == null || value == undefined || value == 'null' || value == 'undefined') return true
    if (this.isString(value)) {
      if (value.trim().length == 0) return true
    } else if (this.isArray(value)) {
      if (value.length == 0) return true
    } else if (this.isObject(value)) {
      for (let name in value) return false
      return true
    }
    return false;
  },
  /**
   * 判断是否为字符串类型，是为true，否则为false
   */
  isString(value) {
    return value != null && value != undefined && value.constructor == String
  },

  /**
   * 使用中发现 JSON中 数字字符串判定会有问题
   * 判断是否为数字类型，是为true，否则为false
   */
//   isNumber(value) {
//     return value != null && value != undefined && value.constructor == Number
//   },
  isNumber(value) {
    //return value != null && value != undefined && value.constructor == Number
    return Number.isInteger(Number(value));
  },  
  /**
   * 判断是否为布尔类型，是为true，否则为false
   */
  booleanTry(value) {
    return value != null && value != undefined && value.constructor == Boolean
  },
  /**
   * 	判断是否为数组类型，是为true，否则为false
   */
  isArray(value) {
    return value != null && value != undefined && value.constructor == Array
  },
  /**
   * 	判断是否为对象类型，是为true，否则为false
   */
  isObject(value) {
    return value != null && value != undefined && value.constructor == Object
  },
  isFunction(value) {
    return value != null && value != undefined && value.constructor == Function
  },

  //解决返回为字符串型JSON问题 2023 0915
  /*
   检测是否是字符串式的JSON 是的话格式化返回
   在问题反馈时 有图片时 碰到 packageA\pages\Setting\feedback\index.js
   请求的接口 /api/Feedback/detailEdit
   正常：{"code":1,"message":"感谢您的反馈，我们的工作人员将尽快处理"} 
   有上传图片时反回不正常了："{\"code\":1,\"message\":\"感谢您的反馈，我们的工作人员将尽快处理\"}"
  */
  jsonTestParse(value)
  {
    //先查看是不是字符串
    if(value != null && value != undefined && value.constructor == String)
    {
      let str = value.replace(/\\/g, '');//去掉反斜
       return JSON.parse(str);
    }
    return value;
  },
  
  //和当前时间比 是否过期
 validateDateExpires(accessExpires) {
  const currentTime = Date.now(); //13位时间戳 1693376939413
  let _accessExpires = new Date(Date.parse(accessExpires.replace(/-/g, "/"))).getTime(); //加上000为13位的时间戳 1693372853000
  if (currentTime > _accessExpires) {
    return true;
  } else {
    return false;
  }
},
 //和当前时间比 是否过期  -  使用时间戳 10位的
validateDateExpiresByStamp(accessExpiresStamp) {
  const currentTime = Date.now(); //13位时间戳 1693376939413
  let _accessExpires =accessExpiresStamp*1000; 
  if (currentTime > _accessExpires) {
    return true;
  } else {
    return false;
  }
},
  /**
	 * @desc 时间段欢迎语
	 * @param message_title 欢迎头部，如：小张   ，最终组成：小张,早上好!
	 **/
welcomeMessage(message_title){
  let greetings = ['早上好!', '中午好!', '下午好!', '晚上好!'];
  let now = new Date();
  let hours = now.getHours();
  
  let greetingIndex = 0;
  if(hours >= 12 && hours < 17) greetingIndex = 1; 
  else if(hours >= 17 && hours < 19) greetingIndex = 2;
  else if(hours >= 19) greetingIndex = 3;
  if(message_title){
    return message_title+"，"+greetings[greetingIndex];
  }else{
    return greetings[greetingIndex];
  }
},
/*
粉丝格式化
let fans = 1999;
console.log(formatFans(fans)); // 1.9K+
fans = 29999;
console.log(formatFans(fans)); // 29.9K+ 
fans = 102345;
console.log(formatFans(fans)); // 102.3K+
fans = 1234567  
console.log(formatFans(fans)); // 123.4W+
*/
formatFans(num) {
  if(num < 100) {
    return num; 
  }
  if(num >= 1000 && num < 10000) {
    // 显示成1K+
    return (num/1000).toFixed(1) + 'K+';
  }
  if(num >= 10000) {
    // 显示成1W+
    return (num/10000).toFixed(1) + 'W+';
  }
},

  /*小鱼区END */

//#region 与util.wxs 同步
//秒时间格成时间，如21600 格成：6:00
secondToHm(seconds) {
    seconds = Number(seconds);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    //var s = Math.floor(seconds % 3600 % 60);
    var hDisplay = h;
    var mDisplay = m > 0 ? ":" + m : ":00";
    //var sDisplay = s > 0 ? s : "";

    //return hDisplay + mDisplay + sDisplay;
    return hDisplay + mDisplay;
},
/*
米转公里
*/
getDistance(_addressDistan) {
var distance = _addressDistan || 0;
var result = '';
if (distance < 1000) {
    result = distance + ' m';
} else {
    result = (distance / 1000).toFixed(2) + ' km';
}
return result;
},
/*
数字格式成 1.0 2.0 这样的一位小数
formatNumber(num1); // 1.0
*/
formatNumber(num) {
  num = Number(num);
  if (isNaN(num)) {
      return 'N/A';
  }
  return num.toFixed(1); 
},
//#endregion 与util.wxs 同步

//时间戳1695312000,会输出2023-1-24
 formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }
}
module.exports = {
  trim: utils.trim,
  replaceAll: utils.replaceAll,
  formatNumber: utils.formatNumber,
  rmoney: utils.rmoney,
  formatDate: utils.formatDate,
  rgbToHex: utils.rgbToHex,
  hexToRgb: utils.hexToRgb,

  /*旧的移来================= */
  filterEmpty: utils.filterEmpty,
  stripscript: utils.stripscript,
  removeHTMLTag: utils.removeHTMLTag,
  params2Query: utils.params2Query,
  rpx2px: utils.rpx2px,
  toast: utils.toast,
  getURLParam: utils.getURLParam,

  //isNull: utils.isNull, //是否为空

    //小鱼转来
    isNull: utils.isNull,
    isNumber: utils.isNumber,
    isString: utils.isString,
    booleanTry: utils.booleanTry,
    isArray: utils.isArray,
    isObject: utils.isObject,
    isFunction: utils.isFunction,

    jsonTestParse: utils.jsonTestParse,    
    validateDateExpires: utils.validateDateExpires,//时间是否过期
    validateDateExpiresByStamp: utils. validateDateExpiresByStamp,//和当前时间比 是否过期  -  使用时间戳 10位的
 

    welcomeMessage: utils.welcomeMessage,//欢迎词
    formatFans: utils.formatFans,//粉丝格式化
  /*旧的移来======END=========== */

  //#region 与util.wxs 同步
  secondToHm: utils.secondToHm,//秒转时间
  formatTimestamp: utils.formatTimestamp,//时间戳1695312000,会输出2023-1-24

  getDistance: utils.getDistance,  //米转公里
  formatNumber: utils.formatNumber,  //数字格式成 1.0 2.0 这样的一位小数



  //#endregion 与util.wxs 同步

}