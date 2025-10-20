import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { travelPlans } from '../../lib/supabase';
import TravelPlanForm from '../TravelPlanner/TravelPlanForm';
import TravelPlanDetails from '../TravelPlanner/TravelPlanDetails';
import UserPreferences from '../UserPreferences/UserPreferences';
// import AITestConnection from '../AITest/AITestConnection';
// import TestConnection from '../TestConnection';
// import TestUserStatus from '../TestUserStatus';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [userTravelPlans, setUserTravelPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTravelPlanner, setShowTravelPlanner] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTravelPlans();
  }, [user]);

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  const handleCreatePlan = () => {
    setShowTravelPlanner(true);
  };

  const handleShowPreferences = () => {
    setShowPreferences(true);
  };

  const handleClosePreferences = () => {
    setShowPreferences(false);
  };

  const handlePlanCreated = (newPlan) => {
    // 刷新旅行计划列表
    fetchTravelPlans();
    setShowTravelPlanner(false);
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCloseDetails = () => {
    setSelectedPlan(null);
  };

  const handlePlanUpdate = (updatedPlan) => {
    // 更新本地状态
    setUserTravelPlans(prev => 
      prev.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
    );
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
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

  // 如果显示偏好设置，渲染偏好设置组件
  if (showPreferences) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1>🌍 AI旅行规划师</h1>
              <p>欢迎回来，{user?.name}！</p>
            </div>
            <div className="header-right">
              <button onClick={handleClosePreferences} className="back-button">
                ← 返回仪表板
              </button>
              <button onClick={handleLogout} className="logout-button">
                退出登录
              </button>
            </div>
          </div>
        </header>
        <UserPreferences user={user} onClose={handleClosePreferences} />
      </div>
    );
  }

  // 如果显示旅行规划器，渲染规划器组件
  if (showTravelPlanner) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1>🌍 AI旅行规划师</h1>
              <p>欢迎回来，{user?.name}！</p>
            </div>
            <div className="header-right">
              <button onClick={() => setShowTravelPlanner(false)} className="back-button">
                ← 返回仪表板
              </button>
              <button onClick={handleLogout} className="logout-button">
                退出登录
              </button>
            </div>
          </div>
        </header>
        <TravelPlanForm user={user} onPlanCreated={handlePlanCreated} />
      </div>
    );
  }

  // 如果显示计划详情，渲染详情组件
  if (selectedPlan) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1>🌍 AI旅行规划师</h1>
              <p>欢迎回来，{user?.name}！</p>
            </div>
            <div className="header-right">
              <button onClick={handleCloseDetails} className="back-button">
                ← 返回仪表板
              </button>
              <button onClick={handleLogout} className="logout-button">
                退出登录
              </button>
            </div>
          </div>
        </header>
        <TravelPlanDetails 
          plan={selectedPlan} 
          onClose={handleCloseDetails} 
          onUpdate={handlePlanUpdate}
        />
      </div>
    );
  }

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
            <div className="welcome-actions">
              <button onClick={handleCreatePlan} className="create-plan-button">
                ✈️ 创建新计划
              </button>
              <button onClick={handleShowPreferences} className="preferences-button">
                ⚙️ 偏好设置
              </button>
            </div>
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
                       <span 
                         className="plan-status"
                         style={{ 
                           background: getStatusColor(plan.status),
                           color: 'white'
                         }}
                       >
                         {getStatusText(plan.status)}
                       </span>
                     </div>
                     <div className="plan-details">
                       <p><strong>日期：</strong>{formatDate(plan.start_date)} - {formatDate(plan.end_date)}</p>
                       <p><strong>预算：</strong>¥{plan.budget}</p>
                       <p><strong>人数：</strong>{plan.travelers}人</p>
                       {plan.preferences && (
                         <p><strong>偏好：</strong>{plan.preferences.substring(0, 50)}{plan.preferences.length > 50 ? '...' : ''}</p>
                       )}
                     </div>
                     <div className="plan-actions">
                       <button 
                         className="view-button"
                         onClick={() => handleViewPlan(plan)}
                       >
                         查看详情
                       </button>
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>

          <div className="stats-section">
            {/* <AITestConnection />
            <TestConnection />
            <TestUserStatus /> */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>{userTravelPlans.length}</h3>
                  <p>总计划数</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>{userTravelPlans.filter(p => p.status === 'planning').length}</h3>
                  <p>规划中</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{userTravelPlans.filter(p => p.status === 'completed').length}</h3>
                  <p>已完成</p>
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
