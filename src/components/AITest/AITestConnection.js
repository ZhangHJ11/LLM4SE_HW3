import React, { useState } from 'react';
import { generateTravelPlan } from '../../services/aiTravelPlanner';
import { testAIConnection } from '../../services/simpleAITest';

const AITestConnection = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 开始测试AI连接...');
      
      // 先进行简单连接测试
      const simpleTest = await testAIConnection();
      
      if (simpleTest.success) {
        setResult({
          success: true,
          message: 'AI连接测试成功！',
          data: simpleTest.response,
          fullResponse: simpleTest.fullResponse
        });
      } else {
        setError({
          message: simpleTest.error,
          details: simpleTest.errorDetails
        });
      }
    } catch (err) {
      console.error('测试失败:', err);
      setError({
        message: err.message,
        details: err
      });
    } finally {
      setLoading(false);
    }
  };

  const testFullTravelPlan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 开始完整旅行规划测试...');
      
      // 使用简单的测试数据
      const testRequest = {
        destination: '北京',
        days: '3',
        budget: '5000',
        travelers: '2',
        preferences: '喜欢历史文化',
        specialNeeds: '无'
      };

      console.log('📤 发送测试请求:', testRequest);
      
      const response = await generateTravelPlan(testRequest);
      
      console.log('📥 收到响应:', response);
      
      if (response.success) {
        setResult({
          success: true,
          message: '完整旅行规划测试成功！',
          data: response.data
        });
      } else {
        setError({
          message: response.error,
          details: response.errorDetails
        });
      }
    } catch (err) {
      console.error('测试失败:', err);
      setError({
        message: err.message,
        details: err
      });
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
      <h3>🧪 AI连接测试工具</h3>
      <p>点击按钮测试火山引擎AI连接是否正常</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={handleTestConnection}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {loading ? '🔄 测试中...' : '🚀 简单连接测试'}
        </button>
        
        <button 
          onClick={testFullTravelPlan}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#ccc' : '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {loading ? '🔄 测试中...' : '🎯 完整功能测试'}
        </button>
      </div>

      {error && (
        <div style={{ 
          background: '#fed7d7', 
          color: '#c53030', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h4>❌ 测试失败</h4>
          <p><strong>错误信息:</strong> {error.message}</p>
          {error.details && (
            <div>
              <p><strong>错误详情:</strong></p>
              <pre style={{ 
                background: '#f7fafc', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '0.9rem',
                overflow: 'auto'
              }}>
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {result && (
        <div style={{ 
          background: '#c6f6d5', 
          color: '#22543d', 
          padding: '15px', 
          borderRadius: '8px'
        }}>
          <h4>✅ 测试成功</h4>
          <p>{result.message}</p>
          {result.data && (
            <div>
              <p><strong>AI响应预览:</strong></p>
              <div style={{ 
                background: '#f7fafc', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '0.9rem',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {typeof result.data === 'string' ? 
                  result.data.substring(0, 500) + '...' : 
                  JSON.stringify(result.data, null, 2).substring(0, 500) + '...'
                }
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#e6fffa', 
        borderRadius: '8px',
        border: '2px solid #38b2ac'
      }}>
        <h4>🔍 排查步骤</h4>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>检查浏览器控制台的详细日志</li>
          <li>确认API密钥是否正确配置</li>
          <li>检查火山引擎账户是否有足够额度</li>
          <li>确认网络连接是否正常</li>
          <li>检查API密钥是否有正确的权限</li>
        </ol>
      </div>
    </div>
  );
};

export default AITestConnection;
