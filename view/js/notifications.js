document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userPhone = sessionStorage.getItem('userPhone');

    if (isLoggedIn !== 'true') return;

    const notifList = document.getElementById('notifList');

    async function fetchNotifications() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/user/${userPhone}`);
            if (!response.ok) throw new Error('Không thể tải thông báo');
            const data = await response.json();
            renderNotifications(data);
        } catch (error) {
            console.error(error);
            notifList.innerHTML = '<div class="text-center py-5 text-danger">Lỗi tải thông báo.</div>';
        }
    }

    function renderNotifications(notifs) {
        if (!notifs || notifs.length === 0) {
            notifList.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-bell-slash fa-3x mb-3"></i>
                    <p>Bạn không có thông báo nào.</p>
                </div>
            `;
            return;
        }

        notifList.innerHTML = notifs.map(n => `
            <div class="notif-card ${n.isRead ? '' : 'unread'}" onclick="markAsRead(${n.id})">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid ${n.isRead ? 'fa-envelope-open text-secondary' : 'fa-envelope text-success'} fs-5"></i>
                        <h6 class="mb-0 fw-bold ${n.isRead ? 'text-secondary' : 'text-dark'}">${n.title}</h6>
                    </div>
                    ${!n.isRead ? '<span class="badge bg-danger rounded-pill" style="font-size: 10px;">Mới</span>' : ''}
                </div>
                <p class="mb-1 text-muted small ms-4 ps-1">${n.message}</p>
                <div class="text-muted small ms-4 ps-1"><i class="fa-regular fa-clock me-1"></i>${new Date(n.createdAt).toLocaleString('vi-VN')}</div>
            </div>
        `).join('');
    }

    window.markAsRead = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
            fetchNotifications(); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    fetchNotifications();
});
