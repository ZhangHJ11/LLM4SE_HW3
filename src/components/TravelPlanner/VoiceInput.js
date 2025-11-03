import React, { useState, useRef } from 'react';

const VoiceInput = ({ onResult, onStop, onError }) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testMicLevel, setTestMicLevel] = useState(0);
  const audioContextRef = useRef(null);
  const websocketRef = useRef(null);
  const isStoppingRef = useRef(false);
  const sequenceRef = useRef(0);
  const audioProcessorRef = useRef(null);
  const audioSourceRef = useRef(null);
  const streamRef = useRef(null);

  // ==========================================
  // 在这里填写您的讯飞API凭证
  // 1. 前往 https://www.xfyun.cn/ 注册并创建应用
  // 2. 获取APP ID, API Key和API Secret
  // 3. 设置环境变量 XF_APIKEY 为你的实际讯飞API密钥
  // ==========================================
    const XF_CONFIG = {
        appId: process.env.XF_APPID || '',           // 设置环境变量 XF_APPID
        apiKey: process.env.XF_APIKEY || '',         // 设置环境变量 XF_APIKEY
        apiSecret: process.env.XF_APISECRET || ''    // 设置环境变量 XF_APISECRET
    };

  // 生成RFC1123格式的时间戳
  const getRFC1123Date = () => {
    return new Date().toUTCString();
  };

  // debug 辅助：掩码中间内容，避免泄露完整密钥/授权串
  const maskMiddle = (str, keep = 6) => {
    try {
      if (!str || str.length <= keep * 2) return '***';
      return str.slice(0, keep) + '...MASK...' + str.slice(-keep);
    } catch {
      return '***';
    }
  };

  const maskAuthInUrl = (url) => {
    try {
      const u = new URL(url);
      const auth = u.searchParams.get('authorization');
      if (auth) {
        u.searchParams.set('authorization', maskMiddle(auth));
      }
      return u.toString();
    } catch {
      return url;
    }
  };

  // 生成HMAC-SHA256签名
  const hmacSHA256 = (data, secret) => {
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(secret);
    
    return crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ).then(key => {
      const dataBuffer = encoder.encode(data);
      return crypto.subtle.sign("HMAC", key, dataBuffer);
    }).then(signature => {
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    });
  };

  // 生成授权URL（直接连讯飞官方）
  const generateAuthUrl = async () => {
    try {
      const host = 'iat.xf-yun.com';
      const path = '/v1';
      const date = getRFC1123Date();
      
      // 构造signature原始字段
      const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
      
      // 生成signature
      const signature = await hmacSHA256(signatureOrigin, XF_CONFIG.apiSecret);
      
      // 构造authorization_origin
      const authorizationOrigin = `api_key="${XF_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
      
      // base64编码authorization_origin
      const authorization = btoa(authorizationOrigin);

      // 打印关键上下文（已掩码）
      try {
        console.log('[VoiceDebug] env', {
          href: window.location.href,
          protocol: window.location.protocol,
          isSecureContext: window.isSecureContext,
          userAgent: navigator.userAgent,
          mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
          nowUtc: new Date().toUTCString(),
        });
        console.log('[VoiceDebug] authParams', {
          host,
          path,
          date,
          authorizationMasked: maskMiddle(authorization),
          signaturePreview: maskMiddle(signature, 8),
        });
      } catch {}
      
      const url = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
      try { console.log('[VoiceDebug] wsUrl', maskAuthInUrl(url)); } catch {}
      return url;
    } catch (err) {
      console.error('生成授权URL失败:', err);
      throw new Error('生成授权URL失败: ' + err.message);
    }
  };

  // 连接讯飞WebSocket服务（直接连官方）
  const connectXunfei = () => {
    return new Promise((resolve, reject) => {
      try {
        // 检查是否已配置凭证
        if (!XF_CONFIG.appId || !XF_CONFIG.apiKey || !XF_CONFIG.apiSecret) {
          throw new Error('请先配置讯飞API凭证');
        }
        
        // 生成授权URL并连接
        generateAuthUrl().then((url) => {
          const ws = new WebSocket(url);
          websocketRef.current = ws;
          ws.onopen = () => {
            sequenceRef.current = 0;
            sendInitialFrame();
            resolve();
          };
          ws.onerror = (error) => {
            try { console.error('WebSocket错误(onerror):', error); } catch {}
            const errorMsg = '连接讯飞服务失败: ' + (error.message || '未知错误');
            setErrorMessage(errorMsg);
            onError && onError(errorMsg);
            reject(error);
          };
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              handleRecognitionResult(data);
            } catch (err) {
              console.error('解析讯飞返回数据失败:', err);
            }
          };
          ws.onclose = (e) => {
            try { console.warn('WebSocket关闭(onclose):', { code: e.code, reason: e.reason }); } catch {}
            if (!isStoppingRef.current) {
              stopListening();
            }
          };
        }).catch(err => {
          console.error('生成授权URL失败:', err);
          reject(err);
        });
      } catch (err) {
        console.error('连接讯飞服务失败:', err);
        const errorMsg = '连接讯飞服务失败: ' + (err.message || '未知错误');
        setErrorMessage(errorMsg);
        onError && onError(errorMsg);
        reject(err);
      }
    });
  };

  // 发送初始帧
  const sendInitialFrame = () => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const frame = {
        header: {
          app_id: XF_CONFIG.appId,
          status: 0 // 首帧
        },
        parameter: {
          iat: {
            domain: "slm",
            language: "zh_cn",
            accent: "mandarin",
            eos: 6000,
            vinfo: 1,
            dwa: "wpgs",
            result: {
              encoding: "utf8",
              compress: "raw",
              format: "json"
            }
          }
        },
        payload: {
          audio: {
            encoding: "raw",
            sample_rate: 16000,
            channels: 1,
            bit_depth: 16,
            seq: 1,
            status: 0,
            audio: ""
          }
        }
      };
      // 发送初始帧
      websocketRef.current.send(JSON.stringify(frame));
    }
  };

  // 发送音频数据
  const sendAudioData = (base64Data) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      sequenceRef.current++;
      const frame = {
        header: {
          app_id: XF_CONFIG.appId,
          status: 1 // 中间帧
        },
        payload: {
          audio: {
            encoding: "raw",
            sample_rate: 16000,
            channels: 1,
            bit_depth: 16,
            seq: sequenceRef.current,
            status: 1, // 中间帧
            audio: base64Data
          }
        }
      };
      
      // 静默发送音频数据
      
      websocketRef.current.send(JSON.stringify(frame));
    }
  };

  // 发送结束帧
  const sendEndFrame = () => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      sequenceRef.current++;
      const frame = {
        header: {
          app_id: XF_CONFIG.appId,
          status: 2 // 最后一帧
        },
        payload: {
          audio: {
            encoding: "raw",
            sample_rate: 16000,
            channels: 1,
            bit_depth: 16,
            seq: sequenceRef.current,
            status: 2, // 最后一帧
            audio: "" // 结束帧数据为空
          }
        }
      };
      // 发送结束帧
      websocketRef.current.send(JSON.stringify(frame));
    }
  };

  // 处理识别结果
  const handleRecognitionResult = (data) => {
    if (data.header && data.header.code !== 0) {
      console.error('讯飞识别错误:', data.header.message);
      const errorMsg = '语音识别错误: ' + data.header.message;
      setErrorMessage(errorMsg);
      onError && onError(errorMsg);
      return;
    }
    
    if (data.payload && data.payload.result && data.payload.result.text) {
      try {
        // 解码并解析结果
        const decodedText = atob(data.payload.result.text);
        const result = JSON.parse(decodedText);
        
        // 检查新的数据格式
        if (result.ws && Array.isArray(result.ws)) {
          let fullResult = '';
          result.ws.forEach(word => {
            if (word.cw && Array.isArray(word.cw) && word.cw[0] && word.cw[0].w) {
              fullResult += word.cw[0].w;
            }
          });
          
          if (fullResult) {
            // 正确解码UTF-8字节序列
            let decodedText = '';
            try {
              // 将字符串转换为UTF-8字节数组
              const bytes = new Uint8Array(fullResult.length);
              for (let i = 0; i < fullResult.length; i++) {
                bytes[i] = fullResult.charCodeAt(i) & 0xFF;
              }
              // 使用TextDecoder解码UTF-8
              const decoder = new TextDecoder('utf-8');
              decodedText = decoder.decode(bytes);
            } catch (e) {
              console.error('UTF-8解码失败:', e);
              decodedText = fullResult; // 如果解码失败，使用原始结果
            }
            
            onResult && onResult(decodedText, true); // 新格式也直接标记为完成
          }
        }
        // 兼容旧格式
        else if (result.cn && result.cn.st && result.cn.st.rt) {
          let fullResult = '';
          result.cn.st.rt.forEach(sentence => {
            if (sentence.ws) {
              sentence.ws.forEach(word => {
                if (word.cw && word.cw[0] && word.cw[0].w) {
                  fullResult += word.cw[0].w;
                }
              });
            }
          });
          
          if (fullResult) {
            // 正确解码UTF-8字节序列
            let decodedText = '';
            try {
              // 将字符串转换为UTF-8字节数组
              const bytes = new Uint8Array(fullResult.length);
              for (let i = 0; i < fullResult.length; i++) {
                bytes[i] = fullResult.charCodeAt(i) & 0xFF;
              }
              // 使用TextDecoder解码UTF-8
              const decoder = new TextDecoder('utf-8');
              decodedText = decoder.decode(bytes);
            } catch (e) {
              console.error('UTF-8解码失败:', e);
              decodedText = fullResult; // 如果解码失败，使用原始结果
            }
            
            onResult && onResult(decodedText, true);
          }
        }
      } catch (err) {
        console.error('解析识别结果失败:', err);
      }
    }
    
    // 如果是最后一帧，结束识别
    if (data.header && data.header.status === 2) {
      stopListening();
      onStop && onStop();
    }
  };

  // 兼容性获取用户媒体
  const getUserMedia = (constraints) => {
    // 优先使用标准的mediaDevices API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
    
    // 后备方案1: 使用旧的getUserMedia API
    const getUserMediaLegacy = navigator.getUserMedia || 
                               navigator.webkitGetUserMedia || 
                               navigator.mozGetUserMedia || 
                               navigator.msGetUserMedia;
    
    if (getUserMediaLegacy) {
      return new Promise((resolve, reject) => {
        getUserMediaLegacy.call(navigator, constraints, resolve, reject);
      });
    }
    
    // 如果都不支持，抛出错误
    throw new Error('您的浏览器不支持getUserMedia API。请使用现代浏览器（Chrome、Firefox、Edge等）或确保使用HTTPS连接。');
  };

  // 开始录音
  const startListening = async () => {
    try {
      setErrorMessage('');
      isStoppingRef.current = false;
      
      // 先获取用户媒体权限（使用兼容性函数）
      const stream = await getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          sampleSize: 16
        } 
      });
      streamRef.current = stream;
      
      // 创建音频上下文
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      // 确保音频上下文正在运行
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // 创建音频源节点
      audioSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // 创建ScriptProcessor节点
      audioProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      // 设置音频处理回调
      audioProcessorRef.current.onaudioprocess = (e) => {
        if (!isStoppingRef.current && websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // 检查音频输入强度
          let maxAmplitude = 0;
          let hasAudio = false;
          for (let i = 0; i < inputData.length; i++) {
            const amplitude = Math.abs(inputData[i]);
            maxAmplitude = Math.max(maxAmplitude, amplitude);
            if (amplitude > 0.01) {
              hasAudio = true;
            }
          }
          
          // 更新音频强度显示
          setAudioLevel(maxAmplitude * 100);
          
          // 静默处理音频强度
          
          // 转换为16位整数数组（小端序）
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            // 确保音频数据在有效范围内
            const sample = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = Math.round(sample * 32767);
          }
          
          // 转换为字节数组（小端序）
          const bytes = new Uint8Array(pcmData.buffer);
          
          // 编码为base64
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Data = btoa(binary);
          
          // 音频数据质量检查（静默）
          
          // 发送音频数据
          sendAudioData(base64Data);
        }
      };
      
      // 连接音频节点
      audioSourceRef.current.connect(audioProcessorRef.current);
      audioProcessorRef.current.connect(audioContextRef.current.destination);
      
      // 连接讯飞服务（在音频处理设置完成后）
      await connectXunfei();
      
      setIsListening(true);
    } catch (err) {
      console.error('启动录音失败:', err);
      let errorMsg = '启动录音失败: ' + (err.message || '未知错误');
      
      // 提供更详细的错误信息
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          errorMsg = '启动录音失败: 浏览器要求使用HTTPS连接才能访问麦克风。当前使用HTTP连接，请使用HTTPS访问或联系管理员配置SSL证书。';
        } else {
          errorMsg = '启动录音失败: 您的浏览器不支持媒体设备API。请使用现代浏览器（Chrome 60+、Firefox 55+、Edge 79+、Safari 11+）。';
        }
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = '启动录音失败: 您拒绝了麦克风权限。请在浏览器设置中允许此网站访问麦克风。';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = '启动录音失败: 未找到麦克风设备。请确保已连接麦克风并允许浏览器访问。';
      }
      
      setErrorMessage(errorMsg);
      onError && onError(errorMsg);
      stopListening();
    }
  };

  // 停止录音
  const stopListening = () => {
    isStoppingRef.current = true;
    
    // 发送结束帧
    sendEndFrame();
    
    // 断开音频处理器连接
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }
    
    // 断开音频源连接
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    
    // 停止音频流
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // 关闭音频上下文
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // 关闭WebSocket连接
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    setIsListening(false);
    
    // 确保调用onStop回调
    onStop && onStop();
  };

  // 测试麦克风
  const testMicrophone = async () => {
    try {
      setIsTestingMic(true);
      setTestMicLevel(0);
      
      const stream = await getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          sampleSize: 16
        } 
      });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let maxAmplitude = 0;
        for (let i = 0; i < inputData.length; i++) {
          maxAmplitude = Math.max(maxAmplitude, Math.abs(inputData[i]));
        }
        setTestMicLevel(maxAmplitude * 100);
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      // 5秒后停止测试
      setTimeout(() => {
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        setIsTestingMic(false);
        setTestMicLevel(0);
      }, 5000);
      
    } catch (err) {
      console.error('麦克风测试失败:', err);
      let errorMsg = '麦克风测试失败: ' + (err.message || '未知错误');
      
      // 提供更详细的错误信息
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          errorMsg = '麦克风测试失败: 浏览器要求使用HTTPS连接才能访问麦克风。当前使用HTTP连接，请使用HTTPS访问或联系管理员配置SSL证书。';
        } else {
          errorMsg = '麦克风测试失败: 您的浏览器不支持媒体设备API。请使用现代浏览器（Chrome 60+、Firefox 55+、Edge 79+、Safari 11+）。';
        }
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = '麦克风测试失败: 您拒绝了麦克风权限。请在浏览器设置中允许此网站访问麦克风。';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = '麦克风测试失败: 未找到麦克风设备。请确保已连接麦克风并允许浏览器访问。';
      }
      
      setErrorMessage(errorMsg);
      setIsTestingMic(false);
      setTestMicLevel(0);
    }
  };

  // 切换录音状态
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="voice-input-wrapper">
      <div className="voice-controls">
        <button
          type="button"
          className={`voice-input-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? '⏹️ 停止录音' : '🎤 语音输入(讯飞)'}
        </button>
        <button
          type="button"
          className="test-microphone-button"
          onClick={testMicrophone}
          disabled={isListening}
        >
          🔧 测试麦克风
        </button>
      </div>
      
      {isListening && (
        <div className="audio-level-indicator">
          <div className="audio-level-label">
            🎤 音量: {audioLevel.toFixed(0)}% 
            {audioLevel > 5 ? ' 🔊' : audioLevel > 1 ? ' 🔉' : ' 🔈'}
          </div>
          <div className="audio-level-bar">
            <div 
              className="audio-level-fill" 
              style={{ 
                width: `${Math.min(audioLevel * 3, 100)}%`,
                backgroundColor: audioLevel > 10 ? '#4CAF50' : audioLevel > 5 ? '#FFC107' : '#FF5722'
              }}
            ></div>
          </div>
        </div>
      )}
      
      {isTestingMic && (
        <div className="audio-level-indicator test-mic-indicator">
          <div className="audio-level-label">
            🔧 测试麦克风: {testMicLevel.toFixed(0)}% 
            {testMicLevel > 5 ? ' 🔊' : testMicLevel > 1 ? ' 🔉' : ' 🔈'}
          </div>
          <div className="audio-level-bar">
            <div 
              className="audio-level-fill" 
              style={{ 
                width: `${Math.min(testMicLevel * 3, 100)}%`,
                backgroundColor: testMicLevel > 10 ? '#4CAF50' : testMicLevel > 5 ? '#FFC107' : '#FF5722'
              }}
            ></div>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="voice-input-error">
          {errorMessage}
          {(errorMessage.includes('凭证') || errorMessage.includes('APP ID')) && (
            <div className="permission-help">
              请在VoiceInput.js文件顶部的XF_CONFIG对象中配置正确的讯飞APP ID、API Key和API Secret
            </div>
          )}
        </div>
      )}
      
      {isListening && (
        <div className="voice-recording-indicator">
          正在录音...请继续说话
        </div>
      )}
    </div>
  );
};

export default VoiceInput;