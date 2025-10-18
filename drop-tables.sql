-- 删除所有自定义表的SQL语句
-- 注意：这会删除所有数据，请谨慎使用！

-- 删除旅行计划收藏表
DROP TABLE IF EXISTS travel_plan_favorites CASCADE;

-- 删除旅行计划评论表
DROP TABLE IF EXISTS travel_plan_comments CASCADE;

-- 删除旅行计划表
DROP TABLE IF EXISTS travel_plans CASCADE;

-- 删除用户配置文件表
DROP TABLE IF EXISTS profiles CASCADE;

-- 注意：
-- 1. auth.users 表是Supabase内置的认证表，不要删除
-- 2. 使用 CASCADE 会自动删除相关的约束和索引
-- 3. 删除后需要重新运行 supabase-setup.sql 来创建新表
