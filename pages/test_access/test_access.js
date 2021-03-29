// pages/test_access/test_access.js

var request = require('../https')
const regeneratorRuntime = require('../../component/utils/runtime')
import {user} from '../../user'
import {court} from '../../court'
import {dataType} from '../../dataType'




Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		_dataType: new dataType(),
		http: new request('http://tennis.coopcloud.cn'),
		errorTitle: null,
		errorMsg: null,
		_user: new user(),
		_court: new court(),
        dialogButton: [
            {
                text: '确定'
            }
		],
		weekData: [
			"周日", "周一", "周二", "周三", "周四", "周五", "周六"
		],
		courtAreaList: [
            {
                title: 'C场',
                vid: 8,
                parktypeinfo: 1
            },
            {
                title: 'D场',
                vid: 9,
                parktypeinfo: 1
            },
            {
                title: 'F场',
                vid: 10,
                parktypeinfo: 1
            },
            {
                title: 'P场',
                vid: 12,
                parktypeinfo: 1
            },
            {
                title: 'G场',
                vid: 11,
                parktypeinfo: 3
            },
            {
                title: 'K场',
                vid: 13,
                parktypeinfo: 3
            },
            {
                title: 'G场草地',
                vid: 11,
                parktypeinfo: 4
            },
		],
		dateNav: [],
		selectDateVal: 0,
		courtAreaVal: 0,
		userid: null,
		ballcode: 1,
		parkstatus: 0,
		courtHead: {},
		courtList: [],
		courtTime: [],
		courtListTem: {},
		selectedCourt: {},
	},
	async sendCode(url, options){
        let res = await this.data.http.sendCode(url, options)
        this.errorHandle(res)
        return res
    },
    errorLogClose(){
        this.setData({
            errorMsg: null,
            errorTitle: null
        })
    },
    errorLogOpen(title, msg){
        this.setData({
            errorMsg: msg,
            errorTitle: title
        })
    },
    errorHandle(res, title){
        let msg = '未知错误'
        title = title || '请求失败'
        res = res || {}
        if(res.respCode == '1001') return
        if(res.respMsg !== undefined) msg = res.respMsg
        this.setData({
            errorMsg: msg,
            errorTitle: title
        })
        this.errorLogOpen(title, msg)
    },
    
    userStatusCheck(){
        // let user = wx.getStorageSync('user')
        // if(!user || user.id === undefined){
        //     wx.redirectTo({
        //         url: `/pages/testLogin/testLogin`,
		// 	})
		// 	return false
		// }
		// return true
		if(!this.data._user.statusCheck()){
            wx.redirectTo({
                url: `/pages/testLogin/testLogin`,
			})
			return false
        }
        return true
	},
	dateNavInit(){
		let date = new Date()
		let list = [], weekData = this.data.weekData
		let i = date.getDay()
		let dayTime = 24 * 60 * 60 * 1000
		while(list.length <= weekData.length){
			if(!weekData[i]){
				break
			}
			let d = date.getTime()
			let tem = list.length * dayTime
			d = d + tem
			d = new Date(d)
			d = {
				month: (d.getMonth() + 1),
				day: d.getDate(),
				year: d.getFullYear()
			}
			for(var j in d){
				if(d[j] < 10) d[j] = `0${d[j]}`
			}
			let yn = `${d.month}月${d.day}日`
			list.push({
				weekday: weekData[i],
				date: yn,
				month: d.month,
				day: d.day,
				year: d.year
			})
			list[list.length - 1].index = list.length - 1
			i++
			i = i % weekData.length
		}
		this.setData({
			dateNav: list
		})
		return list
	},
	async pageInit(){
		this.dateNavInit()
		await this.data._user.userOpenidCheck()
		await this.courtListPull()
	},
	changeSelect(e){
		let val = e.currentTarget.dataset.val
		this.selectDateVal = val
		this.setData({
			selectDateVal: val
		}, () => {
			this.courtListPull({refresh: true})
		})
	},
	onTabClick(e){},
	onChange(e){
		let index = e.detail.index
		this.setData({
			courtAreaVal: index
		}, () => {
			this.courtListPull()
		})
	},
	async userCardTypeCodeGet(){
		let courtListTem = this.data.courtListTem || {}
		let list = courtListTem.venList || []
		let date = this.selectedDateGet()
		let court = this.selectedCourtGet()
		let userid = this.data._user.getUserId()
		let cardtypecode = await this.data._user.userCardTypeCodeGet()
		let f = false
		for(var i in list){
			if(list[i].vid == court.vid && list[i].parktypeid == court.parktypeinfo){
				f = true
				break
			}
		}
		console.log(f)
		if(!f){
			let options = {
				userid: userid,
				cardtypecode: cardtypecode,
				date: `${date.year}-${date.month}-${date.day}`,
				ballcode: this.data.ballcode,
				parkstatus: this.data.parkstatus,
				parktypeinfo: court.parktypeinfo
			}
			let res = await this.data._court.getCourtList(options)
			console.log(res)
			if(res){
				this.setData({
					courtListTem: this.data._dataType.deepCopy(res)
				})
			}
		}
		return this.data.courtListTem
	},
	async courtListPull(opt){
		this.setData({
			courtHead: {},
			courtList: [],
			courtTime: [],
			selectedCourt: {},
		})
		opt = opt || {}
		if(opt.refresh) {
			this.setData({
				courtListTem: {}
			})
		}
		let court = this.selectedCourtGet()
		let data = await this.userCardTypeCodeGet()
		data = data || {}
		let courtList = data.venList || []
		let head = data.timeLimit || {}
		this.setData({
			courtHead: head
		})
		let rd = null
		for(var i in courtList){
			if(courtList[i].vid == court.vid){
				rd = courtList[i]
				break
			}
		}
		if(!rd) return
		this.courtListHandle(rd.park)
	},
	courtListHandle(list){
		let courtTime = this.courtTimeHand(list)
		let timeNow = new Date()
		let userid = this.data._user.getUserId()
		// 0 -- 可用 4 -- 锁定
		for(var i in list){
			list[i].index = i
			for(var j in list[i].reserve){
				let tem = list[i].reserve[j]
				let hour = Number(timeNow.getHours())
				let courtTime = Number(tem.time)
				let status = 0
				if(hour >= courtTime) status = 2
				else if(tem.detailid){
					if(tem.bookmoney > 0)  status = 2
					else status = 1
				
				}
				list[i].reserve[j].status = status
				status = tem.bookstatus
				let courtUserid = tem.userid
				// list[i].reserve[j].statusClass = status == 0 ? 'avai' : (status == 2 ? 'unavai' : 'lock')
				list[i].reserve[j].statusClass = status == 0 ? 'avai' : (courtUserid == userid ? 'order' : 'unavai')
				list[i].reserve[j].index = j
				list[i].reserve[j].parkname = list[i].parkname
				list[i].reserve[j].key = `${list[i].parkname}-${list[i].reserve[j].time}`
			}
		}
		this.setData({
			courtList: list,
			courtTime: courtTime
		})
	},
	courtTimeHand(data){
		data = data || []
		data = data[0]
		if(!data.reserve || !data.reserve.length) return []
		let reserve = data.reserve
		let rd = []
		for(var i in reserve){
			rd.push(reserve[i].time)
		}
		return rd
	},
	selectedDateGet(){
		let index = this.data.selectDateVal
		let list = this.data.dateNav
		return list[index] || null
	},
	selectedCourtGet(){
		let index = this.data.courtAreaVal
		let list = this.data.courtAreaList
		return list[index] || null
	},
	quit(){
		this.data._user.quit()
	},
	selectCourt(e){
		let val = e.currentTarget.dataset.val
		val = val || {}
		if(val.bookstatus != 0) return
		let selList = this.data.selectedCourt || {}
		
		let key = val.key
		if(selList[key]) delete selList[key]
		else{
			let block = this.data.courtHead.timeSurplus - Object.keys(selList).length
			if(block <= 0){
				wx.showToast({
					title: `当日还能预定${block}块场地`,
					icon: 'none'
				})
				return 
			}
			selList[key] = val
		}
		this.setData({
			selectedCourt: selList
		})
	},
	async orderCourt(){
		let selList = this.data.selectedCourt || {}
		if(!Object.keys(selList).length) return
		let date = this.selectedDateGet()
		let court = this.selectedCourtGet()
		console.log(date)
		// userid: 12765,
		// parklist: '[{"date":"2021-03-11","time":"21","parkid":"67","parkname":"K2"}]',
		// paywaycode: 0,
		// addOrderType: 'wx'
		let fields = []
		let postDate = `${date.year}-${date.month}-${date.day}`
		for(var i in selList){
			fields.push({
				time: selList[i].time,
				parkid: selList[i].id,
				parkname: selList[i].parkname,
				date: postDate
			})
		}
		let options = {
			userid: this.data._user.getUserId(),
			parklist: JSON.stringify(fields),
			paywaycode: 0,
			addOrderType: 'app'

			// vid: court.vid,
			// vname: court.title,
			// parkType: '网球',
			// date: postDate,
			// parkId: 1
		}
		await this.data._user.judgeUser()
		let res = await this.data._court.orderCourt(options)
		console.log(res)
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if(!this.userStatusCheck()) return
		this.pageInit()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})