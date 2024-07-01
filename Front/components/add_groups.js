$(document).ready(function () {
    function loadGroups() {
        $.getJSON("http://localhost:8000/group", function (data) {
            var content = "<div class='card mb-4'>";
            content += "<div class='card-header bg-primary text-white'>Группы</div>";
            content += "<div class='card-body'>";
            content += "<table class='table table-hover table-bordered'>";
            content += "<thead class='thead-light'><tr>";
            content += "<th class='text-center'>№</th>";
            content += "<th>Название группы</th>";
            content += "<th class='text-center'>Редактирование</th>";
            content += "</tr></thead><tbody>";

            data.forEach(function (group, index) {
                content += "<tr>";
                content += "<td class='text-center'>" + (index + 1) + "</td>";
                content += "<td>" + group.Group_Name + "</td>";
                content += '<td class="text-center"><button class="btn btn-warning btn-sm edit-btn" data-id="' + group.Group_ID + '" data-name="' + group.Group_Name + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293z"/></svg></button></td>';
                content += "</tr>";
            });

            content += "</tbody></table>";
            content += "</div></div>";
            $("#groups-table").html(content);

            $(".edit-btn").click(function () {
                var groupId = $(this).data("id");
                var groupName = $(this).data("name");

                // Заполнить поля модального окна
                $("#editGroupId").val(groupId);
                $("#editGroupName").val(groupName);

                // Показать модальное окно
                $("#editModal").modal("show");
            });
        });
    }

    function resetForm() {
        $("#group-form")[0].reset();
        $("#group-id").val("");
    }

    function createGroup(event) {
        event.preventDefault(); // предотвратить перезагрузку страницы при отправке формы
        var groupId = $("#group-id").val();
        var url = groupId
            ? "http://localhost:8000/groups/" + groupId
            : "http://localhost:8000/groups";
        var type = groupId ? "PUT" : "POST";
        var groupData = {
            Group_Name: $("#groupName").val()
        };
        $.ajax({
            url: url,
            type: type,
            contentType: "application/json",
            data: JSON.stringify(groupData),
            success: function () {
                loadGroups();
                resetForm();
                $("#editModal").modal("hide");
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при создании группы:", error);
            },
        });
    }

    function updateGroup() {
        var groupId = $("#editGroupId").val();
        var groupData = {
            Group_Name: $("#editGroupName").val()
        };
        $.ajax({
            url: "http://localhost:8000/groups/" + groupId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(groupData),
            success: function () {
                loadGroups();
                $("#editModal").modal("hide");
                alert("Группа успешно обновлена!");
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при обновлении группы:", error);
            },
        });
    }

    var app = $("#app");
    var content = `
        <h1 class="mt-5">Добавление группы</h1>
        <form id="group-form" class="mb-3">
            <input type="hidden" id="group-id">
            <div class="form-group">
                <label for="groupName">Название группы</label>
                <input type="text" class="form-control" id="groupName" required>
            </div>
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-secondary" id="reset-button">Сбросить</button>
        </form>
        <div id="groups-table"></div>
        
        <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editModalLabel">Редактирование группы</h5>
                        <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-group-form">
                            <input type="hidden" id="editGroupId">
                            <div class="form-group">
                                <label for="editGroupName">Название группы</label>
                                <input type="text" class="form-control" id="editGroupName" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        <button type="button" class="btn btn-primary" id="saveBtn">Сохранить изменения</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    app.html(content);

    $("#group-form").on("submit", createGroup); // обработка отправки формы
    $("#reset-button").on("click", resetForm); // обработка сброса формы
    $("#saveBtn").on("click", updateGroup); // обработка сохранения в модальном окне

    loadGroups();
});
