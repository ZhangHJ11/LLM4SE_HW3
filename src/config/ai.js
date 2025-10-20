// 火山引擎AI配置
export const aiConfig = {
  apiKey: process.env.DOUBAO_APIKEY || '', // 使用环境变量，本地开发时需要设置环境变量
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  model: 'doubao-seed-1-6-251015', // 豆包大模型
  reasoningEffort: 'medium'
};

// 使用说明：
// 1. 在火山引擎控制台获取你的API密钥
// 2. 设置环境变量 DOUBAO_APIKEY
// 3. 确保你的账户有足够的额度使用AI服务
// 4. 注意：API密钥会在浏览器中暴露，请确保密钥安全
// 5. 建议使用环境变量或服务器端代理来保护API密钥