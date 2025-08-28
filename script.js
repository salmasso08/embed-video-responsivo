// Seletores otimizados
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// DOM Elements
const btnAction = $('#btn-action');
const videoUrl = $('#video-url');
const videoResult = $('#video-result');
const clearBtn = $('#clear-btn');
const inputWrapper = $('.input-wrapper');
const btnYoutube = $('#btn-youtube');
const btnGeneric = $('#btn-generic');

// Estado atual
let currentMode = 'youtube';

// Event Listeners
btnAction?.addEventListener('click', generateEmbed);
videoUrl?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateEmbed();
});

// Mode switchers
btnYoutube?.addEventListener('click', () => switchMode('youtube'));
btnGeneric?.addEventListener('click', () => switchMode('generic'));

// Input clear functionality
videoUrl?.addEventListener('input', () => {
    if (videoUrl.value.trim()) {
        inputWrapper.classList.add('has-content');
    } else {
        inputWrapper.classList.remove('has-content');
    }
});

clearBtn?.addEventListener('click', () => {
    videoUrl.value = '';
    inputWrapper.classList.remove('has-content');
    videoUrl.focus();
    videoResult.innerHTML = '';
});

// Switch mode function
function switchMode(mode) {
    currentMode = mode;
    
    // Update button states
    btnYoutube.classList.toggle('active', mode === 'youtube');
    btnGeneric.classList.toggle('active', mode === 'generic');
    
    // Update placeholder
    if (mode === 'youtube') {
        videoUrl.placeholder = 'https://www.youtube.com/watch?v=...';
    } else {
        videoUrl.placeholder = 'https://example.com/page';
    }
    
    // Clear results
    videoResult.innerHTML = '';
    videoUrl.value = '';
    inputWrapper.classList.remove('has-content');
}

// Função principal para gerar embed
function generateEmbed() {
    const url = videoUrl.value.trim();
    
    if (!url) {
        alert('Por favor, cole uma URL');
        return;
    }
    
    let embedHtml, displayId;
    
    if (currentMode === 'youtube') {
        const videoId = extractVideoId(url);
        if (!videoId) {
            alert('URL inválida. Use uma URL do YouTube válida.');
            return;
        }
        embedHtml = createYouTubeEmbed(videoId);
        displayId = videoId;
    } else {
        if (!isValidUrl(url)) {
            alert('URL inválida. Use uma URL válida.');
            return;
        }
        embedHtml = createGenericEmbed(url);
        displayId = url;
    }
    
    displayResult(embedHtml, displayId);
    showModal(embedHtml);
    
    // Track evento customizado
    if (window.trackEvent) {
        trackEvent('embed_generated', { mode: currentMode, url: displayId });
    }
}

// Extrair ID do vídeo da URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// Criar HTML do embed YouTube
function createYouTubeEmbed(videoId) {
    return `<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/${videoId}' frameborder='0' allowfullscreen></iframe></div>`;
}

// Criar HTML do embed genérico
function createGenericEmbed(url) {
    return `<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='${url}' style='border:0'></iframe></div>`;
}

// Validar URL genérica
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Exibir resultado
function displayResult(embedHtml, id) {
    let previewContainer;
    
    if (currentMode === 'youtube') {
        previewContainer = `<div class="video-container">
            <iframe src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe>
        </div>`;
    } else {
        previewContainer = `<div class="video-container">
            <iframe src="${id}" style="border:0"></iframe>
        </div>`;
    }
    
    const title = currentMode === 'youtube' ? 'Vídeo Embed Gerado:' : 'Iframe Embed Gerado:';
    
    videoResult.innerHTML = `
        <h3>${title}</h3>
        ${previewContainer}
    `;
}

// Modal functions
const modal = $('#modal');
const embedCodeTextarea = $('#embed-code');
const copyBtn = $('#copy-btn');
const closeBtn = $('.close');

function showModal(embedHtml) {
    embedCodeTextarea.value = embedHtml;
    modal.style.display = 'block';
    embedCodeTextarea.select();
}

function closeModal() {
    modal.style.display = 'none';
}

// Event listeners para modal
closeBtn?.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

copyBtn?.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(embedCodeTextarea.value);
        copyBtn.textContent = '✅ Copiado!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 Copiar Código';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        embedCodeTextarea.select();
        alert('Selecione e copie manualmente (Ctrl+C)');
    }
});



// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Embed Video Responsivo carregado!');
    
    // Focar no input
    videoUrl?.focus();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});
