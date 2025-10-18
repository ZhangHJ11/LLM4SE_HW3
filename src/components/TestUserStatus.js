import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const TestUserStatus = () => {
  const [email, setEmail] = useState('');
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkUserStatus = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      // 直接查询auth.users表
      const { data, error } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error checking user status:', error);
        setUserStatus({ error: error.message });
      } else {
        setUserStatus(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setUserStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fixUserStatus = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      // 尝试直接更新用户状态
      const { data, error } = await supabase.rpc('update_user_email_confirmed', {
        user_email: email
      });

      if (error) {
        console.error('Error fixing user status:', error);
        setUserStatus({ error: error.message });
      } else {
        setUserStatus({ success: '用户状态已更新' });
      }
    } catch (err) {
      console.error('Error:', err);
      setUserStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: 'white', 
      borderRadius: '10px', 
      margin: '20px',
      border: '2px solid #e2e8f0'
    }}>
      <h3>🔍 用户状态检查工具</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="email"
          placeholder="输入邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '10px',
            border: '2px solid #e2e8f0',
            borderRadius: '5px',
            width: '300px',
            marginRight: '10px'
          }}
        />
        <button 
          onClick={checkUserStatus}
          disabled={loading}
          style={{
            padding: '10px 15px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '检查中...' : '检查状态'}
        </button>
      </div>

      {userStatus && (
        <div style={{ 
          padding: '15px', 
          background: userStatus.error ? '#fed7d7' : '#c6f6d5',
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          {userStatus.error ? (
            <p style={{ color: '#c53030' }}>❌ {userStatus.error}</p>
          ) : userStatus.success ? (
            <p style={{ color: '#22543d' }}>✅ {userStatus.success}</p>
          ) : (
            <div>
              <h4>用户信息:</h4>
              <p><strong>ID:</strong> {userStatus.id}</p>
              <p><strong>邮箱:</strong> {userStatus.email}</p>
              <p><strong>创建时间:</strong> {userStatus.created_at}</p>
              <p><strong>邮箱确认:</strong> {userStatus.email_confirmed_at ? '✅ 已确认' : '❌ 未确认'}</p>
              <p><strong>最后登录:</strong> {userStatus.last_sign_in_at || '从未登录'}</p>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        padding: '15px', 
        background: '#e6fffa', 
        borderRadius: '5px',
        border: '2px solid #38b2ac'
      }}>
        <h4>💡 解决方案:</h4>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>在Supabase控制台的 <strong>Authentication > Users</strong> 中手动确认用户邮箱</li>
          <li>运行 <code>fix-email-confirmation.sql</code> 文件中的SQL语句</li>
          <li>删除现有用户并重新注册</li>
          <li>检查Supabase项目的邮箱确认设置</li>
        </ol>
      </div>
    </div>
  );
};

export default TestUserStatus;
