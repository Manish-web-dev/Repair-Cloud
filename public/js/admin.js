document.addEventListener("DOMContentLoaded", function () {
    const openBtn = document.getElementById("openProjectModal"); // fixed id here
    const modal = document.getElementById("projectModal");
    const closeBtn = document.getElementById("closeProjectModal");
    const form = document.getElementById("projectForm");
    const tableBody = document.getElementById("projectTableBody");
    const editModal = document.getElementById("editProjectModal");
    const closeEditBtn = document.getElementById("closeEditProjectModal");
    const editForm = document.getElementById("editProjectForm");

    function showModal() { modal.style.display = "flex"; } // changed from "block" to "flex"
    function hideModal() { modal.style.display = "none"; form.reset(); }
    function showEditModal() { editModal.style.display = "flex"; }
    function hideEditModal() { editModal.style.display = "none"; editForm.reset(); }

    openBtn.addEventListener("click", showModal);
    closeBtn.addEventListener("click", hideModal);
    if (closeEditBtn) closeEditBtn.addEventListener("click", hideEditModal);
    window.onclick = function(event) {
        if (event.target === modal) hideModal();
        if (event.target === editModal) hideEditModal();
    };

    // Fetch and render projects
    function fetchProjects() {
        fetch("/projects")
            .then(res => res.json())
            .then(projects => {
                tableBody.innerHTML = "";
                projects
                    .slice()
                    .sort((a, b) => (a.projectNumber > b.projectNumber ? 1 : -1))
                    .forEach((p) => {
                        const tr = document.createElement("tr");
                        tr.setAttribute("data-id", p._id);
                        // Format date to YYYY-MM-DD
                        const formattedDate = p.date ? new Date(p.date).toISOString().slice(0,10) : "";
                        tr.innerHTML = `
                            <td>${p.projectNumber}</td>
                            <td><img src="${p.imageUrl}" alt="img" style="width:60px;height:60px;object-fit:cover;"></td>
                            <td>${p.description}</td>
                            <td>${formattedDate}</td>
                            <td>
                                <button class="edit-btn btn btn_secondary" data-id="${p._id}">Edit</button>
                                <button class="delete-btn btn btn_primary" data-id="${p._id}">Delete</button>
                                ${!p.completed ? `<button class="complete-btn btn btn_success" data-id="${p._id}">Completed</button>` : ""}
                            </td>
                        `;
                        tableBody.appendChild(tr);
                    });

                // Attach event listeners for edit/delete
                document.querySelectorAll(".edit-btn").forEach(btn => {
                    btn.onclick = function () {
                        const id = btn.getAttribute("data-id");
                        fetch(`/projects/${id}`)
                            .then(res => res.json())
                            .then(p => {
                                document.getElementById("editProjectId").value = p._id;
                                document.getElementById("editProjectNumber").value = p.projectNumber;
                                document.getElementById("editDescription").value = p.description;
                                document.getElementById("editDate").value = p.date ? new Date(p.date).toISOString().slice(0,10) : "";
                                showEditModal();
                            });
                    };
                });
                document.querySelectorAll(".delete-btn").forEach(btn => {
                    btn.onclick = function () {
                        const id = btn.getAttribute("data-id");
                        if (confirm("Are you sure you want to delete this project?")) {
                            fetch(`/projects/${id}`, { method: "DELETE" })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.success) fetchProjects();
                                    else alert(data.error || "Failed to delete project");
                                });
                        }
                    };
                });
                // Completed button handler
                document.querySelectorAll(".complete-btn").forEach(btn => {
                    btn.onclick = function () {
                        const id = btn.getAttribute("data-id");
                        fetch(`/projects/${id}/completed`, { method: "PUT" })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) fetchProjects();
                                else alert(data.error || "Failed to mark as completed");
                            });
                    };
                });
            });
    }

    fetchProjects();

    // Handle form submit
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        fetch("/projects", {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" } // ensure backend returns JSON
        })
        .then(async res => {
            let data;
            try {
                data = await res.json();
            } catch (e) {
                data = { error: "Invalid server response" };
            }
            if (res.ok && data.success) {
                // Reload the table from server to ensure correct image URL and data
                fetchProjects();
                form.reset();
                hideModal();
            } else {
                alert(data.error || "Failed to add project");
            }
        })
        .catch(err => {
            alert("Failed to add project: " + err.message);
        });
    });

    // Handle edit form submit
    if (editForm) {
        editForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const id = document.getElementById("editProjectId").value;
            const formData = new FormData(editForm);
            fetch(`/projects/${id}`, {
                method: "PUT",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    fetchProjects();
                    hideEditModal();
                } else {
                    alert(data.error || "Failed to update project");
                }
            })
            .catch(err => {
                alert("Failed to update project: " + err.message);
            });
        });
    }

    // GALLERY SECTION
    const openGalleryBtn = document.getElementById("openGalleryModal");
    const galleryModal = document.getElementById("galleryModal");
    const closeGalleryBtn = document.getElementById("closeGalleryModal");
    const galleryForm = document.getElementById("galleryForm");
    const galleryTableBody = document.getElementById("galleryTableBody");

    function showGalleryModal() { galleryModal.style.display = "flex"; }
    function hideGalleryModal() { galleryModal.style.display = "none"; galleryForm.reset(); }

    if (openGalleryBtn) openGalleryBtn.addEventListener("click", showGalleryModal);
    if (closeGalleryBtn) closeGalleryBtn.addEventListener("click", hideGalleryModal);
    window.addEventListener("click", function(event) {
        if (event.target === galleryModal) hideGalleryModal();
    });

    function fetchGalleryImages() {
        fetch("/gallery-images")
            .then(res => res.json())
            .then(images => {
                galleryTableBody.innerHTML = "";
                images.forEach((img, idx) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${idx + 1}</td>
                        <td>
                            ${img.imageUrl ? `<img src="${img.imageUrl}" alt="gallery" style="width:60px;height:60px;object-fit:cover;">` : ""}
                        </td>
                        <td>${img.createdAt ? new Date(img.createdAt).toISOString().slice(0,10) : ""}</td>
                        <td>
                            <button class="delete-gallery-btn btn btn_primary" data-id="${img._id}">Delete</button>
                        </td>
                    `;
                    galleryTableBody.appendChild(tr);
                });
                document.querySelectorAll(".delete-gallery-btn").forEach(btn => {
                    btn.onclick = function () {
                        const id = btn.getAttribute("data-id");
                        if (confirm("Delete this image?")) {
                            fetch(`/gallery-images/${id}`, { method: "DELETE" })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.success) fetchGalleryImages();
                                    else alert(data.error || "Failed to delete image");
                                });
                        }
                    };
                });
            });
    }

    fetchGalleryImages();

    if (galleryForm) {
        galleryForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const fileInput = document.getElementById("galleryImage");
            if (!fileInput.files || !fileInput.files.length) {
                alert("Please select an image file to upload.");
                return;
            }
            const formData = new FormData(galleryForm);
            fetch("/gallery-images", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    fetchGalleryImages();
                    hideGalleryModal();
                } else {
                    alert(data.error || "Failed to upload image");
                }
            })
            .catch(err => {
                alert("Failed to upload image: " + err.message);
            });
        });
    }

});