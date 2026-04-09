document.addEventListener("DOMContentLoaded", async function () {

    // KẾT HỢP ĐĂNG NHẬP: Bắt buộc đăng nhập để tạo yêu cầu
    if (sessionStorage.getItem("isLoggedIn") !== "true") {
        // Lưu lại URL hiện tại (bao gồm cả các tham số như ?workerId=XYZ)
        sessionStorage.setItem("redirectAfterLogin", window.location.href);

        // Tạo giao diện Modal Đăng nhập (thay thế alert xấu)
        const overlay = document.createElement("div");
        overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 99999; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;";
        
        const modal = document.createElement("div");
        modal.style.cssText = "background: white; padding: 40px; border-radius: 24px; text-align: center; max-width: 400px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); transform: translateY(30px); transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);";
        
        modal.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 15px;"><i class="fa-solid fa-handshake text-primary"></i></div>
            <h3 style="font-weight: 800; color: #222; margin-bottom: 10px;">Yêu cầu Đăng nhập</h3>
            <p style="color: #666; font-size: 15px; margin-bottom: 25px; line-height: 1.5;">Vui lòng đăng nhập với tư cách Người dùng để có thể tiến hành đặt thợ sửa chữa.</p>
            <button id="modalLoginBtn" style="background: #4e7d63; color: white; border: none; padding: 12px 30px; border-radius: 30px; font-weight: 700; font-size: 16px; cursor: pointer; transition: 0.3s; width: 100%; box-shadow: 0 6px 15px rgba(78, 125, 99, 0.2);">Đăng nhập ngay</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animation in
        setTimeout(() => {
            overlay.style.opacity = "1";
            modal.style.transform = "translateY(0)";
        }, 10);

        // Button Click -> Redirect
        document.getElementById("modalLoginBtn").addEventListener("click", () => {
            window.location.href = "login.html?role=Customer";
        });
        
        // Hover effect for button
        document.getElementById("modalLoginBtn").addEventListener("mouseenter", function() {
            this.style.background = "#3d6651";
            this.style.transform = "translateY(-2px)";
        });
        document.getElementById("modalLoginBtn").addEventListener("mouseleave", function() {
            this.style.background = "#4e7d63";
            this.style.transform = "translateY(0)";
        });

        return; // Dừng thực thi script cho đến khi chuyển trang
    }

    // ====== BẢO MẬT: Sửa đúng key sessionStorage (login.js lưu "userRole" với giá trị "Repairman") ======
    if (sessionStorage.getItem("userRole") === "Repairman") {
        showModal("Thợ sửa chữa không thể tạo yêu cầu. Vui lòng đăng nhập bằng tài khoản Khách hàng.", "warning", { onClose: () => window.location.href = "index.html" });
        return;
    }

    const form = document.getElementById("requestForm");
    const workerSelect = document.getElementById("workerSelect");
    const submitBtn = document.getElementById("submitBtn");
    const formCard = document.getElementById("formCard");
    const successBox = document.getElementById("successBox");
    const requestIdEl = document.getElementById("requestId");

    const provinceSelect = document.getElementById("provinceSelect");
    const districtSelect = document.getElementById("districtSelect");

    const broadcastToggle = document.getElementById("broadcastToggle");
    const workerSelectGroup = document.getElementById("workerSelectGroup");
    const broadcastGroup = document.getElementById("broadcastGroup");
    const multiWorkerInfo = document.getElementById("multiWorkerInfo");

    let allProvinces = [];

    // ======= LOAD PROVINCES TỪ API =======
    async function loadProvinces() {
        try {
            const res = await fetch('https://provinces.open-api.vn/api/?depth=2');
            if (!res.ok) return;
            allProvinces = await res.json();
            
            allProvinces.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.name;
                opt.textContent = p.name;
                provinceSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("Lỗi lấy danh sách tỉnh/thành:", err);
        }
    }
    loadProvinces();

    // ======= PROVINCE → DISTRICT CASCADE =======
    provinceSelect.addEventListener("change", function () {
        const provinceName = this.value;
        districtSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện --</option>';

        const province = allProvinces.find(p => p.name === provinceName);
        if (province && province.districts) {
            province.districts.forEach(d => {
                const opt = document.createElement("option");
                opt.value = d.name;
                opt.textContent = d.name;
                districtSelect.appendChild(opt);
            });
        }
    });

    // Auto-fill thông tin từ session nếu đã đăng nhập
    const sessionName = sessionStorage.getItem("fullName");
    const sessionPhone = sessionStorage.getItem("userPhone");
    if (sessionName) document.getElementById("customerName").value = sessionName;
    if (sessionPhone) document.getElementById("customerPhone").value = sessionPhone;

    // ======= URL PARAMS PARSING =======
    const urlParams = new URLSearchParams(window.location.search);
    const preCategory = urlParams.get("category");
    const preWorkerId = urlParams.get("workerId");
    const preWorkerIds = urlParams.get("workers"); // Multi-select: "id1,id2,id3"

    // Chế độ hoạt động
    let mode = "single"; // "single", "multi", "broadcast"
    let multiWorkerIdsList = [];

    // ======= CHẾ ĐỘ MULTI-WORKER =======
    if (preWorkerIds) {
        mode = "multi";
        multiWorkerIdsList = preWorkerIds.split(",").map(id => parseInt(id)).filter(id => !isNaN(id));

        // Ẩn worker select, ẩn broadcast toggle
        if (workerSelectGroup) workerSelectGroup.style.display = "none";
        if (broadcastGroup) broadcastGroup.style.display = "none";

        // Hiện multi-worker info
        if (multiWorkerInfo) {
            multiWorkerInfo.style.display = "block";
            document.getElementById("multiWorkerCount").textContent = multiWorkerIdsList.length;
        }
    }

    // ======= BROADCAST AUTO MODE =======
    const isBroadcast = urlParams.get("broadcast") === "true";
    const broadcastInfo = document.getElementById("broadcastInfo");

    if (isBroadcast) {
        mode = "broadcast";
        if (workerSelectGroup) workerSelectGroup.style.display = "none";
        if (broadcastInfo) broadcastInfo.style.display = "block";
    }

    // Auto-select category từ URL (Quick Categories trên trang chủ)
    if (preCategory) {
        const categorySelect = document.getElementById("category");
        for (let opt of categorySelect.options) {
            if (opt.value === preCategory) {
                opt.selected = true;
                break;
            }
        }
    }

    // XỬ LÝ CHỌN THỢ NGAY LẬP TỨC (TRƯỚC KHI GỌI API)
    if (preWorkerId && !preWorkerIds) {
        workerSelect.innerHTML = ''; // Xóa sạch tùy chọn "Tự động kết nối..."
        
        const opt = document.createElement("option");
        opt.value = preWorkerId;
        opt.selected = true;
        workerSelect.appendChild(opt);
        
        // Ẩn select đi và dán một cục div cứng vào
        workerSelect.style.display = "none";
        const fakeInput = document.createElement("div");
        fakeInput.id = "fakeWorkerInput";
        fakeInput.style.cssText = "background:#eaf3ed; border-radius:12px; padding:12px 18px; border:1.5px solid #c8e6c9; font-weight:700; color:#2c3e50; font-size:15px;";
        fakeInput.innerHTML = `<i class="fa-solid fa-helmet-safety text-primary me-2"></i> Đang tải thông tin thợ (ID: ${preWorkerId})...`;
        workerSelect.parentNode.insertBefore(fakeInput, workerSelect);
        
        // Ẩn hướng dẫn "Tự động kết nối" vì người dùng đã chọn thợ cụ thể
        if (workerSelectGroup) {
            const helpText = workerSelectGroup.querySelector("small");
            if (helpText) {
                helpText.style.display = 'none';
            }
        }
        
        // Ẩn luôn "Yêu cầu nhanh" vì đã chọn thợ cụ thể
        if (broadcastGroup) {
            broadcastGroup.style.display = "none";
        }
    }

    // 1. Tải danh sách thợ từ API
    let allWorkers = [];
    (async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/profiles/search`);
            const workers = await res.json();

            if (Array.isArray(workers)) {
                allWorkers = workers;
                
                // Multi-worker mode: hiển thị tên các thợ đã chọn
                if (mode === "multi" && multiWorkerIdsList.length > 0) {
                    const selectedWorkers = workers.filter(w => multiWorkerIdsList.includes(w.id));
                    const namesEl = document.getElementById("multiWorkerNames");
                    if (namesEl && selectedWorkers.length > 0) {
                        namesEl.innerHTML = selectedWorkers.map(w => 
                            `<span style="display:inline-block; background:#fff; border:1px solid #ddd; padding:3px 10px; border-radius:20px; margin:3px 3px 0 0; font-weight:600;"><i class="fa-solid fa-helmet-safety text-primary"></i> ${w.nameOrStore}</span>`
                        ).join("");
                    }
                }

                if (preWorkerId && !preWorkerIds) {
                    // Nếu được chọn trước từ trang chi tiết, cập nhật lại tên thật của thợ
                    const selectedWorker = workers.find(w => w.id == preWorkerId);
                    const fakeInput = document.getElementById("fakeWorkerInput");
                    if (fakeInput && selectedWorker) {
                        fakeInput.innerHTML = `<i class="fa-solid fa-helmet-safety me-2" style="color:#4e7d63;"></i> Thợ: ${selectedWorker.nameOrStore} <span style="color:#666; font-weight:500; font-size:13px; margin-left:8px;">(${selectedWorker.location || "Không rõ"})</span>`;
                    } else if (fakeInput) {
                        fakeInput.innerHTML = `<i class="fa-solid fa-helmet-safety me-2" style="color:#4e7d63;"></i> Thợ sửa chữa (ID: ${preWorkerId})`;
                    }
                } else if (!preWorkerIds) {
                    // Nếu không có thợ chọn trước, hiển thị danh sách tất cả thợ
                    workers.forEach(w => {
                        const opt = document.createElement("option");
                        opt.value = w.id;
                        opt.textContent = `${w.nameOrStore} — ${w.location || "Không rõ"}`;
                        workerSelect.appendChild(opt);
                    });
                }
            }
        } catch (err) {
            console.error("Load workers error:", err);
        }
    })();

    // 2. Xử lý gửi form
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const province = provinceSelect.value;
        const district = districtSelect.value;
        const detail = document.getElementById("addressDetail").value.trim();

        if (!province) {
            showModal("Vui lòng chọn Tỉnh/Thành phố.", "warning");
            return;
        }
        if (!detail) {
            showModal("Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường).", "warning");
            return;
        }

        // Ghép địa chỉ đầy đủ: "Số nhà, Quận, Tỉnh"
        let fullAddress = detail;
        if (district) fullAddress += ", " + district;
        fullAddress += ", " + province;

        const basePayload = {
            customerName: document.getElementById("customerName").value.trim(),
            customerPhone: document.getElementById("customerPhone").value.trim(),
            address: fullAddress,
            category: document.getElementById("category").value,
            description: document.getElementById("description").value.trim()
        };

        // Validate thêm
        if (!basePayload.customerName || !basePayload.customerPhone || !basePayload.category) {
            showModal("Vui lòng điền đầy đủ các trường bắt buộc (*).", "warning");
            return;
        }

        // Validate Họ Tên (chỉ được phép sử dụng chữ cái và khoảng trắng)
        const nameRegex = /^[\p{L}\s]+$/u;
        if (!nameRegex.test(basePayload.customerName)) {
            showModal("Họ tên không được chứa số hoặc ký tự đặc biệt.", "warning");
            return;
        }

        // Validate số điện thoại: bắt đầu bằng 0, đúng 10 chữ số
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(basePayload.customerPhone)) {
            showModal("Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.", "warning");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Đang gửi...";

        try {
            let payload;

            if (mode === "broadcast") {
                // ===== CHẾ ĐỘ BROADCAST =====
                payload = { ...basePayload, isBroadcast: true };
            } else if (mode === "multi") {
                // ===== CHẾ ĐỘ MULTI-WORKER =====
                payload = { ...basePayload, workerIds: multiWorkerIdsList };
            } else {
                // ===== CHẾ ĐỘ SINGLE WORKER =====
                let workerId;
                if (workerSelect.value === "auto") {
                    // Tự chọn thợ ngẫu nhiên từ danh sách
                    if (allWorkers.length === 0) {
                        showModal("Không tìm thấy thợ nào. Vui lòng chọn thủ công.", "warning");
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Gửi yêu cầu";
                        return;
                    }
                    const randomIndex = Math.floor(Math.random() * allWorkers.length);
                    workerId = allWorkers[randomIndex].id;
                } else {
                    workerId = parseInt(workerSelect.value);
                    if (!workerId || isNaN(workerId)) {
                        showModal("Vui lòng chọn thợ sửa hoặc để Tự động kết nối.", "warning");
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Gửi yêu cầu";
                        return;
                    }
                }
                payload = { ...basePayload, workerId: workerId };
            }

            const res = await fetch(`${API_BASE_URL}/api/repairrequests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Lỗi tạo yêu cầu");
            }

            const data = await res.json();

            // Hiện thông báo thành công
            formCard.style.display = "none";
            successBox.style.display = "block";

            if (mode === "multi") {
                requestIdEl.textContent = `Đã tạo ${data.requests?.length || multiWorkerIdsList.length} đơn`;
            } else if (mode === "broadcast") {
                requestIdEl.textContent = "#" + data.id + " (Broadcast)";
            } else {
                requestIdEl.textContent = "#" + data.id;
            }

        } catch (err) {
            showModal(err.message, "error");
            submitBtn.disabled = false;
            submitBtn.textContent = "Gửi yêu cầu";
        }
    });
});
