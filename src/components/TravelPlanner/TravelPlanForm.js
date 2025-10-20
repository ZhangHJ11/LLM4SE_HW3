import React, { useState, useRef, useEffect } from 'react';
import { generateTravelPlan, analyzeVoiceContent } from '../../services/aiTravelPlanner';
import { travelPlans, userPreferences } from '../../lib/supabase';
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
  const [voiceText, setVoiceText] = useState(''); // 用于存储语音输入的实时文本
  const [voiceInputText, setVoiceInputText] = useState(''); // 用于存储语音输入的完整文本
  const finalVoiceTextRef = useRef(''); // 用于保存最终的语音文本
  const [isAnalyzing, setIsAnalyzing] = useState(false); // AI分析状态
  const [userPreferencesList, setUserPreferencesList] = useState([]); // 用户偏好设置列表
  const [selectedPreference, setSelectedPreference] = useState(null); // 选中的偏好设置

  // 获取用户偏好设置
  useEffect(() => {
    fetchUserPreferences();
  }, [user]);

  const fetchUserPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await userPreferences.getByUser(user.id);
      if (error) {
        console.error('获取偏好设置失败:', error);
      } else {
        setUserPreferencesList(data || []);
        // 重置选中的偏好设置，不自动选择
        setSelectedPreference(null);
      }
    } catch (err) {
      console.error('获取偏好设置时发生错误:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // 应用偏好设置到表单
  const applyPreference = (preference) => {
    if (!preference || !preference.preferences) return;
    
    const pref = preference.preferences;
    const newFormData = { ...formData };
    
    // 应用偏好设置到表单字段
    if (pref.travelStyle) {
      newFormData.preferences = pref.travelStyle;
    }
    
    if (pref.budgetRange) {
      // 从预算范围中提取数字
      const budgetMatch = pref.budgetRange.match(/(\d+)/);
      if (budgetMatch) {
        newFormData.budget = budgetMatch[1];
      }
    }
    
    if (pref.groupSize) {
      // 从出行人数中提取数字
      const groupMatch = pref.groupSize.match(/(\d+)/);
      if (groupMatch) {
        newFormData.travelers = groupMatch[1];
      }
    }
    
    // 合并特殊需求
    if (pref.specialNeeds) {
      newFormData.specialNeeds = pref.specialNeeds;
    }
    
    // 合并饮食偏好
    if (pref.foodPreferences) {
      const currentPrefs = newFormData.preferences ? newFormData.preferences + '；' : '';
      newFormData.preferences = currentPrefs + `饮食偏好：${pref.foodPreferences}`;
    }
    
    // 合并活动类型偏好
    if (pref.activityTypes && pref.activityTypes.length > 0) {
      const currentPrefs = newFormData.preferences ? newFormData.preferences + '；' : '';
      newFormData.preferences = currentPrefs + `喜欢的活动：${pref.activityTypes.join('、')}`;
    }
    
    // 合并季节偏好
    if (pref.seasonPreferences && pref.seasonPreferences.length > 0) {
      const currentPrefs = newFormData.preferences ? newFormData.preferences + '；' : '';
      newFormData.preferences = currentPrefs + `偏好季节：${pref.seasonPreferences.join('、')}`;
    }
    
    setFormData(newFormData);
    setSelectedPreference(preference);
    setError(`✅ 已应用偏好设置"${preference.name}"`);
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
      // 调用AI生成旅行计划，传递用户偏好设置
      const result = await generateTravelPlan(formData, selectedPreference);
      
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
    // 只更新预览文本，不添加到语音输入框
    setVoiceText(text);
    // 保存最终的语音文本到ref中
    if (text && text.trim()) {
      finalVoiceTextRef.current = text;
    }
  };

  const handleVoiceError = (error) => {
    setError('语音识别错误: ' + error);
  };

  const handleVoiceStop = () => {
    // 录音停止时，将预览文本添加到语音输入框
    const textToAdd = finalVoiceTextRef.current || voiceText;
    if (textToAdd && textToAdd.trim()) {
      setVoiceInputText(prev => prev + (prev ? ' ' : '') + textToAdd);
    }
    
    // 清空预览文本和ref
    setVoiceText('');
    finalVoiceTextRef.current = '';
  };

  // AI分析语音内容并填充表单
  const handleAnalyzeVoiceContent = async () => {
    if (!voiceInputText.trim()) {
      setError('请先进行语音输入');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzeVoiceContent(voiceInputText);
      
      if (result.success && result.data) {
        const analysis = result.data;
        
        // 智能填充表单字段（只填充有内容且置信度较高的字段）
        const newFormData = { ...formData };
        let filledFields = [];
        
        // 目的地（置信度 > 0.7）
        if (analysis.destination && analysis.confidence.destination > 0.7) {
          newFormData.destination = analysis.destination;
          filledFields.push('目的地');
        }
        
        // 旅行天数（置信度 > 0.7）
        if (analysis.days && analysis.confidence.days > 0.7) {
          newFormData.days = analysis.days;
          filledFields.push('旅行天数');
        }
        
        // 预算（置信度 > 0.7）
        if (analysis.budget && analysis.confidence.budget > 0.7) {
          newFormData.budget = analysis.budget;
          filledFields.push('预算');
        }
        
        // 同行人数（置信度 > 0.6）
        if (analysis.travelers && analysis.confidence.travelers > 0.6) {
          newFormData.travelers = analysis.travelers;
          filledFields.push('同行人数');
        }
        
        // 旅行偏好（置信度 > 0.5）
        if (analysis.preferences && analysis.confidence.preferences > 0.5) {
          newFormData.preferences = analysis.preferences;
          filledFields.push('旅行偏好');
        }
        
        // 出发日期（置信度 > 0.6）
        if (analysis.startDate && analysis.confidence.startDate > 0.6) {
          newFormData.startDate = analysis.startDate;
          filledFields.push('出发日期');
        }
        
        setFormData(newFormData);
        
        // 显示填充结果
        if (filledFields.length > 0) {
          setError(`✅ AI已成功填充以下字段：${filledFields.join('、')}`);
        } else {
          setError('⚠️ AI未能从语音内容中提取到足够的信息，请手动填写表单');
        }
      } else {
        setError('AI分析失败: ' + (result.error || '未知错误'));
      }
    } catch (err) {
      console.error('AI分析错误:', err);
      setError('AI分析时发生错误: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
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
          
          {/* 偏好设置快速选择区域 */}
          {userPreferencesList.length > 0 && (
            <div className="preferences-quick-select">
              <h3>⚙️ 快速应用偏好设置</h3>
              <p>选择您保存的偏好设置，快速填充表单信息</p>
              <div className="preferences-buttons">
                {userPreferencesList.map((preference) => (
                  <button
                    key={preference.id}
                    type="button"
                    className={`preference-quick-button ${selectedPreference?.id === preference.id ? 'selected' : ''}`}
                    onClick={() => applyPreference(preference)}
                  >
                    {preference.is_default && <span className="default-indicator">⭐</span>}
                    {preference.name}
                  </button>
                ))}
              </div>
              {selectedPreference && (
                <div className="selected-preference-info">
                  <p>✅ 当前应用：<strong>{selectedPreference.name}</strong></p>
                  {selectedPreference.description && (
                    <p className="preference-description">{selectedPreference.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* 语音输入区域 - 移动到表单最上面 */}
          <div className="voice-input-section">
            <h3>🎤 语音输入旅行信息</h3>
            <p>您可以通过语音输入目的地、日期、预算、同行人数和旅行偏好</p>
            <div className="voice-input-container">
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
            <div className="voice-text-display">
              <label htmlFor="voiceInputText">语音输入内容：</label>
              <textarea
                id="voiceInputText"
                value={voiceInputText}
                onChange={(e) => setVoiceInputText(e.target.value)}
                rows="3"
                placeholder="语音识别的内容将显示在这里，您也可以手动编辑..."
                className="voice-textarea"
              />
              <div className="voice-text-actions">
                <button 
                  type="button" 
                  onClick={() => setVoiceInputText('')}
                  className="clear-voice-button"
                >
                  🗑️ 清空
                </button>
                <button 
                  type="button" 
                  onClick={handleAnalyzeVoiceContent}
                  className="analyze-voice-button"
                  disabled={!voiceInputText.trim() || isAnalyzing}
                >
                  {isAnalyzing ? '🤖 AI分析中...' : '🤖 AI分析填充表单'}
                </button>
              </div>
            </div>
          </div>
          
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
            <textarea
              id="preferences"
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              rows="3"
              placeholder="例如：喜欢美食和动漫，带孩子，喜欢历史文化，偏好自然风光等"
            />
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
