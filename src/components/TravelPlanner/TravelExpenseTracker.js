import React, { useState, useEffect } from 'react';
import './TravelExpenseTracker.css';

const TravelExpenseTracker = ({ planId, planDetails }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // 从localStorage加载数据
  useEffect(() => {
    const savedExpenses = localStorage.getItem(`expenses_${planId}`);
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, [planId]);

  // 保存数据到localStorage
  const saveExpenses = (newExpenses) => {
    setExpenses(newExpenses);
    localStorage.setItem(`expenses_${planId}`, JSON.stringify(newExpenses));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      alert('请填写所有必填字段');
      return;
    }

    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount)
    };

    const updatedExpenses = [...expenses, expense];
    saveExpenses(updatedExpenses);
    
    setNewExpense({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date
    });
    setShowAddForm(true);
  };

  const handleUpdateExpense = (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      alert('请填写所有必填字段');
      return;
    }

    const updatedExpenses = expenses.map(expense => 
      expense.id === editingExpense.id 
        ? { ...expense, ...newExpense, amount: parseFloat(newExpense.amount) }
        : expense
    );
    
    saveExpenses(updatedExpenses);
    setShowAddForm(false);
    setEditingExpense(null);
    setNewExpense({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('确定要删除这笔支出吗？')) {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      saveExpenses(updatedExpenses);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingExpense(null);
    setNewExpense({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // 计算总支出
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // 按类别分组统计
  const categoryStats = expenses.reduce((stats, expense) => {
    if (!stats[expense.category]) {
      stats[expense.category] = 0;
    }
    stats[expense.category] += expense.amount;
    return stats;
  }, {});

  const categories = [
    '住宿', '餐饮', '交通', '门票', '购物', '娱乐', '其他'
  ];

  return (
    <div className="expense-tracker">
      <div className="expense-header">
        <h3>💰 旅行记账</h3>
        <div className="expense-summary">
          <div className="total-expense">
            <span className="label">总支出：</span>
            <span className="amount">¥{totalExpense.toFixed(2)}</span>
          </div>
          {planDetails?.budget && (
            <div className="budget-info">
              <span className="label">预算：</span>
              <span className="amount">¥{planDetails.budget}</span>
              <span className="remaining">
                剩余：¥{(planDetails.budget - totalExpense).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {Object.keys(categoryStats).length > 0 && (
        <div className="category-stats">
          <h4>📊 支出分类</h4>
          <div className="stats-grid">
            {Object.entries(categoryStats).map(([category, amount]) => (
              <div key={category} className="stat-item">
                <span className="category">{category}</span>
                <span className="amount">¥{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="expense-actions">
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-expense-button"
        >
          ➕ 添加支出
        </button>
      </div>

      {showAddForm && (
        <div className="expense-form">
          <h4>{editingExpense ? '编辑支出' : '添加支出'}</h4>
          <form onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">类别 *</label>
                <select
                  id="category"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  required
                >
                  <option value="">请选择</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="amount">金额 (元) *</label>
                <input
                  type="number"
                  id="amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">描述 *</label>
              <input
                type="text"
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                required
                placeholder="例如：酒店住宿、午餐、地铁票等"
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">日期</label>
              <input
                type="date"
                id="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                {editingExpense ? '💾 更新' : '💾 保存'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="expense-list">
        <h4>📝 支出记录</h4>
        {expenses.length === 0 ? (
          <div className="empty-state">
            <p>还没有支出记录，点击"添加支出"开始记账吧！</p>
          </div>
        ) : (
          <div className="expense-items">
            {expenses
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(expense => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <div className="expense-main">
                      <span className="category">{expense.category}</span>
                      <span className="description">{expense.description}</span>
                    </div>
                    <div className="expense-details">
                      <span className="amount">¥{expense.amount.toFixed(2)}</span>
                      <span className="date">{expense.date}</span>
                    </div>
                  </div>
                  <div className="expense-actions">
                    <button 
                      onClick={() => handleEditExpense(expense)}
                      className="edit-button"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="delete-button"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelExpenseTracker;
