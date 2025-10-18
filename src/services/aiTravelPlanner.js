import OpenAI from 'openai';
import { aiConfig } from '../config/ai';

// 初始化OpenAI客户端（使用火山引擎）
const openai = new OpenAI({
  apiKey: aiConfig.apiKey,
  baseURL: aiConfig.baseURL,
  dangerouslyAllowBrowser: true, // 允许在浏览器环境中使用
});

// 旅行规划提示词模板
const createTravelPrompt = (travelRequest) => {
  return `你是一位专业的旅行规划师，请根据用户的需求生成详细的旅行计划。

用户需求：
- 目的地：${travelRequest.destination}
- 旅行天数：${travelRequest.days}天
- 预算：${travelRequest.budget}元
- 同行人数：${travelRequest.travelers}人
- 旅行偏好：${travelRequest.preferences}
- 特殊需求：${travelRequest.specialNeeds || '无'}

请生成一个详细的旅行计划，包含以下信息：

1. 行程概览
2. 每日详细行程安排
3. 推荐景点及游览时间
4. 推荐餐厅及用餐安排
5. 住宿推荐
6. 交通安排
7. 预算分配
8. 注意事项和建议

请以JSON格式返回结果，格式如下：
{
  "overview": {
    "title": "旅行计划标题",
    "summary": "行程概览",
    "totalDays": 天数,
    "estimatedCost": 预估总费用
  },
  "dailyPlans": [
    {
      "day": 1,
      "date": "日期",
      "title": "第1天标题",
      "activities": [
        {
          "time": "时间",
          "activity": "活动内容",
          "location": "地点",
          "duration": "持续时间",
          "cost": "费用",
          "description": "详细描述"
        }
      ],
      "meals": [
        {
          "type": "早餐/午餐/晚餐",
          "restaurant": "餐厅名称",
          "location": "餐厅位置",
          "cost": "费用",
          "description": "推荐理由"
        }
      ],
      "accommodation": {
        "name": "住宿名称",
        "location": "住宿位置",
        "cost": "费用",
        "description": "住宿描述"
      }
    }
  ],
  "recommendations": {
    "attractions": [
      {
        "name": "景点名称",
        "location": "位置",
        "description": "景点描述",
        "bestTime": "最佳游览时间",
        "ticketPrice": "门票价格"
      }
    ],
    "restaurants": [
      {
        "name": "餐厅名称",
        "cuisine": "菜系",
        "location": "位置",
        "priceRange": "价格区间",
        "description": "推荐理由"
      }
    ],
    "accommodations": [
      {
        "name": "住宿名称",
        "type": "住宿类型",
        "location": "位置",
        "priceRange": "价格区间",
        "description": "住宿特色"
      }
    ]
  },
  "budget": {
    "total": 总预算,
    "breakdown": {
      "accommodation": 住宿费用,
      "transportation": 交通费用,
      "meals": 餐饮费用,
      "attractions": 景点门票,
      "shopping": 购物费用,
      "miscellaneous": 其他费用
    }
  },
  "tips": [
    "实用建议1",
    "实用建议2",
    "注意事项1",
    "注意事项2"
  ]
}

请确保返回的JSON格式正确，内容详细且实用。`;
};

// 生成旅行计划
export const generateTravelPlan = async (travelRequest) => {
  try {
    console.log('🚀 开始生成旅行计划...');
    console.log('📋 请求参数:', travelRequest);
    console.log('🔑 API配置:', {
      baseURL: aiConfig.baseURL,
      model: aiConfig.model,
      hasApiKey: !!aiConfig.apiKey
    });

    const prompt = createTravelPrompt(travelRequest);
    console.log('📝 生成的提示词长度:', prompt.length);
    
    console.log('🌐 发送请求到火山引擎...');
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: aiConfig.model,
      reasoning_effort: aiConfig.reasoningEffort,
      temperature: 0.7,
      max_tokens: 4000
    });

    console.log('✅ 收到响应:', completion);
    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('AI服务未返回有效响应');
    }

    // 尝试解析JSON响应
    try {
      const travelPlan = JSON.parse(response);
      return {
        success: true,
        data: travelPlan,
        rawResponse: response
      };
    } catch (parseError) {
      // 如果JSON解析失败，返回原始文本
      return {
        success: true,
        data: {
          overview: {
            title: "AI生成的旅行计划",
            summary: response,
            totalDays: travelRequest.days,
            estimatedCost: travelRequest.budget
          },
          dailyPlans: [],
          recommendations: {},
          budget: {
            total: travelRequest.budget,
            breakdown: {}
          },
          tips: []
        },
        rawResponse: response
      };
    }
  } catch (error) {
    console.error('❌ AI旅行规划错误:', error);
    console.error('错误详情:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    
    return {
      success: false,
      error: error.message || 'AI服务调用失败',
      data: null,
      errorDetails: {
        status: error.status,
        code: error.code,
        type: error.type
      }
    };
  }
};

// 优化旅行计划
export const optimizeTravelPlan = async (originalPlan, feedback) => {
  try {
    const prompt = `请根据用户反馈优化以下旅行计划：

原始计划：
${JSON.stringify(originalPlan, null, 2)}

用户反馈：
${feedback}

请提供优化建议，并以JSON格式返回优化后的计划。`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: aiConfig.model,
      reasoning_effort: aiConfig.reasoningEffort,
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('AI服务未返回有效响应');
    }

    try {
      const optimizedPlan = JSON.parse(response);
      return {
        success: true,
        data: optimizedPlan,
        rawResponse: response
      };
    } catch (parseError) {
      return {
        success: true,
        data: originalPlan,
        rawResponse: response
      };
    }
  } catch (error) {
    console.error('AI旅行计划优化错误:', error);
    return {
      success: false,
      error: error.message || 'AI服务调用失败',
      data: null
    };
  }
};

// 获取旅行建议
export const getTravelSuggestions = async (destination, preferences) => {
  try {
    const prompt = `请为目的地"${destination}"提供旅行建议，用户偏好：${preferences}。

请以JSON格式返回：
{
  "suggestions": [
    {
      "category": "类别（如：必游景点、美食推荐、文化体验等）",
      "items": [
        {
          "name": "名称",
          "description": "描述",
          "reason": "推荐理由"
        }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: aiConfig.model,
      reasoning_effort: aiConfig.reasoningEffort,
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('AI服务未返回有效响应');
    }

    try {
      const suggestions = JSON.parse(response);
      return {
        success: true,
        data: suggestions,
        rawResponse: response
      };
    } catch (parseError) {
      return {
        success: true,
        data: { suggestions: [] },
        rawResponse: response
      };
    }
  } catch (error) {
    console.error('AI旅行建议错误:', error);
    return {
      success: false,
      error: error.message || 'AI服务调用失败',
      data: null
    };
  }
};
