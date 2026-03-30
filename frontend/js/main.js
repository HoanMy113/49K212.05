document.addEventListener("DOMContentLoaded", function () {

    /* ================= LOGIN DEMO ================= */

    const loginBtn = document.getElementById("loginBtn");
    const navGuest = document.querySelector(".nav-guest");
    const navUser = document.getElementById("navUser");
    const username = document.getElementById("username");

    loginBtn.addEventListener("click", function(){

        /*const user = "Người dùng"; // demo user*/

        navGuest.style.display = "none";
        navUser.style.display = "flex";

        username.textContent = user;

    });
    
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    /*CATEGORY DROPDOWN*/

    const categoryToggle = $("#categoryToggle");
    const categoryDropdown = $(".category-dropdown");
    const categoryArrow = $("#categoryArrow");
    const categoryText = $("#categoryText");

    const selectAll = $(".select-all");
    const clearBtn = $(".clear-category");
    const applyBtn = $(".apply-category");
    const categorySearch = $("#categorySearch");

    const checkboxes = categoryDropdown
        ? categoryDropdown.querySelectorAll('input[type="checkbox"]:not(.select-all)')
        : [];

    function closeCategoryDropdown() {
        if (!categoryDropdown) return;
        categoryDropdown.style.display = "none";
        if (categoryArrow) categoryArrow.src = "assets/images/arrow-down.png";
    }

    categoryToggle?.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!categoryDropdown) return;

        const isOpen = categoryDropdown.style.display === "block";
        categoryDropdown.style.display = isOpen ? "none" : "block";
        if (categoryArrow)
            categoryArrow.src = isOpen
                ? "assets/images/arrow-down.png"
                : "assets/images/arrow-up.png";

        closeLocationPopup();
    });

    selectAll?.addEventListener("change", function () {
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
    });

    clearBtn?.addEventListener("click", function () {
        checkboxes.forEach(cb => cb.checked = false);
        if (selectAll) selectAll.checked = false;
    });

    applyBtn?.addEventListener("click", function () {
        const selected = [];

        checkboxes.forEach(cb => {
            if (cb.checked) {
                selected.push(cb.parentElement.textContent.trim());
            }
        });

        if (selected.length > 0 && categoryText) {
            categoryText.innerText = selected.join(", ");
        }

        closeCategoryDropdown();
    });

    categorySearch?.addEventListener("input", function () {
        const keyword = this.value.toLowerCase();
        const items = $$(".category-item");

        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(keyword) ? "flex" : "none";
        });
    });

    /* LOCATION DROPDOWN */

    const locationToggle = $("#locationToggle");
    const locationPanel = $("#locationPanel");
    const locationArrow = $("#locationArrow");
    const locationText = $("#locationText");

    const provinceColumn = $("#provinceColumn");
    const districtColumn = $("#districtColumn");

    const saveLocationBtn = $("#saveLocation");
    const searchBtn = $(".search-main-btn");

    let selectedProvince = "";
    let selectedDistrict = "";

    const locationData = {
        "Hà Nội": ["Ba Đình", "Cầu Giấy", "Đống Đa", "Đông Anh", "Hoàn Kiếm", "Hoàng Mai"],
        "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7"],
        "Bình Dương": ["Thủ Dầu Một", "Dĩ An"],
        "Bắc Ninh": [],
        "Đồng Nai": [],
        "Hưng Yên": [],
        "Hải Dương": [],
        "Đà Nẵng": [],
        "Hải Phòng": [],
    };

    function closeLocationPopup() {
        if (!locationPanel) return;
        locationPanel.style.display = "none";
        if (locationArrow) locationArrow.src = "assets/images/arrow-down.png";
    }

    function renderProvince() {
        if (!provinceColumn) return;
        provinceColumn.innerHTML = "";

        Object.keys(locationData).forEach(province => {

            const div = document.createElement("div");
            div.className = "province-item";
            div.innerHTML = `
                <input type="checkbox">
                <span>${province}</span>
            `;

            div.addEventListener("click", function () {

                $$(".province-item").forEach(p =>
                    p.classList.remove("active")
                );

                div.classList.add("active");
                selectedProvince = province;
                renderDistrict(province);
            });

            provinceColumn.appendChild(div);
        });
    }

    function renderDistrict(province) {
        if (!districtColumn) return;
        districtColumn.innerHTML = "";

        locationData[province].forEach(d => {

            const div = document.createElement("div");
            div.className = "district-item";
            div.innerHTML = `
                <input type="checkbox">
                <span>${d}</span>
            `;

            div.addEventListener("click", function () {
                selectedDistrict = d;
            });

            districtColumn.appendChild(div);
        });
    }

    locationToggle?.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!locationPanel) return;

        const isOpen = locationPanel.style.display === "block";
        locationPanel.style.display = isOpen ? "none" : "block";

        if (locationArrow)
            locationArrow.src = isOpen
                ? "assets/images/arrow-down.png"
                : "assets/images/arrow-up.png";

        if (!isOpen) closeCategoryDropdown();
    });

    saveLocationBtn?.addEventListener("click", function () {
        if (selectedProvince && selectedDistrict && locationText) {
            locationText.innerText =
                selectedProvince + ", " + selectedDistrict;
        }
        closeLocationPopup();
    });

    renderProvince();

    /* CLICK OUTSIDE */

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".search-bar-wrapper")) {
            closeLocationPopup();
            closeCategoryDropdown();
        }
    });

    searchBtn?.addEventListener("click", async function () {
        closeLocationPopup();
        closeCategoryDropdown();

        const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
        if (!isLoggedIn) {
            sessionStorage.setItem("searchRedirectMsg", "Vui lòng đăng nhập để sử dụng chức năng tìm thợ.");
            alert("Vui lòng đăng nhập để sử dụng chức năng tìm thợ.");
            return;
        }

        // Gather selected categories
        const selectedCategories = [];
        checkboxes.forEach(cb => {
            if (cb.checked) selectedCategories.push(cb.parentElement.textContent.trim());
        });

        // Gather location
        const locationStr = (selectedProvince && selectedDistrict)
            ? selectedProvince + ", " + selectedDistrict
            : selectedProvince || selectedDistrict || "";

        // Build query params
        const params = new URLSearchParams();
        if (selectedCategories.length > 0) params.append("category", selectedCategories.join(","));
        if (locationStr)              params.append("location", locationStr);

        const API_URL = "http://localhost:5111";
        const url = `${API_URL}/api/profiles/search?${params.toString()}`;

        // Show loading
        let resultsSection = document.getElementById("searchResults");
        if (!resultsSection) {
            resultsSection = document.createElement("section");
            resultsSection.id = "searchResults";
            resultsSection.className = "search-results container";
            document.querySelector("main").appendChild(resultsSection);
        }
        resultsSection.innerHTML = "<p class='loading-msg'>Đang tìm kiếm...</p>";

        try {
            const res = await fetch(url);
            const workers = await res.json();

            if (!workers || workers.length === 0) {
                resultsSection.innerHTML = `<p class='no-result-msg'>Chưa có dữ liệu thợ sửa chữa phù hợp.</p>`;
                return;
            }

            resultsSection.innerHTML = `<h2 class='results-title'>Danh sách thợ phù hợp (${workers.length} kết quả)</h2>`;

            const grid = document.createElement("div");
            grid.className = "results-grid";

            workers.forEach(worker => {
                const stars = Math.round(worker.rating || 0);
                const starHTML = "★".repeat(stars) + "☆".repeat(5 - stars);
                const services = Array.isArray(worker.services) ? worker.services.join(", ") : (worker.services || "");

                const card = document.createElement("div");
                card.className = "worker-card";
                card.innerHTML = `
                    <div class="worker-card-inner">
                        <div class="worker-avatar">👷</div>
                        <div class="worker-info">
                            <h3 class="worker-name">${worker.nameOrStore || "Không tên"}</h3>
                            <span class="worker-rating" title="Đánh giá">${starHTML} <small>${(worker.rating || 0).toFixed(1)}</small></span>
                            <p class="worker-location">📍 ${worker.location || "Không rõ địa điểm"}</p>
                            <p class="worker-services">🔧 ${services || "Chưa cập nhật"}</p>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });

            resultsSection.appendChild(grid);
        } catch (err) {
            resultsSection.innerHTML = `<p class='no-result-msg'>Không thể kết nối đến máy chủ. Vui lòng thử lại sau.</p>`;
            console.error("Search API error:", err);
        }
    });

    // Bỏ chọn tất cả (E1.6)
    document.getElementById("clearAll")?.addEventListener("click", function () {
        checkboxes.forEach(cb => cb.checked = false);
        if (selectAll) selectAll.checked = false;
        selectedProvince = "";
        selectedDistrict = "";
        if (locationText) locationText.innerText = "Địa điểm";
        if (categoryText) categoryText.innerText = "Danh mục sửa chữa";
        if (districtColumn) districtColumn.innerHTML = "";
        $$(".province-item").forEach(p => p.classList.remove("active"));
    });

    /* AUTH */

    function updateNavbar() {
        const navGuest = $(".nav-guest");
        const navUser = $(".nav-user");

        if (sessionStorage.getItem("isLoggedIn") === "true") {
            if (navGuest) navGuest.style.display = "none";
            if (navUser) navUser.style.display = "flex";
        } else {
            if (navUser) navUser.style.display = "none";
            if (navGuest) navGuest.style.display = "flex";
        }
    }

    updateNavbar();

    $("#loginBtn")?.addEventListener("click", function () {
        sessionStorage.setItem("isLoggedIn", "true");
        updateNavbar();
    });

    $("#logoutBtn")?.addEventListener("click", function () {
        sessionStorage.clear();
        updateNavbar();
    });

    /* USER DROPDOWN */

    const userAvatar = $("#userAvatar");
    const userMenu = $(".user-dropdown .dropdown-menu");

    userAvatar?.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!userMenu) return;

        const isOpen = userMenu.style.display === "flex";
        userMenu.style.display = isOpen ? "none" : "flex";
    });

    userMenu?.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    document.addEventListener("click", function () {
        if (userMenu) userMenu.style.display = "none";
    });

});