-- 创建用户配置文件表（扩展auth.users表）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建旅行计划表
CREATE TABLE travel_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  budget INTEGER,
  travelers INTEGER,
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
