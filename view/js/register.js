document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const roleTabs = document.querySelectorAll('.role-tab');
    const repairmanFields = document.getElementById('repairmanFields');
    const submitBtn = document.getElementById('submitBtn');
    let currentRole = 'Customer';

    // DOM refs
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const categorySelect = document.getElementById('category');
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const wardSelect = document.getElementById('wardSelect');
    const detailAddressInput = document.getElementById('detailAddress');

    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const passwordError = document.getElementById('passwordError');

    // Store API data
    let allProvinces = [];

    // === ROLE TAB SWITCHING ===
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRole = tab.dataset.role;
            if (repairmanFields) {
                repairmanFields.style.display = currentRole === 'Repairman' ? 'block' : 'none';
            }
        });
    });

    // === LOAD PROVINCES (depth=3 includes wards) ===
    async function loadProvinces() {
        try {
            const res = await fetch('https://provinces.open-api.vn/api/?depth=3');
            if (!res.ok) return;
            allProvinces = await res.json();
            
            allProvinces.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.code;
                opt.textContent = p.name;
                provinceSelect.appendChild(opt);
            });
        } catch (err) {
            console.error('Lỗi tải dữ liệu tỉnh/thành:', err);
        }
    }

    // === CASCADE: Province -> District ===
    provinceSelect.addEventListener('change', () => {
        const code = parseInt(provinceSelect.value);
        districtSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
        wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
        districtSelect.disabled = true;
        wardSelect.disabled = true;

        if (!code) return;

        const province = allProvinces.find(p => p.code === code);
        if (province && province.districts) {
            province.districts.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.code;
                opt.textContent = d.name;
                districtSelect.appendChild(opt);
            });
            districtSelect.disabled = false;
        }
    });

    // === CASCADE: District -> Ward ===
    districtSelect.addEventListener('change', () => {
        const provCode = parseInt(provinceSelect.value);
        const distCode = parseInt(districtSelect.value);
        wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
        wardSelect.disabled = true;

        if (!provCode || !distCode) return;

        const province = allProvinces.find(p => p.code === provCode);
        if (!province) return;
        const district = province.districts.find(d => d.code === distCode);
        if (district && district.wards) {
            district.wards.forEach(w => {
                const opt = document.createElement('option');
                opt.value = w.code;
                opt.textContent = w.name;
                wardSelect.appendChild(opt);
            });
            wardSelect.disabled = false;
        }
    });

    // === VALIDATION HELPERS ===
    function clearError(input, errorEl) {
        input.classList.remove('is-invalid');
        if (errorEl) errorEl.style.display = 'none';
    }
    function showError(input, errorEl, msg) {
        input.classList.add('is-invalid');
        if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
    }

    // Real-time validation on input
    fullNameInput.addEventListener('input', () => clearError(fullNameInput, nameError));
    phoneInput.addEventListener('input', () => {
        // Only allow digits
        phoneInput.value = phoneInput.value.replace(/\D/g, '').substring(0, 10);
        clearError(phoneInput, phoneError);
    });
    passwordInput.addEventListener('input', () => clearError(passwordInput, passwordError));

    // === FORM SUBMIT ===
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = fullNameInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;
        let valid = true;

        // 1. Name validation: support full Vietnamese alphabet
        const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸạảấầẩẫậắằẳẵặẹẻẽềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹđĐ\s]+$/;
        if (fullName === '') {
            showError(fullNameInput, nameError, 'Họ tên không được để trống.');
            valid = false;
        } else if (!nameRegex.test(fullName)) {
            showError(fullNameInput, nameError, 'Họ tên không được chứa số hoặc ký tự đặc biệt.');
            valid = false;
        }

        // 2. Phone validation: starts with 0, exactly 10 digits
        const phoneRegex = /^0\d{9}$/;
        if (phone === '') {
            showError(phoneInput, phoneError, 'Số điện thoại không được để trống.');
            valid = false;
        } else if (!phoneRegex.test(phone)) {
            showError(phoneInput, phoneError, 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.');
            valid = false;
        }

        // 3. Password validation: min 6
        if (password.length < 6) {
            showError(passwordInput, passwordError, 'Mật khẩu phải có ít nhất 6 ký tự.');
            valid = false;
        }

        if (!valid) return;

        // Build payload
        const payload = {
            fullName,
            phone,
            password,
            role: currentRole
        };

        // For Repairman: include address and category
        if (currentRole === 'Repairman') {
            payload.category = categorySelect.value || null;
            
            // Build full address from selectors
            const provText = provinceSelect.options[provinceSelect.selectedIndex]?.text || '';
            const distText = districtSelect.options[districtSelect.selectedIndex]?.text || '';
            const wardText = wardSelect.options[wardSelect.selectedIndex]?.text || '';
            const detail = detailAddressInput.value.trim();

            const parts = [detail, wardText, distText, provText].filter(p => p && p !== '' && !p.startsWith('--'));
            payload.address = parts.join(', ');
        }

        // Disable button while submitting
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Đăng ký thành công! Hãy đăng nhập.');
                window.location.href = 'login.html';
            } else {
                const error = await response.text();
                alert('Đăng ký thất bại: ' + error);
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Tạo tài khoản';
        }
    });

    // Load provinces on page init
    loadProvinces();
});
