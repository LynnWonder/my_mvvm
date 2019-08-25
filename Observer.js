/**
 * 递归给模版绑定数据进行数据劫持
 */
class Observer{
    constructor(data){
        this.observer(data);
    }
    observer(data){
        //要对这个data数据将原有的属性改成set和get的形式
        if(!data || typeof data !== 'object'){
            return;
        }
        //要将数据 一一劫持 先获取到 data 到 key 和 value
        Object.keys(data).forEach(key => {
            //劫持
            this.defineReactive(data,key,data[key]);
            this.observer(data[key]); //深度递归劫持
        })
    }
    //定义响应式
    defineReactive(obj,key,value){
        let that = this;
        //每个变化的数据，都会对应一个数组，这个数组是存放所有更新的操作
        let dep = new Dep();
        // 获取某个值被监听到
        Object.defineProperty(obj,key,{
            enumerable : true,
            configurable : true,
            get(){ //当取值时调用到方法
                // 在compile中遇到模版中绑定的变量就会实例化watcher
                // 此时就会调用watcher的get方法获取旧值，因而就会触发这个get
                // 因为代码中获取值的操作很多，为了保证watcher不被重复添加，所以watcher类里面
                //获取旧值并保存后立即Dep.target = null;
                // 并且设置了下面的短路操作，有Dep.target才进行添加watcher
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set(newValue){ //当给data属性中设置值的时候，更改获取的属性的值
                if(newValue !== value){
                    // 性能优化，不一样的时候才重新渲染页面，如果是引用类型需要对引用类型重新来一次劫持
                    that.observer(newValue);
                    value = newValue;
                    dep.notify(); //通知所有人数据更新了
                }
            }
        })
    }
}

/**
 * 一个消息订阅器
 */
class Dep{
    constructor(){
        //订阅的数组
        this.subs = [];
    }
    addSub(watcher){
        this.subs.push(watcher);
    }
    notify(){
        this.subs.forEach(watcher => watcher.update());
    }
}