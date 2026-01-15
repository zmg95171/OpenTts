// 应用状态
const state = {
    voices: [],
    selectedVoice: null,
    currentAudioUrl: null
};

// DOM 元素
const elements = {
    languageFilter: document.getElementById('languageFilter'),
    genderFilter: document.getElementById('genderFilter'),
    voiceList: document.getElementById('voiceList'),
    textInput: document.getElementById('textInput'),
    charCount: document.getElementById('charCount'),
    generateBtn: document.getElementById('generateBtn'),
    playerSection: document.getElementById('playerSection'),
    audioPlayer: document.getElementById('audioPlayer'),
    downloadBtn: document.getElementById('downloadBtn'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    speedRange: document.getElementById('speedRange'),
    speedValue: document.getElementById('speedValue'),
    fileUploadArea: document.getElementById('fileUploadArea'),
    fileInput: document.getElementById('fileInput')
};

// 文件上传功能
const fileUploadArea = elements.fileUploadArea;
const fileInput = elements.fileInput;

// 点击上传区域触发文件选择
fileUploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 处理文件选择
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.textInput.value = e.target.result;
            updateCharCount();
            updateGenerateButton();
        };
        reader.readAsText(file);
    } else {
        alert('请选择 .txt 格式的文本文件');
    }
});

// 拖拽上传
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('drag-over');
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('drag-over');
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.textInput.value = e.target.result;
            updateCharCount();
            updateGenerateButton();
        };
        reader.readAsText(file);
    } else {
        alert('请拖入 .txt 格式的文本文件');
    }
});

// 语速控制
elements.speedRange.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    elements.speedValue.textContent = speed.toFixed(1) + 'x';
    if (elements.audioPlayer.src) {
        elements.audioPlayer.playbackRate = speed;
    }
});

// 更新服务状态
function updateServiceStatus(status) {
    const statusDot = elements.statusDot;
    const statusText = elements.statusText;

    statusDot.className = 'status-dot';

    switch(status) {
        case 'online':
            statusDot.classList.add('online');
            statusText.textContent = '服务正常';
            break;
        case 'offline':
            statusDot.classList.add('offline');
            statusText.textContent = '服务不可用';
            break;
        case 'checking':
            statusDot.classList.add('checking');
            statusText.textContent = '检查中...';
            break;
        default:
            statusText.textContent = '未知状态';
    }
}

// 测试网络连接
async function testConnection() {
    console.log('开始测试网络连接...');
    updateServiceStatus('checking');
    try {
        const response = await fetch('https://tts.2068.online/api/tts/voices', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log('响应状态:', response.status);
        console.log('响应头:', [...response.headers.entries()]);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('服务器返回错误:', errorText);
            throw new Error(`HTTP错误! 状态码: ${response.status}, 错误信息: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('服务器返回的不是JSON格式数据');
        }

        // 先获取原始文本
        const rawText = await response.text();
        console.log('服务器原始响应:', rawText);

        // 尝试解析为JSON
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error('JSON解析失败:', parseError);
            throw new Error('服务器返回的不是有效的JSON格式');
        }

        console.log('解析后的数据类型:', typeof data);
        console.log('是否为数组:', Array.isArray(data));
        console.log('数据内容:', data);

        // 检查数据结构
        if (Array.isArray(data)) {
            return data;
        } else if (data && typeof data === 'object' && data.success && Array.isArray(data.voices)) {
            console.log('使用 voices 属性作为数据源');
            console.log('voices 数组内容:', data.voices);
            updateServiceStatus('online');
            return data.voices;
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
            console.log('使用 data 属性作为数据源');
            return data.data;
        } else {
            console.error('数据结构:', data);
            throw new Error('无法从响应中找到语音数组数据');
        }
    } catch (error) {
        console.error('网络连接测试失败:', error);
        updateServiceStatus('offline');
        throw error;
    }
}

// 获取语音列表
async function fetchVoices() {
    try {
        console.log('开始获取语音列表...');
        const voices = await testConnection();
        console.log('获取到的语音数据类型:', typeof voices);
        console.log('语音数据:', voices);

        // 验证数据类型
        if (!Array.isArray(voices)) {
            throw new Error('获取到的数据不是数组格式');
        }

        state.voices = voices;
        populateLanguageFilter();
        renderVoiceList();
    } catch (error) {
        console.error('获取语音列表失败:', error);
        console.error('错误详情:', {
            message: error.message,
            stack: error.stack,
            status: error.response?.status,
            statusText: error.response?.statusText
        });
        elements.voiceList.innerHTML = `<p class="loading">加载失败: ${error.message}</p>`;
    }
}

// 填充语言筛选器
function populateLanguageFilter() {
    console.log('开始填充语言筛选器，当前语音数据:', state.voices);

    if (!Array.isArray(state.voices)) {
        console.error('state.voices 不是数组:', state.voices);
        return;
    }

    const languages = [...new Set(
        state.voices
            .filter(voice => voice && typeof voice === 'object' && voice.locale)
            .map(voice => voice.locale)
    )].sort();

    console.log('提取的语言列表:', languages);

    elements.languageFilter.innerHTML = '<option value="">所有语言</option>' +
        languages.map(lang => `<option value="${lang}">${lang}</option>`).join('');
}

// 渲染语音列表
function renderVoiceList() {
    console.log('开始渲染语音列表，当前语音数据:', state.voices);

    if (!Array.isArray(state.voices)) {
        console.error('state.voices 不是数组:', state.voices);
        elements.voiceList.innerHTML = '<p class="loading">语音数据格式错误</p>';
        return;
    }

    const languageFilter = elements.languageFilter.value;
    const genderFilter = elements.genderFilter.value;

    const filteredVoices = state.voices.filter(voice => {
        if (!voice || typeof voice !== 'object') {
            console.warn('无效的语音数据:', voice);
            return false;
        }
        // 使用新的属性名
        if (languageFilter && voice.locale !== languageFilter) return false;
        if (genderFilter && voice.gender !== genderFilter.toLowerCase()) return false;
        return true;
    });

    console.log('过滤后的语音列表:', filteredVoices);

    if (filteredVoices.length === 0) {
        elements.voiceList.innerHTML = '<p class="loading">没有找到匹配的语音</p>';
        return;
    }

    elements.voiceList.innerHTML = filteredVoices.map(voice => {
        try {
            return `
                <div class="voice-item ${state.selectedVoice?.id === voice.id ? 'selected' : ''}"
                     data-voice='${JSON.stringify(voice)}'>
                    <div class="voice-name">${voice.displayName || voice.name || '未知'}</div>
                    <div class="voice-info">
                        ${voice.locale || '未知'} | ${voice.gender || '未知'} | ${voice.locale || '未知'}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('渲染语音项失败:', error, voice);
            return '';
        }
    }).join('');

    // 添加点击事件
    document.querySelectorAll('.voice-item').forEach(item => {
        item.addEventListener('click', () => {
            try {
                const voice = JSON.parse(item.dataset.voice);
                console.log('选择的语音:', voice);
                selectVoice(voice);
            } catch (error) {
                console.error('解析语音数据失败:', error);
            }
        });
    });
}

