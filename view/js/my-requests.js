document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userPhone = sessionStorage.getItem('userPhone');

    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const requestsList = document.getElementById('requestsList');
    const paginationNav = document.getElementById('paginationNav');
    const paginationList = document.getElementById('paginationList');
    
    let allRequests = [];
    let activeFilter = null;
    let currentPage = 1;
    const itemsPerPage = 5;

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
        
        currentPage = 1; // Reset to first page on filter change
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
    async function renderRequests(requests) {
        if (!requests || requests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <div class="icon-circle">—</div>
                    <p>Không có yêu cầu nào ở trạng thái này.</p>
                </div>
            `;
            if (paginationNav) paginationNav.style.display = 'none';
            return;
        }

        // Pagination Logic
        const totalPages = Math.ceil(requests.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = requests.slice(startIndex, endIndex);

        // Kiểm tra đánh giá cho các đơn hoàn thành
        const reviewedSet = new Set();
        const completedItems = currentItems.filter(r => r.status === 2);
        await Promise.all(completedItems.map(async (req) => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/reviews/request/${req.id}`);
                if (res.ok) reviewedSet.add(req.id);
            } catch (e) { /* chưa đánh giá */ }
        }));

        requestsList.innerHTML = currentItems.map(req => {
            const dateStr = new Date(req.createdAt).toLocaleDateString('vi-VN');
            const workerHtml = req.workerName
                ? `<span class="fw-bold text-dark">${req.workerName}</span>`
                : `<span class="fst-italic text-muted">Chưa phân công</span>`;

            let actionsHtml = '';
            if (req.status === 0) {
                actionsHtml = `<button class="btn btn-outline-danger btn-sm rounded-pill px-4 fw-bold btn-cancel" data-id="${req.id}">Huỷ yêu cầu</button>`;
            } else if (req.status === 2) {
                if (reviewedSet.has(req.id)) {
                    actionsHtml = `<span class="badge bg-light text-success border border-success rounded-pill px-3 py-2 fw-bold"><i class="fa-solid fa-circle-check me-1"></i>Đã đánh giá</span>`;
                } else {
                    actionsHtml = `<a href="review.html?requestId=${req.id}&workerId=${req.workerId}" class="btn btn-warning btn-sm rounded-pill px-4 fw-bold text-white">Đánh giá</a>`;
                }
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
        
        renderPagination(totalPages, requests);
    }
    
    function renderPagination(totalPages, allFilteredRequests) {
        if (!paginationNav || !paginationList) return;

        if (totalPages <= 1) {
            paginationNav.style.display = 'none';
            return;
        }

        paginationNav.style.display = 'block';
        let html = '';

        // Prev btn
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link shadow-sm" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link shadow-sm" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Next btn
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link shadow-sm" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;

        paginationList.innerHTML = html;

        // Attach events
        paginationList.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.dataset.page);
                if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                    currentPage = page;
                    renderRequests(allFilteredRequests);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // ====== CANCEL ======
    async function cancelRequest(id) {
        try {
            // ====== BẢO MẬT: Gửi customerPhone để backend xác minh quyền hủy ======
            const userPhone = sessionStorage.getItem('userPhone');
            const cancelUrl = userPhone 
                ? `${API_BASE_URL}/api/RepairRequests/${id}/cancel?customerPhone=${encodeURIComponent(userPhone)}`
                : `${API_BASE_URL}/api/RepairRequests/${id}/cancel`;
            const response = await fetch(cancelUrl, { method: 'PUT' });
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
