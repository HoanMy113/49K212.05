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
    const isSubPage = !path.endsWith("index.html") && !path.endsWith("/") && !path.includes("login.html") && !path.includes("register.html") && !path.includes("create-request.html");
    if (isSubPage) {
        const mainContainer = document.querySelector("main.container");
        if (mainContainer) {
            // Only inject if no custom back button exists (searching for common classes or links to index)
            const hasExistingBack = mainContainer.querySelector('.btn-back-global, .back-btn, a[href="index.html"]');
            if (!hasExistingBack) {
                const backBtn = document.createElement("button");
                backBtn.innerHTML = "← Quay lại";
                backBtn.className = "btn-back-global";
                backBtn.onclick = () => window.history.back();
                mainContainer.insertBefore(backBtn, mainContainer.firstChild);
            }
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
        
        // Cập nhật ảnh đại diện nếu có trong session
        const savedAvatar = sessionStorage.getItem("userAvatar");
        if (savedAvatar) {
            const avatarImg = document.querySelector("#userAvatar img");
            if (avatarImg) avatarImg.src = savedAvatar;
        }
        
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
        window.location.replace("login.html");
    }
    document.addEventListener("click", function (e) {
        const target = e.target.closest("#logoutBtn, #logoutBtnSide, .btn-logout-side, .logout-btn");
        if (target) handleLogout(e);
    });

    // Auth-based Profile navigations
    const navProfileLink = document.getElementById('navProfileLink');
    if (navProfileLink) {
        navProfileLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (sessionStorage.getItem('userRole') === 'Repairman') {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'customer-profile.html';
            }
        });
    }
    
    const navProfileNav = document.getElementById('navProfileNav');
    if (navProfileNav) {
        navProfileNav.addEventListener('click', (e) => {
            e.preventDefault();
            if (sessionStorage.getItem('userRole') === 'Repairman') {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'customer-profile.html';
            }
        });
    }
    
    const navManageRequests = document.getElementById('navManageRequests');
    if (navManageRequests) {
        navManageRequests.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'my-requests.html';
        });
    }
    
    // Helper to format VND
    function formatVND(val) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    }

    /* CATEGORY DROPDOWN */
    const categoryToggle = $("#categoryToggle");
    const categoryDropdown = $(".category-dropdown");
    const categoryArrow = $("#categoryArrow");
    const categoryText = $("#categoryText");
    const categoryCheckboxes = document.querySelectorAll(".category-dropdown input[type='checkbox']");

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

    // Category Apply Button Logic
    const applyCat = document.querySelector('.apply-category');
    if (applyCat) {
        applyCat.addEventListener('click', () => {
            const selected = [];
            categoryCheckboxes.forEach(c => { if (c.checked) selected.push(c.parentElement.textContent.trim()); });
            if (categoryText) {
                if (selected.length === 0) categoryText.innerText = "Danh mục sửa chữa";
                else if (selected.length === 1) categoryText.innerText = selected[0];
                else categoryText.innerText = `Đã chọn ${selected.length} danh mục`;
            }
            closeCategoryDropdown();
        });
    }

    // Category Clear All Logic
    const clearCat = document.querySelector('.clear-category');
    if (clearCat) {
        clearCat.addEventListener('click', () => {
            categoryCheckboxes.forEach(c => c.checked = false);
            if (categoryText) categoryText.innerText = "Danh mục sửa chữa";
        });
    }

    // Category Text Search Filtering
    const searchCat = document.getElementById('categorySearch');
    if (searchCat) {
        searchCat.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.category-item');
            items.forEach(item => {
                const text = item.textContent.trim().toLowerCase();
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    }

    /* ================= LOCATION POPUP ================= */
    const locationToggle = $("#locationToggle");
    const locationPanel = $("#locationPanel");
    const locationArrow = $("#locationArrow");
    const locationText = $("#locationText");

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
        if (willBeOpen && !window.provincesLoaded) loadProvinces();
    });

    // === LOCATION LOGIC (Provinces API) ===
    let allProvinces = [];
    let selectedProvinceName = '';
    let selectedDistrictName = '';

    async function loadProvinces() {
        const pCol = document.getElementById('provinceColumn');
        if(!pCol) return;
        pCol.innerHTML = '<div class="text-center mt-4"><div class="spinner-border spinner-border-sm text-success"></div></div>';
        try {
            const res = await fetch('https://provinces.open-api.vn/api/?depth=2');
            allProvinces = await res.json();
            renderProvinces(allProvinces);
            window.provincesLoaded = true;
        } catch(e) {
            pCol.innerHTML = '<div class="text-danger p-2">Lỗi tải vị trí</div>';
        }
    }

    function renderProvinces(list) {
        const pCol = document.getElementById('provinceColumn');
        if(!pCol) return;
        pCol.innerHTML = '';
        list.forEach(p => {
            const div = document.createElement('div');
            div.className = 'province-item';
            div.textContent = p.name;
            div.onclick = () => {
                document.querySelectorAll('.province-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                selectedProvinceName = p.name;
                selectedDistrictName = '';
                renderDistricts(p.districts);
            };
            pCol.appendChild(div);
        });
    }

    function renderDistricts(dList) {
        const dCol = document.getElementById('districtColumn');
        if(!dCol) return;
        dCol.innerHTML = '';
        dList.forEach(d => {
            const lbl = document.createElement('label');
            lbl.className = 'district-item';
            lbl.style.display = 'flex';
            lbl.style.alignItems = 'center';
            lbl.style.gap = '10px';
            lbl.innerHTML = `<input type="radio" name="districtRadio" value="${d.name}"> <span>${d.name}</span>`;
            lbl.querySelector('input').onchange = () => {
                selectedDistrictName = d.name;
            };
            dCol.appendChild(lbl);
        });
    }

    // Location Apply
    const applyLoc = document.getElementById('saveLocation');
    const clearLoc = document.getElementById('clearAll');
    
    if(applyLoc) {
        applyLoc.addEventListener('click', () => {
            if(selectedProvinceName) {
                let txt = selectedProvinceName;
                if(selectedDistrictName) txt += `, ${selectedDistrictName}`;
                if(locationText) locationText.textContent = txt;
                // Save globally for search button
                window.selectedProvince = selectedProvinceName;
                window.selectedDistrict = selectedDistrictName;
            }
            if(locationPanel) locationPanel.style.display = 'none';
        });
    }

    if(clearLoc) {
        clearLoc.addEventListener('click', () => {
            selectedProvinceName = '';
            selectedDistrictName = '';
            window.selectedProvince = '';
            window.selectedDistrict = '';
            document.querySelectorAll('.province-item').forEach(el => el.classList.remove('active'));
            const dCol = document.getElementById('districtColumn');
            if(dCol) dCol.innerHTML = '';
            if(locationText) locationText.textContent = 'Địa điểm';
        });
    }

    // Location Search Filters
    const locInputs = document.querySelectorAll('.location-header .search-input input');
    if(locInputs.length >= 2) {
        // Province Search
        locInputs[0].addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allProvinces.filter(p => p.name.toLowerCase().includes(term));
            renderProvinces(filtered);
            const dCol = document.getElementById('districtColumn');
            if(dCol) dCol.innerHTML = '';
            selectedProvinceName = '';
            selectedDistrictName = '';
        });
        // District Search (client side filtering of currently visible districts)
        locInputs[1].addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.district-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                if(text.includes(term)) item.style.display = 'flex';
                else item.style.display = 'none';
            });
        });
    }

    /* SEARCH LOGIC */
    const searchBtn = document.querySelector(".search-main-btn");
    let searchWorkers = [];
    const selectedWorkerIds = new Set();
    const searchItemsPerPage = 6;
    let currentSearchPage = 1;

    if (searchBtn) {
        searchBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            closeLocationPopup();
            closeCategoryDropdown();
            
            if (sessionStorage.getItem("isLoggedIn") !== "true") {
                alert("Vui lòng đăng nhập để tìm kiếm và đặt thợ sửa chữa.");
                window.location.href = "login.html";
                return;
            }

            const selectedCategories = [];
            categoryCheckboxes.forEach(cb => { if (cb.checked) selectedCategories.push(cb.parentElement.textContent.trim()); });
            const params = new URLSearchParams();
            if (selectedCategories.length > 0) params.append("category", selectedCategories.join(","));
            
            const locProv = window.selectedProvince || "";
            const locDist = window.selectedDistrict || "";
            const locationStr = locProv ? (locDist ? `${locProv}, ${locDist}` : locProv) : "";
            
            if (locationStr) params.append("location", locationStr);

            let resultsSection = document.getElementById("searchResults");
            if (!resultsSection) {
                resultsSection = document.createElement("section");
                resultsSection.id = "searchResults";
                resultsSection.className = "search-results container mt-0 mb-4";
                document.querySelector("main").appendChild(resultsSection);
            }
            resultsSection.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-success mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
                    <h5 style="color:#2c3e50; font-weight:700;">Đang tìm kiếm thợ tốt nhất cho bạn...</h5>
                </div>`;

            try {
                const res = await fetch(`${API_BASE_URL}/api/profiles/search?${params.toString()}`);
                const data = await res.json();
                if (!data || data.length === 0) {
                    resultsSection.innerHTML = `
                        <div class="text-center py-5" style="background:white; border-radius:20px; box-shadow:0 8px 30px rgba(0,0,0,0.06);">
                            <i class="fa-solid fa-face-frown text-muted" style="font-size:64px; margin-bottom:20px; opacity:0.5;"></i>
                            <h4 style="color:#2c3e50; font-weight:800;">Không tìm thấy thợ phù hợp</h4>
                            <p style="color:#777; font-size:16px;">Vui lòng thử chọn danh mục hoặc địa điểm khác.</p>
                        </div>`;
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
                    <div class="d-flex justify-content-between align-items-end mb-3 border-bottom pb-2">
                        <div>
                            <h2 style="font-weight:800; color:#2c3e50; margin:0; font-size:22px;"><i class="fa-solid fa-users text-success me-2"></i> Danh sách thợ phù hợp</h2>
                            <p style="color:#666; font-size:14px; margin:4px 0 0 0;">Tìm thấy <strong>${data.length}</strong> thợ dựa trên lựa chọn của bạn</p>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-2 bg-white p-2 px-3 rounded-3 shadow-sm">
                        <label style="cursor:pointer; font-weight:700; color:#2c3e50; display:flex; align-items:center; gap:10px; font-size:14px;">
                            <input type="checkbox" id="selectAllWorkers" style="width:18px; height:18px;"> Chọn tất cả thợ
                        </label>
                        <span id="selectedCount" style="font-weight:700; color:#e67e22; font-size:14px;"></span>
                    </div>
                    
                    <div class="row g-3" id="resultsGrid"></div>
                    <div id="searchPagination" class="mt-3 d-flex justify-content-center"></div>
                `;
                
                let fab = document.getElementById("multiSelectFab");
                if (!fab) {
                    fab = document.createElement("button");
                    fab.id = "multiSelectFab";
                    fab.style.cssText = "position:fixed; bottom:40px; right:40px; background:linear-gradient(135deg, #4e7d63, #3a9d6e); color:#fff; border:none; padding:16px 32px; border-radius:50px; font-weight:800; font-size:16px; z-index:9990; display:none; box-shadow:0 10px 30px rgba(78,125,99,0.4); transition:all 0.3s; cursor:pointer;";
                    fab.onmouseover = () => fab.style.transform = "translateY(-3px)";
                    fab.onmouseout = () => fab.style.transform = "none";
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
    }

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
            const div = document.createElement("div");
            div.className = "col-md-6 col-lg-4";
            div.innerHTML = `
                <div class="worker-card-premium" style="position:relative; background:white; border-radius:14px; padding:16px; box-shadow:0 4px 15px rgba(0,0,0,0.04); transition:transform 0.2s; height:100%; display:flex; flex-direction:column;">
                    <input type="checkbox" class="worker-select-cb" data-worker-id="${w.id}" style="position:absolute; top:15px; right:15px; z-index:5; width:20px; height:20px; cursor:pointer;">
                    
                    <div class="worker-card-body" style="flex-grow:1;">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="worker-avatar-container" style="width:56px; height:56px; border-radius:50%; overflow:hidden; border:2px solid #eaf3ed; flex-shrink:0;">
                                <img src="${w.avatarUrl ? (w.avatarUrl.startsWith('http') ? w.avatarUrl : API_BASE_URL + w.avatarUrl) : 'https://cdn-icons-png.flaticon.com/512/147/147144.png'}" 
                                     alt="Avatar" style="width:100%; height:100%; object-fit:cover;">
                            </div>
                            <div style="flex-grow:1; min-width:0;">
                                <h5 class="worker-name m-0" style="font-weight:800; color:#2c3e50; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${w.nameOrStore || "---"}</h5>
                                <div class="worker-rating-pill" style="display:inline-block; color:#f39c12; font-weight:700; font-size:13px;">
                                    <i class="fa-solid fa-star"></i> ${w.displayRating.toFixed(1)}
                                </div>
                            </div>
                        </div>
                        
                        <div class="worker-location-text mb-2" style="color:#666; font-size:13px; display:flex; gap:8px; line-height:1.4;">
                            <i class="fa-solid fa-location-dot mt-1" style="color:#e74c3c;"></i> 
                            <span style="overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${w.address || w.location || "---"}</span>
                        </div>
                        
                        <div class="worker-service-tags" style="display:flex; flex-wrap:wrap; gap:6px;">
                            ${(() => {
                                let sList = [];
                                if (Array.isArray(w.services)) {
                                    sList = w.services;
                                } else if (typeof w.services === 'string') {
                                    try { sList = JSON.parse(w.services); } catch(e) { sList = [w.services]; }
                                }
                                const top3 = sList.slice(0, 3);
                                let html = top3.map(s => `<span style="background:#eaf3ed; color:#4e7d63; padding:4px 10px; border-radius:8px; font-size:11px; font-weight:700;">${s}</span>`).join("");
                                if (sList.length > 3) html += `<span style="background:#f0f0f0; color:#888; padding:4px 8px; border-radius:8px; font-size:11px; font-weight:700;">+${sList.length - 3}</span>`;
                                return html;
                            })()}
                        </div>
                    </div>
                    
                    <div class="worker-card-footer d-flex gap-2 mt-3 pt-3" style="border-top:1px solid #f0f0f0;">
                        <a href="worker-detail.html?id=${w.id}" class="btn flex-grow-1" style="background:#f8f9fa; color:#2c3e50; border:none; padding:10px; border-radius:12px; font-weight:700; font-size:14px; transition:all 0.2s;">Xem chi tiết</a>
                        <a href="create-request.html?workerId=${w.id}&workerName=${encodeURIComponent(w.nameOrStore || '')}" class="btn flex-grow-1" style="background:linear-gradient(135deg, #4e7d63, #3a9d6e); color:white; border:none; padding:10px; border-radius:12px; font-weight:700; font-size:14px; box-shadow:0 4px 15px rgba(78,125,99,0.3); transition:all 0.2s;">Chọn thợ</a>
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

    // ====== NOTIFICATION BADGE POLLING (30s) ======
    (function initNotificationBadge() {
        const phone = sessionStorage.getItem("userPhone");
        if (!phone || sessionStorage.getItem("isLoggedIn") !== "true") return;

        async function checkUnread() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/notifications/user/${phone}`);
                if (!res.ok) return;
                const notifs = await res.json();
                const unreadCount = notifs.filter(n => !n.isRead).length;

                // Update navbar bell badge
                const bellIcon = document.querySelector(".nav-icon");
                if (bellIcon) {
                    let badge = bellIcon.querySelector(".notif-badge");
                    if (unreadCount > 0) {
                        if (!badge) {
                            badge = document.createElement("span");
                            badge.className = "notif-badge";
                            badge.style.cssText = "position:absolute;top:-4px;right:-4px;background:#e74c3c;color:white;font-size:11px;font-weight:700;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 4px;box-shadow:0 2px 6px rgba(231,76,60,0.4);";
                            bellIcon.style.position = "relative";
                            bellIcon.appendChild(badge);
                        }
                        badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
                    } else if (badge) {
                        badge.remove();
                    }
                }

                // Update sidebar badge (worker dashboard)
                const sidebarBadge = document.getElementById("sidebarBadge");
                if (sidebarBadge) {
                    if (unreadCount > 0) {
                        sidebarBadge.style.display = "inline-block";
                        sidebarBadge.textContent = unreadCount > 9 ? "9+" : unreadCount;
                    } else {
                        sidebarBadge.style.display = "none";
                    }
                }
            } catch (e) {
                // Silently fail
            }
        }

        checkUnread();
        setInterval(checkUnread, 30000);
    })();
});