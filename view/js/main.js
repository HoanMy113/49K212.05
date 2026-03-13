/**
 * showModal – Thay thế alert() bằng giao diện đẹp, dùng chung toàn bộ ứng dụng
 * @param {string} message – Nội dung hiển thị
 * @param {"success"|"error"|"warning"} type – Loại thông báo
 * @param {object} options – { autoClose: ms, onClose: function, buttonText: string }
 */
function showModal(message, type = "success", options = {}) {
    const config = {
        success: { icon: '<i class="fa-solid fa-check text-success"></i>', bg: "#eaf3ed", color: "#4e7d63", title: "Thành công" },
        error:   { icon: '<i class="fa-solid fa-xmark text-danger"></i>', bg: "#fdecea", color: "#d32f2f", title: "Lỗi" },
        warning: { icon: "⚠️", bg: "#fff8e1", color: "#f57f17", title: "Thông báo" }
    };
    const c = config[type] || config.success;
    
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s ease;";
    
    const modal = document.createElement("div");
    modal.style.cssText = "background:#fff;padding:36px 32px;border-radius:24px;text-align:center;max-width:380px;width:90%;box-shadow:0 20px 50px rgba(0,0,0,.2);transform:translateY(20px) scale(.95);transition:all .4s cubic-bezier(.34,1.56,.64,1);";
    
    const btnText = options.buttonText || "Đóng";
    modal.innerHTML = `
        <div style="width:70px;height:70px;background:${c.bg};border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:34px;">${c.icon}</div>
        <h3 style="font-weight:800;color:#222;margin-bottom:8px;font-size:20px;">${c.title}</h3>
        <p style="color:#555;font-size:14.5px;line-height:1.6;margin-bottom:24px;">${message}</p>
        <button class="modal-close-btn" style="background:${c.color};color:#fff;border:none;padding:10px 28px;border-radius:30px;font-weight:700;font-size:15px;cursor:pointer;transition:.3s;width:100%;box-shadow:0 4px 12px ${c.color}33;">${btnText}</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Animation in
    requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        modal.style.transform = "translateY(0) scale(1)";
    });

    // Close logic
    function closeModal() {
        overlay.style.opacity = "0";
        modal.style.transform = "translateY(20px) scale(.95)";
        setTimeout(() => { overlay.remove(); if (options.onClose) options.onClose(); }, 300);
    }
    
    modal.querySelector(".modal-close-btn").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    
    // Hover effects
    const btn = modal.querySelector(".modal-close-btn");
    btn.addEventListener("mouseenter", () => { btn.style.filter = "brightness(0.9)"; btn.style.transform = "translateY(-2px)"; });
    btn.addEventListener("mouseleave", () => { btn.style.filter = "none"; btn.style.transform = "translateY(0)"; });
    
    // Auto close
    if (options.autoClose) {
        setTimeout(closeModal, options.autoClose);
    }
}

/**
 * showConfirmModal – Thay thế confirm() bằng giao diện đẹp
 * @param {string} message – Nội dung câu hỏi
 * @param {string} confirmText – Text nút xác nhận (mặc định: "Xác nhận")
 * @param {string} cancelText – Text nút hủy (mặc định: "Hủy bỏ")
 * @returns {Promise<boolean>} – true nếu người dùng xác nhận
 */
function showConfirmModal(message, confirmText = "Xác nhận", cancelText = "Hủy bỏ") {
    return new Promise(resolve => {
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s ease;";
        const modal = document.createElement("div");
        modal.style.cssText = "background:#fff;padding:36px 32px;border-radius:24px;text-align:center;max-width:380px;width:90%;box-shadow:0 20px 50px rgba(0,0,0,.2);transform:translateY(20px) scale(.95);transition:all .4s cubic-bezier(.34,1.56,.64,1);";
        modal.innerHTML = `
            <div style="width:70px;height:70px;background:#fff8e1;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:34px;">🤔</div>
            <h3 style="font-weight:800;color:#222;margin-bottom:8px;font-size:20px;">Xác nhận</h3>
            <p style="color:#555;font-size:14.5px;line-height:1.6;margin-bottom:24px;">${message}</p>
            <div style="display:flex;gap:12px;">
                <button class="confirm-no" style="flex:1;background:#f5f5f5;color:#666;border:none;padding:10px 0;border-radius:30px;font-weight:700;font-size:15px;cursor:pointer;transition:.3s;">${cancelText}</button>
                <button class="confirm-yes" style="flex:1;background:#4e7d63;color:#fff;border:none;padding:10px 0;border-radius:30px;font-weight:700;font-size:15px;cursor:pointer;transition:.3s;">${confirmText}</button>
            </div>
        `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.style.opacity = "1";
            modal.style.transform = "translateY(0) scale(1)";
        });
        function close(result) {
            overlay.style.opacity = "0";
            modal.style.transform = "translateY(20px) scale(.95)";
            setTimeout(() => { overlay.remove(); resolve(result); }, 300);
        }
        modal.querySelector(".confirm-yes").addEventListener("click", () => close(true));
        modal.querySelector(".confirm-no").addEventListener("click", () => close(false));
        overlay.addEventListener("click", (e) => { if (e.target === overlay) close(false); });
        // Hover effects
        const yesBtn = modal.querySelector(".confirm-yes");
        yesBtn.addEventListener("mouseenter", () => { yesBtn.style.filter = "brightness(0.9)"; });
        yesBtn.addEventListener("mouseleave", () => { yesBtn.style.filter = "none"; });
    });
}

/**
 * renderPagination – Tạo giao diện phân trang cho danh sách bô cấp
 * @param {HTMLElement} container – Element chứa nút phân trang
 * @param {number} totalItems – Tổng số item
 * @param {number} itemsPerPage – Số item mỗi trang
 * @param {number} currentPage – Trang hiện tại (1-based)
 * @param {function} onPageChange – Callback khi trang thay đổi
 */
function renderPagination(container, totalItems, itemsPerPage, currentPage, onPageChange) {
    if (!container) return;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }
    let html = `
        <div class="pagination-container">
            <button class="page-btn prev-page" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>
    `;
    // Hiển thị số trang (tối đa 5 trang xung quanh trang hiện tại)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn num-page ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `
            <button class="page-btn next-page" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>
        </div>
    `;
    container.innerHTML = html;
    // Events
    container.querySelector(".prev-page")?.addEventListener("click", () => onPageChange(currentPage - 1));
    container.querySelector(".next-page")?.addEventListener("click", () => onPageChange(currentPage + 1));
    container.querySelectorAll(".num-page").forEach(btn => {
        btn.addEventListener("click", () => onPageChange(parseInt(btn.dataset.page)));
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Global: Thêm amination chuyển trang mượt mà
    document.body.classList.add("page-fade-in");
    
    // Global: Thêm nút "Quay lại" tự động cho các trang con
    const path = window.location.pathname;
    const isSubPage = !path.endsWith("index.html") && !path.endsWith("/") && !path.includes("login.html") && !path.includes("register.html");
    if (isSubPage) {
        const mainContainer = document.querySelector("main.container");
        if (mainContainer) {
            const backBtn = document.createElement("button");
            backBtn.innerHTML = "← Quay lại";
            backBtn.className = "btn-back-global";
            backBtn.onclick = () => window.history.back();
            mainContainer.insertBefore(backBtn, mainContainer.firstChild);
        }
    }

    /* ================= AUTH SESSION ================= */
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    const navGuest = $(".nav-guest");
    const navUser = $("#navUser");
    const username = $("#username");
    
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
        if (navGuest) navGuest.style.display = "none";
        if (navUser) {
            navUser.style.display = "flex";
            // Inject Notification Bell if missing (Global fix for all pages)
            if (!navUser.querySelector('a[href="notifications.html"]')) {
                const bellHtml = `
                    <a href="notifications.html" class="nav-icon" style="text-decoration:none; position:relative; margin-right:15px;">
                        <img src="assets/images/bell.png" alt="Thông báo" style="width:24px;">
                    </a>
                `;
                const userDropdown = navUser.querySelector('.user-dropdown');
                if (userDropdown) {
                    userDropdown.insertAdjacentHTML('beforebegin', bellHtml);
                } else {
                    navUser.insertAdjacentHTML('afterbegin', bellHtml);
                }
            }
        }
        if (username) username.textContent = sessionStorage.getItem("fullName") || "Người dùng";
        
        // Hiện menu thợ nếu role=Worker
        if (sessionStorage.getItem("role") === "Worker") {
            const workerMenuGroup = document.getElementById("workerMenuGroup");
            if (workerMenuGroup) workerMenuGroup.style.display = "block";
            const customerMenuGroup = document.getElementById("customerMenuGroup");
            if (customerMenuGroup) customerMenuGroup.style.display = "none";
            
            // === WORKER DASHBOARD ===
            const heroSection = document.getElementById("heroSection");
            const workerDashboard = document.getElementById("workerDashboard");
            if (heroSection && workerDashboard) {
                heroSection.style.display = "none";
                workerDashboard.style.display = "block";
                const greetName = document.getElementById("workerGreetName");
                if (greetName) greetName.textContent = sessionStorage.getItem("fullName") || "Thợ sửa";
                
                // Load stats
                const wpId = sessionStorage.getItem("workerProfileId");
                if (wpId) {
                    fetch(`${API_BASE_URL}/api/repairrequests/worker/${wpId}`)
                        .then(r => r.json())
                        .then(requests => {
                            if (Array.isArray(requests)) {
                                const pending = requests.filter(r => r.status === 0).length;
                                const confirmed = requests.filter(r => r.status === 1).length;
                                const completed = requests.filter(r => r.status === 2).length;
                                const sp = document.getElementById("statPending");
                                const sc = document.getElementById("statConfirmed");
                                const sco = document.getElementById("statCompleted");
                                if (sp) sp.textContent = pending;
                                if (sc) sc.textContent = confirmed;
                                if (sco) sco.textContent = completed;
                            }
                        })
                        .catch(() => {});
                }
            }
        }

        // === REAL-TIME NOTIFICATION BADGE POLLING ===
        const currentPhone = sessionStorage.getItem("phone");
        if (currentPhone) {
            if (!document.getElementById("toastContainer")) {
                const toastContainer = document.createElement("div");
                toastContainer.id = "toastContainer";
                toastContainer.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999;";
                document.body.appendChild(toastContainer);
            }
            
            function showToast(title, message) {
                const container = document.getElementById("toastContainer");
                const toast = document.createElement("div");
                toast.className = "notif-toast";
                toast.style.cssText = `
                    background: #fff; border-left: 5px solid #28a745; border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.15); padding: 15px 20px;
                    margin-bottom: 15px; min-width: 300px; transform: translateX(120%);
                    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); cursor: pointer;
                `;
                toast.innerHTML = `
                    <div style="font-weight: 800; color: #333; font-size: 15px; margin-bottom: 4px;">${title}</div>
                    <div style="color: #666; font-size: 14px;">${message}</div>
                `;
                container.appendChild(toast);
                toast.addEventListener("click", () => window.location.href = "notifications.html");
                setTimeout(() => toast.style.transform = "translateX(0)", 100);
                setTimeout(() => {
                    toast.style.transform = "translateX(120%)";
                    setTimeout(() => toast.remove(), 400);
                }, 5000);
            }
            
            let lastNotifId = sessionStorage.getItem("lastNotifId") || null;
            function checkUnreadNotifications() {
                fetch(`${API_BASE_URL}/api/notifications?phone=${encodeURIComponent(currentPhone)}&t=${Date.now()}`)
                    .then(res => res.json())
                    .then(notifs => {
                        if (Array.isArray(notifs)) {
                            const unreadCount = notifs.filter(n => !n.isRead).length;
                            updateBadgeUI(unreadCount);
                            if (notifs.length > 0) {
                                const newestNotif = notifs[0];
                                if (lastNotifId && newestNotif.id > parseInt(lastNotifId) && !newestNotif.isRead) {
                                    showToast(newestNotif.title, newestNotif.message);
                                }
                                if (!lastNotifId || newestNotif.id > parseInt(lastNotifId)) {
                                    sessionStorage.setItem("lastNotifId", newestNotif.id);
                                    lastNotifId = newestNotif.id;
                                }
                            }
                        }
                    })
                    .catch(() => {});
            }
            
            function updateBadgeUI(count) {
                const notifLinks = document.querySelectorAll('a[href="notifications.html"]');
                notifLinks.forEach(link => {
                    let badge = link.querySelector('.notif-badge');
                    if (count > 0) {
                        if (!badge) {
                            link.style.position = 'relative';
                            badge = document.createElement('span');
                            badge.className = 'notif-badge';
                            link.appendChild(badge);
                        }
                        badge.textContent = count > 99 ? '99+' : count;
                        badge.style.display = 'block';
                    } else if (badge) {
                        badge.style.display = 'none';
                    }
                });
            }
            
            checkUnreadNotifications();
            let pollingId = setInterval(checkUnreadNotifications, 10000);
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) clearInterval(pollingId);
                else {
                    checkUnreadNotifications();
                    pollingId = setInterval(checkUnreadNotifications, 10000);
                }
            });
        }
    }

    // US_20: Đăng xuất (Global)
    function handleLogout(e) {
        if (e) e.preventDefault();
        sessionStorage.clear();
        window.location.replace("index.html");
    }
    document.addEventListener("click", function (e) {
        const target = e.target.closest("#logoutBtn, #logoutBtnSide, .btn-logout-side");
        if (target) handleLogout(e);
    });

    /* CATEGORY DROPDOWN */
    const categoryToggle = $("#categoryToggle");
    const categoryDropdown = $("#categoryDropdown");
    const categoryArrow = $("#categoryArrow");
    const categoryText = $("#categoryText");
    const checkboxes = $$("#categoryDropdown input[type='checkbox']");

    function closeCategoryDropdown() {
        if (!categoryDropdown) return;
        categoryDropdown.style.display = "none";
        if (categoryArrow) {
            categoryArrow.src = "assets/images/arrow-down.png";
            categoryArrow.classList.remove("fa-chevron-up");
            categoryArrow.classList.add("fa-chevron-down");
        }
    }

    categoryToggle?.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!categoryDropdown) return;
        const isOpen = categoryDropdown.style.display === "block";
        const willBeOpen = !isOpen;
        categoryDropdown.style.display = willBeOpen ? "block" : "none";
        if (categoryArrow) {
            categoryArrow.src = willBeOpen ? "assets/images/arrow-up.png" : "assets/images/arrow-down.png";
            categoryArrow.classList.toggle("fa-chevron-up", willBeOpen);
            categoryArrow.classList.toggle("fa-chevron-down", !willBeOpen);
        }
        closeLocationPopup();
    });

    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const selected = [];
            checkboxes.forEach(c => { if (c.checked) selected.push(c.parentElement.textContent.trim()); });
            if (categoryText) categoryText.innerText = selected.length > 0 ? selected.join(", ") : "Danh mục sửa chữa";
        });
    });

    /* LOCATION POPUP */
    const locationToggle = $("#locationToggle");
    const locationPanel = $("#locationPanel");
    const locationArrow = $("#locationArrow");
    const locationText = $("#locationText");
    const provinceColumn = $("#provinceColumn");
    const districtColumn = $("#districtColumn");
    const saveLocationBtn = $("#saveLocation");
    const clearAllBtn = $("#clearAll");
    let selectedProvince = "";
    let selectedDistrict = "";

    function closeLocationPopup() {
        if (!locationPanel) return;
        locationPanel.style.display = "none";
        if (locationArrow) {
            locationArrow.src = "assets/images/arrow-down.png";
            locationArrow.classList.remove("fa-chevron-up");
            locationArrow.classList.add("fa-chevron-down");
        }
    }

    locationToggle?.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!locationPanel) return;
        const isOpen = locationPanel.style.display === "block";
        const willBeOpen = !isOpen;
        locationPanel.style.display = willBeOpen ? "block" : "none";
        if (locationArrow) {
            locationArrow.classList.toggle("fa-chevron-up", willBeOpen);
            locationArrow.classList.toggle("fa-chevron-down", !willBeOpen);
        }
        closeCategoryDropdown();
    });

    const locationDataLocal = {
        "Hà Nội": ["Ba Đình", "Cầu Giấy", "Đống Đa", "Đông Anh", "Hoàn Kiếm", "Hoàng Mai"],
        "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7"],
        "Bình Dương": ["Thủ Dầu Một", "Dĩ An"],
        "Bắc Ninh": [], "Đồng Nai": [], "Hưng Yên": [], "Hải Dương": [], "Đà Nẵng": [], "Hải Phòng": [],
    };

    function renderProvince() {
        if (!provinceColumn) return;
        provinceColumn.innerHTML = "";
        Object.keys(locationDataLocal).forEach(p => {
            const div = document.createElement("div");
            div.className = "province-item";
            div.textContent = p;
            div.addEventListener("click", () => {
                $$(".province-item").forEach(item => item.classList.remove("active"));
                div.classList.add("active");
                selectedProvince = p;
                renderDistrict(p);
            });
            provinceColumn.appendChild(div);
        });
    }

    function renderDistrict(province) {
        if (!districtColumn) return;
        districtColumn.innerHTML = "";
        const districts = locationDataLocal[province] || [];
        const allDiv = document.createElement("div");
        allDiv.className = "district-item active";
        allDiv.innerHTML = `<input type="checkbox"><span>Tất cả Quận/Huyện</span>`;
        allDiv.addEventListener("click", () => {
            $$(".district-item").forEach(d => d.classList.remove("active"));
            allDiv.classList.add("active");
            selectedDistrict = "";
        });
        districtColumn.appendChild(allDiv);
        districts.forEach(d => {
            const div = document.createElement("div");
            div.className = "district-item";
            div.innerHTML = `<input type="checkbox"><span>${d}</span>`;
            div.addEventListener("click", () => {
                $$(".district-item").forEach(d => d.classList.remove("active"));
                div.classList.add("active");
                selectedDistrict = d;
            });
            districtColumn.appendChild(div);
        });
    }

    saveLocationBtn?.addEventListener("click", () => {
        if (locationText) locationText.innerText = selectedProvince ? (selectedDistrict ? `${selectedProvince}, ${selectedDistrict}` : selectedProvince) : "Địa điểm";
        closeLocationPopup();
    });

    clearAllBtn?.addEventListener("click", () => {
        selectedProvince = ""; selectedDistrict = "";
        $$(".province-item").forEach(p => p.classList.remove("active"));
        if (districtColumn) districtColumn.innerHTML = "";
    });

    renderProvince();

    /* SEARCH LOGIC */
    const searchBtn = $(".search-main-btn");
    let searchWorkers = [];
    const selectedWorkerIds = new Set();
    const searchItemsPerPage = 6;
    let currentSearchPage = 1;

    searchBtn?.addEventListener("click", async function () {
        closeLocationPopup();
        closeCategoryDropdown();
        
        if (sessionStorage.getItem("isLoggedIn") !== "true") {
            showModal("Vui lòng đăng nhập để tìm kiếm và đặt thợ sửa chữa.", "warning", {
                buttonText: "Đăng nhập",
                onClose: () => window.location.href = "login.html"
            });
            return;
        }

        const selectedCategories = [];
        checkboxes.forEach(cb => { if (cb.checked) selectedCategories.push(cb.parentElement.textContent.trim()); });
        const locationStr = selectedProvince ? (selectedDistrict ? `${selectedProvince}, ${selectedDistrict}` : selectedProvince) : "";

        const params = new URLSearchParams();
        if (selectedCategories.length > 0) params.append("category", selectedCategories.join(","));
        if (locationStr) params.append("location", locationStr);

        let resultsSection = document.getElementById("searchResults");
        if (!resultsSection) {
            resultsSection = document.createElement("section");
            resultsSection.id = "searchResults";
            resultsSection.className = "search-results container my-5";
            document.querySelector("main").appendChild(resultsSection);
        }
        resultsSection.innerHTML = `<div class="text-center"><div class="spinner-border text-success"></div><p>Đang tìm kiếm...</p></div>`;

        try {
            const res = await fetch(`${API_BASE_URL}/api/profiles/search?${params.toString()}`);
            const data = await res.json();
            if (!data || data.length === 0) {
                resultsSection.innerHTML = `<div class="alert alert-warning text-center">Chưa có dữ liệu thợ phù hợp.</div>`;
                return;
            }

            await Promise.all(data.map(async (worker) => {
                try {
                    const rRes = await fetch(`${API_BASE_URL}/api/reviews/worker/${worker.id}`);
                    if (rRes.ok) {
                        const rData = await rRes.json();
                        worker.displayRating = rData.averageRating != null ? parseFloat(rData.averageRating) : (worker.rating || 0);
                    } else worker.displayRating = worker.rating || 0;
                } catch { worker.displayRating = worker.rating || 0; }
            }));

            searchWorkers = data;
            resultsSection.innerHTML = `
                <h3 class="fw-bold mb-3">Danh sách thợ phù hợp (${data.length})</h3>
                <div class="d-flex justify-content-between mb-3">
                    <label style="cursor:pointer;"><input type="checkbox" id="selectAllWorkers"> Chọn tất cả</label>
                    <span id="selectedCount"></span>
                </div>
                <div class="row g-4" id="resultsGrid"></div>
                <div id="searchPagination" class="mt-4"></div>
            `;
            
            let fab = document.getElementById("multiSelectFab");
            if (!fab) {
                fab = document.createElement("button");
                fab.id = "multiSelectFab";
                fab.style.cssText = "position:fixed; bottom:30px; right:30px; background:#4e7d63; color:#fff; border:none; padding:14px 28px; border-radius:50px; font-weight:800; z-index:9990; display:none;";
                fab.onclick = () => window.location.href = `create-request.html?workers=${Array.from(selectedWorkerIds).join(",")}`;
                document.body.appendChild(fab);
            }

            document.getElementById("selectAllWorkers")?.addEventListener("change", function() {
                document.querySelectorAll(".worker-select-cb").forEach(cb => {
                    cb.checked = this.checked;
                    if (this.checked) selectedWorkerIds.add(cb.dataset.workerId); else selectedWorkerIds.delete(cb.dataset.workerId);
                });
                updateSelectedCount();
            });

            renderSearchPage(1);
        } catch (err) {
            resultsSection.innerHTML = `<div class="alert alert-danger text-center">Lỗi kết nối máy chủ.</div>`;
        }
    });

    function renderSearchPage(page) {
        currentSearchPage = page;
        const grid = document.getElementById("resultsGrid");
        const pag = document.getElementById("searchPagination");
        const start = (page - 1) * searchItemsPerPage;
        const paged = searchWorkers.slice(start, start + searchItemsPerPage);
        renderWorkersList(grid, paged);
        renderPagination(pag, searchWorkers.length, searchItemsPerPage, page, renderSearchPage);
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderWorkersList(grid, workers) {
        grid.innerHTML = "";
        workers.forEach(w => {
            const stars = "⭐".repeat(Math.round(w.displayRating));
            let sHTML = (w.services || []).slice(0, 3).map(s => `<span class="worker-service-tag">${s}</span>`).join("");
            if (w.services?.length > 3) sHTML += `<span class="worker-service-tag text-muted">+${w.services.length - 3}</span>`;
            
            const div = document.createElement("div");
            div.className = "col-md-6 col-lg-4";
            div.innerHTML = `
                <div class="worker-card-premium" style="position:relative;">
                    <input type="checkbox" class="worker-select-cb" data-worker-id="${w.id}" style="position:absolute; top:12px; left:12px; z-index:5;">
                    <div class="worker-card-body">
                        <div class="d-flex justify-content-between">
                            <h6 class="worker-name">${w.nameOrStore || "---"}</h6>
                            <div class="worker-rating-pill">⭐ ${w.displayRating.toFixed(1)}</div>
                        </div>
                        <div class="worker-location-text"><i class="fa-solid fa-location-dot"></i> ${w.location || "---"}</div>
                        <div class="worker-service-tags">${sHTML}</div>
                    </div>
                    <div class="worker-card-footer d-flex gap-2">
                        <a href="repairman-detail.html?id=${w.id}" class="btn btn-outline-secondary btn-sm rounded-pill flex-grow-1">Chi tiết</a>
                        <a href="create-request.html?workerId=${w.id}" class="btn btn-success btn-sm rounded-pill flex-grow-1" style="background:#4e7d63;">Chọn thợ</a>
                    </div>
                </div>
            `;
            grid.appendChild(div);
        });
        grid.querySelectorAll(".worker-select-cb").forEach(cb => {
            if (selectedWorkerIds.has(cb.dataset.workerId)) cb.checked = true;
            cb.onchange = () => { if (cb.checked) selectedWorkerIds.add(cb.dataset.workerId); else selectedWorkerIds.delete(cb.dataset.workerId); updateSelectedCount(); };
        });
        updateSelectedCount();
    }

    function updateSelectedCount() {
        const countEl = document.getElementById("selectedCount");
        const fab = document.getElementById("multiSelectFab");
        const total = selectedWorkerIds.size;
        if (countEl) countEl.textContent = total > 0 ? `Đã chọn ${total} thợ` : "";
        if (fab) { fab.style.display = total > 0 ? "block" : "none"; fab.innerHTML = `Tạo đơn cho ${total} thợ`; }
    }

    /* USER DROPDOWN */
    const userAvatar = $("#userAvatar");
    const userMenu = $(".user-dropdown .dropdown-menu");
    userAvatar?.addEventListener("click", (e) => { e.stopPropagation(); userMenu.style.display = userMenu.style.display === "flex" ? "none" : "flex"; });
    document.addEventListener("click", () => { if (userMenu) userMenu.style.display = "none"; });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-bar-wrapper")) { closeLocationPopup(); closeCategoryDropdown(); }
    });
});