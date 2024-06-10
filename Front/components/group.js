$(document).ready(function() {
    function loadStudentsByGroup() {
        $.getJSON("http://localhost:8000/users_by_group", function(data) {
            var content = "";
            data.forEach(function(group) {
                content += "<h3>Группа: " + group.group_name + "</h3>";
                content += "<table class='table table-striped'>";
                content += "<thead><tr><th>ID</th><th>Фамилия</th><th>Имя</th><th>Отчество</th></tr></thead><tbody>";
                group.students.forEach(function(student) {
                    content += "<tr>";
                    content += "<td>" + student.User_ID + "</td>";
                    content += "<td>" + student.Last_Name + "</td>";
                    content += "<td>" + student.First_Name + "</td>";
                    content += "<td>" + (student.Middle_Name || '') + "</td>";
                    content += "</tr>";
                });
                content += "</tbody></table>";
            });
            $("#app").html(content);
        });
    }

    // Вызов функции при загрузке страницы
    loadStudentsByGroup();
});
