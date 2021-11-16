# blue-feedback

> 一个轻量的用户反馈UI插件。

+ **智能客服**：跳转链接，用于打开客服会话。
+ **问题报错**：提交各种系统异常（bug）的描述以及图片说明（可选）。
+ **意见反馈**：提交用户意见（feature）以及图片说明（可选）。

<img src="https://github.com/anyblue/blue-feedback/blob/main/example/preview.png" alt="预览" style="zoom:70%;" />



## Install
```shell
npm install blue-feedback --save
```


## Demo
```javascript
const feedback = new Feedback({
  option: [
    {
      type: 'modal',
      title: '问题报错',
      img: {
        label: '问题图片',
        count: 4,
        itemSize: 2,
      },
      text: {
        label: '问题描述',
        placeholder: '请输入问题描述以及正确描述',
        maxLength: 2000,
      },
    }
  ],
  async send (type, formData) {
    formData.append('type', type);
    await sendApi(formData); // 提交请求函数
  }
});
```


## API
### 配置项

| 名称            | 类型                                                         | 必选 | 说明                                                         |
| --------------- | ------------------------------------------------------------ | ---- | ------------------------------------------------------------ |
| ```helperUrl``` | string                                                       | 否   | 需要『智能客服』时，传入跳转 url                             |
| ```toast```     | (e: Error) => string\|false\|void                            | 否   | 用于定制toast，返回```false```禁止默认toast；返回```void```使用默认toast行为；返回```string```修改toast信息 |
| ```send```      | (*type*: 'bug'\|'feature', *data*: *FormData*): *Promise*<*any*> | 否   | 提交函数                                                     |
| option          | Array<Link\|Modal>                                           | 是   | 菜单配置项                                                   |

+ **send.args[0] type**：触发提交的窗口，『问题报错』为 ```'bug'```，『意见反馈』为 ```'feature'```
+ **send.args[0] data**：提交内容的FormData

| 名称                | 类型   | 说明               |
| ------------------- | ------ | ------------------ |
| ```adviceContent``` | string | 文本描述           |
| ```files```         | File   | 【可选】多图片上传 |

### option
#### option.Link[type="link"]
+ **title**：必填，页签标题
+ **url**：必填，页签跳转地址
#### option.Modal[type="modal"]
+ **title**：必填，页签标题
+ **value**：默认值同```title```，对应 send.args[0] 
+ **img**：可选，上传图片配置，为```true```时，应用默认值
  + **默认值**：{label: '上传图片', count: 4, itemSize: 2}
  + **label**：表单文案
  + **count**：图片个数限制
  + **itemSize**：单个图片的大小限制（单位：MB）
+ **text**：默认值{label: '文字描述'}，文本框配置
  + **label**：表单文案
  + **placeholder**：文本框提示文案
  + **maxLength**：最长字数限制

### 实例方法
+ **el**：插件的根DOM节点

### 实例方法
+ **unmount**：用于卸载插件
#### 自定义异常
+ **StateError**：上传图片解析失败
+ **SizeError**：单个图片大小超过上限
+ **FileTypeError**：上传非图片类型
+ **CountError**：图片数量超过上限
+ **OverflowError**：文字描述超过长度限制
+ ```send```函数产生的异常

## History