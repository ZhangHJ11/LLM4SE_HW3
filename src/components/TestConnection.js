import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const TestConnection = () => {
  const [status, setStatus] = useState('未测试');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('测试中...');
    
    try {
      // 测试Supabase连接
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        setStatus(`连接失败: ${error.message}`);
      } else {
        setStatus('✅ Supabase连接成功！');
      }
    } catch (err) {
      setStatus(`连接错误: ${err.message}`);
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
      textAlign: 'center'
    }}>
      <h3>Supabase连接测试</h3>
      <p>状态: {status}</p>
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '测试中...' : '测试连接'}
      </button>
    </div>
  );
};

export default TestConnection;
