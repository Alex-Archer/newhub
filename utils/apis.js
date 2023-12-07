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
          resolve(util.jsonTestParse(_data));
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
}