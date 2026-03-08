document.addEventListener("DOMContentLoaded", function () {

    /* ================= USER DROPDOWN ================= */

    const userAvatar = document.getElementById("userAvatar");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (userAvatar && dropdownMenu) {

        let isOpen = false;

        userAvatar.addEventListener("click", function (e) {
            e.stopPropagation();

            if (!isOpen) {
                dropdownMenu.classList.add("show");
                isOpen = true;
            } else {
                dropdownMenu.classList.remove("show");
                isOpen = false;
            }
        });

        document.addEventListener("click", function (e) {
            if (isOpen && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove("show");
                isOpen = false;
            }
        });
    }

    /* ================= CREATE PROFILE MODAL ================= */

    const modal = document.getElementById("profileModal");
    const openBtn = document.getElementById("openModal");
    const closeBtn = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");

    if (openBtn && modal) {
        openBtn.addEventListener("click", function () {
            modal.style.display = "flex";
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    if (cancelBtn && modal) {
        cancelBtn.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    /* ================= AUTO EXPAND TEXTAREA ================= */

    const textareas = document.querySelectorAll(".auto-expand");

    textareas.forEach(textarea => {
        textarea.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = this.scrollHeight + "px";
        });
    });

    /* ================= SELECT ALL SERVICES ================= */

    const selectAllBtn = document.getElementById("selectAll");
    const deselectAllBtn = document.getElementById("deselectAll");

    if (selectAllBtn) {
        selectAllBtn.addEventListener("click", function () {
            document.querySelectorAll(".service").forEach(cb => cb.checked = true);
        });
    }

    if (deselectAllBtn) {
        deselectAllBtn.addEventListener("click", function () {
            document.querySelectorAll(".service").forEach(cb => cb.checked = false);
        });
    }

});