document.addEventListener('DOMContentLoaded', async () => {
    
    /* ================= SESSION CHECK ================= */
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === "true";
    const userRole = sessionStorage.getItem('userRole');
    const userName = sessionStorage.getItem('fullName') || 'Người dùng';
    const workerProfileId = sessionStorage.getItem('workerProfileId');

    if (!isLoggedIn || userRole !== 'Repairman') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in navbar
    const usernameEl = document.getElementById("username");
    if (usernameEl) {
        usernameEl.textContent = userName || "Thợ sửa chữa";
    }

    /* ================= USER DROPDOWN ================= */
    const userAvatar = document.getElementById("userAvatar");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (userAvatar && dropdownMenu) {
        let isOpen = false;
        userAvatar.addEventListener("click", function (e) {
            e.stopPropagation();
            isOpen = !isOpen;
            dropdownMenu.classList.toggle("show", isOpen);
        });
        document.addEventListener("click", function (e) {
            if (isOpen && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove("show");
                isOpen = false;
            }
        });
    }

    /* ================= LOGOUT ================= */
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = "login.html";
        });
    }

    /* ================= DATA FETCHING ================= */
    const feedbackList = document.getElementById('feedbackList');
    const ratingSummary = document.getElementById('ratingSummary');
    const avgStars = document.getElementById('avgStars');
    const starIcons = document.getElementById('starIcons');
    const workerNameDisplay = document.getElementById('workerNameDisplay');
    const totalReviewsCount = document.getElementById('totalReviewsCount');

    // Display Name in Summary Card
    if (workerNameDisplay) workerNameDisplay.textContent = userName || "Hồ sơ của bạn";

    async function fetchFeedback() {
        if (!workerProfileId) {
            renderEmptyState("Bạn chưa thiết lập hồ sơ thợ. Hãy vào 'Hồ sơ của tôi' để tạo hồ sơ trước.");
            return;
        }

        try {
            // Fetch reviews directly using workerProfileId
            const reviewsRes = await fetch(`${API_BASE_URL}/api/reviews/worker/${workerProfileId}`);
            
            if (!reviewsRes.ok) {
                if (reviewsRes.status === 404) {
                    renderEmptyState("Bạn chưa có đánh giá nào từ khách hàng.");
                } else {
                    throw new Error('Lỗi tải dữ liệu từ máy chủ.');
                }
                return;
            }
            
            const data = await reviewsRes.json();
            renderFeedback(data.reviews || data);

        } catch (error) {
            console.error(error);
            if (feedbackList) {
                feedbackList.innerHTML = `<div class="empty-state">
                    <i class="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i>
                    <p>Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
                </div>`;
            }
        }
    }

    function renderEmptyState(message) {
        if (ratingSummary) ratingSummary.style.display = 'none';
        if (feedbackList) {
            feedbackList.innerHTML = `
                <div class="empty-state">
                    <div class="placeholder-icon">—</div>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    function renderFeedback(reviews) {
        if (!reviews || reviews.length === 0) {
            renderEmptyState("Bạn chưa có đánh giá nào từ khách hàng.");
            return;
        }

        if (ratingSummary) ratingSummary.style.display = 'flex';
        
        // Calculate average
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        if (avgStars) avgStars.textContent = avg.toFixed(1);
        if (totalReviewsCount) totalReviewsCount.textContent = `${reviews.length} đánh giá từ khách hàng`;
        
        // Render large summary stars
        if (starIcons) {
            let starHtml = '';
            const roundedAvg = Math.round(avg);
            for (let i = 1; i <= 5; i++) {
                starHtml += i <= roundedAvg ? '★' : '☆';
            }
            starIcons.textContent = starHtml;
        }

        // Render rating breakdown bars
        const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
        reviews.forEach(r => {
            const s = parseInt(r.rating);
            if (s >= 1 && s <= 5) counts[s - 1]++;
        });
        const maxCount = Math.max(...counts, 1);
        for (let i = 1; i <= 5; i++) {
            const bar = document.getElementById(`bar${i}`);
            const countEl = document.getElementById(`count${i}`);
            if (bar) bar.style.width = `${(counts[i - 1] / maxCount) * 100}%`;
            if (countEl) countEl.textContent = counts[i - 1];
        }

        // Render reviews list
        if (feedbackList) {
            feedbackList.innerHTML = reviews.map(rev => {
                const name = rev.customerName || 'Khách hàng';
                const initial = name.charAt(0).toUpperCase();
                const dateStr = new Date(rev.createdAt).toLocaleDateString('vi-VN');
                return `
                    <div class="feedback-item">
                        <div class="feedback-header">
                            <div class="feedback-author">
                                <div class="author-avatar">${initial}</div>
                                <div class="author-info">
                                    <div class="name">${name}</div>
                                    <div class="date">${dateStr}</div>
                                </div>
                            </div>
                            <div class="feedback-rating">${renderStarText(rev.rating)}</div>
                        </div>
                        <div class="feedback-text">${rev.comment || '<em style="color:#bbb;">Không có bình luận</em>'}</div>
                    </div>
                `;
            }).join('');
        }
    }

    function renderStarText(count) {
        let text = '';
        const limit = parseInt(count) || 0;
        for (let i = 0; i < limit; i++) text += '★';
        for (let i = limit; i < 5; i++) text += '☆';
        return text;
    }

    fetchFeedback();
});
