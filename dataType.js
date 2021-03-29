class dataType{
    constructor(){
        this.isArray = (obj) =>{
            return Object.prototype.toString.call(obj) == '[object Array]'
        }
        this.isObject = (obj) =>{
            return Object.prototype.toString.call(obj) == '[object Object]'
        }
        this.isString = (obj) =>{
            return Object.prototype.toString.call(obj) == '[object String]'
        }
        this.isNumber = (obj) =>{
            return Object.prototype.toString.call(obj) == '[object Number]'
        }
        this.isBool = (obj) =>{
            return Object.prototype.toString.call(obj) == '[object Boolean]'
        }
        this.deepCopy = (obj) =>{
            if (this.isString(obj) || this.isBool(obj) || this.isNumber(obj) || !obj) return obj
            return JSON.parse(JSON.stringify(obj))
        }
    }
}

export {dataType}