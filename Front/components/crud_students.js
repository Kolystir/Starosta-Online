$(document).ready(function() {
    function loadStudents() {
        $.getJSON("http://localhost:8000/users", function(data) {
            var tableBody = $("#students-table");
            tableBody.empty();
            data.forEach(function(student) {
                var row = "<tr>";
                row += "<td>" + student.User_ID + "</td>";
                row += "<td>" + student.Last_Name + "</td>";
                row += "<td>" + student.First_Name + "</td>";
                row += "<td>" + (student.Middle_Name || '') + "</td>";
                row += "<td>" + (student.Group_Name || '') + "</td>";
                row += '<td><button class="btn btn-warning edit-btn" data-id="' + student.User_ID + '">Изменить</button></td>';
                row += '<td><button class="btn btn-danger delete-btn" data-id="' + student.User_ID + '">Удалить</button></td>';
                row += "</tr>";
                tableBody.append(row);
            });

            $(".delete-btn").click(function() {
                var userId = $(this).data("id");
                if (confirm("Вы уверены, что хотите удалить этого студента?")) {
                    $.ajax({
                        url: "http://localhost:8000/users/" + userId,
                        type: "DELETE",
                        success: function() {
                            loadStudents();
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
                loadStudents();
                resetForm();
            }
        });
    });

    loadStudents();
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
        <table class="table table-bordered mt-3">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Фамилия</th>
                    <th>Имя</th>
                    <th>Отчество</th>
                    <th>Группа</th>
                    <th>Редактирование</th>
                    <th>Удаление</th>
                </tr>
            </thead>
            <tbody id="students-table">
            </tbody>
        </table>
    `;
    app.html(content);
});
