import React, { useState } from 'react';
import { travelPlans } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import TravelExpenseTracker from './TravelExpenseTracker';
import TravelMap from './TravelMap';
import './TravelPlanner.css';

const TravelPlanDetails = ({ plan, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState(plan.status);
  const [currentStatus, setCurrentStatus] = useState(plan.status);
  const navigate = useNavigate();

  const handleStatusUpdate = async () => {
    if (newStatus === currentStatus) return;

    setLoading(true);
    setError('');

    try {
      const { data, error } = await travelPlans.update(plan.id, { status: newStatus });
      
      if (error) {
        setError('更新状态失败: ' + error.message);
      } else {
        onUpdate && onUpdate(data[0]); // Supabase update returns array
        // Update local state to reflect the new status
        setCurrentStatus(newStatus);
        alert('状态更新成功！');
      }
    } catch (err) {
      setError('更新状态时发生错误');
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm('确定要删除这个旅行计划吗？此操作无法撤销。')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await travelPlans.delete(plan.id);
      
      if (error) {
        setError('删除计划失败: ' + error.message);
      } else {
        onUpdate && onUpdate({ ...plan, deleted: true });
        alert('计划删除成功！');
        onClose();
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError('删除计划时发生错误');
      console.error('Delete plan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return '#ed8936';
      case 'confirmed': return '#4299e1';
      case 'in_progress': return '#48bb78';
      case 'completed': return '#38a169';
      case 'cancelled': return '#e53e3e';
      default: return '#718096';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return '规划中';
      case 'confirmed': return '已确认';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const planDetails = plan.plan_details || {};

  return (
    <div className="travel-planner-container">
      <div className="travel-planner-card">
        <div className="planner-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>📋 旅行计划详情</h1>
              <p>{plan.destination} - {planDetails.overview?.title || 'AI生成的旅行计划'}</p>
            </div>
            <button onClick={onClose} className="close-button">
              ✕ 关闭
            </button>
          </div>
        </div>

        {/* 状态管理 */}
        <div className="status-section">
          <h3>📊 计划状态</h3>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '600' }}>当前状态：</span>
              <span 
                style={{ 
                  background: getStatusColor(currentStatus),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                {getStatusText(currentStatus)}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '600' }}>更新为：</span>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              >
                <option value="planning">规划中</option>
                <option value="confirmed">已确认</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
              
              <button 
                onClick={handleStatusUpdate}
                disabled={loading || newStatus === currentStatus}
                style={{
                  padding: '6px 16px',
                  background: newStatus === currentStatus ? '#ccc' : '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  cursor: newStatus === currentStatus ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '更新中...' : '更新状态'}
              </button>
              <button 
                onClick={handleDeletePlan}
                disabled={loading}
                style={{
                  padding: '6px 16px',
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginLeft: '10px'
                }}
              >
                {loading ? '删除中...' : '删除计划'}
              </button>
            </div>
          </div>
          
          {error && (
            <div style={{ 
              background: '#fed7d7', 
              color: '#c53030', 
              padding: '10px', 
              borderRadius: '6px', 
              marginTop: '10px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* 基本信息 */}
        <div className="plan-overview">
          <h3>📋 基本信息</h3>
          <div className="overview-grid">
            <div className="overview-item">
              <span className="label">目的地：</span>
              <span className="value">{plan.destination}</span>
            </div>
            <div className="overview-item">
              <span className="label">出发日期：</span>
              <span className="value">{formatDate(plan.start_date)}</span>
            </div>
            <div className="overview-item">
              <span className="label">结束日期：</span>
              <span className="value">{formatDate(plan.end_date)}</span>
            </div>
            <div className="overview-item">
              <span className="label">旅行天数：</span>
              <span className="value">{planDetails.overview?.totalDays || '未知'}天</span>
            </div>
            <div className="overview-item">
              <span className="label">预算：</span>
              <span className="value">¥{plan.budget}</span>
            </div>
            <div className="overview-item">
              <span className="label">人数：</span>
              <span className="value">{plan.travelers}人</span>
            </div>
          </div>
          
          {plan.preferences && (
            <div style={{ marginTop: '20px' }}>
              <h4>旅行偏好：</h4>
              <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{plan.preferences}</p>
            </div>
          )}
          
          {plan.special_needs && (
            <div style={{ marginTop: '15px' }}>
              <h4>特殊需求：</h4>
              <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{plan.special_needs}</p>
            </div>
          )}
        </div>

        {/* AI生成的计划详情 */}
        {planDetails.overview?.summary && (
          <div className="plan-summary">
            <h3>🎯 行程概览</h3>
            <p>{planDetails.overview.summary}</p>
          </div>
        )}

        {/* 每日行程 */}
        {planDetails.dailyPlans && planDetails.dailyPlans.length > 0 && (
          <div className="daily-plans">
            <h3>🗓️ 每日行程安排</h3>
            {planDetails.dailyPlans.map((day, index) => (
              <div key={index} className="day-plan">
                <h4>第{day.day}天 - {day.title}</h4>
                {day.activities && day.activities.length > 0 && (
                  <div className="activities">
                    <h5>📅 活动安排</h5>
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="activity">
                        <div className="activity-time">{activity.time}</div>
                        <div className="activity-content">
                          <div className="activity-title">{activity.activity}</div>
                          <div className="activity-location">📍 {activity.location}</div>
                          {activity.description && (
                            <div className="activity-description">{activity.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 推荐清单 */}
        {planDetails.recommendations && (
          <div className="recommendations">
            <h3>🌟 推荐清单</h3>
            
            {planDetails.recommendations.attractions && planDetails.recommendations.attractions.length > 0 && (
              <div className="recommendation-section">
                <h4>🏛️ 必游景点</h4>
                <div className="recommendation-grid">
                  {planDetails.recommendations.attractions.map((attraction, index) => (
                    <div key={index} className="recommendation-item">
                      <h5>{attraction.name}</h5>
                      <p>{attraction.description}</p>
                      <div className="recommendation-meta">
                        <span>📍 {attraction.location}</span>
                        {attraction.ticketPrice && <span>💰 {attraction.ticketPrice}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {planDetails.recommendations.restaurants && planDetails.recommendations.restaurants.length > 0 && (
              <div className="recommendation-section">
                <h4>🍽️ 美食推荐</h4>
                <div className="recommendation-grid">
                  {planDetails.recommendations.restaurants.map((restaurant, index) => (
                    <div key={index} className="recommendation-item">
                      <h5>{restaurant.name}</h5>
                      <p>{restaurant.description}</p>
                      <div className="recommendation-meta">
                        <span>📍 {restaurant.location}</span>
                        <span>🍴 {restaurant.cuisine}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {planDetails.recommendations.accommodations && planDetails.recommendations.accommodations.length > 0 && (
              <div className="recommendation-section">
                <h4>🏨 住宿推荐</h4>
                <div className="recommendation-grid">
                  {planDetails.recommendations.accommodations.map((accommodation, index) => (
                    <div key={index} className="recommendation-item">
                      <h5>{accommodation.name}</h5>
                      <p>{accommodation.description}</p>
                      <div className="recommendation-meta">
                        <span>📍 {accommodation.location}</span>
                        <span>🏨 {accommodation.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 预算分配 */}
        {planDetails.budget && (
          <div className="budget-section">
            <h3>💰 预算分配</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {Object.entries(planDetails.budget.breakdown || {}).map(([category, amount]) => (
                <div key={category} style={{ 
                  background: '#f7fafc', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '5px' }}>
                    {category === 'accommodation' ? '住宿' :
                     category === 'transportation' ? '交通' :
                     category === 'meals' ? '餐饮' :
                     category === 'attractions' ? '景点' :
                     category === 'shopping' ? '购物' :
                     category === 'miscellaneous' ? '其他' : category}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#667eea' }}>
                    ¥{amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 实用建议 */}
        {planDetails.tips && planDetails.tips.length > 0 && (
          <div className="travel-tips">
            <h3>💡 实用建议</h3>
            <ul>
              {planDetails.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 创建时间 */}
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          background: '#f7fafc', 
          borderRadius: '8px',
          border: '2px solid #e2e8f0'
        }}>
          <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0' }}>
            <strong>创建时间：</strong>{formatDate(plan.created_at)}
            {plan.updated_at && plan.updated_at !== plan.created_at && (
              <span> | <strong>更新时间：</strong>{formatDate(plan.updated_at)}</span>
            )}
          </p>
        </div>

        {/* 旅行记账功能 */}
        <TravelExpenseTracker 
          planId={plan.id} 
          planDetails={{
            budget: plan.budget,
            destination: plan.destination,
            startDate: plan.start_date,
            endDate: plan.end_date
          }}
        />

        {/* 路线规划地图 */}
        <TravelMap planDetails={planDetails} />
      </div>
    </div>
  );
};

export default TravelPlanDetails;
