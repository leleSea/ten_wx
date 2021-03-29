import localData from '../localData'


function request(url) {
	this.url = url
	this._localData = new localData()
	this.sendCode = function (code, opt) {
		let promise = new Promise(success => {
			opt = opt || {}
			let url = this.url
			if(!url) return
			url = `${url}${code}`
			opt.header = opt.header || {}
			let cookie = this.cookieGet()
			if(cookie){
				opt.header.cookie = cookie
			}
			wx.showLoading('加载中')
			wx.request({
				url: url,
				data: opt.data || undefined,
				header: opt.header || undefined,
				method: opt.method || 'GET',
				complete: res => {
					wx.hideLoading()
					if(res && res.header && res.header['Set-Cookie']) this.cookieSet(res.header['Set-Cookie'])
					if(res && res.statusCode == 200){
						res = res.data
						if(res.respCode != '1001' && res.respMsg){
							wx.showToast({
								title: res.respMsg,
								icon: 'error'
							})
						}
					}else res = false
					success(res)
				}
			})
		})
		return promise
	}
	// var logs = wx.getStorageSync('logs') || []
    // var that = this
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
	this.cookieGet = () =>{
		let cookie = this._localData.getItem('cookie')
		let openid = this._localData.getItem('openid_ten')
		if(openid) cookie = `${cookie}; openid=${openid}`
		if(!cookie) return null
		return cookie
	}
	this.cookieSet = (cookie) =>{
		this._localData.setItem({
			cookie: cookie
		})
	}
}

module.exports = request