/**
 * el就是我们的dom元素，vm是mvvm实例，之所以传进来mvvm实例是因为可以更方便的获取mvvm上的属性：
 * this.$el = options.el;
 * this.$data = options.data;
 */
class Compile{
    constructor(el,vm){
        //el可能是 #app or dom，所以要进行判断
        this.el = this.isElementNode(el)?el:document.querySelector(el);
        this.vm = vm;
        if(this.el){
            //如果这个元素能获取到，我们才开始编译
            //1.先把这些真实的DOM移入到内存中 fragment
            //2、编译 =》 提前想要的元素元素节点 v-model 和文本节点 {{}}
            //3、把编译好的 fragment 在塞回到页面里去

            //1.先把这些真实的DOM移入到内存中 fragment
            let fragment  = this.node2fragment(this.el);
            //2、编译 =》 提前想要的元素元素节点 v-model 和文本节点 {{}}
            this.compile(fragment);
            //3、把编译的fragment在塞回到页面中去
            this.el.appendChild(fragment);
        }
    }
    /*专门写一些辅助方法*/
    //判断是否是元素节点
    isElementNode(node){
        return node.nodeType === 1;
    }

    /**
     * 判断是否是模版指令
     * @param name
     * @returns {boolean}
     */
    isDirective(name){
        return name.includes('v-');
    }
    /*核心的方法*/

    //1、需要将el中的内容全部放到内存中
    node2fragment(el){
        //文档碎片 内存中的dom节点
        let fragment = document.createDocumentFragment();
        let firstChild;
        // 循环取出根节点中的节点放入文档碎片
        while(firstChild = el.firstChild){
            fragment.appendChild(firstChild);
        }
        return fragment; //内存中的节点
    }
    //2、编译 =》 提前想要的元素元素节点 v-model 和文本节点 {{}}
    /**
     * 对文档碎片进行编译
     * @param fragment
     */
    compile(fragment){
        //需要递归
        let childNodes = fragment.childNodes;
        //
        Array.from(childNodes).forEach(node => {
            if(this.isElementNode(node)){
                //是元素节点，还需要深入的检查
                //这里需要编译元素
                this.compileElement(node);//编译 带 v-model 的元素
                this.compile(node);
            }else{
                //文本节点
                //这里需要编译文本
                // console.info('text===>',node);
                this.compileText(node);
            }
        });
    }

    /**
     * 编译模版指令
     * @param node
     */
    compileElement(node){
        //带v-model
        let attrs = node.attributes;//取出当前节点的属性
        Array.from(attrs).forEach(attr => {
            //判断属性名字是不是包含v-
            console.log(attr.name);
            let attrName = attr.name;
            if(this.isDirective(attrName)){
                //取到对应的值放到节点中
                let expr = attr.value;
                //解构负值，将v-model中的model截取处理
                let [,type] = attrName.split('-');
                // console.log(type);
                //node this.vm.$data expr v-model v-text v-html
                //todo ...
                CompileUtil[type](node,this.vm,expr);
            }
        })
    }

    /**
     * 编译文本
     * @param node
     */
    compileText(node){
        //带{{}}
        let expr = node.textContent;//取文本中的内容
        // 正则默认是贪婪的，防止第一个{和最后一个}进行匹配，所以要进行非贪婪匹配
        let reg = /\{\{([^}]+)\}\}/g; //{{a}}、{{b}}、{{c}}
        if(reg.test(expr)){
            // node this.vm.$data text
            //todo ...
            CompileUtil['text'](node,this.vm,expr);
        }
    }
}

/**
 * 这边只实现了v-model和{{}}对应的方法
 * @type {{getVal(*, *): *, getTextVal(*=, *): *, model(*=, *=, *=): void, text(*=, *=, *=): void, setVal(*, *, *): *, updater: {textUpdater(*, *): void, modelUpdater(*, *): void}}}
 */
CompileUtil = {
    /**
     * 鉴于compile编译模版处理v-model和{{}}的时候其实就是将模版绑定数据中的值替换掉fragment中相应的节点中的变量
     * 因此会经常性的读取data中的值
     * 所以提取了 getVal getTextVal setVal三个方法
     */
    getVal(vm,expr){
        expr = expr.split('.');
        // 归并取值的一个过程
        return expr.reduce((prev,next) => {
            return prev[next];
        },vm.$data);
    },
    /**
     * 获取{{}}中变量在data中对应的值
     * @param vm
     * @param expr
     * @returns {void | string}
     */
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            return this.getVal(vm,arguments[1]);
        });
    },
    setVal(vm,expr,value){ //[message,a]
        expr = expr.split('.');
        //归并设置值
        return expr.reduce((prev,next,currentIndex)=>{
            if(currentIndex === expr.length-1){
                // 如果当前索引为最后一项则赋值即可
                return prev[next] = value;
            }
            return prev[next];
        },vm.$data)
    },
    text(node,vm,expr){ //文本处理
        let updateFn = this.updater['textUpdater'];
        let value = this.getTextVal(vm,expr);
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            new Watcher(vm,arguments[1],(newValue)=>{
                // 当变量重新赋值的时候，调用更新dom节点值的方法
                updateFn && updateFn(node,newValue);
            });
            return arguments[1];
        });
        updateFn && updateFn(node,value);
    },
    model(node,vm,expr){ //处理v-model指令
        // 获取赋值方法
        let updateFn = this.updater['modelUpdater'];
        //这里应该加一个监控，数据变化了 应该调用这个watch的callback
        new Watcher(vm,expr,(newValue)=>{
            //当值变化后会调用 cb，将新的值传递过去 （）
            updateFn && updateFn(node,newValue);
        });
        // 双向数据绑定 添加事件监听
        node.addEventListener('input',(e)=>{
            let newValue = e.target.value;
            this.setVal(vm,expr,newValue)
        });
        //第一次设置值，视图初始化
        updateFn && updateFn(node,this.getVal(vm,expr));

    },
    updater:{
        //文本更新
        textUpdater(node,value){
            node.textContent = value;
        },
        //输入框更新
        modelUpdater(node,value){
            node.value = value;
        }
    }
};