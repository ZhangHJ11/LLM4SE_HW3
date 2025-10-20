// Supabase配置
export const supabaseConfig = {
  url: 'https://bvpeqfvlkqsckkmkuesf.supabase.co',
  anonKey: process.env.SUPABASE_KEY || '' // 使用环境变量，本地开发时需要设置环境变量
};

// 使用说明：
// 1. 在Supabase控制台获取你的项目URL和匿名密钥
// 2. 设置环境变量 SUPABASE_KEY 为你的实际Supabase匿名密钥
// 3. 或者创建.env文件并设置SUPABASE_KEY环境变量