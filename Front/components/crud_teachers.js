$(document).ready(function () {
  function loadTeachers() {
    $.getJSON("http://localhost:8000/teachers", function (data) {
      var content = "<div class='card mb-4'>";
      content += "<div class='card-body'>";
      content +=
        "<table class='table table-striped fixed-table' style='width: 100%;'>";
      content += "<thead><tr>";
      content += "<th class='id-col'>ID</th>";
      content += "<th class='last-name-col'>Фамилия</th>";
      content += "<th class='first-name-col'>Имя</th>";
      content += "<th class='middle-name-col'>Отчество</th>";
      content += "<th class='group-col'>Классный руководитель группы</th>";
      content += "<th class='edit-col'>Редактирование</th>";
      content += "<th class='delete-col'>Удаление</th>";
      content += "</tr></thead><tbody>";
      data.forEach(function (teacher) {
        content += "<tr>";
        content += "<td class='id-col'>" + teacher.User_ID + "</td>";
        content += "<td class='last-name-col'>" + teacher.Last_Name + "</td>";
        content += "<td class='first-name-col'>" + teacher.First_Name + "</td>";
        content +=
          "<td class='middle-name-col'>" +
          (teacher.Middle_Name || "") +
          "</td>";
        content +=
          "<td class='group-col'>" + (teacher.Group_Name || "—") + "</td>";
        content +=
          '<td class="edit-col"><button class="btn btn-secondary edit-btn" data-id="' +
          teacher.User_ID +
          '" data-first-name="' +
          teacher.First_Name +
          '" data-last-name="' +
          teacher.Last_Name +
          '" data-middle-name="' +
          (teacher.Middle_Name || "") +
          '" data-group-id="' +
          (teacher.Group_ID || "") +
          '" data-username="' +
          teacher.username +
          '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></button></td>';
        content +=
          '<td class="delete-col"><button class="btn btn-danger delete-btn" data-id="' +
          teacher.User_ID +
          '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></button></td>';
        content += "</tr>";
      });
      content += "</tbody></table>";
      content += "</div></div>";
      $("#teachers-table").html(content);

      $(".delete-btn").click(function () {
        var userId = $(this).data("id");
        if (confirm("Вы уверены что хотите удалить этого учителя?")) {
          $.ajax({
            url: "http://localhost:8000/teachers/" + userId,
            type: "DELETE",
            success: function () {
              loadTeachers();
              alert("Учитель успешно удален!");
            },
            error: function () {
              alert("Произошла ошибка при удалении учителя.");
            },
          });
        }
      });

      $(".edit-btn").click(function () {
        var userId = $(this).data("id");
        var firstName = $(this).data("first-name");
        var lastName = $(this).data("last-name");
        var middleName = $(this).data("middle-name");
        var groupId = $(this).data("group-id");
        var username = $(this).data("username");

        // Заполнить поля модального окна
        $("#editUserId").val(userId);
        $("#editFirstName").val(firstName);
        $("#editLastName").val(lastName);
        $("#editMiddleName").val(middleName);
        $("#editGroup").val(groupId);
        $("#editUsername").val(username);

        // Показать модальное окно
        $("#editModal").modal("show");
      });
    });
  }

  function loadGroups() {
    $.getJSON("http://localhost:8000/group", function (data) {
      var groupSelect = $("#group-select, #editGroup");
      groupSelect.empty();
      data.forEach(function (group) {
        var option =
          "<option value='" +
          group.Group_ID +
          "'>" +
          group.Group_Name +
          "</option>";
        groupSelect.append(option);
      });
    });
  }

  function resetForm() {
    $("#teacher-form")[0].reset();
    $("#teacher-id").val("");
  }

  function createTeacher(event) {
    event.preventDefault(); // предотвратить перезагрузку страницы при отправке формы
    var teacherId = $("#teacher-id").val();
    var url = teacherId
      ? "http://localhost:8000/teachers/" + teacherId
      : "http://localhost:8000/teachers";
    var type = teacherId ? "PUT" : "POST";
    var teacherData = {
      Last_Name: $("#last-name").val(),
      First_Name: $("#first-name").val(),
      Middle_Name: $("#middle-name").val(),
      group_id: $("#group-select").val(),
      username: $("#username").val(),
      password: $("#password").val(),
    };
    $.ajax({
      url: url,
      type: type,
      contentType: "application/json",
      data: JSON.stringify(teacherData),
      success: function () {
        loadTeachers();
        resetForm();
        $("#editModal").modal("hide");
        $("#error-message").hide(); // скрыть сообщение об ошибке при успешной операции
      },
      error: function (xhr, status, error) {
        console.log("XHR Status: ", xhr.status);
        console.log("Response JSON: ", xhr.responseJSON);
        if (
          xhr.status === 400 &&
          xhr.responseJSON && xhr.responseJSON.detail === "Username already taken"
        ) {
          $("#error-message").text("Данное имя пользователя уже занято").show();
        } else {
          console.error("Ошибка при создании студента:", error);
          $("#error-message").text("Произошла ошибка при создании студента").show();
        }
      },
    });
  }
  

  function updateTeacher() {
    var userId = $("#editUserId").val();
    var teacherData = {
      Last_Name: $("#editLastName").val(),
      First_Name: $("#editFirstName").val(),
      Middle_Name: $("#editMiddleName").val(),
      group_id: $("#editGroup").val(),
      username: $("#editUsername").val(),
    };
    $.ajax({
      url: "http://localhost:8000/teachers/" + userId,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(teacherData),
      success: function () {
        loadTeachers();
        $("#editModal").modal("hide");
        alert("Учитель успешно обновлен!");
      },
      error: function (xhr, status, error) {
        console.error("Ошибка при обновлении учителя:", error);
      },
    });
  }

  var app = $("#app");
  var content = `
        <h1 class="mt-5">Добавление учителя!</h1>
        <form id="teacher-form" class="mb-3">
            <input type="hidden" id="teacher-id">
            <div class="form-row">
                <div class="form-group col-md-4">
                    <label for="last-name">Фамилия</label>
                    <input type="text" class="form-control" id="last-name" required>
                </div>
                <div class="form-group col-md-4">
                    <label for="first-name">Имя</label>
                    <input type="text" class="form-control" id="first-name" required>
                </div>
                <div class="form-group col-md-4">
                    <label for="middle-name">Отчество</label>
                    <input type="text" class="form-control" id="middle-name">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label for="group-select">Группа</label>
                    <select class="form-control" id="group-select"></select>
                </div>
                <div class="form-group col-md-6">
                    <label for="username">Логин</label>
                    <input type="text" class="form-control" id="username" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-12">
                    <label for="password">Пароль</label>
                    <input type="password" class="form-control" id="password" required>
                </div>
            </div>
            <div id="error-message" class="alert alert-danger" style="display: none;"></div>
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-secondary" id="reset-button">Сбросить</button>
        </form>
        <div id="teachers-table"></div>
        
        <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editModalLabel">Редактирование учителя</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editForm">
                            <div class="mb-3">
                                <label for="editFirst  Name" class="form-label">Имя:</label>
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
    `;
  app.html(content);

  $("#teacher-form").on("submit", createTeacher); // обработка отправки формы
  $("#reset-button").on("click", resetForm); // обработка сброса формы
  $("#saveBtn").on("click", updateTeacher); // обработка сохранения в модальном окне

  loadTeachers();
  loadGroups();
});
