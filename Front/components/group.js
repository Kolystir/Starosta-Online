$(document).ready(function() {
    function loadStudentsByGroup() {
        $.getJSON("http://localhost:8000/users_by_group", function(data) {
            var content = "";
            data.forEach(function(group) {
                content += "<h3>Группа: " + group.group_name + "</h3>";
                content += "<table class='table table-striped'>";
                content += "<thead><tr><th>ID</th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Редактирование</th><th>Удаление</th></tr></thead><tbody>";
                group.students.forEach(function(student) {
                    content += "<tr>";
                    content += "<td>" + student.User_ID + "</td>";
                    content += "<td>" + student.Last_Name + "</td>";
                    content += "<td>" + student.First_Name + "</td>";
                    content += "<td>" + (student.Middle_Name || '') + "</td>";
                    content += '<td><button class="btn btn-secondary edit-btn" data-id="' + student.User_ID + '">Изменить</button></td>';
                    content += '<td><button class="btn btn-danger delete-btn" data-id="' + student.User_ID + '">Удалить</button></td>';
                    content += "</tr>";
                });
                content += "</tbody></table>";
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
