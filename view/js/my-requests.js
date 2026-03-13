document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userPhone = sessionStorage.getItem('userPhone');

    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const requestsList = document.getElementById('requestsList');

    async function fetchMyRequests() {
        try {
            const response = await fetch(`http://localhost:5194/api/repair-requests/customer/${userPhone}`);
            if (!response.ok) throw new Error('Không thể tải yêu cầu');
            const data = await response.json();
            renderRequests(data);
        } catch (error) {
            console.error(error);
            requestsList.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu.</div>';
        }
    }

    function renderRequests(requests) {
        if (!requests || requests.length === 0) {
            requestsList.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Bạn chưa gửi yêu cầu sửa chữa nào.</p>
                    <a href="index.html" class="btn btn-success">Khám phá ngay</a>
                </div>
            `;
            return;
        }

        requestsList.style.display = 'grid';
        requestsList.style.gap = '20px';
        requestsList.innerHTML = requests.map(req => `
            <div class="card p-3 shadow-sm border-0">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0 text-success">${req.category}</h5>
                    <span class="badge ${getStatusBadgeClass(req.status)}">${getStatusText(req.status)}</span>
                </div>
                <div class="mb-2">
                    <small class="text-muted d-block">Thợ đảm nhận:</small>
                    <strong>${req.workerName || 'Đang chờ thợ...'}</strong>
                </div>
                <p class="mb-2 text-secondary">${req.description}</p>
                <div class="d-flex justify-content-between align-items-end mt-2">
                    <span class="text-muted small">${new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
                    ${req.status === 'Completed' ? `
                        <a href="review.html?requestId=${req.id}&workerId=${req.workerId}" class="btn btn-outline-warning btn-sm">
                            <i class="fas fa-star"></i> Đánh giá
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    function getStatusText(status) {
        switch(status) {
            case 'Pending': return 'Đang chờ';
            case 'Accepted': return 'Đã nhận';
            case 'Completed': return 'Hoàn thành';
            case 'Rejected': return 'Bị từ chối';
            default: return status;
        }
    }

    function getStatusBadgeClass(status) {
        switch(status) {
            case 'Pending': return 'bg-warning text-dark';
            case 'Accepted': return 'bg-info text-white';
            case 'Completed': return 'bg-success text-white';
            case 'Rejected': return 'bg-danger text-white';
            default: return 'bg-light text-dark';
        }
    }

    fetchMyRequests();
});
