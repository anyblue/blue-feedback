# blue-feedback

> 一个轻量的用户反馈UI插件。

+ **智能客服**：跳转链接，用于打开客服会话。
+ **问题报错**：提交各种系统异常（bug）的描述以及图片说明（可选）。
+ **意见反馈**：提交用户意见（feature）以及图片说明（可选）。

<img src="https://github.com/anyblue/blue-feedback/blob/main/preview.png" alt="预览" style="zoom:70%;" />


## Feature
+ typescript环境支持


## Install
```shell
npm install blue-feedback --save
```


## Demo
```javascript
const feedback = new Feedback({
  // defaultToast: false, // 禁用内置toast
  async send (type, formData) {
    formData.append('type', type);
    await sendApi(formData); // 提交请求函数
  }
});
feedback.onerror((e) => {
  toast.error(e.message); // 使用自定义toast
});
```


## APIs
### 配置项
配置项均为**可选项**

| 名称               | 类型                                                         | 说明                                 |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ |
| ```helperUrl```    | string                                                       | 需要『智能客服』时，传入跳转 url     |
| ```defaultToast``` | boolean                                                      | 是否需要内置 toast ，默认```true```  |
| ```bugModal```     | boolean                                                      | 是否需要『问题报错』，默认```true``` |
| ```featureModal``` | boolean                                                      | 是否需要『意见反馈』，默认```true``` |
| ```send```         | (*type*: 'bug'\|'feature', *data*: *FormData*): *Promise*<*any*> | 提交函数                             |
+ **send.args[0] type**：触发提交的窗口，『问题报错』为 ```'bug'```，『意见反馈』为 ```'feature'```
+ **send.args[0] data**：提交内容的FormData

| 名称                | 类型   | 说明               |
| ------------------- | ------ | ------------------ |
| ```adviceContent``` | string | 文本描述           |
| ```files```         | File   | 【可选】多图片上传 |

### 实例方法
+ **el**：插件的根DOM节点

### 实例方法
+ **unmount**：用于卸载插件
+ **onerror**：监听插件内产生的异常，可用于对接自定义toast
#### 自定义异常
+ **StateError**：上传图片解析失败
+ **SizeError**：单个图片大小超过上限
+ **FileTypeError**：上传非图片类型
+ **OverflowError**：文字描述超过长度限制 or 图片数量超过上限
+ **ValidateError**：未填写文字描述
+ ```send```函数产生的异常


## History

