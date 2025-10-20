import React, { useState, useEffect, useRef } from 'react';
import './TravelMap.css';

const TravelMap = ({ planDetails }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 百度地图API密钥 - 请替换为你的实际密钥
  const BAIDU_MAP_AK = 'cFszv9aC8dtsnwqjcEoMm8meU2lhr4jz'; // 需要替换为实际的百度地图API密钥

  // 提取景点信息
  const extractAttractions = () => {
    const attractions = [];
    
    // 从每日行程中提取景点
    if (planDetails?.dailyPlans) {
      planDetails.dailyPlans.forEach(day => {
        if (day.activities) {
          day.activities.forEach(activity => {
            if (activity.location) {
              attractions.push({
                name: activity.activity || '景点',
                location: activity.location,
                day: day.day,
                time: activity.time
              });
            }
          });
        }
      });
    }

    // 从推荐景点中提取
    if (planDetails?.recommendations?.attractions) {
      planDetails.recommendations.attractions.forEach(attraction => {
        attractions.push({
          name: attraction.name,
          location: attraction.location,
          type: 'recommended'
        });
      });
    }

    return attractions;
  };

  const attractions = extractAttractions();
  const cityName = (planDetails?.destination || planDetails?.overview?.title || '').toString();

  // 加载百度地图API
  useEffect(() => {
    const loadBaiduMapAPI = () => {
      if (window.BMapGL) {
        setIsMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${BAIDU_MAP_AK}&callback=initMap`;
      script.async = true;
      
      window.initMap = () => {
        setIsMapLoaded(true);
      };

      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        delete window.initMap;
      };
    };

    const cleanup = loadBaiduMapAPI();
    return cleanup;
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    try {
      // 创建地图实例
      const map = new window.BMapGL.Map(mapRef.current);
      mapInstanceRef.current = map;

      // 设置地图中心点（使用第一个景点的位置或默认位置）
      const centerPoint = attractions.length > 0 ? attractions[0].location : '北京市';
      map.centerAndZoom(centerPoint, 12);

      // 启用地图控件
      map.enableScrollWheelZoom(true);
      map.addControl(new window.BMapGL.NavigationControl());
      map.addControl(new window.BMapGL.ScaleControl());
      // OverviewMapControl 在GL版本中可能不存在，使用条件检查
      if (window.BMapGL.OverviewMapControl) {
        map.addControl(new window.BMapGL.OverviewMapControl());
      }

      // 初始化地图（不添加标记）
      initializeMap(map);

    } catch (error) {
      console.error('地图初始化失败:', error);
    }
  }, [isMapLoaded]);

  // 添加景点标记
  // 简化的地图初始化，不添加任何标记
  const initializeMap = (map) => {
    // 地图初始化
    // 只设置地图中心点，不添加任何标记
    if (attractions.length > 0) {
      const firstAttraction = attractions[0];
      const geocoder = new window.BMapGL.Geocoder();
      geocoder.getPoint(firstAttraction.location, (point) => {
        if (point) {
          map.centerAndZoom(point, 12);
        }
      }, cityName || undefined);
    }
  };

  // 将地址地理编码为坐标点
  const geocodeToPoint = (address) => {
    return new Promise((resolve, reject) => {
      try {
        const geocoder = new window.BMapGL.Geocoder();
        geocoder.getPoint(address, (point) => {
          if (point) {
            // 地理编码成功
            resolve(point);
          } else {
            console.warn('⚠️ 地理编码失败:', address, 'cityHint:', cityName);
            reject(new Error(`无法解析地点: ${address}`));
          }
        }, cityName || undefined);
      } catch (e) {
        reject(e);
      }
    });
  };

  // 路线规划
  const planRoute = async () => {
    if (!selectedStart || !selectedEnd || !mapInstanceRef.current) {
      alert('请选择出发点和终点');
      return;
    }

    if (selectedStart === selectedEnd) {
      alert('出发点和终点不能相同');
      return;
    }

    setIsLoading(true);
    
    // 开始路线规划

    try {
      const map = mapInstanceRef.current;
      
      // 不清除所有覆盖物，让百度地图API自动管理路线渲染
      // 保持现有地图状态

      // 地理编码出发点/终点
      const [startPoint, endPoint] = await Promise.all([
        geocodeToPoint(selectedStart),
        geocodeToPoint(selectedEnd)
      ]);

      // 起终点坐标就绪

      // 设置超时处理
      const timeoutId = setTimeout(() => {
        // 路线规划超时
        setIsLoading(false);
        alert('路线规划请求超时，请检查网络连接或稍后重试');
      }, 15000); // 15秒超时

      // 创建路线规划实例
      const driving = new window.BMapGL.DrivingRoute(map, {
        renderOptions: { 
          map: map, 
          autoViewport: true,
          showTraffic: false,
          enableDragging: true,
          panel: null
        },
        onSearchComplete: (results) => {
          clearTimeout(timeoutId); // 清除超时定时器
          setIsLoading(false);
          
          // 检查路线规划状态
          const status = driving.getStatus();
          // 路线规划状态
          
          if (status === 0) { // 0 表示成功
            const plan = results.getPlan && results.getPlan(0);
            if (plan) {
              const route = plan.getRoute && plan.getRoute(0);
              
              // 显示路线信息
              const routeInfo = {
                distance: plan.getDistance ? plan.getDistance(true) : '未知',
                duration: plan.getDuration ? plan.getDuration(true) : '未知',
                steps: plan.getNumRoutes ? plan.getNumRoutes() : 0
              };
              
              setRouteInfo(routeInfo);
              // 路线信息已设置
              
              // 显示文字路线信息
              // 显示路线信息
              
              // 尝试获取路线步骤信息
              let routeSteps = [];
              try {
                if (plan.getNumRoutes && plan.getNumRoutes() > 0) {
                  const route = plan.getRoute(0);
                  if (route && route.getNumSteps) {
                    const numSteps = route.getNumSteps();
                    
                    for (let i = 0; i < numSteps; i++) {
                      const step = route.getStep(i);
                      if (step) {
                        // 尝试多种方法获取步骤描述
                        let instruction = '';
                        try {
                          instruction = step.getDescription ? step.getDescription() : '';
                        } catch (e) {
                          // 步骤描述获取失败，使用默认描述
                        }
                        
                        // 如果无法获取描述，生成基本描述
                        if (!instruction || instruction.trim() === '') {
                          const distance = step.getDistance ? step.getDistance(true) : '';
                          if (distance) {
                            instruction = `行驶 ${distance}`;
                          } else {
                            instruction = `第 ${i + 1} 段路线`;
                          }
                        }
                        
                        routeSteps.push({
                          instruction: instruction,
                          distance: step.getDistance ? step.getDistance(true) : '',
                          duration: step.getDuration ? step.getDuration(true) : ''
                        });
                      }
                    }
                  }
                }
              } catch (error) {
                // 无法获取详细路线步骤
                console.error('获取路线步骤信息失败:', error);
              }
              
              // 如果无法获取步骤，生成基本路线信息
              if (routeSteps.length === 0) {
                routeSteps = [
                  {
                    instruction: `从 ${selectedStart} 出发`,
                    distance: '',
                    duration: ''
                  },
                  {
                    instruction: `前往 ${selectedEnd}`,
                    distance: routeInfo.distance,
                    duration: routeInfo.duration
                  },
                  {
                    instruction: `到达目的地 ${selectedEnd}`,
                    distance: '',
                    duration: ''
                  }
                ];
              }
              
              // 优化路线步骤显示，添加更详细的导航信息
              const optimizedSteps = routeSteps.map((step, index) => {
                let instruction = step.instruction;
                
                // 如果指令为空或只有距离，生成更详细的描述
                if (!instruction || instruction.trim() === '' || instruction === `行驶 ${step.distance}`) {
                  if (index === 0) {
                    instruction = `🚗 从 ${selectedStart} 出发`;
                  } else if (index === routeSteps.length - 1) {
                    instruction = `🏁 到达目的地 ${selectedEnd}`;
                  } else {
                    // 根据距离和位置生成更详细的描述
                    if (step.distance) {
                      const distance = step.distance;
                      if (distance.includes('米')) {
                        instruction = `➡️ 直行 ${distance}`;
                      } else if (distance.includes('公里')) {
                        instruction = `🛣️ 行驶 ${distance}`;
                      } else {
                        instruction = `📍 继续行驶 ${distance}`;
                      }
                    } else {
                      instruction = `📍 第 ${index + 1} 段路线`;
                    }
                  }
                } else {
                  // 如果API返回了描述，添加图标
                  instruction = `📍 ${instruction}`;
                }
                
                return {
                  instruction: instruction,
                  distance: step.distance,
                  duration: step.duration
                };
              });
              
              // 更新路线信息，包含步骤
              const enhancedRouteInfo = {
                ...routeInfo,
                steps: optimizedSteps.length > 0 ? optimizedSteps : [
                  { instruction: `从 ${selectedStart} 出发`, distance: '', duration: '' },
                  { instruction: `前往 ${selectedEnd}`, distance: routeInfo.distance, duration: routeInfo.duration },
                  { instruction: `到达目的地 ${selectedEnd}`, distance: '', duration: '' }
                ]
              };
              
              setRouteInfo(enhancedRouteInfo);
              
              // 简化版本：直接绘制路线
              if (route && route.getPath) {
                const path = route.getPath();
                // 路径点数量: path.length
                
                // 确保路径点存在且不为空
                if (path && path.length > 0) {
                  // 清除所有覆盖物
                  map.clearOverlays();
                  
                  // 使用与测试地图相同的模式添加实际路线
                  const polyline = new window.BMapGL.Polyline(path, {
                    strokeColor: "#ff0000", // 使用红色以便更容易看到
                    strokeWeight: 6,
                    strokeOpacity: 0.9
                  });
                  map.addOverlay(polyline);
                   // 路线Polyline已添加
                  
                  // 添加起点终点标记
                  const startMarker = new window.BMapGL.Marker(path[0]);
                  const endMarker = new window.BMapGL.Marker(path[path.length - 1]);
                  map.addOverlay(startMarker);
                  map.addOverlay(endMarker);
                   // 起点终点标记已添加
                  
                  // 设置地图视野 - 使用更明确的方式
                  map.setViewport(path);
                   // 地图视野已设置
                  
                   // 路线已绘制
                  
                  // 强制刷新地图以确保渲染
                  setTimeout(() => {
                    map.panBy(1, 1);
                    map.panBy(-1, -1);
                     // 地图已强制刷新
                    
                    // 再次检查覆盖物数量
                     // 强制刷新后覆盖物数量
                  }, 100);
                  
                  // 再次检查覆盖物数量
                  setTimeout(() => {
                     // 延迟检查覆盖物数量
                  }, 500);
                } else {
                  // 路径点为空或无效
                }
              }
            } else {
              // 未找到路线计划
              alert('未找到合适的路线');
            }
          } else {
            // 根据状态码显示不同的错误信息
            let errorMessage = '路线规划失败';
            switch (status) {
              case 1:
                errorMessage = '起点信息有误，请检查地点名称';
                break;
              case 2:
                errorMessage = '终点信息有误，请检查地点名称';
                break;
              case 3:
                errorMessage = '起终点信息有误，请检查地点名称';
                break;
              case 4:
                errorMessage = '网络错误，请检查网络连接';
                break;
              case 5:
                errorMessage = '请求超时，请稍后重试或检查地点名称是否准确';
                break;
              default:
                errorMessage = `路线规划失败 (状态码: ${status})`;
            }
            alert(errorMessage);
          }
        },
        onMarkersSet: () => {
          // 路线标记设置完成回调
          // 路线标记设置完成
        }
      });

      // 执行路线规划
      driving.search(startPoint, endPoint);

    } catch (error) {
      setIsLoading(false);
      console.error('路线规划失败:', error);
      alert('路线规划失败，请稍后重试');
    }
  };

  // 清除路线
  const clearRoute = () => {
    if (mapInstanceRef.current) {
      // 清除所有覆盖物
      mapInstanceRef.current.clearOverlays();
      // 已清除所有地图覆盖物
    }
    setRouteInfo(null);
    setSelectedStart('');
    setSelectedEnd('');
    // 已清除路线信息
  };

  // 添加一个函数来手动绘制路线以调试问题
  const drawRouteManually = (points) => {
    if (!mapInstanceRef.current || !points || points.length === 0) {
      // 无法绘制路线: 地图实例或路径点无效
      return;
    }

    const map = mapInstanceRef.current;
    
    // 清除现有覆盖物
    map.clearOverlays();
    // 已清除现有覆盖物

    try {
      // 创建路线折线
      const polyline = new window.BMapGL.Polyline(points, {
        strokeColor: "#ff0000", // 红色路线，便于识别
        strokeWeight: 6,
        strokeOpacity: 0.9
      });
      
      // 添加到地图
      map.addOverlay(polyline);
      // 路线已添加到地图
      
      // 添加起点和终点标记
      if (points.length > 0) {
        const startMarker = new window.BMapGL.Marker(points[0]);
        const endMarker = new window.BMapGL.Marker(points[points.length - 1]);
        map.addOverlay(startMarker);
        map.addOverlay(endMarker);
        // 起点和终点标记已添加
      }
      
      // 调整地图视野以适应路线
      map.setViewport(points);
      // 地图视野已调整以适应路线
      
    } catch (error) {
      console.error('❌ 手动绘制路线失败:', error);
    }
  };


  return (
    <div className="travel-map-container">
      <div className="map-header">
        <h3>🗺️ 路线规划</h3>
        <p>选择出发点和终点，查看最优路线</p>
      </div>

      <div className="map-controls">
        <div className="route-selection">
          <div className="selection-group">
            <label htmlFor="startPoint">出发点：</label>
            <select
              id="startPoint"
              value={selectedStart}
              onChange={(e) => setSelectedStart(e.target.value)}
            >
              <option value="">请选择出发点</option>
              {attractions.map((attraction, index) => (
                <option key={`start-${index}`} value={attraction.location}>
                  {attraction.name} - {attraction.location}
                </option>
              ))}
            </select>
          </div>

          <div className="selection-group">
            <label htmlFor="endPoint">终点：</label>
            <select
              id="endPoint"
              value={selectedEnd}
              onChange={(e) => setSelectedEnd(e.target.value)}
            >
              <option value="">请选择终点</option>
              {attractions.map((attraction, index) => (
                <option key={`end-${index}`} value={attraction.location}>
                  {attraction.name} - {attraction.location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="route-actions">
          <button
            onClick={planRoute}
            disabled={!selectedStart || !selectedEnd || isLoading}
            className="plan-route-button"
          >
            {isLoading ? '🔄 规划中...' : '🚗 规划路线'}
          </button>
          <button
            onClick={clearRoute}
            className="clear-route-button"
          >
            🗑️ 清除路线
          </button>
          
        </div>
      </div>

      {routeInfo && (
        <div className="route-info">
          <h4>📊 路线信息</h4>
          <div className="route-stats">
            <div className="stat-item">
              <span className="label">距离：</span>
              <span className="value">{routeInfo.distance}</span>
            </div>
            <div className="stat-item">
              <span className="label">预计时间：</span>
              <span className="value">{routeInfo.duration}</span>
            </div>
            <div className="stat-item">
              <span className="label">路线数：</span>
              <span className="value">{Array.isArray(routeInfo.steps) ? routeInfo.steps.length : routeInfo.steps}条</span>
            </div>
          </div>
          
          {/* 文字路线步骤 */}
          {Array.isArray(routeInfo.steps) && routeInfo.steps.length > 0 && (
            <div className="route-steps">
              <h5>🗺️ 路线详情</h5>
              <div className="steps-list">
                {routeInfo.steps.map((step, index) => (
                  <div key={index} className="step-item">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <div className="step-instruction">{step.instruction}</div>
                      {(step.distance || step.duration) && (
                        <div className="step-details">
                          {step.distance && <span className="distance">📏 {step.distance}</span>}
                          {step.duration && <span className="duration">⏱️ {step.duration}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="map-container">
        {!isMapLoaded ? (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>地图加载中...</p>
          </div>
        ) : (
          <div ref={mapRef} className="baidu-map"></div>
        )}
      </div>

      {attractions.length === 0 && (
        <div className="no-attractions">
          <p>⚠️ 未找到景点信息，无法进行路线规划</p>
        </div>
      )}

      {BAIDU_MAP_AK === 'YOUR_BAIDU_MAP_AK' && (
        <div className="api-key-warning">
          <p>⚠️ 请先配置百度地图API密钥</p>
          <p>在 TravelMap.js 文件中将 YOUR_BAIDU_MAP_AK 替换为你的实际API密钥</p>
        </div>
      )}
    </div>
  );
};

export default TravelMap;
