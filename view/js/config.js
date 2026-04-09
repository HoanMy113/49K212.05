let API_BASE_URL = "https://buikhanh1-001-site1.qtempurl.com";
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") {
    API_BASE_URL = "http://localhost:5111";
}
// ====== CHỐNG NGROK CẢNH BÁO: Ghi đè hàm fetch mặc định cho toàn web ======
const originalFetch = window.fetch;
window.fetch = async function () {
    let [resource, config] = arguments;
    if (!config) config = {};
    if (!config.headers) config.headers = {};

    // Chỉ chèn vé thông hành ngrok nếu đang gọi tới máy chủ API của mình
    if (typeof resource === 'string' && resource.includes(API_BASE_URL)) {
        config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    return originalFetch(resource, config);
};

// ====== BẢO MẬT: Helper gọi API có gắn JWT Token tự động ======
async function authFetch(url, options = {}) {
    const token = sessionStorage.getItem('authToken');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return fetch(url, options); // Gọi fetch phía trên đã được vá lỗi
}