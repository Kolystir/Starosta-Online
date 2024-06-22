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
                                        <img src="/Front/img/logo.png" alt="login form" class="img-fluid" style="margin-top: 14%;" />
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
                                                    <button data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-lg btn-block" type="button" id="loginButton">Войти</button>
                                                </div>
                                                <a class="small text-muted" href="" id="forgotPasswordLink">Забыли пароль или  у вас нет аккаунта?</a>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
  
            <!-- Success Modal -->
            <div class="modal fade" id="successModal" tabindex="-1" role="dialog" aria-labelledby="successModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="successModalLabel">Авторизация успешна</h5>
                            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Добро пожаловать, <span id="username"></span> Ваша роль: <span id="role"></span>.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">ОК</button>
                        </div>
                    </div>
                </div>
            </div>
  
            <!-- Error Modal -->
            <div class="modal fade" id="errorModal" tabindex="-1" role="dialog" aria-labelledby="errorModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="errorModalLabel">Ошибка авторизации</h5>
                            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Неправильный логин или пароль.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">ОК</button>
                        </div>
                    </div>
                </div>
            </div>
  
            <!-- Forgot Password Modal -->
            <div class="modal fade" id="forgotPasswordModal" tabindex="-1" role="dialog" aria-labelledby="forgotPasswordModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="forgotPasswordModalLabel">Забыли пароль?</h5>
                            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Обратитесь к старосте вашей группы, либо к классному руководителю
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">ОК</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $("#app").html(loginForm);
  
        $("#loginButton").click(login);
        $("#forgotPasswordLink").click(showForgotPasswordModal);
    }
  
    function showForgotPasswordModal() {
        $("#forgotPasswordModal").modal('show');
    }
  
    function login() {
        var formData = new FormData();
        formData.append("username", $("#form2Example17").val());
        formData.append("password", $("#form2Example27").val());
  
        $.ajax({
            url: "http://localhost:8000/token",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("role", data.role);
                localStorage.setItem("username", data.username);
                $("#username").text(data.username);
                $("#role").text(data.role);
                $("#successModal").modal('show');
                $("#successModal").on('hidden.bs.modal', function() {
                    window.location.reload();
                    loadMainContent();
                });
            },
            error: function() {
                $("#errorModal").modal('show');
            }
        });
    }
  
    function loadMainContent() {
        if (localStorage.getItem("role") === "Студент") {
            $.getScript("Front/components/crud_students.js");
        } else if (localStorage.getItem("role") === "Преподаватель") {
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
  