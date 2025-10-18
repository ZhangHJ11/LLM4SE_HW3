import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../config/supabase'

// 创建Supabase客户端
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// 认证相关的方法
export const auth = {
  // 用户注册
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // 额外的用户数据，如姓名等
      }
    })
    return { data, error }
  },

  // 用户登录
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // 用户登出
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 获取当前会话
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 监听认证状态变化
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 用户配置文件相关的方法
export const profiles = {
  // 创建用户配置文件
  create: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }])
    return { data, error }
  },

  // 获取用户配置文件
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // 更新用户配置文件
  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    return { data, error }
  }
}

// 旅行计划相关的方法
export const travelPlans = {
  // 创建旅行计划
  create: async (planData) => {
    const { data, error } = await supabase
      .from('travel_plans')
      .insert([planData])
      .select()
    return { data, error }
  },

  // 获取用户的所有旅行计划
  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 获取单个旅行计划详情
  getById: async (planId) => {
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .single()
    return { data, error }
  },

  // 更新旅行计划
  update: async (planId, updates) => {
    const { data, error } = await supabase
      .from('travel_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', planId)
      .select()
    return { data, error }
  },

  // 删除旅行计划
  delete: async (planId) => {
    const { data, error } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', planId)
    return { data, error }
  },

  // 获取AI生成的旅行计划
  getAIGenerated: async (userId) => {
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('ai_generated', true)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// 旅行计划评论相关的方法
export const planComments = {
  // 添加评论
  create: async (commentData) => {
    const { data, error } = await supabase
      .from('travel_plan_comments')
      .insert([commentData])
      .select()
    return { data, error }
  },

  // 获取计划的评论
  getByPlan: async (planId) => {
    const { data, error } = await supabase
      .from('travel_plan_comments')
      .select(`
        *,
        profiles:user_id (name, email)
      `)
      .eq('plan_id', planId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 删除评论
  delete: async (commentId) => {
    const { data, error } = await supabase
      .from('travel_plan_comments')
      .delete()
      .eq('id', commentId)
    return { data, error }
  }
}

// 旅行计划收藏相关的方法
export const planFavorites = {
  // 添加收藏
  add: async (planId, userId) => {
    const { data, error } = await supabase
      .from('travel_plan_favorites')
      .insert([{ plan_id: planId, user_id: userId }])
    return { data, error }
  },

  // 取消收藏
  remove: async (planId, userId) => {
    const { data, error } = await supabase
      .from('travel_plan_favorites')
      .delete()
      .eq('plan_id', planId)
      .eq('user_id', userId)
    return { data, error }
  },

  // 检查是否已收藏
  isFavorited: async (planId, userId) => {
    const { data, error } = await supabase
      .from('travel_plan_favorites')
      .select('id')
      .eq('plan_id', planId)
      .eq('user_id', userId)
      .single()
    return { data: data !== null, error }
  },

  // 获取用户的收藏列表
  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('travel_plan_favorites')
      .select(`
        *,
        travel_plans (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

export default supabase
