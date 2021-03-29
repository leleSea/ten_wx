import http from '/pages/https'
import localData from 'localData'
import {dataType} from 'dataType'
import regeneratorRuntime from './component/utils/runtime'


class court{
    constructor(){
        this._localData = new localData()
        this._dataType = new dataType()
        this._http = new http('http://tennis.coopcloud.cn')
        this.ballcode = 1
        this.parkstatus = 0
        this.courtAreaList = [
            {
                name: 'C场',
                vid: 8,
                parktypeinfo: 1
            },
            {
                name: 'D场',
                vid: 9,
                parktypeinfo: 1
            },
            {
                name: 'F场',
                vid: 10,
                parktypeinfo: 1
            },
            {
                name: 'P场',
                vid: 12,
                parktypeinfo: 1
            },
            {
                name: 'G场',
                vid: 11,
                parktypeinfo: 3
            },
            {
                name: 'K场',
                vid: 13,
                parktypeinfo: 3
            },
            {
                name: 'G场草地',
                vid: 11,
                parktypeinfo: 4
            },
        ]
        this.getCourtAreaList = () =>{
            return this.courtAreaList
        }
        this.getBallcode = () =>{
            return this.ballcode
        }
        this.getParkstatus = () =>{
            return this.parkstatus
        }
        this.getCourtList = async (opt) =>{
            let url = '/TennisCenterInterface/pmPark/getParkShowByParam.action'
            opt = opt || {}
            if(!Object.keys(opt).length) return false
            // opt.userid = '12765'
            let options = {
                url: url,
                data: opt,
                method: 'GET'
            }
            let res = await this._http.sendCode(url, options)
            if(res && res.respCode == '1001'){
                return res.datas
            }
            return false
        }
        this.orderCourt = async (opt) => {
            let url = '/TennisCenterInterface/pmPark/addParkOrder.action'
            opt = opt || {}
            console.log(opt)
            if(!Object.keys(opt).length) return false
            // opt.userid = '12765'
            let options = {
                url: url,
                data: opt,
                method: 'POST'
            }
            let res = await this._http.sendCode(url, options)
            if(res && res.respCode == '1001'){
                console.log(res)
                return res.datas
            }
            return false
        }
    }
}

export {court}