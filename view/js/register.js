document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const roleTabs = document.querySelectorAll('.role-tab');
    const repairmanFields = document.getElementById('repairmanFields');
    let currentRole = 'Customer';

    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRole = tab.dataset.role;
            repairmanFields.style.display = currentRole === 'Repairman' ? 'block' : 'none';
        });
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const category = document.getElementById('category').value;

        // Simple validation
        if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        const payload = {
            fullName,
            phone,
            password,
            role: currentRole,
            category: currentRole === 'Repairman' ? category : null
        };

        try {
            const response = await fetch('http://localhost:5194/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Đăng ký thành công! Hãy đăng nhập.');
                window.location.href = 'login.html';
            } else {
                const error = await response.text();
                alert('Đăng ký thất bại: ' + error);
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối máy chủ.');
        }
    });
});
