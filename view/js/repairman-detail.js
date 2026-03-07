document.addEventListener("DOMContentLoaded", async function () {
    
    // 1. Lấy ID từ URL
    // Nếu chưa truyền ID trên URL thì mặc định lấy 1 để test.
    const urlParams = new URLSearchParams(window.location.search);
    const repairmanId = urlParams.get('id') || 1; 

    // Các thẻ HTML cần thao tác
    const profileContent = document.getElementById("profileContent");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const errorMessage = document.getElementById("errorMessage");

    try {
        // 2. Gọi API đến Backend .NET (Cổng 5009)
        // const response = await fetch(`http://localhost:5009/api/repairprofiles/${repairmanId}`);

    const response = await fetch(`${API_BASE_URL}/api/repairprofiles/${repairmanId}`);

        if (!response.ok) {
            throw new Error("Không tìm thấy dữ liệu thợ sửa");
        }

        const data = await response.json();

        // 3. Đổ dữ liệu chữ (Text) vào HTML
        document.getElementById("rm-name").innerText = data.name;
        // document.getElementById("rm-rating").innerText = data.rating;
        // document.getElementById("rm-reviews").innerText = data.totalReviews;

        // --- XỬ LÝ HIỂN THỊ SAO ĐÁNH GIÁ ---
        const ratingBox = document.querySelector(".rating-box");
        if (data.rating === 0) {
            // Nếu 0 điểm -> Hiện "⭐ 0"
            ratingBox.innerHTML = `<span>⭐</span> <span class="fw-bold">0</span>`;
        } else {
            // Nếu > 0 điểm -> Làm tròn số và in ra số lượng sao tương ứng
            const starCount = Math.round(data.rating); 
            ratingBox.innerHTML = `<span style="letter-spacing: 3px;">${"⭐".repeat(starCount)}</span>`;
        }
        // -----------------------------------

        document.getElementById("rm-phone").innerText = data.phone;
        document.getElementById("rm-address").innerText = data.address || "Chưa cập nhật";
        document.getElementById("rm-desc").innerText = data.description || "Chưa có bài tự giới thiệu.";

        // 4. Đổ dữ liệu mảng (List) thành các thẻ Tags
        renderTags("rm-services", data.services);
        // renderTags("rm-skills", data.skills);
        renderTags("rm-areas", data.serviceAreas);

        // Hiển thị nội dung Profile, ẩn Loading Spinner
        loadingSpinner.style.display = "none";
        profileContent.style.display = "block";

    
    } catch (error) {
        console.error("Lỗi gọi API:", error);
        loadingSpinner.style.display = "none";
        errorMessage.style.display = "block";
    }

    // Hàm phụ trợ: Vẽ các mảng JSON thành thẻ Tag HTML
    function renderTags(elementId, dataArray) {
        const container = document.getElementById(elementId);
        
        // Nếu Backend trả về mảng rỗng []
        if (!dataArray || dataArray.length === 0) {
            container.innerHTML = `<span class="text-muted fst-italic">Chưa cập nhật</span>`;
            return;
        }

        // Biến mỗi phần tử thành 1 thẻ span có class .custom-tag
        const html = dataArray.map(item => `<span class="custom-tag">${item}</span>`).join('');
        container.innerHTML = html;
    }
});