import Feedback from 'src';

console.info(new Feedback({
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
        },
        {
            type: 'modal',
            title: '意见反馈',
            img: {
                label: '问题图片',
                count: 4,
                itemSize: 2,
            },
            text: {
                label: '问题描述',
                placeholder: '请输入您的建议/反馈',
                maxLength: 2000,
            },
        },
    ],
}));