// 选择语音
function selectVoice(voice) {
    state.selectedVoice = voice;
    renderVoiceList();
    updateGenerateButton();
}

// 更新生成按钮状态
function updateGenerateButton() {
    const hasText = elements.textInput.value.trim().length > 0;
    const hasVoice = state.selectedVoice !== null;
    elements.generateBtn.disabled = !(hasText && hasVoice);
}

// 生成语音
async function generateSpeech() {
    let text = elements.textInput.value.trim();
    const voice = state.selectedVoice;

    if (!text || !voice) return;

    // 清理和验证文本
    text = text.split('\n')
        .filter(line => line.trim())  // 移除空行
        .join(' ')  // 用空格连接非空行
        .trim();  // 移除首尾空格

    if (!text) {
        throw new Error('请输入有效的文本内容');
    }

    // 清理之前的音频
    if (state.currentAudioUrl) {
        URL.revokeObjectURL(state.currentAudioUrl);
        state.currentAudioUrl = null;
    }

    // 更新按钮状态
    elements.generateBtn.disabled = true;
    elements.generateBtn.querySelector('.btn-text').style.display = 'none';
    elements.generateBtn.querySelector('.btn-loader').style.display = 'inline';

    try {
        const response = await fetch('https://tts.2068.online/api/tts/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                voiceId: voice.id  // 使用voiceId参数
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '生成语音失败');
        }

        // 获取音频数据
        const audioBlob = await response.blob();
        state.currentAudioUrl = URL.createObjectURL(audioBlob);

        // 设置音频播放器
        elements.audioPlayer.src = state.currentAudioUrl;
        elements.playerSection.style.display = 'block';

        // 自动播放
        elements.audioPlayer.play();
    } catch (error) {
        console.error('生成语音失败:', error);
        alert(`生成语音失败: ${error.message}`);
    } finally {
        // 恢复按钮状态
        elements.generateBtn.disabled = false;
        elements.generateBtn.querySelector('.btn-text').style.display = 'inline';
        elements.generateBtn.querySelector('.btn-loader').style.display = 'none';
        updateGenerateButton();
    }
}

// 下载音频
function downloadAudio() {
    if (!state.currentAudioUrl) return;

    const a = document.createElement('a');
    a.href = state.currentAudioUrl;
    a.download = `tts-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 事件监听
elements.languageFilter.addEventListener('change', renderVoiceList);
elements.genderFilter.addEventListener('change', renderVoiceList);

elements.textInput.addEventListener('input', () => {
    const length = elements.textInput.value.length;
    elements.charCount.textContent = `${length}/1000`;
    updateGenerateButton();
});

elements.generateBtn.addEventListener('click', generateSpeech);
elements.downloadBtn.addEventListener('click', downloadAudio);

// 初始化
fetchVoices();
