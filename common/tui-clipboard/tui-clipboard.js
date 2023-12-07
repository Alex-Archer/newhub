/*!
 * 剪贴板，新增此方法主要与uni-app保持一致
 *
/**
 * data 需要复制的数据
 * callback 回调
 * **/
const getClipboardData = function (data, callback) {

	wx.setClipboardData({
		data: data,
		success(res) {
			("function" == typeof callback) && callback(true)
		},
		fail(res) {
			("function" == typeof callback) && callback(false)
		}
	})
}
export default {
	getClipboardData: getClipboardData
};