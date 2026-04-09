document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');
    const workerId = urlParams.get('workerId');

    if (!requestId || !workerId) {
        window.location.href = 'my-requests.html';
        return;
    }

    // Kiểm tra đã đánh giá đơn này chưa
    try {
        const checkRes = await fetch(`${API_BASE_URL}/api/reviews/request/${requestId}`);
        if (checkRes.ok) {
            const existingReview = await checkRes.json();
            const card = document.querySelector('.card');
            if (card) {
                const starsHtml = Array.from({length: 5}, (_, i) =>
                    `<i class="bi ${i < existingReview.rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} fs-2"></i>`
                ).join(' ');

                card.innerHTML = `
                    <div class="text-center">
                        <div class="mb-3"><i class="fa-solid fa-circle-check text-success" style="font-size:64px;"></i></div>
                        <h3 class="fw-bold text-dark mb-2">Bạn đã đánh giá đơn này</h3>
                        <p class="text-muted mb-4">Cảm ơn bạn đã chia sẻ trải nghiệm!</p>
                        <div class="d-flex justify-content-center gap-2 mb-3">${starsHtml}</div>
                        ${existingReview.comment ? `<div class="bg-light rounded-3 p-3 mx-auto" style="max-width:400px;"><i class="fa-solid fa-quote-left text-secondary me-1"></i> <span class="text-dark">${existingReview.comment}</span></div>` : ''}
                        <div class="mt-4">
                            <a href="my-requests.html" class="btn text-white fw-bold px-4 py-2 rounded-3" style="background:#4e7d63;">
                                <i class="bi bi-arrow-left me-2"></i>Quay lại yêu cầu
                            </a>
                        </div>
                    </div>
                `;
            }
            return; // Dừng lại, không cần khởi tạo form
        }
    } catch (e) { /* Chưa đánh giá, tiếp tục hiện form */ }

    const starRating = document.getElementById('starRating');
    const stars = starRating.querySelectorAll('.star');
    const ratingText = document.getElementById('ratingText');
    let currentRating = 0;

    const ratingLabels = {
        1: 'Rất tệ',
        2: 'Tệ',
        3: 'Bình thường',
        4: 'Tốt',
        5: 'Tuyệt vời!'
    };

    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            updateStars();
        });

        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(rating);
            if (ratingText) ratingText.textContent = ratingLabels[rating] || '';
        });

        star.addEventListener('mouseout', () => {
            updateStars();
            if (ratingText) ratingText.textContent = currentRating > 0 ? ratingLabels[currentRating] : '';
        });
    });

    function highlightStars(rating) {
        stars.forEach(star => {
            const isActive = parseInt(star.dataset.rating) <= rating;
            if (isActive) {
                star.classList.remove('bi-star', 'text-secondary');
                star.classList.add('bi-star-fill', 'text-warning');
            } else {
                star.classList.remove('bi-star-fill', 'text-warning');
                star.classList.add('bi-star', 'text-secondary');
            }
        });
    }

    function updateStars() {
        stars.forEach(star => {
            const isActive = parseInt(star.dataset.rating) <= currentRating;
            if (isActive) {
                star.classList.remove('bi-star', 'text-secondary');
                star.classList.add('bi-star-fill', 'text-warning');
            } else {
                star.classList.remove('bi-star-fill', 'text-warning');
                star.classList.add('bi-star', 'text-secondary');
            }
        });
    }

    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (currentRating === 0) {
            if (typeof showModal === 'function') {
                showModal('Vui lòng chọn số sao đánh giá.', 'error');
            } else {
                alert('Vui lòng chọn số sao đánh giá.');
            }
            return;
        }

        const comment = document.getElementById('comment').value;
        const customerName = sessionStorage.getItem('fullName') || 'Khách hàng';

        const payload = {
            requestId: parseInt(requestId),
            workerId: parseInt(workerId),
            customerName: customerName,
            rating: currentRating,
            comment
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                if (typeof showModal === 'function') {
                    showModal('Cảm ơn bạn đã đánh giá!', 'success', {
                        autoClose: 2000,
                        onClose: () => window.location.href = 'my-requests.html'
                    });
                } else {
                    alert('Cảm ơn bạn đã đánh giá!');
                    window.location.href = 'my-requests.html';
                }
            } else {
                const data = await response.json();
                const msg = data.message || 'Gửi đánh giá thất bại.';
                if (typeof showModal === 'function') showModal(msg, 'error');
                else alert(msg);
            }
        } catch (error) {
            console.error(error);
            if (typeof showModal === 'function') showModal('Lỗi kết nối máy chủ.', 'error');
            else alert('Lỗi kết nối máy chủ.');
        }
    });
});
