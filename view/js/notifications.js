document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userPhone = sessionStorage.getItem('userPhone');

    if (isLoggedIn !== 'true') return;

    const notifList = document.getElementById('notifList');

    async function fetchNotifications() {
        try {
            const response = await fetch(`http://localhost:5194/api/notifications/user/${userPhone}`);
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
                <div class="d-flex justify-content-between align-items-start">
                    <h6 class="mb-1 ${n.isRead ? 'text-secondary' : 'text-dark font-weight-bold'}">${n.title}</h6>
                    ${!n.isRead ? '<span class="badge bg-success rounded-pill" style="font-size: 8px;">&nbsp;</span>' : ''}
                </div>
                <p class="mb-0 text-muted small">${n.message}</p>
                <div class="notif-time">${new Date(n.createdAt).toLocaleString('vi-VN')}</div>
            </div>
        `).join('');
    }

    window.markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5194/api/notifications/${id}/read`, { method: 'PATCH' });
            fetchNotifications(); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    fetchNotifications();
});
