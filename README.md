# 实现一个自己的MVVM模式
数据流动图：
![image](https://img-blog.csdnimg.cn/20190826001021682.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2x5bm53b25kZXI2,size_16,color_FFFFFF,t_70)
![image](https://upload-images.jianshu.io/upload_images/9199255-aa098dd6b3a0eae4.png?imageMogr2/auto-orient/strip|imageView2/2/w/669/format/webp)
## 回顾vue实现数据双向绑定的原理
1. 利用compile解析模版指令，将模版中的变量替换成数据，然后初始化渲染视图，并将每个指令对应的节点绑定更新函数（watcher的回调函数），添加数据绑定的订阅者watcher。
2. 利用watcher存储更新前的值，并且向dep消息订阅类中自动添加自己，同时暴露update实例方法进行视图更新。
3. 利用observer给模版绑定数据进行数据劫持，这样compile实例化watcher的时候获取旧值就会触发get，此时会向dep中添加watcher，而值发生变化时触发set，此时则会触发dep.notify遍历执行watcher实例的update进行视图更新
## 实现一个Compile
### 注意点
1. 遍历解析的时候多次操作DOM节点，为了提高性能和效率，现将跟节点el转换成fragment，解析完成插回原来真实的DOM节点中。
### 知识点回顾
- Node.nodeType确定节点类型，为1表示为元素节点。[参考MDN]
- Node.textContent 获取一个节点及其后代的文本内容
## 实现一个watcher
获取更改前的值存起来，并且有一个update实例方法，当值被修改时执行实例的回调函数达到视图更新
## 实现一个observer
作用：对数据进行劫持，把data挂到mvvm实例上。

