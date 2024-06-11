$(document).ready(function() {
    function loadStudentsByGroup() {
        $.getJSON("http://localhost:8000/users_by_group", function(data) {
            var content = "";
            data.forEach(function(group) {
                content += "<div class='group'>";
                content += "<h3>Группа: " + group.group_name + "</h3>";
                content += "<table class='table table-striped fixed-table'>";
                content += "<thead class=''><tr><th class='id-col'>ID</th><th class='last-name-col'>Фамилия</th><th class='first-name-col'>Имя</th><th class='middle-name-col'>Отчество</th><th class='edit-col'>Редактирование</th><th class='delete-col'>Удаление</th></tr></thead><tbody>";
                group.students.forEach(function(student) {
                    content += "<tr>";
                    content += "<td class='id-col'>" + student.User_ID + "</td>";
                    content += "<td class='last-name-col'>" + student.Last_Name + "</td>";
                    content += "<td class='first-name-col'>" + student.First_Name + "</td>";
                    content += "<td class='middle-name-col'>" + (student.Middle_Name || '') + "</td>";
                    content += '<td class="edit-col"><button class="btn btn-secondary edit-btn" data-id="' + student.User_ID + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></button></td>';
                    content += '<td class="delete-col"><button class="btn btn-danger delete-btn" data-id="' + student.User_ID + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></button></td>';
                    content += "</tr>";
                });
                content += "</tbody></table>";
                content += "</div>"; // Close group div
            });
            $("#app").html(content);

            $(".edit-btn").click(function() {
                var userId = $(this).data("id");
                // Обработка редактирования
                alert("Редактирование студента с ID " + userId);
            });

            $(".delete-btn").click(function() {
                var userId = $(this).data("id");
                if (confirm("Вы уверены что хотите удалить этого студента?")) {
                    $.ajax({
                        url: "http://localhost:8000/users/" + userId,
                        type: "DELETE",
                        success: function() {
                            loadStudentsByGroup();
                            alert("Студент успешно удален!");
                        },
                        error: function() {
                            alert("Произошла ошибка при удалении студента.");
                        }
                    });
                }
            });
        });
    }

    loadStudentsByGroup();
});
