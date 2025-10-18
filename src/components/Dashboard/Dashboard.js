import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { travelPlans } from '../../lib/supabase';
// import TestConnection from '../TestConnection';
// import TestUserStatus from '../TestUserStatus';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [userTravelPlans, setUserTravelPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTravelPlans = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const { data, error } = await travelPlans.getByUser(user.id);
          if (error) {
            // console.error('Error fetching travel plans:', error);
          } else {
            setUserTravelPlans(data || []);
          }
        } catch (err) {
          // console.error('Error fetching travel plans:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTravelPlans();
  }, [user]);

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  const handleCreatePlan = () => {
    // 这里将来会跳转到创建旅行计划的页面
    alert('创建旅行计划功能即将推出！');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🌍 AI旅行规划师</h1>
            <p>欢迎回来，{user?.name}！</p>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="logout-button">
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>我的旅行计划</h2>
            <p>管理您的旅行计划，开始规划下一次精彩旅程</p>
            <button onClick={handleCreatePlan} className="create-plan-button">
              ✈️ 创建新计划
            </button>
          </div>

          <div className="plans-section">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>加载旅行计划中...</p>
                </div>
              </div>
            ) : userTravelPlans.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗺️</div>
                <h3>还没有旅行计划</h3>
                <p>创建您的第一个旅行计划，开始探索世界吧！</p>
                <button onClick={handleCreatePlan} className="create-first-plan-button">
                  创建第一个计划
                </button>
              </div>
            ) : (
              <div className="plans-grid">
                {userTravelPlans.map((plan) => (
                  <div key={plan.id} className="plan-card">
                    <div className="plan-header">
                      <h3>{plan.destination}</h3>
                      <span className="plan-status">{plan.status}</span>
                    </div>
                    <div className="plan-details">
                      <p><strong>日期：</strong>{formatDate(plan.start_date)} - {formatDate(plan.end_date)}</p>
                      <p><strong>预算：</strong>¥{plan.budget}</p>
                      <p><strong>人数：</strong>{plan.travelers}人</p>
                    </div>
                    <div className="plan-actions">
                      <button className="view-button">查看详情</button>
                      <button className="edit-button">编辑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="stats-section">
            {/* <TestConnection />
            <TestUserStatus /> */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>{userTravelPlans.length}</h3>
                  <p>旅行计划</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🌍</div>
                <div className="stat-content">
                  <h3>{new Set(userTravelPlans.map(p => p.destination)).size}</h3>
                  <p>目的地</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>¥{userTravelPlans.reduce((sum, plan) => sum + (plan.budget || 0), 0)}</h3>
                  <p>总预算</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{userTravelPlans.reduce((sum, plan) => sum + (plan.travelers || 0), 0)}</h3>
                  <p>总出行人数</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
