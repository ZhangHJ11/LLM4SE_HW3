import React, { useState, useEffect } from 'react';
import { userPreferences } from '../../lib/supabase';
import './UserPreferences.css';

const UserPreferences = ({ user, onClose }) => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPreference, setEditingPreference] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    preferences: {
      travelStyle: '',
      accommodationType: '',
      foodPreferences: '',
      activityTypes: [],
      budgetRange: '',
      groupSize: '',
      specialNeeds: '',
      languagePreferences: '',
      transportationPreferences: '',
      seasonPreferences: []
    }
  });

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await userPreferences.getByUser(user.id);
      if (error) {
        setError('获取偏好设置失败: ' + error.message);
      } else {
        setPreferences(data || []);
      }
    } catch (err) {
      setError('获取偏好设置时发生错误: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? 
            (checked ? [...prev.preferences[prefKey], value] : 
             prev.preferences[prefKey].filter(item => item !== value)) : 
            value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 验证表单
    if (!formData.name.trim()) {
      setError('请输入偏好设置名称');
      return;
    }

    try {
      const preferenceData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        preferences: formData.preferences,
        is_default: preferences.length === 0 // 如果是第一个偏好设置，设为默认
      };

      if (editingPreference) {
        // 更新现有偏好设置
        const { error } = await userPreferences.update(editingPreference.id, preferenceData);
        if (error) {
          setError('更新偏好设置失败: ' + error.message);
        } else {
          await fetchPreferences();
          resetForm();
        }
      } else {
        // 创建新偏好设置
        const { error } = await userPreferences.create(preferenceData);
        if (error) {
          setError('创建偏好设置失败: ' + error.message);
        } else {
          await fetchPreferences();
          resetForm();
        }
      }
    } catch (err) {
      setError('保存偏好设置时发生错误: ' + err.message);
    }
  };

  const handleEdit = (preference) => {
    setEditingPreference(preference);
    setFormData({
      name: preference.name,
      description: preference.description || '',
      preferences: preference.preferences
    });
    setShowForm(true);
  };

  const handleDelete = async (preferenceId) => {
    if (!window.confirm('确定要删除这个偏好设置吗？')) return;

    try {
      const { error } = await userPreferences.delete(preferenceId);
      if (error) {
        setError('删除偏好设置失败: ' + error.message);
      } else {
        await fetchPreferences();
      }
    } catch (err) {
      setError('删除偏好设置时发生错误: ' + err.message);
    }
  };

  const handleSetDefault = async (preferenceId) => {
    try {
      const { error } = await userPreferences.setDefault(preferenceId, user.id);
      if (error) {
        setError('设置默认偏好失败: ' + error.message);
      } else {
        await fetchPreferences();
      }
    } catch (err) {
      setError('设置默认偏好时发生错误: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      preferences: {
        travelStyle: '',
        accommodationType: '',
        foodPreferences: '',
        activityTypes: [],
        budgetRange: '',
        groupSize: '',
        specialNeeds: '',
        languagePreferences: '',
        transportationPreferences: '',
        seasonPreferences: []
      }
    });
    setEditingPreference(null);
    setShowForm(false);
  };

  const activityOptions = [
    '文化历史', '自然风光', '美食体验', '购物娱乐', '户外运动', 
    '艺术展览', '音乐演出', '海滩度假', '城市探索', '乡村体验'
  ];

  const seasonOptions = ['春季', '夏季', '秋季', '冬季'];

  return (
    <div className="user-preferences-container">
      <div className="preferences-header">
        <h2>⚙️ 我的偏好设置</h2>
        <p>管理您的旅行偏好，让AI更好地为您规划个性化行程</p>
        <button onClick={onClose} className="close-button">✕ 关闭</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="preferences-content">
        <div className="preferences-list">
          <div className="list-header">
            <h3>已保存的偏好设置</h3>
            <button 
              onClick={() => setShowForm(true)} 
              className="add-preference-button"
            >
              ➕ 新建偏好设置
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>加载偏好设置中...</p>
            </div>
          ) : preferences.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⚙️</div>
              <h4>还没有偏好设置</h4>
              <p>创建您的第一个偏好设置，让AI更好地了解您的旅行喜好</p>
              <button 
                onClick={() => setShowForm(true)} 
                className="create-first-preference-button"
              >
                创建第一个偏好设置
              </button>
            </div>
          ) : (
            <div className="preferences-grid">
              {preferences.map((preference) => (
                <div key={preference.id} className="preference-card">
                  <div className="preference-header">
                    <h4>{preference.name}</h4>
                    {preference.is_default && (
                      <span className="default-badge">默认</span>
                    )}
                  </div>
                  
                  {preference.description && (
                    <p className="preference-description">{preference.description}</p>
                  )}
                  
                  <div className="preference-details">
                    {preference.preferences.travelStyle && (
                      <div className="preference-item">
                        <span className="label">旅行风格：</span>
                        <span className="value">{preference.preferences.travelStyle}</span>
                      </div>
                    )}
                    {preference.preferences.accommodationType && (
                      <div className="preference-item">
                        <span className="label">住宿类型：</span>
                        <span className="value">{preference.preferences.accommodationType}</span>
                      </div>
                    )}
                    {preference.preferences.budgetRange && (
                      <div className="preference-item">
                        <span className="label">预算范围：</span>
                        <span className="value">{preference.preferences.budgetRange}</span>
                      </div>
                    )}
                    {preference.preferences.activityTypes && preference.preferences.activityTypes.length > 0 && (
                      <div className="preference-item">
                        <span className="label">活动类型：</span>
                        <span className="value">{preference.preferences.activityTypes.join('、')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="preference-actions">
                    {!preference.is_default && (
                      <button 
                        onClick={() => handleSetDefault(preference.id)}
                        className="set-default-button"
                      >
                        ⭐ 设为默认
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(preference)}
                      className="edit-button"
                    >
                      ✏️ 编辑
                    </button>
                    <button 
                      onClick={() => handleDelete(preference.id)}
                      className="delete-button"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <div className="preference-form-section">
            <div className="form-header">
              <h3>{editingPreference ? '编辑偏好设置' : '新建偏好设置'}</h3>
              <button onClick={resetForm} className="cancel-button">取消</button>
            </div>

            <form onSubmit={handleSubmit} className="preference-form">
              <div className="form-group">
                <label htmlFor="name">偏好设置名称 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="例如：商务旅行、家庭度假、背包客"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">描述</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="简单描述这个偏好设置的用途..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="travelStyle">旅行风格</label>
                  <select
                    id="travelStyle"
                    name="preferences.travelStyle"
                    value={formData.preferences.travelStyle}
                    onChange={handleInputChange}
                  >
                    <option value="">请选择</option>
                    <option value="休闲度假">休闲度假</option>
                    <option value="文化探索">文化探索</option>
                    <option value="冒险刺激">冒险刺激</option>
                    <option value="商务出行">商务出行</option>
                    <option value="家庭亲子">家庭亲子</option>
                    <option value="浪漫蜜月">浪漫蜜月</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="accommodationType">住宿类型</label>
                  <select
                    id="accommodationType"
                    name="preferences.accommodationType"
                    value={formData.preferences.accommodationType}
                    onChange={handleInputChange}
                  >
                    <option value="">请选择</option>
                    <option value="豪华酒店">豪华酒店</option>
                    <option value="商务酒店">商务酒店</option>
                    <option value="精品酒店">精品酒店</option>
                    <option value="民宿">民宿</option>
                    <option value="青年旅社">青年旅社</option>
                    <option value="度假村">度假村</option>
                    <option value="公寓">公寓</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="budgetRange">预算范围</label>
                  <select
                    id="budgetRange"
                    name="preferences.budgetRange"
                    value={formData.preferences.budgetRange}
                    onChange={handleInputChange}
                  >
                    <option value="">请选择</option>
                    <option value="经济型 (&lt; 5000元)">经济型 (&lt; 5000元)</option>
                    <option value="舒适型 (5000-15000元)">舒适型 (5000-15000元)</option>
                    <option value="豪华型 (15000-30000元)">豪华型 (15000-30000元)</option>
                    <option value="奢华型 (&gt; 30000元)">奢华型 (&gt; 30000元)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="groupSize">常用出行人数</label>
                  <select
                    id="groupSize"
                    name="preferences.groupSize"
                    value={formData.preferences.groupSize}
                    onChange={handleInputChange}
                  >
                    <option value="">请选择</option>
                    <option value="1人">1人</option>
                    <option value="2人">2人</option>
                    <option value="3-4人">3-4人</option>
                    <option value="5-8人">5-8人</option>
                    <option value="9人以上">9人以上</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>喜欢的活动类型</label>
                <div className="checkbox-group">
                  {activityOptions.map((activity) => (
                    <label key={activity} className="checkbox-item">
                      <input
                        type="checkbox"
                        name="preferences.activityTypes"
                        value={activity}
                        checked={formData.preferences.activityTypes.includes(activity)}
                        onChange={handleInputChange}
                      />
                      <span>{activity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>偏好的季节</label>
                <div className="checkbox-group">
                  {seasonOptions.map((season) => (
                    <label key={season} className="checkbox-item">
                      <input
                        type="checkbox"
                        name="preferences.seasonPreferences"
                        value={season}
                        checked={formData.preferences.seasonPreferences.includes(season)}
                        onChange={handleInputChange}
                      />
                      <span>{season}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="foodPreferences">饮食偏好</label>
                <textarea
                  id="foodPreferences"
                  name="preferences.foodPreferences"
                  value={formData.preferences.foodPreferences}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="例如：喜欢当地特色菜、素食、不吃辣等"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialNeeds">特殊需求</label>
                <textarea
                  id="specialNeeds"
                  name="preferences.specialNeeds"
                  value={formData.preferences.specialNeeds}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="例如：无障碍设施、语言翻译、医疗需求等"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingPreference ? '💾 更新偏好设置' : '💾 保存偏好设置'}
                </button>
                <button type="button" onClick={resetForm} className="cancel-button">
                  取消
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPreferences;
