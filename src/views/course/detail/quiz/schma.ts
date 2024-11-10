import { array, boolean, nonEmpty, number, object, optional, pipe, safeParse, string } from 'valibot'


// 定义 items 结构
const itemSchema = object({
    title: optional(string()), // 默认是可选的，但会在后面动态验证时处理
    checked: optional(boolean()),
    file: optional(string()),
});

// 定义 topic 结构（基础结构）
export const quizTopicSchema = object({
    title: pipe(string('The field is required'), nonEmpty('The field is required')), // 必填
    questionType: number('The field is required'), // 必填
    score: number('The field is required'), // 必填
    value: array(string('The field is required')), // 必填
    isImage: optional(boolean()), // 可选
    items: array(itemSchema),
});

// 动态验证 function
const validateTopic = (data: any) => {
    // 验证 questionType 为 0 或 1 时，items 中的 title 是必填项
    if ([0, 1].includes(data.questionType)) {
        for (const item of data.items) {
            if (!item.title) {

                return false;
            }
        }
    }

    return true;
};

// 包装函数，用于同时进行 schema 验证和动态验证
export const validateTopics = (topics: any[]) => {
    for (const topic of topics) {
        const parsedResult = safeParse(quizTopicSchema, topic); // 使用 safeParse 进行验证
        if (!parsedResult.success) {
            return false
        }

        // 进行动态验证
        const dynamicValidationResult = validateTopic(parsedResult.output);
        if (!dynamicValidationResult) {
            return dynamicValidationResult;
        }
    }

    return true // 所有验证通过
};