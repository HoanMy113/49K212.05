const API_BASE_URL = "http://127.0.0.1:5111";

// ====== BẢO MẬT: Helper gọi API có gắn JWT Token tự động ======
async function authFetch(url, options = {}) {
    const token = sessionStorage.getItem('authToken');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return fetch(url, options);
}