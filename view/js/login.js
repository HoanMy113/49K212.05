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
            const response = await fetch('http://localhost:5194/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, role: currentRole })
            });

            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userPhone', phone);
                sessionStorage.setItem('userRole', currentRole);
                sessionStorage.setItem('userName', data.fullName || 'Người dùng');
                
                if (data.workerProfileId) {
                    sessionStorage.setItem('workerProfileId', data.workerProfileId);
                }

                window.location.href = 'index.html';
            } else {
                loginError.style.display = 'block';
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối máy chủ.');
        }
    });
});
