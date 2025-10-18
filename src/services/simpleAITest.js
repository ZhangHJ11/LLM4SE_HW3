import OpenAI from 'openai';
import { aiConfig } from '../config/ai';

// 简单的AI连接测试
export const testAIConnection = async () => {
  try {
    console.log('🧪 开始简单AI连接测试...');
    console.log('配置信息:', {
      baseURL: aiConfig.baseURL,
      model: aiConfig.model,
      hasApiKey: !!aiConfig.apiKey,
      apiKeyLength: aiConfig.apiKey?.length
    });

    const openai = new OpenAI({
      apiKey: aiConfig.apiKey,
      baseURL: aiConfig.baseURL,
      dangerouslyAllowBrowser: true,
    });

    console.log('🌐 发送简单测试请求...');
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: '你好，请简单回复"测试成功"'
        }
      ],
      model: aiConfig.model,
      max_tokens: 100
    });

    console.log('✅ 收到响应:', completion);
    
    return {
      success: true,
      response: completion.choices[0]?.message?.content,
      fullResponse: completion
    };
  } catch (error) {
    console.error('❌ AI连接测试失败:', error);
    return {
      success: false,
      error: error.message,
      errorDetails: {
        status: error.status,
        code: error.code,
        type: error.type,
        stack: error.stack
      }
    };
  }
};
