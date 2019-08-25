class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        //获取更新之前的值
        this.value = this.get();
    }
    get(){
        // 将当前的watcher添加到Dep类的静态属性上去
        /**  为什么？
         * 在observer.js里面解释
          */
        Dep.target = this;
        let value =  CompileUtil.getVal(this.vm,this.expr);
        // 清空Dep上的watcher防止重复添加
        Dep.target = null;
        return value;
    }
    //对外暴露的方法 在Dep.notify中被循环调用
    update(){
        let newValue = CompileUtil.getVal(this.vm,this.expr);
        let oldValue = this.value;
        if(newValue !== oldValue){
            this.cb(newValue); //调用watch的callback

        }
    }
}