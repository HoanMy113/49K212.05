document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    const userPhone = sessionStorage.getItem('userPhone');
    const userName = sessionStorage.getItem('userName');

    if (isLoggedIn !== 'true' || userRole !== 'Repairman') {
        window.location.href = 'login.html';
        return;
    }

    const feedbackList = document.getElementById('feedbackList');
    const ratingSummary = document.getElementById('ratingSummary');
    const avgStars = document.getElementById('avgStars');
    const starIcons = document.getElementById('starIcons');
    const workerNameDisplay = document.getElementById('workerNameDisplay');
    const totalReviewsCount = document.getElementById('totalReviewsCount');

    workerNameDisplay.textContent = userName;

    async function fetchFeedback() {
        try {
            // Find worker profile by phone
            const profileRes = await fetch(`http://localhost:5194/api/profile/phone/${userPhone}`);
            if (!profileRes.ok) throw new Error('Không tìm thấy hồ sơ thợ');
            const profile = await profileRes.json();

            // Fetch reviews for this worker
            const reviewsRes = await fetch(`http://localhost:5194/api/reviews/worker/${profile.id}`);
            if (!reviewsRes.ok) throw new Error('Không thể tải đánh giá');
            const reviews = await reviewsRes.json();

            renderFeedback(reviews);
        } catch (error) {
            console.error(error);
            feedbackList.innerHTML = '<div class="error-text">Có lỗi xảy ra khi tải dữ liệu.</div>';
        }
    }

    function renderFeedback(reviews) {
        if (!reviews || reviews.length === 0) {
            feedbackList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-slash fa-3x mb-3"></i>
                    <p>Bạn chưa có đánh giá nào từ khách hàng.</p>
                </div>
            `;
            ratingSummary.style.display = 'none';
            return;
        }

        ratingSummary.style.display = 'flex';
        
        // Calculate average
        const avg = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;
        avgStars.textContent = avg.toFixed(1);
        totalReviewsCount.textContent = `${reviews.length} đánh giá từ khách hàng`;
        
        // Render stars
        let starHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.round(avg)) {
                starHtml += '<i class="fas fa-star"></i>';
            } else {
                starHtml += '<i class="far fa-star"></i>';
            }
        }
        starIcons.innerHTML = starHtml;

        feedbackList.innerHTML = reviews.map(rev => `
            <div class="feedback-item">
                <div class="feedback-user">
                    <span class="name">${rev.customerName || 'Khách hàng ẩn danh'}</span>
                    <div class="stars text-warning ms-2">
                        ${renderStarIcons(rev.stars)}
                    </div>
                    <span class="feedback-date">${new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="feedback-text">${rev.comment}</div>
            </div>
        `).join('');
    }

    function renderStarIcons(count) {
        let text = '';
        for(let i=0; i<count; i++) text += '<i class="fas fa-star"></i>';
        for(let i=count; i<5; i++) text += '<i class="far fa-star"></i>';
        return text;
    }

    fetchFeedback();
});
