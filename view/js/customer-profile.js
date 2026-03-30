document.addEventListener("DOMContentLoaded", async function () {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const userPhone = sessionStorage.getItem("userPhone");
    const userRole = sessionStorage.getItem("userRole");

    if (isLoggedIn !== "true" || userRole === "Repairman") {
        window.location.href = "login.html";
        return;
    }

    // Elements
    const fullNameInput = document.getElementById("fullName");
    const phoneNumberInput = document.getElementById("phoneNumber");
    
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const btnUpdateProfile = document.getElementById("btnUpdateProfile");
    const btnUpdatePassword = document.getElementById("btnUpdatePassword");

    let currentUserId = null;

    /* ================= AVATAR UPLOAD ================= */
    const avatarInput = document.getElementById("avatarInput");
    const btnBrowseAvatar = document.getElementById("btnBrowseAvatar");
    const avatarPreview = document.getElementById("profileImagePreview");

    if (btnBrowseAvatar && avatarInput) {
        btnBrowseAvatar.addEventListener("click", () => avatarInput.click());
        avatarInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert("Dung lượng ảnh phải nhỏ hơn 2MB.");
                    this.value = "";
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (avatarPreview) avatarPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Load Profile
    async function loadProfile() {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/Users/${userPhone}`);
            if (!res.ok) throw new Error("Không thể tải thông tin từ server.");
            
            const data = await res.json();
            
            fullNameInput.value = data.fullName || "";
            document.getElementById("displayFullName").textContent = data.fullName || "Người dùng";
            
            const usernameEl = document.getElementById("username");
            if (usernameEl) usernameEl.textContent = data.fullName || "Người dùng";
            
            phoneNumberInput.value = data.phone || userPhone;
            
            // Sync session if needed
            sessionStorage.setItem("fullName", data.fullName);

            // Load avatar from data
            if (data.avatarUrl && avatarPreview) {
                const fullUrl = data.avatarUrl.startsWith("http") ? data.avatarUrl : (API_BASE_URL + data.avatarUrl);
                avatarPreview.src = fullUrl;
                sessionStorage.setItem("userAvatar", fullUrl);
            } else {
                // Fallback to session
                const savedAvatar = sessionStorage.getItem("userAvatar");
                if (savedAvatar && avatarPreview) {
                    avatarPreview.src = savedAvatar;
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải hồ sơ:", error);
            // Fallback to session if API fails
            const sessionName = sessionStorage.getItem("fullName");
            if (sessionName) {
                fullNameInput.value = sessionName;
                document.getElementById("displayFullName").textContent = sessionName;
            }
        }
    }

    // Update Profile (Name)
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const newName = fullNameInput.value.trim();
        if (!newName) {
            alert("Vui lòng nhập họ tên.");
            return;
        }

        btnUpdateProfile.disabled = true;
        btnUpdateProfile.textContent = "Đang lưu...";

        try {
            let avatarUrl = sessionStorage.getItem("userAvatar");

            // 1. Nếu có file mới được chọn, upload trước
            if (avatarInput.files && avatarInput.files[0]) {
                const formData = new FormData();
                formData.append("file", avatarInput.files[0]);

                const uploadRes = await fetch(`${API_BASE_URL}/api/Upload`, {
                    method: "POST",
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    avatarUrl = uploadData.url; // Đây là đường dẫn tương đối VD: /uploads/abc.jpg
                }
            }

            // 2. Cập nhật thông tin profile qua API
            const updatePayload = {
                fullName: newName,
                avatarUrl: avatarUrl
            };

            const response = await authFetch(`${API_BASE_URL}/api/Users/${userPhone}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) throw new Error("Không thể cập nhật thông tin trên server.");

            // 3. Cập nhật dữ liệu local
            sessionStorage.setItem("fullName", newName);
            if (avatarUrl) {
                // Đảm bảo URL đầy đủ nếu cần, hoặc cứ để tương đối
                const fullAvatarUrl = avatarUrl.startsWith("http") ? avatarUrl : (API_BASE_URL + avatarUrl);
                sessionStorage.setItem("userAvatar", fullAvatarUrl);
                
                // Cập nhật UI ngay lập tức
                if (avatarPreview) avatarPreview.src = fullAvatarUrl;
                const navAvatar = document.querySelector("#userAvatar img");
                if (navAvatar) navAvatar.src = fullAvatarUrl;
            }
            
            // Update UI name
            const displayFullName = document.getElementById("displayFullName");
            if (displayFullName) displayFullName.textContent = newName;

            const usernameEl = document.getElementById("username");
            if (usernameEl) usernameEl.textContent = newName;

            alert("Cập nhật thông tin thành công!");
            
        } catch (error) {
            console.error(error);
            alert("Lỗi khi cập nhật thông tin.");
        } finally {
            btnUpdateProfile.disabled = false;
            btnUpdateProfile.textContent = "Lưu thay đổi";
        }
    });

    // Change Password
    passwordForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp.");
            return;
        }

        btnUpdatePassword.disabled = true;
        btnUpdatePassword.textContent = "Đang xử lý...";

        try {
            const payload = {
                oldPassword: currentPassword,
                newPassword: newPassword
            };

            // ====== BẢO MẬT: Dùng authFetch gắn JWT Token thay vì Header X-User-Phone ======
            const response = await authFetch(`${API_BASE_URL}/api/Auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
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
            alert("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
        } finally {
            btnUpdatePassword.disabled = false;
            btnUpdatePassword.textContent = "Cập nhật mật khẩu";
        }
    });

    loadProfile();
});
