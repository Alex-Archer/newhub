	//此组件只为form表单提交传递数据使用
Component({
  behaviors: ['wx://form-field'],
  properties: {
    //是否为隐藏域
    hidden: {
      type: Boolean,
      value: false
    }
  }
})