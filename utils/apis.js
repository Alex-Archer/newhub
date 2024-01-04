import axios from '../libs/axios-miniprogram/axios-miniprogram.cjs';
const logs = require('../utils/logs.js');
var util = require('../utils/util.js')
const apis = {
  /**
   * 
   * @param {*} _url 
   * @param {*} _config 
   * @param {*} _headers 
   * @param {*} _interceptors 
   */
  _get: function (_url, _config, _headers, _interceptors = false) {
    return new Promise((resolve, reject) => {
      axios.get(_url, _config, {
        headers: _headers,
        interceptors: {
          request: _interceptors,
          response: _interceptors
        },

        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          let _data = util.jsonTestParse(res.data.data);
          resolve(_data);
        } else {
          reject(res.data);
        }
      }).catch((err) => {
        reject();
      });
    })
  },
  _gets: function (_url, _config, _interceptors = false) {
    return new Promise((resolve, reject) => {
      axios.get(_url, _config, {
        headers: {"Content-Type": 'applciation/json'},
        interceptors: {
          request: _interceptors,
          response: _interceptors
        },

        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          let _data = util.jsonTestParse(res.data.data);
          resolve(_data);
        } else {
          reject(res.data);
        }
      }).catch((err) => {
        reject();
      });
    })
  },
/**
   * 
   * @param {*} _url 
   * @param {*} _config 
   * @param {*} _headers {'Content-Type': 'application/json',}/ application/json; charset=utf-8
   * @param {*} _interceptors 
   *    apis.post('/Index/indexPub', _config, {
          "Content-Type": 'applciation/json'
        }, false).then(val => {
            console.log(JSON.stringify(val));
        }, function (err) {
            console.log("err",JSON.stringify(err));
        });
   */
  _post: function (_url, _config, _headers, _interceptors = false) {
    return new Promise((resolve, reject) => {
      axios.post(_url, _config, {
        headers: _headers,
        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          let _data = util.jsonTestParse(res.data.data);
          resolve(_data);
        } else {
          reject(res.data);
        }
      }).catch((err) => {
        reject();
      });
    })
  },
  // 小雨新建的post方法
  _posts: function (_url, _config, _headers, _interceptors = false) {
    return new Promise((resolve, reject) => {
      axios.post(_url, _config, {
        headers: {"Content-Type": 'applciation/json'},
        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          let _data = util.jsonTestParse(res.data.data);
          resolve(_data);
        } else {
          reject(res);
        }
      }).catch((err) => {
        reject();
      });
    })
  },

/**
   * 表单含有文件上传
   * @param {*} _url 
   * @param {*} _data 必须包含name: 'file',file为对接后端文件域名称，可变  { name: 'file', filePath: 本地文件路径,userID: wx.getStorageSync('USERID'),TIMESTAMP: timestamp......} 
   * @param {*} _headers {'Content-Type': 'application/json',}/ application/json; charset=utf-8
   * @param {*} _interceptors 是否登录认证
   *    apis.file('/User/modifyHead', { name: 'file', userID: "asfsdfasdf",TIMESTAMP: 1234567890}, {
          "Content-Type": 'applciation/json'
        }, false).then(val => {
            console.log(JSON.stringify(val));
        }, function (err) {
            console.log("err",JSON.stringify(err));
        });
   */
  _file: function (_url, _data, _headers, _interceptors = false) {
    return new Promise((resolve, reject) => {
      axios(_url, {  
        method: 'POST',
        upload: true, 
        data:_data,
    }, {
        headers: _headers,
        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          let _data = util.jsonTestParse(res.data.data);
          resolve(_data);
        } else {
          reject();
        }
      }).catch((err) => {
        reject();
      });
    })
  },  
}
module.exports = {
  get: apis._get,
  gets: apis._gets,
  posts: apis._posts,
  post: apis._post,
  file: apis._file,//表单含有文件上传
}