document.addEventListener("DOMContentLoaded", function () {

    /* ================= USER DROPDOWN ================= */

    const userAvatar = document.getElementById("userAvatar");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (userAvatar && dropdownMenu) {

        let isOpen = false;

        userAvatar.addEventListener("click", function (e) {
            e.stopPropagation();

            if (!isOpen) {
                dropdownMenu.classList.add("show");
                isOpen = true;
            } else {
                dropdownMenu.classList.remove("show");
                isOpen = false;
            }
        });

        document.addEventListener("click", function (e) {
            if (isOpen && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove("show");
                isOpen = false;
            }
        });
    }

    /* ================= CREATE PROFILE MODAL ================= */

    const modal = document.getElementById("profileModal");
    const openBtn = document.getElementById("openModal");
    const closeBtn = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");

    if (openBtn && modal) {
        openBtn.addEventListener("click", function () {
            modal.style.display = "flex";
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    if (cancelBtn && modal) {
        cancelBtn.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    /* ================= AUTO EXPAND TEXTAREA ================= */

    const textareas = document.querySelectorAll(".auto-expand");

    textareas.forEach(textarea => {
        textarea.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = this.scrollHeight + "px";
        });
    });

    /* ================= SELECT ALL SERVICES ================= */

    const selectAllBtn = document.getElementById("selectAll");
    const deselectAllBtn = document.getElementById("deselectAll");

    if (selectAllBtn) {
        selectAllBtn.addEventListener("click", function () {
            document.querySelectorAll(".service").forEach(cb => cb.checked = true);
        });
    }

    if (deselectAllBtn) {
        deselectAllBtn.addEventListener("click", function () {
            document.querySelectorAll(".service").forEach(cb => cb.checked = false);
        });
    }

    /* ================= API INTEGRATION ================= */

    // Hardcode user ID = 1 for demo purposes
    const userId = 1;
    const apiUrl = `http://localhost:5111/api/profiles/${userId}`;

    // Display elements
    const emptyBox = document.getElementById("emptyProfileBox");
    const profileBox = document.getElementById("existingProfileBox");

    // Info display spans
    const displayName = document.getElementById("displayName");
    const displayPhone = document.getElementById("displayPhone");
    const displayAddress = document.getElementById("displayAddress");
    const displayDescription = document.getElementById("displayDescription");
    const displayServices = document.getElementById("displayServices");

    // Form inputs
    const inputName = document.getElementById("inputName");
    const inputPhone = document.getElementById("inputPhone");
    const inputAddress = document.getElementById("inputAddress");
    const inputDescription = document.getElementById("inputDescription");

    // Validation Error Displays
    const nameError = document.getElementById("nameError");
    const phoneError = document.getElementById("phoneError");

    // Form action buttons
    const profileForm = document.getElementById("profileForm");
    const editProfileBtn = document.getElementById("editProfileBtn");

    async function fetchProfile() {
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();

                // Show profile view, hide empty state
                emptyBox.style.display = "none";
                profileBox.style.display = "block";

                // Populate Display View
                displayName.textContent = data.nameOrStore || "Chưa cập nhật";
                displayPhone.textContent = data.phoneNumber || "Chưa cập nhật";
                displayAddress.textContent = data.address || "Chưa cập nhật";
                displayDescription.textContent = data.description || "Chưa cập nhật";

                displayServices.innerHTML = "";
                if (data.services && data.services.length > 0) {
                    data.services.forEach(svc => {
                        const span = document.createElement("span");
                        span.className = "service-badge";
                        span.textContent = svc;
                        displayServices.appendChild(span);
                    });
                } else {
                    displayServices.innerHTML = "<span>Chưa có dịch vụ nào</span>";
                }

                // Pre-fill the Form Modal
                inputName.value = data.nameOrStore;
                inputPhone.value = data.phoneNumber;
                inputAddress.value = data.address;
                inputDescription.value = data.description;

                // Check checkboxes if they match services list
                document.querySelectorAll(".service").forEach(cb => {
                    const svcName = cb.parentNode.textContent.trim();
                    if (data.services.includes(svcName)) {
                        cb.checked = true;
                    } else {
                        cb.checked = false;
                    }
                });

            } else if (response.status === 404) {
                // Show Empty State
                emptyBox.style.display = "block";
                profileBox.style.display = "none";
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // Fallback show empty state if network err
            emptyBox.style.display = "block";
            profileBox.style.display = "none";
        }
    }

    // Load profile on page init
    fetchProfile();

    // Open Modal from Edit button too
    if (editProfileBtn && modal) {
        editProfileBtn.addEventListener("click", function () {
            modal.style.display = "flex";
        });
    }

    // Handle Form Submit
    if (profileForm) {
        profileForm.addEventListener("submit", async function (e) {
            e.preventDefault(); // Prevent page reload

            // 1) VALIDATION logic
            const nameVal = inputName.value.trim();
            const phoneVal = inputPhone.value.trim();

            let isValid = true;

            // Name: No special characters (allow letters, numbers, spaces, vi accents)
            const nameRegex = /^[a-zA-Z0-9\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$/;
            if (!nameRegex.test(nameVal)) {
                nameError.style.display = "block";
                isValid = false;
            } else {
                nameError.style.display = "none";
            }

            // Phone: Only digits, length up to 10
            const phoneRegex = /^\d{1,10}$/;
            if (!phoneRegex.test(phoneVal)) {
                phoneError.style.display = "block";
                isValid = false;
            } else {
                phoneError.style.display = "none";
            }

            if (!isValid) return; // Stop submission

            // 2) Collect selected Services
            const selectedServices = [];
            document.querySelectorAll(".service:checked").forEach(cb => {
                selectedServices.push(cb.parentNode.textContent.trim());
            });

            // 3) Create Payload String matching DTO
            const payload = {
                nameOrStore: nameVal,
                phoneNumber: phoneVal,
                address: inputAddress.value.trim(),
                description: inputDescription.value.trim(),
                services: selectedServices
            };

            // 4) Execute PUT request
            try {
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert('Lưu hồ sơ thành công!');
                    modal.style.display = "none";
                    fetchProfile(); // reload UI data
                } else {
                    alert('Lưu thất bại: Lỗi máy chủ.');
                }
            } catch (error) {
                console.error("Error saving profile:", error);
                alert('Lỗi kết nối máy chủ.');
            }
        });
    }

});