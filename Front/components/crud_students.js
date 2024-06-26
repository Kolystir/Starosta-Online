$(document).ready(function () {
  function loadStudentsByGroup() {
    $.getJSON("http://localhost:8000/users_by_group", function (data) {
      var content = "";
      data.forEach(function (group) {
        content += "<div class='card mb-4'>";
        content +=
          "<div class='card-header'><h3>Группа: " +
          group.group_name +
          "</h3></div>";
        content += "<div class='card-body'>";
        content +=
          "<table class='table table-striped fixed-table' style='width: 100%;'>";
        content += "<thead><tr>";
        content += "<th class='id-col'>ID</th>";
        content += "<th class='last-name-col'>Фамилия</th>";
        content += "<th class='first-name-col'>Имя</th>";
        content += "<th class='middle-name-col'>Отчество</th>";
        content += "</tr></thead><tbody>";
        group.students.forEach(function (student) {
          content += "<tr>";
          content += "<td class='id-col'>" + student.User_ID + "</td>";
          content += "<td class='last-name-col'>" + student.Last_Name + "</td>";
          content +=
            "<td class='first-name-col'>" + student.First_Name + "</td>";
          content +=
            "<td class='middle-name-col'>" +
            (student.Middle_Name || "") +
            "</td>";
          content += "</tr>";
        });
        content += "</tbody></table>";
        content += "</div></div>";
      });
      $("#students-table").html(content);
    });
  }

  function loadGroups() {
    $.getJSON("http://localhost:8000/group", function (data) {
      var groupSelect = $("#group-select");
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
    $("#student-form")[0].reset();
    $("#student-id").val("");
  }

  function createStudent(event) {
    event.preventDefault(); // предотвратить перезагрузку страницы при отправке формы
    var studentId = $("#student-id").val();
    var url = studentId
      ? "http://localhost:8000/students/" + studentId
      : "http://localhost:8000/students";
    var type = studentId ? "PUT" : "POST";
    var studentData = {
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
      data: JSON.stringify(studentData),
      success: function () {
        loadStudentsByGroup();
        resetForm();
        $("#error-message").hide();
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
        }
      },
    });
}

  loadStudentsByGroup();
  loadGroups();

  var app = $("#app");
var content = `
    <h1 class="mt-5">Добавление студента!</h1>
    <form id="student-form" class="mb-3">
        <input type="hidden" id="student-id">
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
                <select class="form-control" id="group-select" required></select>
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
    <div id="students-table"></div>
`;
app.html(content);

  $("#student-form").on("submit", createStudent); // обработка отправки формы
  $("#reset-button").on("click", resetForm); // обработка сброса формы
});
