document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kiểm tra session đăng nhập
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userPhone = sessionStorage.getItem('userPhone');

    if (isLoggedIn !== 'true') return;

    const notifList = document.getElementById('notifList');
    const paginationNav = document.getElementById('paginationNav');
    const paginationList = document.getElementById('paginationList');

    let allNotifications = [];
    let currentPage = 1;
    const itemsPerPage = 5;

    // 2. Fetch danh sách bằng GET API
    async function fetchNotifications() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/user/${userPhone}`);
            if (!response.ok) throw new Error('Không thể tải thông báo');
            
            allNotifications = await response.json();
            renderNotifications(); // Gọi render
        } catch (error) {
            console.error(error);
            notifList.innerHTML = '<div class="text-center py-5 text-danger">Lỗi tải thông báo.</div>';
        }
    }

    // 3. Render lên giao diện HTML
    function renderNotifications() {
        if (!allNotifications || allNotifications.length === 0) {
            // Hiển thị giao diện "Trống" nếu không có Log
            notifList.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-bell-slash fa-3x mb-3"></i>
                    <p>Bạn không có thông báo nào.</p>
                </div>
            `;
            if (paginationNav) paginationNav.style.display = 'none';
            return;
        }

        // Logic phân trang
        const totalPages = Math.ceil(allNotifications.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = allNotifications.slice(startIndex, endIndex);

        notifList.innerHTML = currentItems.map(n => `
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

        renderPagination(totalPages);
    }
    
    // Logic nút Phân trang <ẩn cho bớt dài>
    function renderPagination(totalPages) {
        /* ... xử lý HTML tạo nút 1, 2, 3 ... */
    }

    // 4. Báo cho Backend là mình đã bấm đọc cái thông báo này
    window.markAsRead = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
            fetchNotifications(); // Refresh lại danh sách
        } catch (error) {
            console.error(error);
        }
    };

    // Callback khởi tạo
    fetchNotifications();
});