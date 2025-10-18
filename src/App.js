import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>欢迎使用 React Web 应用</h1>
        <p>这是一个使用 React 构建的现代 Web 应用程序</p>
        
        <div className="counter-section">
          <h2>计数器示例</h2>
          <p>当前计数: <span className="count">{count}</span></p>
          <div className="button-group">
            <button onClick={() => setCount(count + 1)}>
              增加
            </button>
            <button onClick={() => setCount(count - 1)}>
              减少
            </button>
            <button onClick={() => setCount(0)}>
              重置
            </button>
          </div>
        </div>

        <div className="features">
          <h2>功能特性</h2>
          <ul>
            <li>✅ React 18 最新版本</li>
            <li>✅ Webpack 5 构建工具</li>
            <li>✅ Babel 转译器</li>
            <li>✅ 热重载开发服务器</li>
            <li>✅ 现代化 CSS 样式</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
