document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    const workerProfileId = sessionStorage.getItem('workerProfileId');

    if (isLoggedIn !== 'true' || userRole !== 'Repairman') {
        window.location.href = 'login.html';
        return;
    }

    if (!workerProfileId) {
        if (typeof showModal !== 'undefined') {
            showModal("Không tìm thấy hồ sơ thợ. Vui lòng đăng nhập lại.", "error", { onClose: () => window.location.href = 'login.html' });
        } else {
            alert("Không tìm thấy hồ sơ thợ.");
            window.location.href = 'login.html';
        }
        return;
    }

    const requestsList = document.getElementById('requestsList');
    let allFetchedRequests = [];
    let activeFilter = null;
    
    async function fetchRequests() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/repairrequests/worker/${workerProfileId}`);
            if (!response.ok) throw new Error('Không thể tải yêu cầu');
            const data = await response.json();
            allFetchedRequests = data;
            updateStats(data);
            applyFilter();
        } catch (error) {
            console.error(error);
            requestsList.innerHTML = '<div class="empty-icon"><i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i></div><div class="empty-text" style="color:#e74c3c;">Có lỗi xảy ra khi tải dữ liệu.</div>';
        }
    }

    function applyFilter() {
        let filtered;
        const filterLabel = document.getElementById('filterLabel');
        const filterMap = {
            'pending': { statuses: [0, 1], label: '— Chờ / Nhận' },
            'completed': { statuses: [2], label: '— Đã hoàn thành' },
            'cancelled': { statuses: [3], label: '— Đã huỷ' }
        };

        if (activeFilter && filterMap[activeFilter]) {
            const { statuses, label } = filterMap[activeFilter];
            filtered = allFetchedRequests.filter(r => statuses.includes(r.status));
            if (filterLabel) filterLabel.textContent = label;
        } else {
            filtered = allFetchedRequests;
            if (filterLabel) filterLabel.textContent = '';
        }

        // Update stat card active states
        document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
            card.classList.toggle('active', card.dataset.filter === activeFilter);
        });

        renderRequests(filtered);
    }

    // Stat card click handlers
    document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.dataset.filter;
            activeFilter = (activeFilter === filter) ? null : filter;
            applyFilter();
        });
    });

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
            <div class="request-item" style="background: white; border: 1px solid #e8e8e8; border-radius: 16px; padding: 24px; transition: box-shadow 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; background: #eaf3ed; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #4e7d63; font-size: 18px;">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div>
                            <h5 style="margin: 0; font-weight: 700; color: #2c3e50; font-size: 16px;">${req.customerName}</h5>
                            <small style="color: #999;"><i class="fa-solid fa-phone me-1"></i>${req.customerPhone}</small>
                        </div>
                    </div>
                    <span style="padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; ${getStatusStyle(req.status)}">${getStatusText(req.status)}</span>
                </div>

                <div style="background: #f8f9fa; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #555;">
                        <i class="fa-solid fa-screwdriver-wrench text-success me-2"></i>
                        <strong>Dịch vụ:</strong> ${req.category}
                        ${req.isBroadcast ? '<span style="background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px; font-weight: 700;">Broadcast</span>' : ''}
                    </p>
                    <p style="margin: 0 0 8px; font-size: 14px; color: #555;">
                        <i class="fa-solid fa-circle-info text-info me-2"></i>
                        <strong>Mô tả:</strong> ${req.description || "Không có mô tả"}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #555;">
                        <i class="fa-solid fa-location-dot text-danger me-2"></i>
                        <strong>Địa chỉ:</strong> ${req.address}
                    </p>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #aaa; font-size: 13px;"><i class="fa-regular fa-clock me-1"></i>${new Date(req.createdAt).toLocaleString('vi-VN')}</span>
                    <div style="display: flex; gap: 10px;">
                        ${req.status === 0 ? `
                            <button class="btn-accept" data-id="${req.id}" style="background: #4e7d63; color: white; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s;">
                                <i class="fa-solid fa-check me-1"></i> Chấp nhận
                            </button>
                            <button class="btn-reject" data-id="${req.id}" style="background: #fff; color: #e74c3c; border: 1.5px solid #e74c3c; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s;">
                                <i class="fa-solid fa-xmark me-1"></i> Từ chối
                            </button>
                        ` : ''}
                        ${req.status === 1 ? `
                            <button class="btn-complete" data-id="${req.id}" style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s;">
                                <i class="fa-solid fa-circle-check me-1"></i> Hoàn thành
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', () => acceptRequest(btn.dataset.id));
        });
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', () => rejectRequest(btn.dataset.id));
        });
        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', () => completeRequest(btn.dataset.id));
        });
    }

    function getStatusText(status) {
        switch(status) {
            case 0: return 'Đang chờ';
            case 1: return 'Đã xác nhận';
            case 2: return 'Hoàn thành';
            case 3: return 'Đã hủy';
            default: return 'Không rõ';
        }
    }

    function getStatusStyle(status) {
        switch(status) {
            case 0: return 'background: #fff8e1; color: #f57f17;';
            case 1: return 'background: #e8f5e9; color: #2e7d32;';
            case 2: return 'background: #e3f2fd; color: #1565c0;';
            case 3: return 'background: #fce4ec; color: #c62828;';
            default: return 'background: #f5f5f5; color: #666;';
        }
    }

    // ====== CẬP NHẬT STAT CARDS (Dashboard) ======
    function updateStats(requests) {
        const pending = requests.filter(r => r.status === 0 || r.status === 1).length;
        const completed = requests.filter(r => r.status === 2).length;
        const cancelled = requests.filter(r => r.status === 3).length;

        const elPending = document.getElementById('statPending');
        const elCompleted = document.getElementById('statCompleted');
        const elCancelled = document.getElementById('statCancelled');
        const elRating = document.getElementById('statRating');

        if (elPending) elPending.textContent = pending;
        if (elCompleted) elCompleted.textContent = completed;
        if (elCancelled) elCancelled.textContent = cancelled;

        // Rating: fetch from profile
        if (elRating) {
            fetch(`${API_BASE_URL}/api/profiles/${workerProfileId}`)
                .then(r => r.json())
                .then(data => { elRating.textContent = (data.rating || 0).toFixed(1); })
                .catch(() => {});
        }
    }

    // ====== CHẤP NHẬN ======
    async function acceptRequest(requestId) {
        let confirmed = false;
        if (typeof showConfirmModal === 'function') {
            confirmed = await showConfirmModal("Bạn có chắc muốn chấp nhận yêu cầu này?");
        } else {
            confirmed = confirm('Bạn có chắc muốn chấp nhận yêu cầu này?');
        }
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/repairrequests/${requestId}/accept?workerId=${workerProfileId}`, {
                method: 'PUT'
            });

            if (response.ok) {
                if (typeof showModal !== 'undefined') showModal('Đã chấp nhận yêu cầu thành công!', 'success', { autoClose: 2000 });
                else alert('Chấp nhận thành công!');
                fetchRequests();
            } else {
                const error = await response.json();
                if (typeof showModal !== 'undefined') showModal(error.message || 'Không thể chấp nhận yêu cầu.', 'error');
                else alert(error.message || 'Lỗi chấp nhận yêu cầu');
            }
        } catch (error) {
            console.error(error);
            if (typeof showModal !== 'undefined') showModal('Lỗi kết nối máy chủ.', 'error');
            else alert('Lỗi kết nối máy chủ.');
        }
    }

    // ====== TỪ CHỐI ======
    async function rejectRequest(requestId) {
        let confirmed = false;
        if (typeof showConfirmModal === 'function') {
            confirmed = await showConfirmModal("Bạn có chắc muốn từ chối yêu cầu này?");
        } else {
            confirmed = confirm('Bạn có chắc muốn từ chối yêu cầu này?');
        }
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/repairrequests/${requestId}/reject?workerId=${workerProfileId}`, {
                method: 'PUT'
            });

            if (response.ok) {
                if (typeof showModal !== 'undefined') showModal('Đã từ chối yêu cầu.', 'success', { autoClose: 2000 });
                else alert('Đã từ chối.');
                fetchRequests();
            } else {
                const error = await response.json();
                if (typeof showModal !== 'undefined') showModal(error.message || 'Không thể từ chối yêu cầu.', 'error');
                else alert(error.message || 'Lỗi từ chối yêu cầu');
            }
        } catch (error) {
            console.error(error);
            if (typeof showModal !== 'undefined') showModal('Lỗi kết nối máy chủ.', 'error');
            else alert('Lỗi kết nối máy chủ.');
        }
    }

    // ====== HOÀN THÀNH ======
    async function completeRequest(requestId) {
        let confirmed = false;
        if (typeof showConfirmModal === 'function') {
            confirmed = await showConfirmModal("Xác nhận đã hoàn thành công việc này?");
        } else {
            confirmed = confirm('Xác nhận đã hoàn thành công việc này?');
        }
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/repairrequests/${requestId}/complete`, {
                method: 'PUT'
            });

            if (response.ok) {
                if (typeof showModal !== 'undefined') showModal('Đã hoàn thành yêu cầu! Chúc mừng bạn! 🎉', 'success', { autoClose: 2000 });
                else alert('Hoàn thành thành công!');
                fetchRequests();
            } else {
                const error = await response.json();
                if (typeof showModal !== 'undefined') showModal(error.message || 'Không thể hoàn thành yêu cầu.', 'error');
                else alert(error.message || 'Lỗi hoàn thành yêu cầu');
            }
        } catch (error) {
            console.error(error);
            if (typeof showModal !== 'undefined') showModal('Lỗi kết nối máy chủ.', 'error');
            else alert('Lỗi kết nối máy chủ.');
        }
    }

    fetchRequests();
});
