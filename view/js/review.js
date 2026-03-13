document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');
    const workerId = urlParams.get('workerId');
    const customerPhone = sessionStorage.getItem('userPhone');

    if (!requestId || !workerId) {
        window.location.href = 'my-requests.html';
        return;
    }

    const starRating = document.getElementById('starRating');
    const stars = starRating.querySelectorAll('i');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            updateStars();
        });
        
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(rating);
        });
        
        star.addEventListener('mouseout', () => {
            updateStars();
        });
    });

    function highlightStars(rating) {
        stars.forEach(star => {
            star.classList.toggle('active', parseInt(star.dataset.rating) <= rating);
        });
    }

    function updateStars() {
        stars.forEach(star => {
            star.classList.toggle('active', parseInt(star.dataset.rating) <= currentRating);
        });
    }

    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (currentRating === 0) {
            alert('Vui lòng chọn số sao đánh giá.');
            return;
        }

        const comment = document.getElementById('comment').value;

        const payload = {
            requestId: parseInt(requestId),
            workerId: parseInt(workerId),
            customerPhone,
            stars: currentRating,
            comment
        };

        try {
            const response = await fetch('http://localhost:5194/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Cảm ơn bạn đã đánh giá!');
                window.location.href = 'my-requests.html';
            } else {
                const text = await response.text();
                alert('Gửi đánh giá thất bại: ' + text);
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối máy chủ.');
        }
    });
});
