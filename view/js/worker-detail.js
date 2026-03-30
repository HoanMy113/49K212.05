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
    const displayAvatar = document.getElementById("displayAvatar");

    if (!workerId) {
        showError("Không tìm thấy thông tin thợ (Thiếu ID).");
        return;
    }

    const apiUrl = `${API_BASE_URL}/api/profiles/${workerId}`;

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
        displayDescription.textContent = data.description || "Chưa có thông tin giới thiệu.";

        if (data.avatarUrl && displayAvatar) {
            displayAvatar.src = data.avatarUrl.startsWith('http') ? data.avatarUrl : (API_BASE_URL + data.avatarUrl);
        }

        // Rating
        const rating = data.rating || 0;
        const stars = Math.round(rating);
        displayRatingHtml.innerHTML = '<i class="fa-solid fa-star"></i>'.repeat(stars) + '<i class="fa-regular fa-star"></i>'.repeat(5 - stars);
        displayRatingScore.textContent = rating.toFixed(1);

        // Services
        displayServices.innerHTML = "";
        let sList = [];
        if (Array.isArray(data.services)) {
            sList = data.services;
        } else if (typeof data.services === 'string') {
            try { sList = JSON.parse(data.services); } catch(e) { sList = [data.services]; }
        }

        if (sList && sList.length > 0) {
            sList.forEach(svc => {
                const span = document.createElement("span");
                span.style.cssText = "background: #eaf3ed; color: #4e7d63; font-weight: 700; padding: 8px 16px; border-radius: 20px; font-size: 14px;";
                span.innerHTML = `<i class="fa-solid fa-check me-2"></i>${svc}`;
                displayServices.appendChild(span);
            });
        } else {
            displayServices.innerHTML = "<span class='text-muted'>Chưa có dịch vụ nào</span>";
        }
    }

    function showError(message) {
        emptyBox.style.display = "block";
        profileBox.style.display = "none";
        
        // Convert the spinner to a cross or generic error icon
        emptyBox.innerHTML = `
            <div style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h4 style="color:#2c3e50; font-weight:700;">${message}</h4>
            <a href="index.html" class="btn mt-4" style="background: #4e7d63; color: white; padding: 10px 24px; border-radius: 8px; font-weight: 600;">Về trang chủ</a>
        `;
    }

    // Fetch customer reviews for this worker
    async function fetchCustomerReviews() {
        const reviewsContainer = document.getElementById('customerReviews');
        if (!reviewsContainer) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/worker/${workerId}`);
            if (!res.ok) {
                reviewsContainer.innerHTML = '<p style="color:#999; font-size:14px; text-align:center; padding:20px 0;">Chưa có đánh giá nào.</p>';
                return;
            }

            const data = await res.json();
            const reviews = data.reviews || data;

            // Update the profile rating with real average
            if (data.averageRating != null && displayRatingScore && displayRatingHtml) {
                const avg = parseFloat(data.averageRating);
                const stars = Math.round(avg);
                displayRatingHtml.innerHTML = '<i class="fa-solid fa-star"></i>'.repeat(stars) + '<i class="fa-regular fa-star"></i>'.repeat(5 - stars);
                displayRatingScore.textContent = avg.toFixed(1);
            }

            if (!reviews || reviews.length === 0) {
                reviewsContainer.innerHTML = '<p style="color:#999; font-size:14px; text-align:center; padding:20px 0;">Chưa có đánh giá nào từ khách hàng.</p>';
                return;
            }

            reviewsContainer.innerHTML = reviews.map(rev => {
                const name = rev.customerName || 'Khách hàng';
                const initial = name.charAt(0).toUpperCase();
                const dateStr = new Date(rev.createdAt).toLocaleDateString('vi-VN');
                const starText = '★'.repeat(Math.min(rev.rating, 5)) + '☆'.repeat(5 - Math.min(rev.rating, 5));

                return `
                    <div style="padding:14px 0; border-bottom:1px solid #f0f0f0;">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="width:36px; height:36px; border-radius:50%; background:#eaf3ed; display:flex; align-items:center; justify-content:center; font-weight:800; color:#4e7d63; font-size:14px;">${initial}</div>
                                <div>
                                    <div style="font-weight:700; color:#2c3e50; font-size:14px;">${name}</div>
                                    <div style="font-size:12px; color:#aaa;">${dateStr}</div>
                                </div>
                            </div>
                            <div style="color:#f5a623; font-size:14px; letter-spacing:1px;">${starText}</div>
                        </div>
                        <div style="color:#666; font-size:14px; line-height:1.6; padding-left:46px;">${rev.comment || '<em style="color:#ccc;">Không có bình luận</em>'}</div>
                    </div>
                `;
            }).join('');

        } catch (err) {
            console.error('Error fetching reviews:', err);
            reviewsContainer.innerHTML = '<p style="color:#e74c3c; font-size:14px; text-align:center;">Lỗi tải đánh giá.</p>';
        }
    }

    // Initialize
    fetchWorkerData();
    fetchCustomerReviews();
});
