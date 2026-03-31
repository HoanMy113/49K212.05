document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const roleTabs = document.querySelectorAll('.role-tab');
    let currentRole = 'Customer';

    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRole = tab.dataset.role;
        });
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('loginError');

        try {
            const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, role: currentRole })
            });

            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userPhone', phone);
                sessionStorage.setItem("userRole", currentRole); // Changed from currentRole to currentRole (was 'role' in instruction, but currentRole is the variable)
                sessionStorage.setItem('userName', data.fullName || 'Người dùng'); // Moved this line up
                
                if (data.workerProfileId) {
                    sessionStorage.setItem("workerProfileId", data.workerProfileId);
                }

                if (currentRole === "Repairman") { // Used currentRole for conditional redirect
                    window.location.href = "worker-dashboard.html";
                } else {
                    window.location.href = "index.html";
                }
            } else {
                const errorText = await response.text();
                loginError.textContent = errorText || 'Số điện thoại hoặc mật khẩu không chính xác.';
                loginError.style.display = 'block';
            }
        } catch (error) {
            console.error(error);
            loginError.textContent = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại server backend.';
            loginError.style.display = 'block';
        }
    });
});
