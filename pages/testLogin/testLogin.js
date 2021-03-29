// pages/testLogin/testLogin.js
var request = require('../https')
const regeneratorRuntime = require('../../component/utils/runtime')
import {user} from '../../user'


Page({

    /**
     * 页面的初始数据
     */
    data: {
        _user: new user(),
        phone: null,
        code: null,
        password: null,
        http: new request('http://tennis.coopcloud.cn'),
        codeStatus: false,
        countNum: 60,
        countShow: null,
        errorTitle: null,
        errorMsg: null,
        dialogButton: [
            {
                text: '确定'
            }
        ]
    },

    valueSet(e){
        let val = e.detail.value
        let type = e.currentTarget.dataset.type
        if(this.data[type] !== undefined){
            let setData = {}
            setData[type] = val
            this.setData(setData)
        }
    },
    async sendSmsCode(){
        let phone = this.data.phone
        if(!phone) return false
        let res = await this.sendCode('/TennisCenterInterface/umUser/getPhoneCode.action', {
            data: {
                loginname: phone,
                type: 3
            },
            method: 'GET'
        })
        if(res && res.respCode == '1001'){
            this.countDownAction()
        }
        this.countDownAction()
    },
    countDownAction(){
        let promise = new Promise(success => {
            let num = this.data.countNum
            this.setData({
                countShow: num
            })
            let interval = setInterval(() => {
                if(num <= 0){
                    clearInterval(interval)
                    success()
                    return
                }
                num--
                this.setData({
                    countShow: num
                })
            }, 1000)
        })
        return promise
    },
    async login(){
        let phone = this.data.phone
        let code = this.data.code
        let password = this.data.password
        if(!phone || !code || !password) return false
        // let res = await this.sendCode('/TennisCenterInterface/umUser/userLogin.action', {
        //     data: {
        //         loginname: phone,
        //         password: password,
        //         code: code
        //     },
        //     method: 'GET'
        // })
        // if(res && res.respCode == '1001'){
        //     this.loginSet(res.datas)
        // }
        let res = await this.data._user.login(phone, code, password)
        this.userStatusCheck()
        return res
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
    loginSet(data){
        data = data || {}
        let user = data.user
        this.data._user.loginSet(user)
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
        let status = this.data._user.statusCheck()
        console.log(status)
        if(status){
            wx.redirectTo({
                url: `/pages/test_access/test_access`,
            })
            return false
        }
        return true
    },
    async pageInit(){
        await this.data._user.userOpenidCheck()
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.pageInit().then(res => {
            if(!this.userStatusCheck()) return
        })
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