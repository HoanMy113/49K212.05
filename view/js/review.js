document.addEventListener('DOMContentLoaded', () => {
    // 1. Phân tích tham số truyền trên Thanh Địa Chỉ (URL Params)
    // Ví dụ: review.html?requestId=123&workerId=45
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');
    const workerId = urlParams.get('workerId');

    if (!requestId || !workerId) {
        // Nếu ai cố tình vào lỗi màn hình này, đá văng về trang Lịch sử
        window.location.href = 'my-requests.html';
        return;
    }

    // Biến lưu trữ Ngôi sao
    const starRating = document.getElementById('starRating');
    const stars = starRating.querySelectorAll('.star');
    const ratingText = document.getElementById('ratingText');
    let currentRating = 0; // Bắt buộc phải chọn mới khác 0

    const ratingLabels = {
        1: 'Rất tệ',
        2: 'Tệ',
        3: 'Bình thường',
        4: 'Tốt',
        5: 'Tuyệt vời!'
    };

    // 2. HIỆU ỨNG DI CHUỘT (Hover) QUA NHỮNG NGÔI SAO
    stars.forEach(star => {
        // Khi Cick: Chốt số Sao hiện tại
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            updateStars();
        });

        // Khi Lướt chuột qua: Bóng lên màu vàng để xem trước
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(rating);
            if (ratingText) ratingText.textContent = ratingLabels[rating] || '';
        });

        // Khi Nhả chuột ra mà chưa Click: Trở lại số sao đang chốt
        star.addEventListener('mouseout', () => {
            updateStars();
            if (ratingText) ratingText.textContent = currentRating > 0 ? ratingLabels[currentRating] : '';
        });
    });

    // Hàm nhuộm màu Vàng các mảng Ngôi Sao
    function highlightStars(rating) {
        stars.forEach(star => {
            const isActive = parseInt(star.dataset.rating) <= rating;
            if (isActive) {
                star.classList.remove('bi-star', 'text-secondary');
                star.classList.add('bi-star-fill', 'text-warning'); // ICON SAO ĐẦY
            } else {
                star.classList.remove('bi-star-fill', 'text-warning');
                star.classList.add('bi-star', 'text-secondary'); // ICON SAO RỖNG XÁM
            }
        });
    }

    function updateStars() {
        highlightStars(currentRating);
    }

    // 3. LOGIC GỬI THÔNG TIN / SUBMIT ĐÁNH GIÁ (Push API)
    const reviewForm = document.getElementById('reviewForm');
    
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Tránh bị Load lại trang HTML

        // Kiểm tra khách đã chọn sao chưa?
        if (currentRating === 0) {
            alert('Vui lòng chọn số sao đánh giá.');
            return;
        }

        const comment = document.getElementById('comment').value; // Ý kiến của khách
        const customerName = sessionStorage.getItem('fullName') || 'Khách hàng';

        const payload = {
            requestId: parseInt(requestId), // Id đơn
            workerId: parseInt(workerId),   // Id ông thợ
            customerName: customerName,     // Tên ông khách
            rating: currentRating,          // Mấy sao?
            comment: comment                // Cầm cái gì?
        };

        try {
            // Đổ Request thẳng về Backend API
            const response = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Thành công: Thông báo và Điều hướng khách trở về Bảng điều khiển Lịch sử
                alert('Cảm ơn bạn đã phản hồi chất lượng. Ý kiến của bạn đã được ghi nhận!');
                window.location.href = 'my-requests.html';
                
            } else {
                // Báo lỗi (Khách đã Review đơn này rồi thì Server trả chữ về đây)
                const data = await response.json();
                const msg = data.message || 'Gửi đánh giá thất bại.';
                alert(msg);
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối mạng hoặc máy chủ tắt.');
        }
    });
});