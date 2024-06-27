$(document).ready(function () {
    function loadGroups() {
        $.getJSON("http://localhost:8000/group", function (data) {
            var content = "<div class='card mb-4'>";
            content += "<div class='card-body'>";
            content += "<table class='table table-striped fixed-table' style='width: 100%;'>";
            content += "<thead><tr>";
            content += "<th class='id-col'>ID</th>";
            content += "<th class='name-col'>Название группы</th>";
            content += "<th class='edit-col'>Редактирование</th>";
            content += "<th class='delete-col'>Удаление</th>";
            content += "</tr></thead><tbody>";
            data.forEach(function (group) {
                content += "<tr>";
                content += "<td class='id-col'>" + group.Group_ID + "</td>";
                content += "<td class='name-col'>" + group.Group_Name + "</td>";
                content += '<td class="edit-col"><button class="btn btn-secondary edit-btn" data-id="' + group.Group_ID + '" data-name="' + group.Group_Name + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></button></td>';
                content += '<td class="delete-col"><button class="btn btn-danger delete-btn" data-id="' + group.Group_ID + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></button></td>';
                content += "</tr>";
            });
            content += "</tbody></table>";
            content += "</div></div>";
            $("#groups-table").html(content);

            $(".delete-btn").click(function () {
                var groupId = $(this).data("id");
                if (confirm("Вы уверены что хотите удалить эту группу?")) {
                    $.ajax({
                        url: "http://localhost:8000/groups/" + groupId,
                        type: "DELETE",
                        success: function () {
                            loadGroups();
                            alert("Группа успешно удалена!");
                        },
                        error: function () {
                            alert("Произошла ошибка при удалении группы.");
                        },
                    });
                }
            });

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
        <h1 class="mt-5">Добавление группы!</h1>
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
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
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
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
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