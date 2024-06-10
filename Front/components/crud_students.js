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
            $("#students-table").html(content);
        });
    }

    function loadGroups() {
        $.getJSON("http://localhost:8000/group", function(data) {
            var groupSelect = $("#group-select");
            groupSelect.empty();
            data.forEach(function(group) {
                var option = "<option value='" + group.Group_ID + "'>" + group.Group_Name + "</option>";
                groupSelect.append(option);
            });
        });
    }

    function resetForm() {
        $("#student-form")[0].reset();
        $("#student-id").val('');
    }

    $("#student-form").submit(function(e) {
        e.preventDefault();
        var studentId = $("#student-id").val();
        var url = studentId ? "http://localhost:8000/users/" + studentId : "http://localhost:8000/users";
        var type = studentId ? "PUT" : "POST";
        var studentData = {
            Last_Name: $("#last-name").val(),
            First_Name: $("#first-name").val(),
            Middle_Name: $("#middle-name").val(),
            group_id: $("#group-select").val()
        };
        $.ajax({
            url: url,
            type: type,
            contentType: "application/json",
            data: JSON.stringify(studentData),
            success: function() {
                loadStudentsByGroup();
                resetForm();
            }
        });
    });

    loadStudentsByGroup();
    loadGroups();

    var app = $("#app");
    var content = `
        <h1 class="mt-5">Добавление, редактирование и удаление студента!</h1>
        <form id="student-form" class="mb-3">
            <input type="hidden" id="student-id">
            <div class="form-group">
                <label for="last-name">Фамилия</label>
                <input type="text" class="form-control" id="last-name" required>
            </div>
            <div class="form-group">
                <label for="first-name">Имя</label>
                <input type="text" class="form-control" id="first-name" required>
            </div>
            <div class="form-group">
                <label for="middle-name">Отчество</label>
                <input type="text" class="form-control" id="middle-name">
            </div>
            <div class="form-group">
                <label for="group-select">Группа</label>
                <select class="form-control" id="group-select" required></select>
            </div>
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-secondary" onclick="resetForm()">Сбросить</button>
        </form>
        <div id="students-table"></div>
    `;
    app.html(content);
});
