import http from '/pages/https'
import localData from 'localData'
import {dataType} from 'dataType'
import regeneratorRuntime from './component/utils/runtime'


class user{
    constructor(){
        this._localData = new localData()
        this._dataType = new dataType()
        this.userCodeSet = '/TennisCenterInterface/toWxAouth.action?code=023XqKll2ePvI648utol2u8sCq1XqKl9&state=1'
        this.openid_tem = 'oR_qexL17fcNPVkLyzOKOdpucCQc'
        this.http = new http('http://tennis.coopcloud.cn')
        this.getUserId = () =>{
            let user = this._localData.getItem('user')
            if(!user) return null
            if(!this._dataType.isObject(user)){
                try{
                    user = JSON.parse(user)
                }catch(e){
                    user = null
                }
            }
            if(!user) return null
            return user.id
        }
        this.userOpenidCheck = async () =>{
            let openid = this._localData.getItem('openid_ten')
            if(!openid) openid = this.openid_tem
            this._localData.setItem({
                openid_ten: openid
            })
            let url = '/TennisCenterInterface/umUser/getUserInfoByOpenid.action'
            let res = await this.http.sendCode(url)
            if(res && res.respCode == '1001'){
                let user = res.datas.user
                let card = res.datas.cardType
                this._localData.setItem({
                    user: JSON.stringify(user),
                    card: JSON.stringify(card)
                })
            }
        }
        this.statusCheck = async () =>{
            let user = this._localData.getItem('user')
            if(!user) return false
            try{
                user = JSON.parse(user)
            }catch(e){
                user = false
            }
            console.log(user)
            if(!user || !this._dataType.isObject(user) || user.id === undefined) return false
            return true
    
        }
        this.sendSmsCode = async (phone) =>{
            let url = '/TennisCenterInterface/umUser/getPhoneCode.action'
            let options = {
                url: url,
                data: {
                    loginname: phone,
                    type: 3
                },
                method: 'GET'
            }
            let res = await this.http.sendCode(url, options)
            return res
        }
        this.login = async (phone, code, password) =>{
            let url = '/TennisCenterInterface/umUser/userLogin.action'
            let options = {
                url: url,
                data: {
                    loginname: phone,
                    password: password,
                    code: code
                },
                method: 'GET'
            }
            let res = await this.http.sendCode(url, options)
            if(res && res.respCode == '1001'){
                let url = '/TennisCenterInterface/umUser/judgeWXuser.action'
                options = {
                    url: url,
                    method: 'POST'
                }
            let resUser = await this.http.sendCode(url, options)
            if(resUser && resUser.respCode == '1001'){
                res.datas.user.openId = resUser.datas.openid
            }
            this.loginSet(res.datas)
                this.userCardGet()
            }
            return res
        }
        this.loginSet = (data) =>{
            if(!data) return
            let user = data.user
            this._localData.setItem({
                'loginData': JSON.stringify(data),
                'user': JSON.stringify(user)
            })
        }
        this.cardSet = (data) =>{
            if(!data) return
            this._localData.setItem({
                'card': JSON.stringify(data)
            })
        }
        
        this.userCardTypeCodeGet = async () =>{
            let card = this._localData.getItem('card')
            if(!card){
                await this.userCardRequest()
                card = this._localData.getItem('card')
            }
            try{
                card = JSON.parse(card)
            }catch(e){
                card = null
            }
            if(!card) return -1
            return card.cardtypecode === undefined ? -1 : card.cardtypecode
        }
        this.userCardGet = async () =>{
            await this.userCardRequest()
            let card = this._localData.getItem('card')
            try{
                card = JSON.parse(card)
            }catch(e){
                card = null
            }
            return card
        }
        this.userCardRequest = async (userid) =>{
            console.log('userCardRequest')
            userid = userid || this.getUserId()
            // userid = '12765'
            if(userid === null) return 
            console.log('has user id')
            let url = '/TennisCenterInterface/umCard/getCardByUser.action'
            let options = {
                url: url,
                data: {
                    userid: userid,
                },
                method: 'POST'
            }
            let res = await this.http.sendCode(url, options)
            console.log(res)
            if(res && res.respCode == '1001'){
                this.cardSet(res.datas)
            }
            return res
        }
        this.judgeUser = async () => {
            let url = '/TennisCenterInterface/umUser/judgeWXuser.action'
            let options = {
                url: url,
                method: 'POST'
            }
            let res = await this.http.sendCode(url, options)
            console.log(res)
            if(res && res.respCode == '1001'){
            }
            console.log(res)
            return res
        }
        this.quit = () => {
            let items = {
                'user': true,
                'card': true,
                'cookie': true,
                'openid_ten': true
            }
            this._localData.removeItem(items)
            wx.redirectTo({
                url: `/pages/testLogin/testLogin`,
            })
        }
    }
    
}

export {user}
