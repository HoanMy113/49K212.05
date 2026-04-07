document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const fullName = sessionStorage.getItem('fullName');
    const userPhone = sessionStorage.getItem('userPhone');

    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const accountName = document.getElementById('accountName');
    const accountPhone = document.getElementById('accountPhone');
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const accountForm = document.getElementById('accountForm');

    accountName.textContent = fullName;
    accountPhone.textContent = userPhone;
    fullNameInput.value = fullName;
    phoneInput.value = userPhone;

    accountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedName = fullNameInput.value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userPhone}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName: updatedName })
            });

            if (response.ok) {
                sessionStorage.setItem('fullName', updatedName);
                alert('Cập nhật thông tin thành công!');
                location.reload();
            } else {
                alert('Cập nhật thất bại.');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối máy chủ.');
        }
    });
});
