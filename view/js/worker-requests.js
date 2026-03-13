document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    const userPhone = sessionStorage.getItem('userPhone');

    if (isLoggedIn !== 'true' || userRole !== 'Repairman') {
        window.location.href = 'login.html';
        return;
    }

    const requestsList = document.getElementById('requestsList');
    
    async function fetchRequests() {
        try {
            const response = await fetch(`http://localhost:5194/api/repair-requests/worker/${userPhone}`);
            if (!response.ok) throw new Error('Không thể tải yêu cầu');
            const data = await response.json();
            renderRequests(data);
        } catch (error) {
            console.error(error);
            requestsList.innerHTML = '<div class="error-text">Có lỗi xảy ra khi tải dữ liệu.</div>';
        }
    }

    function renderRequests(requests) {
        if (!requests || requests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-icon"><i class="fas fa-box-open"></i></div>
                <div class="empty-text">Chưa có yêu cầu nào gửi đến bạn.</div>
            `;
            return;
        }

        requestsList.style.display = 'grid';
        requestsList.style.gridTemplateColumns = '1fr';
        requestsList.style.gap = '20px';
        requestsList.style.justifyItems = 'stretch';
        requestsList.style.alignItems = 'start';
        requestsList.innerHTML = requests.map(req => `
            <div class="request-item card mb-3 p-3 text-start">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="mb-0">${req.customerName}</h5>
                    <span class="badge ${getStatusBadgeClass(req.status)}">${getStatusText(req.status)}</span>
                </div>
                <p class="mb-1"><strong>Dịch vụ:</strong> ${req.category}</p>
                <p class="mb-1"><strong>Mô tả:</strong> ${req.description}</p>
                <p class="mb-2"><strong>Địa chỉ:</strong> ${req.address}, ${req.district}, ${req.province}</p>
                <div class="d-flex gap-2 mt-2">
                    ${req.status === 'Pending' ? `
                        <button class="btn btn-success btn-sm btn-accept" data-id="${req.id}">Chấp nhận</button>
                        <button class="btn btn-danger btn-sm btn-reject" data-id="${req.id}">Từ chối</button>
                    ` : ''}
                    ${req.status === 'Accepted' ? `
                        <button class="btn btn-primary btn-sm btn-complete" data-id="${req.id}">Hoàn thành</button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'Accepted'));
        });
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'Rejected'));
        });
        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'Completed'));
        });
    }

    function getStatusText(status) {
        switch(status) {
            case 'Pending': return 'Đang chờ';
            case 'Accepted': return 'Đã nhận';
            case 'Completed': return 'Đã xong';
            case 'Rejected': return 'Đã từ chối';
            default: return status;
        }
    }

    function getStatusBadgeClass(status) {
        switch(status) {
            case 'Pending': return 'bg-warning text-dark';
            case 'Accepted': return 'bg-info text-white';
            case 'Completed': return 'bg-success text-white';
            case 'Rejected': return 'bg-secondary text-white';
            default: return 'bg-light text-dark';
        }
    }

    async function updateStatus(requestId, newStatus) {
        if (!confirm(`Bạn có chắc muốn chuyển trạng thái sang ${getStatusText(newStatus)}?`)) return;

        try {
            const response = await fetch(`http://localhost:5194/api/repair-requests/${requestId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStatus)
            });

            if (response.ok) {
                alert('Cập nhật thành công!');
                fetchRequests();
            } else {
                alert('Cập nhật thất bại.');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối máy chủ.');
        }
    }

    fetchRequests();
});
