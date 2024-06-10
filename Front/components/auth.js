$(document).ready(function() {
    function showLoginForm() {
        var loginForm = `
            <section class="vh-100" style="background-color: #4D4DFF;">
  <div class="container py-5 h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col col-xl-10">
        <div class="card" style="border-radius: 1rem;">
          <div class="row g-0">
            <div class="col-md-6 col-lg-5 d-none d-md-block">
              <img src="/Front/img/logo.png"
                alt="login form" class="img-fluid" style="margin-top: 22%;" />
            </div>
            <div class="col-md-6 col-lg-7 d-flex align-items-center">
              <div class="card-body p-4 p-lg-5 text-black">

                <form>

                  <div class="d-flex align-items-center mb-3 pb-1">
                    <i class="fas fa-cubes fa-2x me-0" style="color: #ff6219;"></i>
                    <span class="h1 fw-bold mb-0">Авторизация</span>
                  </div>

                  <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Войдите в Ваш аккаунт</h5>

                  <div data-mdb-input-init class="form-outline mb-4">
                    <input type="email" id="form2Example17" class="form-control form-control-lg" />
                    <label class="form-label" for="form2Example17">Логин</label>
                  </div>

                  <div data-mdb-input-init class="form-outline mb-4">
                    <input type="password" id="form2Example27" class="form-control form-control-lg" />
                    <label class="form-label" for="form2Example27">Пароль</label>
                  </div>

                  <div class="pt-1 mb-4">
                    <button data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-lg btn-block" type="button">Войти </button>
                  </div>

                  <a class="small text-muted" href="#!">Забыли пароль?</a>
                  <p class="mb-5 pb-lg-2" style="color: #393f81;">У Вас нет аккаунта? <a href="#!"
                      style="color: #393f81;">Регистрация</a></p>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
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