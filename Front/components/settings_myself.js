$(document).ready(function () {
    // Вставляем HTML код для модального окна
    $("body").append(`
        <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="editModalLabel">Редактирование студента</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form id="editForm">
                  <div class="mb-3">
                    <label for="editFirstName" class="form-label">Имя:</label>
                    <input type="text" class="form-control" id="editFirstName" name="First_Name">
                  </div>
                  <div class="mb-3">
                    <label for="editLastName" class="form-label">Фамилия:</label>
                    <input type="text" class="form-control" id="editLastName" name="Last_Name">
                  </div>
                  <div class="mb-3">
                    <label for="editMiddleName" class="form-label">Отчество:</label>
                    <input type="text" class="form-control" id="editMiddleName" name="Middle_Name">
                  </div>
                  <div class="mb-3">
                    <label for="editEmail" class="form-label">Email:</label>
                    <input type="email" class="form-control" id="editEmail" name="email">
                  </div>
                  <div class="mb-3">
                    <label for="editPassword" class="form-label">Пароль:</label>
                    <input type="password" class="form-control" id="editPassword" name="password">
                  </div>
                  <div class="mb-3">
                    <label for="editGroup" class="form-label">Группа:</label>
                    <select class="form-control" id="editGroup" name="Group"></select>
                  </div>
                  <input type="hidden" id="editUserId">
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                <button type="button" class="btn btn-primary" id="saveBtn">Сохранить</button>
              </div>
            </div>
          </div>
        </div>
    `);
  
    function loadGroups() {
        $.getJSON("http://localhost:8000/group", function (data) {
            var groupSelect = $("#editGroup");
            groupSelect.empty();
            data.forEach(function (group) {
                var option = "<option value='" + group.Group_ID + "'>" + group.Group_Name + "</option>";
                groupSelect.append(option);
            });
        });
    }
  
    function loadStudentsByGroup() {
        $.getJSON("http://localhost:8000/users_by_group", function (data) {
            var content = "";
            data.forEach(function (group) {
                content += "<div class='group'>";
                content += "<h3 style='margin-top: 50px'>Группа: " + group.group_name + "</h3>";
                content += "<table class='table table-striped fixed-table'>";
                content += "<thead class=''><tr><th class='id-col'>ID</th><th class='last-name-col'>Фамилия</th><th class='first-name-col'>Имя</th><th class='middle-name-col'>Отчество</th><th class='edit-col'>Редактирование</th><th class='delete-col'>Удаление</th></tr></thead><tbody>";
                group.students.forEach(function (student) {
                    content += "<tr>";
                    content += "<td class='id-col'>" + student.User_ID + "</td>";
                    content += "<td class='last-name-col'>" + student.Last_Name + "</td>";
                    content += "<td class='first-name-col'>" + student.First_Name + "</td>";
                    content += "<td class='middle-name-col'>" + (student.Middle_Name || '') + "</td>";
                    content += '<td class="edit-col"><button class="btn btn-secondary edit-btn" data-id="' + student.User_ID + '" data-first-name="' + student.First_Name + '" data-last-name="' + student.Last_Name + '" data-middle-name="' + (student.Middle_Name || '') + '" data-group-id="' + group.group_id + '" data-username="' + student.username + '" data-email="' + student.email + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></button></td>';
                    content += '<td class="delete-col"><button class="btn btn-danger delete-btn" data-id="' + student.User_ID + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 1 .5-.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H12v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4H2.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h3.993a1 1 0 0 1 .874.486l.57.964h2.138l.57-.964A1 1 0 0 1 10.507 1H14.5a1 1 0 0 1 1 1v1zM3 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H3zm10-1H9.125L8.553 3H7.447l-.572-.486H3.5V2h10v1z"/></svg></button></td>';
                    content += "</tr>";
                });
                content += "</tbody></table>";
                content += "</div>";
            });
            $("#studentsByGroup").html(content);
        });
    }
  
    // Обработка нажатия на кнопку редактирования
    $(document).on("click", ".edit-btn", function () {
        $("#editUserId").val($(this).data("id"));
        $("#editFirstName").val($(this).data("first-name"));
        $("#editLastName").val($(this).data("last-name"));
        $("#editMiddleName").val($(this).data("middle-name"));
        $("#editEmail").val($(this).data("email"));
        $("#editPassword").val(""); // Оставляем пустым
        $("#editGroup").val($(this).data("group-id"));
        $("#editModal").modal("show");
    });
  
    // Обработка нажатия на кнопку сохранения
    $("#saveBtn").click(function () {
        var userId = $("#editUserId").val();
        var data = {
            First_Name: $("#editFirstName").val(),
            Last_Name: $("#editLastName").val(),
            Middle_Name: $("#editMiddleName").val(),
            email: $("#editEmail").val(),
            password: $("#editPassword").val(),
            group_id: $("#editGroup").val(),
        };
        
        $.ajax({
            url: "http://localhost:8000/students/" + userId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                loadStudentsByGroup();
                $("#editModal").modal("hide");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Ошибка при обновлении студента:", textStatus, errorThrown);
            }
        });
    });
  
    loadGroups();
    loadStudentsByGroup();
  });
  