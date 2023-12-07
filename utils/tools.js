/**
 * 工具类
 * @author mirFisher.
 * @version 1.1.1
 **/
const tools = {

	getScreenWidth() {
		return this.rpx2px(750)
	},
	getScreenHeight() {
		let app = getApp()
		if (app && app.globalData.system)
			return app.globalData.system.screenHeight
		return wx.getSystemInfoSync().screenHeight
	},
	/**https://www.cnblogs.com/zjjDaily/p/10840276.html
	 * https://segmentfault.com/a/1190000019577510
	 * 函数节流(throttle)：函数在一段时间内多次触发只会执行第一次，在这段时间结束前，不管触发多少次也不会执行函数。
	 * @param fn
	 * @param gapTime
	 * @returns {Function}
	 * @fnError 出错执行的命令 小鱼加
	 * @UnlockLock 只有在开锁时用到,解决事发页无法动态设定间隔的问题 .只能用globalData中转
	 */
	throttle(fn, gapTime, fnError,UnlockLock=false) {
		if (gapTime == null || gapTime == undefined) {
			gapTime = 1500
		}

		let _lastTime = null

		// 返回新的函数
		return function () {

			//解决处理页无法获取当前页设置值的问题 
			if(UnlockLock)
			{
				let app = getApp();
				gapTime=app.globalData.indexInterval;
			}

			let _nowTime = +new Date()
			if (_nowTime - _lastTime > gapTime || !_lastTime) {
				fn.apply(this, arguments) //将this和参数传给原函数
				_lastTime = _nowTime
			}
			//小鱼加 用于出错返回提示
			else {
				if (typeof fnError == 'function') {
					let getTime = (gapTime - (_nowTime - _lastTime)) / 1000;
					getTime = Math.round(getTime); //4舍5入
					if (getTime <= 0) {
						getTime = 1; //提示0秒不好看，变成1秒吧
					}
					fnError.apply(this, [getTime + '秒 后方可再次操作']);
				}
			}
		}
	},
	/*函数防抖
	对于在事件被触发n秒后再执行的回调，如果在这n秒内又重新被触发，则重新开始计时
	https://blog.csdn.net/Beijiyang999/article/details/79832604
	
	已用下面的改写的
	
	debounce(fn, delta, context) {
		var timeoutID = null;

		return function () {
			clearTimeout(timeoutID);
			var args = arguments;
			timeoutID = setTimeout(function () {
				console.log(1)
				fn.apply(context, args);
			}, delta);
		};
	},
	*/

	/*
	微信小程序之使用函数防抖与函数节流 ：https://www.cnblogs.com/zjjDaily/p/10840276.html
	有取消的，详细用法见：https://blog.csdn.net/Beijiyang999/article/details/79832604
	var setSomething = debounce(doSomething, 1000, true)

	container.onmousemove = setSomething

	document.getElementById("button").addEventListener('click', function(){
			setSomething.cancel()
	})

	＠params immediate 是否立即执行　在一个周期内第一次触发，就立即执行一次，然后一定时间段内都不能再执行目标函数

	小鱼改小程序用法:
	openActionSheet: tools.debounce(function (e)  {
		//执行体
	},10000,false),
	*/
	debounce(func, wait, immediate) {
		let time
		let debounced = function () {
			let context = this
			if (time) clearTimeout(time)

			if (immediate) {
				let callNow = !time
				if (callNow) func.apply(context, arguments)
				time = setTimeout(
					() => {
						time = null
					} //见注解
					, wait)
			} else {
				time = setTimeout(
					() => {
						func.apply(context, arguments)
					}, wait)
			}
		}

		debounced.cancel = function () {
			clearTimeout(time)
			time = null
		}

		return debounced
	},
  //toast 提示窗
	toast(text, duration, success) {
		wx.showToast({
			title: text,
			icon: success ? 'success' : 'none',
			duration: duration || 2000
		})
	},
	/*旧的移来===END============== */
}

module.exports = {

	getScreenWidth: tools.getScreenWidth,
	getScreenHeight: tools.getScreenHeight,

	throttle: tools.throttle,
	debounce: tools.debounce,

	toast: tools.toast,


}