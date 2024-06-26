$(document).ready(function () {
    function loadSubjects() {
        $.getJSON("http://localhost:8000/predmets", function (data) {
            var content = "<div class='card mb-4'>";
            content += "<div class='card-body'>";
            content +=
                "<table class='table table-striped fixed-table' style='width: 100%;'>";
            content += "<thead><tr>";
            content += "<th class='id-col'>ID</th>";
            content += "<th class='title-col'>Название</th>";
            content += "<th class='time-hour-col'>Время (часы)</th>";
            content += "<th class='edit-col'>Редактирование</th>";
            content += "<th class='delete-col'>Удаление</th>";
            content += "</tr></thead><tbody>";
            data.forEach(function (subject) {
                content += "<tr>";
                content += "<td class='id-col'>" + subject.Subject_ID + "</td>";
                content += "<td class='title-col'>" + subject.Title + "</td>";
                content += "<td class='time-hour-col'>" + subject.Time_hour + "</td>";
                content +=
                    '<td class="edit-col"><button class="btn btn-secondary edit-btn" data-id="' +
                    subject.Subject_ID +
                    '" data-title="' +
                    subject.Title +
                    '" data-time-hour="' +
                    subject.Time_hour +
                    '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></button></td>';
                content +=
                    '<td class="delete-col"><button class="btn btn-danger delete-btn" data-id="' +
                    subject.Subject_ID +
                    '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></button></td>';
                content += "</tr>";
            });
            content += "</tbody></table>";
            content += "</div></div>";
            $("#subjects-table").html(content);

            $(".delete-btn").click(function () {
                var subjectId = $(this).data("id");
                if (confirm("Вы уверены что хотите удалить этот предмет?")) {
                    $.ajax({
                        url: "http://localhost:8000/predmets/" + subjectId,
                        type: "DELETE",
                        success: function () {
                            loadSubjects();
                            alert("Предмет успешно удален!");
                        },
                        error: function () {
                            alert("Произошла ошибка при удалении предмета.");
                        },
                    });
                }
            });

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
        <h1 class="mt-5">Добавление предмета!</h1>
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
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
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
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
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
