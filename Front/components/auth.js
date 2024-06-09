$(document).ready(function() {
    function showLoginForm() {
        var loginForm = `
            <div class="container mt-5">
                <h2>Вход в систему</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="login">Логин</label>
                        <input type="text" class="form-control" id="login" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Пароль</label>
                        <input type="password" class="form-control" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Войти</button>
                </form>
            </div>
        `;
        $("#app").html(loginForm);

        $("#login-form").submit(function(e) {
            e.preventDefault();
            var formData = new FormData();
            formData.append("username", $("#login").val());
            formData.append("password", $("#password").val());

            $.ajax({
                url: "http://localhost:8000/token",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("userId", data.user_id);
                    localStorage.setItem("role", data.role);
                    loadMainContent();
                },
                error: function() {
                    alert("Неправильный логин или пароль.");
                }
            });
        });
    }

    function loadMainContent() {
        if (localStorage.getItem("role") === "Студент") {
            $.getScript("Front/components/crud_students.js");
        } else if (localStorage.getItem("role") === "Учитель") {
            $.getScript("Front/components/crud_teachers.js");
        }
    }

    function checkAuth() {
        if (localStorage.getItem("token")) {
            loadMainContent();
        } else {
            showLoginForm();
        }
    }

    checkAuth();
});