$(document).ready(function () {
  // Вставляем HTML код для модального окна выбора группы и даты
  $("body").append(`
        <!-- Модальное окно для выбора группы и даты -->
<div class="modal fade" id="selectGroupDateModal" tabindex="-1" aria-labelledby="selectGroupDateModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="selectGroupDateModalLabel">Выбор группы и даты</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="selectGroupDateForm">
          <div class="mb-3">
            <label for="selectGroup" class="form-label">Группа:</label>
            <select class="form-control" id="selectGroup" name="Group"></select>
          </div>
          <div class="mb-3">
            <label for="selectDate" class="form-label">Дата:</label>
            <input type="date" class="form-control" id="selectDate" name="Date" />
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
        <button type="button" class="btn btn-primary" id="selectGroupDateBtn">Показать отчет</button>
      </div>
    </div>
  </div>
</div>

<!-- Модальное окно для создания занятия -->
<div class="modal fade" id="createClassModal" tabindex="-1" aria-labelledby="createClassModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="createClassModalLabel">Создание нового занятия</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="createClassForm">
          <div class="mb-3">
            <label for="pairNumber" class="form-label">Номер пары:</label>
            <input type="number" class="form-control" id="pairNumber" name="PairNumber" min="1" max="6" required />
          </div>
          <div class="mb-3">
            <label for="subjectId" class="form-label">Предмет:</label>
            <select class="form-control" id="subjectId" name="SubjectId"></select>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
        <button type="button" class="btn btn-primary" id="createClassBtn">Создать занятие</button>
      </div>
    </div>
  </div>
</div>

    `);

    function loadGroups() {
        $.getJSON("http://localhost:8000/group", function (data) {
            var groupSelect = $("#selectGroup");
            groupSelect.empty();
            data.forEach(function (group) {
                var option = "<option value='" + group.Group_ID + "'>" + group.Group_Name + "</option>";
                groupSelect.append(option);
            });
        });
    }

    function loadSubjects() {
        $.getJSON("http://localhost:8000/predmets", function (data) {
            var subjectSelect = $("#subjectId");
            subjectSelect.empty();
            data.forEach(function (subject) {
                var option = "<option value='" + subject.Subject_ID + "'>" + subject.Title + "</option>";
                subjectSelect.append(option);
            });
        });
    }

    function loadReport(groupId, date) {
        $.getJSON(`http://localhost:8000/report/${groupId}/${date}`, function (data) {
            if (data.classes.length === 0) {
                if (confirm("На выбранную дату нет занятий. Создать новые занятия?")) {
                    $("#createClassModal").modal('show');
                    $("#createClassBtn").off('click').on('click', function () {
                        createClass(groupId, date);
                    });
                }
            } else {
                var content = "";
                content += `<h3 style='margin-top: 50px'>Отчет за ${date}</h3>`;
                content += "<table class='table table-striped fixed-table'>";
                content += "<thead><tr><th>Фамилия И.О.</th><th>Дата</th>";
                for (var i = 1; i <= 6; i++) {  // Предположим, что у нас может быть до 6 пар
                    content += `<th>${i} пара</th>`;
                }
                content += "</tr></thead><tbody>";

                data.report.forEach(function (student) {
                    content += "<tr>";
                    content += `<td>${student.Last_Name} ${student.First_Name[0]}. ${student.Middle_Name ? student.Middle_Name[0] + '.' : ''}</td>`;
                    content += `<td>${date}</td>`;
                    for (var i = 1; i <= 6; i++) {
                        var classInfo = student.classes[i] || "Нет данных";
                        content += `<td>${classInfo}</td>`;
                    }
                    content += "</tr>";
                });
                content += "</tbody></table>";

                $("#app").html(content);
            }
        });
    }

    function createClass(groupId, date) {
        var pairNumber = $("#pairNumber").val();
        var subjectId = $("#subjectId").val();
        $.ajax({
            url: "http://localhost:8000/classes",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                Pair_number: parseInt(pairNumber),
                Date: date,
                subject_id: parseInt(subjectId)
            }),
            success: function (response) {
                $("#createClassModal").modal('hide');
                loadReport(groupId, date);
            },
            error: function (xhr, status, error) {
                alert("Произошла ошибка при создании занятия");
            }
        });
    }

    $("#selectGroupDateBtn").click(function () {
        var selectedGroupId = $("#selectGroup").val();
        var selectedDate = $("#selectDate").val();
        if (selectedGroupId && selectedDate) {
            $("#selectGroupDateModal").modal('hide');
            loadReport(selectedGroupId, selectedDate);
        }
    });

    // Открытие модального окна выбора группы и даты при загрузке страницы
    $("#selectGroupDateModal").modal('show');

    loadGroups();
    loadSubjects();
});

