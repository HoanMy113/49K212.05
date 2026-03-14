document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userPhone = sessionStorage.getItem('userPhone');

    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const requestsList = document.getElementById('requestsList');
    let allRequests = [];
    let activeFilter = null;

    // ====== FETCH ======
    async function fetchMyRequests() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/RepairRequests?phone=${userPhone}`);
            if (!response.ok) throw new Error('Không thể tải yêu cầu');
            const data = await response.json();
            allRequests = data;
            updateStats();
            applyFilter();
        } catch (error) {
            console.error(error);
            requestsList.innerHTML = '<div class="empty-state"><div class="icon-circle">!</div><p>Có lỗi xảy ra khi tải dữ liệu.</p></div>';
        }
    }

    // ====== STAT CARDS ======
    function updateStats() {
        const pending = allRequests.filter(r => r.status === 0).length;
        const confirmed = allRequests.filter(r => r.status === 1).length;
        const completed = allRequests.filter(r => r.status === 2).length;
        const cancelled = allRequests.filter(r => r.status === 3).length;

        const el = id => document.getElementById(id);
        if (el('statPending')) el('statPending').textContent = pending;
        if (el('statConfirmed')) el('statConfirmed').textContent = confirmed;
        if (el('statCompleted')) el('statCompleted').textContent = completed;
        if (el('statCancelled')) el('statCancelled').textContent = cancelled;
    }

    // ====== FILTER ======
    const filterMap = {
        'pending':   { statuses: [0], label: '— Đang chờ' },
        'confirmed': { statuses: [1], label: '— Đã xác nhận' },
        'completed': { statuses: [2], label: '— Hoàn thành' },
        'cancelled': { statuses: [3], label: '— Đã huỷ' }
    };

    function applyFilter() {
        let filtered;
        const filterLabel = document.getElementById('filterLabel');
        const clearBtn = document.getElementById('clearFilterBtn');

        if (activeFilter && filterMap[activeFilter]) {
            const { statuses, label } = filterMap[activeFilter];
            filtered = allRequests.filter(r => statuses.includes(r.status));
            if (filterLabel) filterLabel.textContent = label;
            if (clearBtn) clearBtn.style.display = 'inline-block';
        } else {
            filtered = allRequests;
            if (filterLabel) filterLabel.textContent = '';
            if (clearBtn) clearBtn.style.display = 'none';
        }

        document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
            card.classList.toggle('active', card.dataset.filter === activeFilter);
        });

        renderRequests(filtered);
    }

    // Stat card click
    document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
        card.addEventListener('click', () => {
            const f = card.dataset.filter;
            activeFilter = (activeFilter === f) ? null : f;
            applyFilter();
        });
    });

    // Clear filter
    document.getElementById('clearFilterBtn')?.addEventListener('click', () => {
        activeFilter = null;
        applyFilter();
    });

    // ====== RENDER ======
    function renderRequests(requests) {
        if (!requests || requests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <div class="icon-circle">—</div>
                    <p>Không có yêu cầu nào ở trạng thái này.</p>
                </div>
            `;
            return;
        }

        requestsList.innerHTML = requests.map(req => {
            const dateStr = new Date(req.createdAt).toLocaleDateString('vi-VN');
            const workerHtml = req.workerName
                ? `<span class="fw-bold text-dark">${req.workerName}</span>`
                : `<span class="fst-italic text-muted">Chưa phân công</span>`;

            let actionsHtml = '';
            if (req.status === 0) {
                actionsHtml = `<button class="btn btn-outline-danger btn-sm rounded-pill px-4 fw-bold btn-cancel" data-id="${req.id}">Huỷ yêu cầu</button>`;
            } else if (req.status === 2) {
                actionsHtml = `<a href="review.html?requestId=${req.id}&workerId=${req.workerId}" class="btn btn-warning btn-sm rounded-pill px-4 fw-bold text-white">Đánh giá</a>`;
            }

            return `
                <div class="bg-white rounded-4 shadow-sm border border-light p-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 position-relative overflow-hidden" style="transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 15px rgba(0,0,0,0.05)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 0.125rem 0.25rem rgba(0,0,0,0.075)'">
                    
                    <!-- Color strip on left -->
                    <div class="position-absolute top-0 bottom-0 start-0 ${getStripClass(req.status)}" style="width: 5px;"></div>
                    
                    <div class="flex-grow-1 ms-2">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <h3 class="fs-5 fw-bold text-dark mb-0">${req.category}</h3>
                            <span class="text-muted small fw-semibold">#${req.id}</span>
                        </div>
                        <div class="d-flex flex-column flex-md-row gap-2 gap-md-4 text-secondary small">
                            <span><i class="fa-regular fa-calendar me-1"></i> <span class="fw-semibold">Ngày tạo:</span> ${dateStr}</span>
                            <span><i class="fa-solid fa-user-gear me-1"></i> <span class="fw-semibold">Thợ phụ trách:</span> ${workerHtml}</span>
                        </div>
                        ${req.description ? `<p class="text-muted mt-2 mb-0 small"><i class="fa-solid fa-quote-left me-1 text-light"></i>${req.description}</p>` : ''}
                    </div>
                    
                    <div class="d-flex flex-column align-items-end gap-3 min-w-150">
                        <span class="badge rounded-pill px-3 py-2 fw-semibold ${getBadgeClass(req.status)}">
                            ${getStatusText(req.status)}
                        </span>
                        ${actionsHtml ? `<div>${actionsHtml}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Cancel handlers
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                let confirmed = false;
                if (typeof showConfirmModal === 'function') {
                    confirmed = await showConfirmModal("Bạn có chắc muốn huỷ yêu cầu này?");
                } else {
                    confirmed = confirm('Bạn có chắc muốn huỷ yêu cầu này?');
                }
                if (confirmed) await cancelRequest(id);
            });
        });
    }

    // ====== CANCEL ======
    async function cancelRequest(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/RepairRequests/${id}/cancel`, { method: 'PUT' });
            if (response.ok) {
                if (typeof showModal !== 'undefined') showModal('Đã hủy yêu cầu thành công.', 'success', { autoClose: 2000 });
                else alert('Hủy yêu cầu thành công.');
                fetchMyRequests();
            } else {
                const error = await response.json();
                if (typeof showModal !== 'undefined') showModal(error.message || 'Không thể hủy yêu cầu.', 'error');
                else alert(error.message || 'Lỗi hủy yêu cầu');
            }
        } catch (err) {
            console.error(err);
        }
    }

    // ====== HELPERS ======
    function getStatusText(status) {
        switch(status) {
            case 0: return 'Đang chờ';
            case 1: return 'Đã xác nhận';
            case 2: return 'Hoàn thành';
            case 3: return 'Đã hủy';
            default: return status;
        }
    }

    function getStripClass(status) {
        switch(status) {
            case 0: return 'bg-warning';
            case 1: return 'bg-info';
            case 2: return 'bg-success';
            case 3: return 'bg-secondary';
            default: return 'bg-light';
        }
    }

    function getBadgeClass(status) {
        switch(status) {
            case 0: return 'text-bg-warning text-dark';
            case 1: return 'text-bg-info text-white';
            case 2: return 'text-bg-success';
            case 3: return 'text-bg-secondary';
            default: return 'text-bg-light';
        }
    }

    fetchMyRequests();
});
