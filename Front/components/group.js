$(document).ready(function () {
  // Вставляем HTML код для модального окна редактирования
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

  // Вставляем HTML код для модального окна выбора группы
  $("body").append(`
      <div class="modal fade" id="selectGroupModal" tabindex="-1" aria-labelledby="selectGroupModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="selectGroupModalLabel">Выбор группы</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="selectGroupForm">
                <div class="mb-3">
                  <label for="selectGroup" class="form-label">Группа:</label>
                  <select class="form-control" id="selectGroup" name="Group"></select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
              <button type="button" class="btn btn-primary" id="selectGroupBtn">Показать студентов</button>
            </div>
          </div>
        </div>
      </div>
  `);

  function loadGroups() {
      $.getJSON("http://localhost:8000/group", function (data) {
          var groupSelect = $("#editGroup, #selectGroup");
          groupSelect.empty();
          data.forEach(function (group) {
              var option = "<option value='" + group.Group_ID + "'>" + group.Group_Name + "</option>";
              groupSelect.append(option);
          });
      });
  }

  function loadStudentsByGroup(groupId) {
      $.getJSON(`http://localhost:8000/users_by_group/${groupId}`, function (data) {
          var content = "";
          content += "<div class='group'>";
          content += "<h3 style='margin-top: 50px'>Группа: " + data.group_name + "</h3>";
          content += "<table class='table table-hover table-bordered text-center'>";
          content += "<thead class='thead-light'><tr><th>№</th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Редактирование</th><th>Удаление</th></tr></thead><tbody>";

          // Сортировка студентов по фамилии
          data.students.sort((a, b) => a.Last_Name.localeCompare(b.Last_Name));

          data.students.forEach(function (student, index) {
              content += "<tr>";
              content += "<td>" + (index + 1) + "</td>";
              content += "<td>" + student.Last_Name + "</td>";
              content += "<td>" + student.First_Name + "</td>";
              content += "<td>" + (student.Middle_Name || '') + "</td>";
              content += '<td><button class="btn btn-warning btn-sm edit-btn" data-id="' + student.User_ID + '" data-first-name="' + student.First_Name + '" data-last-name="' + student.Last_Name + '" data-middle-name="' + (student.Middle_Name || '') + '" data-group-id="' + data.group_id + '" data-username="' + student.username + '"><i class="bi bi-pencil"></i></button></td>';
              content += '<td><button class="btn btn-danger btn-sm delete-btn" data-id="' + student.User_ID + '"><i class="bi bi-trash"></i></button></td>';
              content += "</tr>";
          });
          content += "</tbody></table>";
          content += "</div>"; // Close group div

          $("#app").html(content);

          $(".delete-btn").click(function () {
              var userId = $(this).data("id");
              var groupId = $("#selectGroup").val(); // Получаем текущий groupId

              if (confirm("Вы уверены что хотите удалить этого студента?")) {
                  $.ajax({
                      url: "http://localhost:8000/students/" + userId,
                      type: "DELETE",
                      success: function () {
                          loadStudentsByGroup(groupId); // Обновляем список студентов в текущей группе
                          alert("Студент успешно удален!");
                      },
                      error: function () {
                          alert("Произошла ошибка при удалении студента.");
                      }
                  });
              }
          });

          $(".edit-btn").click(function () {
              var userId = $(this).data("id");
              var firstName = $(this).data("first-name");
              var lastName = $(this).data("last-name");
              var middleName = $(this).data("middle-name");
              var groupId = $(this).data("group-id");

              $("#editUserId").val(userId);
              $("#editFirstName").val(firstName);
              $("#editLastName").val(lastName);
              $("#editMiddleName").val(middleName);
              $("#editGroup").val(groupId);

              $("#editModal").modal('show');
          });
      });
  }

  // Отправка данных на сервер при нажатии на кнопку "Сохранить"
  $("#saveBtn").click(function () {
      var userId = $("#editUserId").val();
      var data = {
          First_Name: $("#editFirstName").val(),
          Last_Name: $("#editLastName").val(),
          Middle_Name: $("#editMiddleName").val(),
          group_id: $("#editGroup").val(),
      };

      $.ajax({
          url: "http://localhost:8000/students/" + userId,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function () {
              loadStudentsByGroup($("#editGroup").val());
              alert("Данные студента успешно обновлены!");
              $("#editModal").modal('hide');
          },
          error: function () {
              alert("Произошла ошибка при обновлении данных студента.");
          }
      });
  });

  // Обработчик для открытия модального окна выбора группы
  $("#selectGroupBtn").click(function () {
      var selectedGroupId = $("#selectGroup").val();
      if (selectedGroupId) {
          $("#selectGroupModal").modal('hide');
          loadStudentsByGroup(selectedGroupId);
      }
  });

  // Открытие модального окна выбора группы при загрузке страницы
  $("#selectGroupModal").modal('show');

  loadGroups();
});
