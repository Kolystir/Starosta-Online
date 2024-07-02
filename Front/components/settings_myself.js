$(document).ready(function() {
    $("body").append(`
        <div class="container mt-5">
            <h2>Ваши пропуски</h2>
            <div id="studentAbsences"></div>
        </div>
    `);

    function loadStudentAbsences() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("Вы не авторизованы");
            return;
        }

        $.getJSON(`http://localhost:8000/student_absences/${userId}`, function(data) {
            if (data.length === 0) {
                $("#studentAbsences").html("<p>У вас нет пропусков.</p>");
                return;
            }

            let content = "<table class='table table-striped'><thead><tr><th>Дата</th><th>Предмет</th><th>Тип пропуска</th></tr></thead><tbody>";

            data.forEach(function(absence) {
                content += `<tr>
                    <td>${absence.date}</td>
                    <td>${absence.subject}</td>
                    <td>${absence.presence}</td>
                </tr>`;
            });

            content += "</tbody></table>";
            $("#studentAbsences").html(content);
        }).fail(function() {
            alert("Не удалось загрузить данные о пропусках.");
        });
    }

    loadStudentAbsences();
});