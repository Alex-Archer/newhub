import fetch from '../../../common/httpRequest'
import { stripscript } from '../../../utils/util';
Component({
  properties: {
    //控制显示
    show: {
      type: Boolean,
      value: false
    },
    price: {//支付金额
      type: String,
      value: "0"
    },   
    balance: {//余额
      type: String,
      value: "0"
    },   
    page: {
      type: Number,
      value: 1
    }
  },
  data: {

  },
  methods: {
    close() {
      this.triggerEvent("close",{})
    },
    btnPay(){
      this.close();
      fetch.href("/pages/template/mall/success/success")
    }
  }
})