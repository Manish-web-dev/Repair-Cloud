document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("galleryGrid");
    fetch("/gallery-images")
        .then(res => res.json())
        .then(images => {
            if (!images.length) {
                grid.innerHTML = "<p style='font-size:2rem;color:#444;'>No images yet.</p>";
                return;
            }
            grid.innerHTML = "";
            images.forEach((img, idx) => {
                if (img.imageUrl) {
                    const div = document.createElement("div");
                    div.className = "gallery-img-box";
                    div.style.animationDelay = (idx * 0.09) + "s";
                    // Add fade-in animation for each image
                    div.style.opacity = "0";
                    setTimeout(() => {
                        div.style.opacity = "1";
                        div.style.transition = "opacity 0.7s cubic-bezier(.4,2,.6,1)";
                    }, 100 + idx * 90);
                    div.innerHTML = `<img src="${img.imageUrl}" alt="gallery" class="gallery-img" style="cursor:pointer;">`;
                    // Add click event for preview with ripple effect
                    const galleryImg = div.querySelector("img");
                    galleryImg.addEventListener("click", function (e) {
                        createRipple(div, e);
                        setTimeout(() => showPreviewModal(img.imageUrl), 180);
                    });
                    // Handle broken image
                    galleryImg.onerror = function() {
                        if (galleryImg.src.indexOf("/images/broken-image.png") === -1) {
                            galleryImg.src = "/images/broken-image.png";
                            galleryImg.alt = "Image not found";
                            galleryImg.style.objectFit = "contain";
                            // Optionally show a tooltip/message
                            galleryImg.title = "Image not found or upload failed.";
                        }
                    };
                    grid.appendChild(div);
                }
            });
        });

    // Ripple effect
    function createRipple(container, e) {
        let ripple = document.createElement("span");
        ripple.className = "gallery-ripple";
        const rect = container.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + "px";
        ripple.style.top = (e.clientY - rect.top) + "px";
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    }

    // Modal preview logic
    function showPreviewModal(imageUrl) {
        let modal = document.getElementById("galleryPreviewModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "galleryPreviewModal";
            modal.style.position = "fixed";
            modal.style.left = 0;
            modal.style.top = 0;
            modal.style.width = "100vw";
            modal.style.height = "100vh";
            modal.style.background = "rgba(0,0,0,0.8)";
            modal.style.display = "flex";
            modal.style.alignItems = "center";
            modal.style.justifyContent = "center";
            modal.style.zIndex = 9999;
            modal.innerHTML = `
                <span id="closePreviewModal" style="position:absolute;top:30px;right:50px;font-size:3rem;color:#fff;cursor:pointer;z-index:10001;">&times;</span>
                <img src="" alt="preview" style="max-width:90vw;max-height:90vh;border-radius:22px;box-shadow:0 2px 24px #0008;">
            `;
            document.body.appendChild(modal);
        }
        const img = modal.querySelector("img");
        img.src = imageUrl;
        img.style.animation = "pulsePreview 0.6s cubic-bezier(.4,2,.6,1)";
        modal.style.display = "flex";
        // Close on click X or outside image
        modal.querySelector("#closePreviewModal").onclick = () => { modal.style.display = "none"; };
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = "none";
        };
    }

    // Add ripple effect CSS and pulse animation dynamically if not present
    if (!document.getElementById("galleryRippleStyle")) {
        const style = document.createElement("style");
        style.id = "galleryRippleStyle";
        style.innerHTML = `
        .gallery-ripple {
            position: absolute;
            width: 60px;
            height: 60px;
            background: rgba(93,95,239,0.18);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%) scale(0.5);
            animation: rippleAnim 0.5s linear;
            z-index: 2;
        }
        @keyframes rippleAnim {
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(2.5);
            }
        }
        @keyframes pulsePreview {
            0% { transform: scale(0.92); opacity: 0.7;}
            60% { transform: scale(1.05);}
            100% { transform: scale(1); opacity: 1;}
        }
        `;
        document.head.appendChild(style);
    }
});
