import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, profiles } from '../../lib/supabase';
import './Auth.css';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 验证密码匹配
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    // 验证密码长度
    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      setLoading(false);
      return;
    }

    try {
      // 使用Supabase进行注册
      const { data, error } = await auth.signUp(
        formData.email, 
        formData.password, 
        { name: formData.name }
      );
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // 注册成功，创建用户配置文件
        const profileData = {
          name: formData.name,
          email: formData.email,
          created_at: new Date().toISOString()
        };

        const { error: profileError } = await profiles.create(data.user.id, profileData);
        
        if (profileError) {
          // console.error('Profile creation error:', profileError);
        }

        // 创建用户配置文件对象
        const userProfile = {
          id: data.user.id,
          email: data.user.email,
          name: formData.name,
          created_at: data.user.created_at
        };

        onLogin(userProfile);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('注册失败，请重试');
      // console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🌍 AI旅行规划师</h1>
          <h2>创建账户</h2>
          <p>开始您的智能旅行规划之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="请输入您的姓名"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">邮箱地址</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="请输入您的邮箱"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="请输入密码（至少6位）"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="请再次输入密码"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '注册中...' : '创建账户'}
          </button>
        </form>

        <div className="auth-footer">
          <p>已有账户？ <Link to="/login">立即登录</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
