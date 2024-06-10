$(document).ready(function() {
    function loadStudentsByGroup() {
        $.getJSON("http://localhost:8000/users_by_group", function(data) {
            var content = "";
            data.forEach(function(group) {
                content += "<div class='group'>";
                content += "<h3>Группа: " + group.group_name + "</h3>";
                content += "<table class='table table-striped fixed-table'>";
                content += "<thead class='thead-dark'><tr><th class='id-col'>ID</th><th class='last-name-col'>Фамилия</th><th class='first-name-col'>Имя</th><th class='middle-name-col'>Отчество</th><th class='edit-col'>Редактирование</th><th class='delete-col'>Удаление</th></tr></thead><tbody>";
                group.students.forEach(function(student) {
                    content += "<tr>";
                    content += "<td class='id-col'>" + student.User_ID + "</td>";
                    content += "<td class='last-name-col'>" + student.Last_Name + "</td>";
                    content += "<td class='first-name-col'>" + student.First_Name + "</td>";
                    content += "<td class='middle-name-col'>" + (student.Middle_Name || '') + "</td>";
                    content += '<td class="edit-col"><button class="btn btn-secondary edit-btn" data-id="' + student.User_ID + '"><i class="fas fa-edit"></i></button></td>';
                    content += '<td class="delete-col"><button class="btn btn-danger delete-btn" data-id="' + student.User_ID + '"><i class="fas fa-trash-alt"></i></button></td>';
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
