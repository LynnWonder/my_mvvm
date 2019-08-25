/**
 * vue对外暴露了一个vue构造函数，可以在里面传进去作用域el(dom元素)，或者说是vue实例的挂载目标
 * 会传进去data模版绑定数据
 */
class MVVM{
    constructor(options){
        //首先，先把可用的东西挂载在实例上
        this.$el = options.el;
        this.$data = options.data;
        //然后，判断如果有要编译的模版再进行编译
        if(this.$el){
            //数据劫持，就是把对想观察的所有属性 改成 get 和 set 方法
            new Observer(this.$data);
            //用 元素 和 数据 进行编译
            new Compile(this.$el,this);
        }
    }
}