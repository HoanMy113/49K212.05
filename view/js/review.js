document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');
    const workerId = urlParams.get('workerId');

    if (!requestId || !workerId) {
        window.location.href = 'my-requests.html';
        return;
    }

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
