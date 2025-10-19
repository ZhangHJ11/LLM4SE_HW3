import React, { useState } from 'react';
import { generateTravelPlan } from '../../services/aiTravelPlanner';
import { travelPlans } from '../../lib/supabase';
import './TravelPlanner.css';
import VoiceInput from './VoiceInput';

const TravelPlanForm = ({ user, onPlanCreated }) => {
  const [formData, setFormData] = useState({
    destination: '',
    days: '',
    budget: '',
    travelers: '',
    preferences: '',
    specialNeeds: '',
    startDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [voiceText, setVoiceText] = useState(''); // 用于存储语音输入的文本

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
    setGeneratedPlan(null);

    // 验证表单
    if (!formData.destination || !formData.days || !formData.budget || !formData.travelers) {
      setError('请填写所有必填字段');
      setLoading(false);
      return;
    }

    try {
      // 调用AI生成旅行计划
      const result = await generateTravelPlan(formData);
      
      if (result.success) {
        setGeneratedPlan(result.data);
      } else {
        setError(result.error || '生成旅行计划失败');
      }
    } catch (err) {
      setError('生成旅行计划时发生错误');
      console.error('Travel plan generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan || !user) return;

    setLoading(true);
    try {
      const planData = {
        user_id: user.id,
        destination: formData.destination,
        start_date: formData.startDate || new Date().toISOString().split('T')[0],
        end_date: new Date(new Date(formData.startDate || new Date()).getTime() + (formData.days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: parseInt(formData.budget),
        travelers: parseInt(formData.travelers),
        preferences: formData.preferences,
        special_needs: formData.specialNeeds,
        status: 'planning',
        plan_details: generatedPlan,
        ai_generated: true,
        created_at: new Date().toISOString()
      };

      const { data, error } = await travelPlans.create(planData);
      
      if (error) {
        setError('保存旅行计划失败: ' + error.message);
      } else {
        setError('');
        onPlanCreated && onPlanCreated(data);
        // 重置表单
        setFormData({
          destination: '',
          days: '',
          budget: '',
          travelers: '',
          preferences: '',
          specialNeeds: '',
          startDate: ''
        });
        setGeneratedPlan(null);
        alert('旅行计划已保存！');
      }
    } catch (err) {
      setError('保存旅行计划时发生错误');
      console.error('Save plan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (text, isFinal) => {
    setVoiceText(text);
    // 实时更新文本框内容，不管是否完成
    if (text) {
      const newPreferences = formData.preferences + (formData.preferences ? ' ' : '') + text;
      setFormData({
        ...formData,
        preferences: newPreferences
      });
    }
    
    if (isFinal) {
      // 清空语音文本预览
      setVoiceText('');
    }
  };

  const handleVoiceError = (error) => {
    setError('语音识别错误: ' + error);
  };

  const handleVoiceStop = () => {
    // 录音停止时的处理
    setVoiceText('');
  };

  return (
    <div className="travel-planner-container">
      <div className="travel-planner-card">
        <div className="planner-header">
          <h1>🤖 AI智能旅行规划师</h1>
          <p>告诉我你的旅行需求，AI将为你生成个性化的旅行计划</p>
        </div>

        <form onSubmit={handleSubmit} className="planner-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="destination">目的地 *</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                placeholder="例如：日本东京、法国巴黎、泰国曼谷"
              />
            </div>

            <div className="form-group">
              <label htmlFor="days">旅行天数 *</label>
              <input
                type="number"
                id="days"
                name="days"
                value={formData.days}
                onChange={handleChange}
                required
                min="1"
                max="30"
                placeholder="例如：5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">预算 (元) *</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min="1000"
                placeholder="例如：10000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="travelers">同行人数 *</label>
              <input
                type="number"
                id="travelers"
                name="travelers"
                value={formData.travelers}
                onChange={handleChange}
                required
                min="1"
                max="20"
                placeholder="例如：2"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">出发日期</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="preferences">旅行偏好</label>
            <div className="voice-input-container">
              <textarea
                id="preferences"
                name="preferences"
                value={formData.preferences}
                onChange={handleChange}
                rows="3"
                placeholder="例如：喜欢美食和动漫，带孩子，喜欢历史文化，偏好自然风光等"
              />
              <VoiceInput 
                onResult={handleVoiceResult}
                onError={handleVoiceError}
                onStop={handleVoiceStop}
              />
              {voiceText && (
                <div className="voice-text-preview">
                  🎤 识别中: {voiceText}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="specialNeeds">特殊需求</label>
            <textarea
              id="specialNeeds"
              name="specialNeeds"
              value={formData.specialNeeds}
              onChange={handleChange}
              rows="2"
              placeholder="例如：需要无障碍设施、素食要求、语言翻译等"
            />
          </div>

          <button type="submit" className="generate-button" disabled={loading}>
            {loading ? '🤖 AI正在规划中...' : '✨ 生成旅行计划'}
          </button>
        </form>

        {generatedPlan && (
          <div className="generated-plan">
            <div className="plan-header">
              <h2>🎉 你的专属旅行计划已生成！</h2>
              <div className="plan-actions">
                <button onClick={handleSavePlan} className="save-button" disabled={loading}>
                  {loading ? '保存中...' : '💾 保存计划'}
                </button>
                <button onClick={() => setGeneratedPlan(null)} className="regenerate-button">
                  🔄 重新生成
                </button>
              </div>
            </div>

            <div className="plan-overview">
              <h3>📋 行程概览</h3>
              <div className="overview-grid">
                <div className="overview-item">
                  <span className="label">目的地：</span>
                  <span className="value">{generatedPlan.overview?.title || formData.destination}</span>
                </div>
                <div className="overview-item">
                  <span className="label">天数：</span>
                  <span className="value">{generatedPlan.overview?.totalDays || formData.days}天</span>
                </div>
                <div className="overview-item">
                  <span className="label">预算：</span>
                  <span className="value">¥{generatedPlan.overview?.estimatedCost || formData.budget}</span>
                </div>
                <div className="overview-item">
                  <span className="label">人数：</span>
                  <span className="value">{formData.travelers}人</span>
                </div>
              </div>
              {generatedPlan.overview?.summary && (
                <div className="plan-summary">
                  <p>{generatedPlan.overview.summary}</p>
                </div>
              )}
            </div>

            {generatedPlan.dailyPlans && generatedPlan.dailyPlans.length > 0 && (
              <div className="daily-plans">
                <h3>🗓️ 每日行程安排</h3>
                {generatedPlan.dailyPlans.map((day, index) => (
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

            {generatedPlan.recommendations && (
              <div className="recommendations">
                <h3>🌟 推荐清单</h3>
                {generatedPlan.recommendations.attractions && (
                  <div className="recommendation-section">
                    <h4>🏛️ 必游景点</h4>
                    <div className="recommendation-grid">
                      {generatedPlan.recommendations.attractions.map((attraction, index) => (
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

                {generatedPlan.recommendations.restaurants && (
                  <div className="recommendation-section">
                    <h4>🍽️ 美食推荐</h4>
                    <div className="recommendation-grid">
                      {generatedPlan.recommendations.restaurants.map((restaurant, index) => (
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
              </div>
            )}

            {generatedPlan.tips && generatedPlan.tips.length > 0 && (
              <div className="travel-tips">
                <h3>💡 实用建议</h3>
                <ul>
                  {generatedPlan.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelPlanForm;
