import Feedback from 'src';

console.info(new Feedback({
    mode: 'expand',
    wrapClassName: 'feedback-custom',
    option: [
        {
            type: 'link',
            title: '跳转链接',
            url: 'https://www.baidu.com',
        },
        {
            type: 'modal',
            title: '问题反馈',
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
        },
        {
            type: 'modal',
            title: '平台评价',
            evaluate: true,
            img: {
                label: '评价图片',
                count: 4,
                itemSize: 2,
            },
            text: {
                label: '评价描述',
                placeholder: '请输入您的建议/反馈',
                maxLength: 2000,
                required: true,
            },
        },
    ],
}));
