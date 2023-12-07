Component({
  properties: {
    //展示图片宽度
    width: {
      type: Number,
      optionalTypes: [String],
      value: 220
    },
    //展示图片高度
    height: {
      type: Number,
      optionalTypes: [String],
      value: 220
    },
    //初始化图片路径
    value: {
      type: Array,
      value: [],
      observer(val) {
        this.initImages()
      }
    },
    //2.8.0+
    radius: {
      type: String,
      optionalTypes:[Number],
      value: 0
    },
    //2.8.0+
    background: {
      type: String,
      value: '#F7F7F7'
    },
    //2.8.0+
    borderColor: {
      type: String,
      value: 'transparent'
    },
    //2.8.0+
    //solid、dashed、dotted
    borderSytle: {
      type: String,
      value: 'dashed'
    },
    //2.8.0+
    delColor: {
      type: String,
      value: ''
    },
    //删除图片前是否弹框确认
    delConfirm: {
      type: Boolean,
      value: false
    },
    //禁用删除
    forbidDel: {
      type: Boolean,
      value: false
    },
    //2.3.0+
    addColor: {
      type: String,
      value: '#888'
    },
    //2.3.0+
    addSize: {
      type: String,
      optionalTypes:[Number],
      value: 68
    },
    //2.3.0+
    custom:{
      type: Boolean,
      value: false
    },
    //禁用添加
    forbidAdd: {
      type: Boolean,
      value: false
    },
    //服务器地址
    serverUrl: {
      type: String,
      value: ""
    },
    //限制数
    limit: {
      type: Number,
      value: 9
    },
    //original 原图，compressed 压缩图，默认二者都有
    sizeType: {
      type: Array,
      value: ['original', 'compressed']
    },
    //album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
    sourceType: {
      type: Array,
      value: ['album', 'camera']
    },
    //可上传图片类型，默认为空，不限制  Array<String> [jpg,png,gif]
    imageFormat: {
      type: Array,
      value: []
    },
    //单张图片大小限制 MB 
    size: {
      type: Number,
      value: 4
    },
    //文件对应的key，默认为 file
    fileKeyName: {
      type: String,
      value: "file"
    },
    //HTTP 请求 Header, header 中不能设置 Referer。
    header: {
      type: Object,
      value: {}
    },
    //HTTP 请求中其他额外的 form data
    formData: {
      type: Object,
      value: {}
    },
    //自定义参数
    params: {
      type: Number,
      optionalTypes: [String],
      value: 0
    }
  },
  lifetimes: {
    ready: function () {
      this.initImages()
    }
  },
  data: {
    //图片地址
    imageList: [],
    tempFiles: [],
    //上传状态：1-上传成功 2-上传中 3-上传失败
    statusArr: [],
    //传入回调函数上传
    callUpload: false,
    g_danger: (wx.$tui && wx.$tui.color.danger) || '#EB0909'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initImages() {
      let imgArr = [...this.data.value]
      let status = []
      let tempFiles = []
      for (let item of imgArr) {
        status.push("1")
        tempFiles.push({
          path: item
        })
      }
      this.data.tempFiles = tempFiles;
      this.setData({
        imageList: [...imgArr],
        statusArr: status
      })
    },
    // 重新上传
    reUpLoad(e) {
      let index = Number(e.currentTarget.dataset.index)
      let value = `statusArr[${index}]`
      this.setData({
        [value]: "2"
      })
      this.triggerEvent('reupload', {
        index
      })
      if (!this.data.callUpload) {
        this.uploadImage(index, this.data.imageList[index]).then(() => {
          this.change()
        }).catch(() => {
          this.change()
        })
      }
    },
    /**
     * @param manual 是否手动上传
     **/
    change(manual = false) {
      let status = ~this.data.statusArr.indexOf("2") ? 2 : 1
      if (status != 2 && ~this.data.statusArr.indexOf("3")) {
        // 上传失败
        status = 3
      }
      this.triggerEvent('complete', {
        status: status,
        imgArr: this.data.imageList,
        params: this.data.params,
        manual: manual
      })
    },
    toast(text) {
      text && wx.showToast({
        title: text,
        icon: "none"
      });
    },
    chooseImage: function () {
      let _this = this;
      wx.chooseImage({
        count: _this.data.limit - _this.data.imageList.length,
        sizeType: _this.data.sizeType,
        sourceType: _this.data.sourceType,
        success: function (e) {
          let imageArr = [];
          let status = []
          let tempFiles = []
          for (let i = 0; i < e.tempFiles.length; i++) {
            let len = _this.data.imageList.length;
            if (len >= _this.data.limit) {
              _this.toast(`最多可上传${_this.data.limit}张图片`);
              break;
            }

            //过滤图片类型
            let path = e.tempFiles[i].path;

            if (_this.data.imageFormat.length > 0) {
              let format = path.split(".")[(path.split(".")).length - 1];
              if (_this.data.imageFormat.indexOf(format) == -1) {
                let text = `只能上传 ${_this.data.imageFormat.join(',')} 格式图片！`
                _this.toast(text);
                continue;
              }
            }

            //过滤超出大小限制图片
            let size = e.tempFiles[i].size;

            if (_this.data.size * 1024 * 1024 < size) {
              let err = `单张图片大小不能超过：${_this.data.size}MB`
              _this.toast(err);
              continue;
            }

            imageArr.push(path)
            tempFiles.push(e.tempFiles[i])
            status.push("2")
          }
          _this.setData({
            imageList: _this.data.imageList.concat(imageArr),
            tempFiles: _this.data.tempFiles.concat(tempFiles),
            statusArr: _this.data.statusArr.concat(status)
          })
          _this.change()

          let start = _this.data.imageList.length - imageArr.length
          for (let j = 0; j < imageArr.length; j++) {
            let index = start + j
            //服务器地址
            if (_this.data.serverUrl) {
              _this.uploadImage(index, imageArr[j]).then(() => {
                _this.change()
              }).catch(() => {
                _this.change()
              })
            } else {
              //无服务器地址则直接返回成功
              let value = `statusArr[${index}]`
              _this.setData({
                [value]: "1"
              })
              _this.change()
            }
          }
        }
      })
    },
    uploadImage: function (index, url, serverUrl) {
      let _this = this;
      let status = `statusArr[${index}]`;
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url: this.data.serverUrl || serverUrl,
          name: this.data.fileKeyName,
          header: this.data.header,
          formData: this.data.formData,
          filePath: url,
          success: function (res) {
            if (res.statusCode == 200) {
              //返回结果 此处需要按接口实际返回进行修改
              let d = JSON.parse(res.data.replace(/\ufeff/g, "") || "{}")
              //判断code，以实际接口规范判断
              if (d.code % 100 === 0) {
                // 上传成功 d.url 为上传后图片地址，以实际接口返回为准
                if (d.url) {
                  let value = `imageList[${index}]`
                  _this.setData({
                    [value]: d.url
                  })
                }
                _this.setData({
                  [status]: d.url ? "1" : "3"
                })
              } else {
                // 上传失败
                _this.setData({
                  [status]: "3"
                })
              }
              resolve(index)
            } else {
              _this.setData({
                [status]: "3"
              })
              reject(index)
            }
          },
          fail: function (res) {
            _this.setData({
              [status]: "3"
            })
            reject(index)
          }
        })
      })

    },
    delConfirmExec(index) {
      let imgList = [...this.data.imageList]
      let status = [...this.data.statusArr]
      let tempFiles=[...this.data.tempFiles]
      imgList.splice(index, 1)
      tempFiles.splice(index, 1)
      status.splice(index, 1)
      this.setData({
        imageList: imgList,
        tempFiles:tempFiles,
        statusArr: status
      })
      this.triggerEvent("remove", {
        index: index,
        params: this.data.params
      })
      this.change()
    },
    delImage: function (e) {
      let index = Number(e.currentTarget.dataset.index)
      let _this = this;
      if (this.data.delConfirm) {
        wx.showModal({
          title: '提示',
          content: '确认删除该图片吗？',
          showCancel: true,
          cancelColor: "#555",
          confirmColor: "#eb0909",
          confirmText: "确定",
          success(res) {
            if (res.confirm) {
              _this.delConfirmExec(index)
            }
          }
        })
      } else {
        _this.delConfirmExec(index)
      }
    },
    previewImage: function (e) {
      let index = Number(e.currentTarget.dataset.index)
      if (!this.data.imageList.length) return;
      wx.previewImage({
        current: this.data.imageList[index],
        loop: true,
        urls: this.data.imageList
      })
    },
    /**
     * 当属性serverUrl传空时，父级调用该方法一次性上传所有图片
     * @param serverUrl 服务器接口地址
     **/
    uploadAllImage(serverUrl) {
      if (!serverUrl) {
        this.toast('服务器接口地址不能为空！');
        return;
      }
      let imageArr = [...this.data.imageList]
      const len = imageArr.length
      for (let i = 0; i < len; i++) {
        //如果是服务器地址图片则无需再次上传
        if (imageArr[i].startsWith('http')) {
          continue;
        } else {
          let status = `statusArr[${i}]`;
          _this.setData({
            [status]: "2"
          })
          this.uploadImage(i, imageArr[i], serverUrl).then(() => {
            if (i === len - 1) {
              this.change(true)
            }
          }).catch(() => {
            if (i === len - 1) {
              this.change(true)
            }
          })
        }
      }
    },
    upload(callback, index) {
      // 传入一个返回Promise的文件上传的函数
      //上传状态：1-上传成功 2-上传中 3-上传失败
      this.data.callUpload = true;
      if (index === undefined || index === null) {
        let urls = [...this.data.imageList]
        const len = urls.length
        for (let i = 0; i < len; i++) {
          if (urls[i].startsWith('https')) {
            continue;
          } else {
            let status = `statusArr[${i}]`;
            this.setData({
              [status]: "2"
            })
            if (typeof callback === 'function') {
              callback(this.data.tempFiles[i]).then(res => {
                let value = `imageList[${i}]`
                this.setData({
                  [status]: "1",
                  [value]: res
                })
                this.change(true)
              }).catch(err => {
                this.setData({
                  [status]: "3"
                })
              })
            }
          }
        }
      } else {
        //如果传入index，则是重新上传时调用
        let status = `statusArr[${i}]`;
        this.setData({
          [status]: "2"
        })
        if (typeof callback === 'function') {
          callback(this.data.tempFiles[index]).then(res => {
            let value = `imageList[${index}]`
            this.setData({
              [status]: "1",
              [value]: res
            })
            this.change(true)
          }).catch(err => {
            this.setData({
              [status]: "3"
            })
          })
        }
      }
    }
  }
})