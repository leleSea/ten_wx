

export default class localData{
    constructor(){
        this.getItem = (key) =>{
            return wx.getStorageSync(key)
        }
        this.setItem = (options) =>{
            options = options || {}
            for(var i in options){
                wx.setStorageSync(i, options[i])
            }
        }
        this.removeItem = (options) =>{
            for(var i in options){
                wx.removeStorageSync(i)
            }
        }
        this.clear = () =>{
            wx.clearStorage()
        }
    }
    //localstorage
    
    
    

}