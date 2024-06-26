$(document).ready(function () {
    function loadSubjects() {
        $.getJSON("http://localhost:8000/predmets", function (data) {
            var content = "<div class='card mb-4'>";
            content += "<div class='card-header bg-primary text-white'>Предметы</div>";
            content += "<div class='card-body'>";
            content += "<table class='table table-hover table-bordered'>";
            content += "<thead class='thead-light'><tr>";
            content += "<th class='text-center'>№</th>";
            content += "<th>Название</th>";
            content += "<th class='text-center'>Время (часы)</th>";
            content += "<th class='text-center'>Редактирование</th>";
            content += "</tr></thead><tbody>";

            data.forEach(function (subject, index) {
                content += "<tr>";
                content += "<td class='text-center'>" + (index + 1) + "</td>";
                content += "<td>" + subject.Title + "</td>";
                content += "<td class='text-center'>" + subject.Time_hour + "</td>";
                content += '<td class="text-center"><button class="btn btn-warning btn-sm edit-btn" data-id="' + subject.Subject_ID + '" data-title="' + subject.Title + '" data-time-hour="' + subject.Time_hour + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></button></td>';
                content += "</tr>";
            });

            content += "</tbody></table>";
            content += "</div></div>";
            $("#subjects-table").html(content);

            $(".edit-btn").click(function () {
                var subjectId = $(this).data("id");
                var title = $(this).data("title");
                var timeHour = $(this).data("time-hour");

                // Заполнить поля модального окна
                $("#editSubjectId").val(subjectId);
                $("#editTitle").val(title);
                $("#editTimeHour").val(timeHour);

                // Показать модальное окно
                $("#editModal").modal("show");
            });
        });
    }

    function resetForm() {
        $("#subject-form")[0].reset();
        $("#subject-id").val("");
    }

    function createSubject(event) {
        event.preventDefault(); // предотвратить перезагрузку страницы при отправке формы
        var subjectId = $("#subject-id").val();
        var url = subjectId
            ? "http://localhost:8000/predmets/" + subjectId
            : "http://localhost:8000/predmets";
        var type = subjectId ? "PUT" : "POST";
        var subjectData = {
            Title: $("#title").val(),
            Time_hour: $("#time_hour").val()
        };
        $.ajax({
            url: url,
            type: type,
            contentType: "application/json",
            data: JSON.stringify(subjectData),
            success: function () {
                loadSubjects();
                resetForm();
                $("#editModal").modal("hide");
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при создании предмета:", error);
            },
        });
    }

    function updateSubject() {
        var subjectId = $("#editSubjectId").val();
        var subjectData = {
            Title: $("#editTitle").val(),
            Time_hour: $("#editTimeHour").val()
        };
        $.ajax({
            url: "http://localhost:8000/predmets/" + subjectId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(subjectData),
            success: function () {
                loadSubjects();
                $("#editModal").modal("hide");
                alert("Предмет успешно обновлен!");
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при обновлении предмета:", error);
            },
        });
    }

    var app = $("#app");
    var content = `
        <h1 class="mt-5">Добавление предмета</h1>
        <form id="subject-form" class="mb-3">
            <input type="hidden" id="subject-id">
            <div class="form-group">
                <label for="title">Название предмета</label>
                <input type="text" class="form-control" id="title" required>
            </div>
            <div class="form-group">
                <label for="time_hour">Время (часы)</label>
                <input type="number" class="form-control" id="time_hour" required>
            </div>
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-secondary" id="reset-button">Сбросить</button>
        </form>
        <div id="subjects-table"></div>
        
        <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editModalLabel">Редактирование предмета</h5>
                        <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-subject-form">
                            <input type="hidden" id="editSubjectId">
                            <div class="form-group">
                                <label for="editTitle">Название предмета</label>
                                <input type="text" class="form-control" id="editTitle" required>
                            </div>
                            <div class="form-group">
                                <label for="editTimeHour">Время (часы)</label>
                                <input type="number" class="form-control" id="editTimeHour" required>
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

    $("#subject-form").on("submit", createSubject); // обработка отправки формы
    $("#reset-button").on("click", resetForm); // обработка сброса формы
    $("#saveBtn").on("click", updateSubject); // обработка сохранения в модальном окне

    loadSubjects();
});
