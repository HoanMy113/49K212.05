document.addEventListener("DOMContentLoaded", function () {
    // 1. Parse ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const workerId = urlParams.get('id');

    // Display elements
    const emptyBox = document.getElementById("emptyProfileBox");
    const statusMessage = document.getElementById("statusMessage");
    const profileBox = document.getElementById("existingProfileBox");

    const displayName = document.getElementById("displayName");
    const displayRatingHtml = document.getElementById("displayRatingHtml");
    const displayRatingScore = document.getElementById("displayRatingScore");
    const displayPhone = document.getElementById("displayPhone");
    const displayAddress = document.getElementById("displayAddress");
    const displayLocation = document.getElementById("displayLocation");
    const displayDescription = document.getElementById("displayDescription");
    const displayServices = document.getElementById("displayServices");

    if (!workerId) {
        showError("Không tìm thấy thông tin thợ (Thiếu ID).");
        return;
    }

    const apiUrl = `http://localhost:5111/api/profiles/${workerId}`;

    async function fetchWorkerData() {
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                renderWorkerProfile(data);
            } else if (response.status === 404) {
                showError("Không tìm thấy thợ sửa chữa này trong hệ thống.");
            } else {
                showError("Lỗi từ máy chủ khi lấy dữ liệu thợ.");
            }
        } catch (error) {
            console.error("Error fetching worker profile:", error);
            showError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
        }
    }

    function renderWorkerProfile(data) {
        // Show profile view, hide empty state
        emptyBox.style.display = "none";
        profileBox.style.display = "block";

        // Populate Display View
        displayName.textContent = data.nameOrStore || "Chưa cập nhật";
        displayPhone.textContent = data.phoneNumber || "Chưa cập nhật";
        displayAddress.textContent = data.address || "Chưa cập nhật";
        displayLocation.textContent = data.location || "Chưa cập nhật";
        displayDescription.textContent = data.description || "Chưa cập nhật";

        // Rating
        const rating = data.rating || 0;
        const stars = Math.round(rating);
        displayRatingHtml.textContent = "★".repeat(stars) + "☆".repeat(5 - stars);
        displayRatingScore.textContent = rating.toFixed(1);

        // Services
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
    }

    function showError(message) {
        emptyBox.style.display = "block";
        profileBox.style.display = "none";
        statusMessage.textContent = message;
    }

    // Initialize
    fetchWorkerData();
});
