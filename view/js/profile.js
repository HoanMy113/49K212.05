document.addEventListener("DOMContentLoaded", function () {

    /* ================= SESSION CHECK ================= */
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) { window.location.href = "login.html"; return; }

    const userPhone = sessionStorage.getItem("userPhone");
    const workerProfileId = sessionStorage.getItem("workerProfileId");
    const profileId = workerProfileId || null;

    // Set username in navbar and header
    const fullName = sessionStorage.getItem("fullName") || "Người dùng";
    const usernameEl = document.getElementById("username");
    const workerNameHeader = document.getElementById("workerNameHeader");
    if (usernameEl) usernameEl.textContent = fullName;
    if (workerNameHeader) workerNameHeader.textContent = fullName;

    /* ================= AVATAR UPLOAD ================= */
    const avatarInput = document.getElementById("avatarInput");
    const btnBrowseAvatar = document.getElementById("btnBrowseAvatar");
    const avatarPreview = document.getElementById("avatarPreview");

    if (btnBrowseAvatar && avatarInput) {
        btnBrowseAvatar.addEventListener("click", () => avatarInput.click());
        avatarInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                // Validate size < 2MB
                if (file.size > 2 * 1024 * 1024) {
                    alert("Dung lượng ảnh phải nhỏ hơn 2MB.");
                    this.value = "";
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarPreview.src = e.target.result;
                    // Note: Here we'd call the API to upload if ready
                    // For now, it stays as a local preview
                };
                reader.readAsDataURL(file);
            }
        });
    }

    /* ================= USER DROPDOWN ================= */
    const userAvatar = document.getElementById("userAvatar");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    if (userAvatar && dropdownMenu) {
        let isOpen = false;
        userAvatar.addEventListener("click", (e) => { e.stopPropagation(); isOpen = !isOpen; dropdownMenu.classList.toggle("show", isOpen); });
        document.addEventListener("click", (e) => { if (isOpen && !dropdownMenu.contains(e.target)) { dropdownMenu.classList.remove("show"); isOpen = false; } });
    }

    /* ================= LOGOUT ================= */
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", (e) => { e.preventDefault(); sessionStorage.clear(); window.location.href = "login.html"; });

    /* ================= TAB SWITCHING ================= */
    const tabBtns = document.querySelectorAll('.profile-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    /* ================= PROVINCE CASCADE ================= */
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const wardSelect = document.getElementById('wardSelect');
    let allProvinces = [];

    async function loadProvinces() {
        try {
            const res = await fetch('https://provinces.open-api.vn/api/?depth=3');
            if (!res.ok) return;
            allProvinces = await res.json();
            allProvinces.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.code;
                opt.textContent = p.name;
                provinceSelect.appendChild(opt);
            });
        } catch (err) { console.error('Lỗi tải tỉnh/thành:', err); }
    }

    // Populate district dropdown for a given province code, returns the district options
    function populateDistricts(provCode) {
        districtSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
        wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
        if (!provCode) return;
        const prov = allProvinces.find(p => p.code === provCode);
        if (prov && prov.districts) {
            prov.districts.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.code;
                opt.textContent = d.name;
                districtSelect.appendChild(opt);
            });
            districtSelect.disabled = false;
        }
    }

    // Populate ward dropdown for a province+district code
    function populateWards(provCode, distCode) {
        wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
        if (!provCode || !distCode) return;
        const prov = allProvinces.find(p => p.code === provCode);
        if (!prov) return;
        const dist = prov.districts.find(d => d.code === distCode);
        if (dist && dist.wards) {
            dist.wards.forEach(w => {
                const opt = document.createElement('option');
                opt.value = w.code;
                opt.textContent = w.name;
                wardSelect.appendChild(opt);
            });
            wardSelect.disabled = false;
        }
    }

    provinceSelect.addEventListener('change', () => {
        populateDistricts(parseInt(provinceSelect.value));
    });

    districtSelect.addEventListener('change', () => {
        populateWards(parseInt(provinceSelect.value), parseInt(districtSelect.value));
    });

    // Parse a combined address string like "123 đường ABC, Phường X, Quận Y, Thành phố Z"
    // and try to auto-select province/district/ward in the dropdowns
    function parseAndSelectAddress(addressStr) {
        if (!addressStr || allProvinces.length === 0) {
            if (detailAddress) detailAddress.value = addressStr || "";
            return;
        }

        const parts = addressStr.split(',').map(s => s.trim());
        let matchedProvince = null;
        let matchedDistrict = null;
        let matchedWard = null;
        let detailParts = [];

        // Try matching from the end (province is usually last)
        for (let i = parts.length - 1; i >= 0; i--) {
            const part = parts[i].toLowerCase();
            if (!matchedProvince) {
                matchedProvince = allProvinces.find(p => p.name.toLowerCase() === part || part.includes(p.name.toLowerCase()));
                if (matchedProvince) continue;
            }
            if (matchedProvince && !matchedDistrict) {
                matchedDistrict = matchedProvince.districts?.find(d => d.name.toLowerCase() === part || part.includes(d.name.toLowerCase()));
                if (matchedDistrict) continue;
            }
            if (matchedDistrict && !matchedWard) {
                matchedWard = matchedDistrict.wards?.find(w => w.name.toLowerCase() === part || part.includes(w.name.toLowerCase()));
                if (matchedWard) continue;
            }
            detailParts.unshift(parts[i]);
        }

        // Select province
        if (matchedProvince) {
            provinceSelect.value = matchedProvince.code;
            populateDistricts(matchedProvince.code);
        }
        // Select district
        if (matchedDistrict) {
            districtSelect.value = matchedDistrict.code;
            populateWards(matchedProvince.code, matchedDistrict.code);
        }
        // Select ward
        if (matchedWard) {
            wardSelect.value = matchedWard.code;
        }
        // Put remaining detail into the text field
        if (detailAddress) {
            detailAddress.value = detailParts.join(', ');
        }
    }

    /* ================= LOAD PROFILE ================= */
    const inputName = document.getElementById("inputName");
    const inputPhone = document.getElementById("inputPhone");
    const detailAddress = document.getElementById("detailAddress");
    const inputDescription = document.getElementById("inputDescription");
    const nameError = document.getElementById("nameError");
    const profileForm = document.getElementById("profileForm");
    const btnSaveProfile = document.getElementById("btnSaveProfile");

    const apiUrl = profileId ? `${API_BASE_URL}/api/profiles/${profileId}` : null;

    async function loadProfile() {
        if (!apiUrl) return;
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) return;
            const data = await res.json();

            if (inputName) inputName.value = data.nameOrStore || "";
            if (inputPhone) inputPhone.value = data.phoneNumber || userPhone || "";
            if (inputDescription) inputDescription.value = data.description || "";

            // Parse address and auto-select province/district/ward
            parseAndSelectAddress(data.address || "");

            // Check matching services
            document.querySelectorAll(".service").forEach(cb => {
                const svcName = cb.parentNode.textContent.trim();
                cb.checked = !!(data.services && data.services.includes(svcName));
            });

            // Load avatar from data
            if (data.avatarUrl && avatarPreview) {
                const fullUrl = data.avatarUrl.startsWith("http") ? data.avatarUrl : (API_BASE_URL + data.avatarUrl);
                avatarPreview.src = fullUrl;
                sessionStorage.setItem("userAvatar", fullUrl);
            } else {
                // Fallback to session if API doesn't have it yet
                const savedAvatar = sessionStorage.getItem("userAvatar");
                if (savedAvatar && avatarPreview) {
                    avatarPreview.src = savedAvatar;
                }
            }
        } catch (err) { console.error("Lỗi tải hồ sơ:", err); }
    }

    /* ================= SAVE PROFILE ================= */
    if (profileForm) {
        profileForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const nameVal = inputName ? inputName.value.trim() : "";
            const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸạảấầẩẫậắằẳẵặẹẻẽềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹđĐ\s0-9]+$/;

            if (nameVal === "") {
                if (nameError) { nameError.textContent = "Tên không được bỏ trống."; nameError.style.display = "block"; }
                return;
            }
            if (!nameRegex.test(nameVal)) {
                if (nameError) { nameError.textContent = "Tên không được chứa ký tự đặc biệt."; nameError.style.display = "block"; }
                return;
            }
            if (nameError) nameError.style.display = "none";

            // Build address and location from selectors
            const provText = provinceSelect.options[provinceSelect.selectedIndex]?.text || '';
            const distText = districtSelect.options[districtSelect.selectedIndex]?.text || '';
            const wardText = wardSelect.options[wardSelect.selectedIndex]?.text || '';
            const detail = detailAddress ? detailAddress.value.trim() : '';

            // fullAddress: detail, ward, district, province
            const addrParts = [detail, wardText, distText, provText].filter(p => p && !p.startsWith('--'));
            const fullAddress = addrParts.length > 0 ? addrParts.join(', ') : (detailAddress ? detailAddress.value.trim() : '');

            // location: district, province (main search area)
            const locParts = [distText, provText].filter(p => p && !p.startsWith('--'));
            const fullLocation = locParts.join(', ');

            // Collect selected services
            const selectedServices = [];
            document.querySelectorAll(".service:checked").forEach(cb => {
                selectedServices.push(cb.parentNode.textContent.trim());
            });

            const payload = {
                nameOrStore: nameVal,
                phoneNumber: inputPhone ? inputPhone.value.trim() : userPhone,
                address: fullAddress,
                location: fullLocation,
                description: inputDescription ? inputDescription.value.trim() : "",
                services: selectedServices,
                isActive: true
            };

            if (!apiUrl) {
                alert("Không tìm thấy ID hồ sơ. Vui lòng đăng nhập lại.");
                return;
            }

            btnSaveProfile.disabled = true;
            btnSaveProfile.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';

            try {
                let avatarUrl = sessionStorage.getItem("userAvatar");

                // 1. Upload ảnh nếu có file mới
                if (avatarInput.files && avatarInput.files[0]) {
                    const formData = new FormData();
                    formData.append("file", avatarInput.files[0]);

                    const uploadRes = await fetch(`${API_BASE_URL}/api/Upload`, {
                        method: "POST",
                        body: formData
                    });

                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        avatarUrl = uploadData.url;
                    }
                }

                // 2. Cập nhật payload với AvatarUrl
                payload.avatarUrl = avatarUrl;

                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // 3. Cập nhật dữ liệu local
                    if (avatarUrl) {
                        const fullAvatarUrl = avatarUrl.startsWith("http") ? avatarUrl : (API_BASE_URL + avatarUrl);
                        sessionStorage.setItem("userAvatar", fullAvatarUrl);
                        
                        // Cập nhật UI ngay lập tức
                        if (avatarPreview) avatarPreview.src = fullAvatarUrl;
                        const navAvatar = document.querySelector("#userAvatar img");
                        if (navAvatar) navAvatar.src = fullAvatarUrl;
                    }

                    alert("Lưu thông tin thành công!");
                    loadProfile();
                } else {
                    alert("Lưu thất bại. Vui lòng thử lại.");
                }
            } catch (error) {
                console.error("Lỗi lưu hồ sơ:", error);
                alert("Lỗi kết nối máy chủ.");
            } finally {
                btnSaveProfile.disabled = false;
                btnSaveProfile.innerHTML = '<i class="fa-solid fa-floppy-disk me-2"></i> Lưu thông tin';
            }
        });
    }

    /* ================= CHANGE PASSWORD ================= */
    const passwordForm = document.getElementById("passwordForm");
    const btnChangePassword = document.getElementById("btnChangePassword");

    if (passwordForm) {
        passwordForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const currentPassword = document.getElementById("currentPassword").value.trim();
            const newPassword = document.getElementById("newPassword").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if (newPassword.length < 6) {
                alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
                return;
            }
            if (newPassword !== confirmPassword) {
                alert("Mật khẩu xác nhận không khớp.");
                return;
            }

            btnChangePassword.disabled = true;
            btnChangePassword.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

            try {
                // ====== BẢO MẬT: Dùng authFetch gắn JWT Token thay vì Header X-User-Phone ======
                // CẦN BỔ SUNG X-User-Phone ĐỂ BACKEND LẤY THÔNG TIN THEO LOGIC HIỆN TẠI
                const response = await authFetch(`${API_BASE_URL}/api/Auth/change-password`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-User-Phone": userPhone
                    },
                    body: JSON.stringify({
                        oldPassword: currentPassword,
                        newPassword: newPassword
                    })
                });

                if (response.ok) {
                    alert("Đổi mật khẩu thành công!");
                    passwordForm.reset();
                } else {
                    const errData = await response.json().catch(() => null);
                    alert((errData && errData.message) ? errData.message : "Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra.");
                }
            } catch (error) {
                console.error(error);
                alert("Không thể kết nối máy chủ.");
            } finally {
                btnChangePassword.disabled = false;
                btnChangePassword.innerHTML = '<i class="fa-solid fa-key me-2"></i> Cập nhật mật khẩu';
            }
        });
    }

    /* ================= INIT ================= */
    loadProvinces().then(() => loadProfile());
});