$(document).ready(function () {
  function updateNavbar() {
    var navbar = "";
    var role = localStorage.getItem("role");

    if (localStorage.getItem("token")) {
      navbar = `
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container">
                        <a class="navbar-brand" href="" id="main-web"><img src="/Front/img/logo.png" style="width: 60px" /></a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                ${(role === "Преподаватель" || role === "Староста" || role === "Админ")? `
                                    <li class="nav-item">
                                        <a class="nav-link" href="" id="report">Рапортичка</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="" id="vedomost">Ведомость</a>
                                    </li>
                                `: ""}
                                ${(role === "Преподаватель" || role === "Староста" || role === "Админ" || role === "Студент")? `
                                <li class="nav-item">
                                    <a class="nav-link" href="" id="sort-groups-link">Группа</a>
                                </li>
                                `: ""}
                                
                                <li class="nav-item dropdown">
                                ${(role === "Преподаватель" || role === "Админ")? `
                                    <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Добавление
                                    </a>
                                `: ""}
                                    <ul class="dropdown-menu">
                                    ${(role === "Преподаватель" || role === "Админ")? `
                                        <li><a class="dropdown-item" id="add-student-link">Добавление студента</a></li>
                                    `: ""}
                                    ${(role === "Админ")? `
                                        <li><a class="dropdown-item" id="add-teacher-link">Добавление преподавателя</a></li>
                                        <li><a class="dropdown-item" id="add_subject">Добавление предмета</a></li>
                                        <li><a class="dropdown-item" id="add_groups">Добавление группы</a></li>
                                    `: ""}
                                    </ul>
                                </li>
                            </ul>
                            <div class="dropdown">
                                <i style="font-size: 1.8rem" class="bi bi-person-circle icon fa-lg custom-icon" id="iconDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="iconDropdown">
                                    <a class="dropdown-item" href="" id="settings_myself">Настройки</a>
                                    <a class="dropdown-item" id="logoutButton">Выйти</a>
                                </div>
                            </div>
                        </div>  
                    </div>
                </nav>
            `;
    } else {
      navbar = `
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container">
                        <a class="navbar-brand" href="" id="main-web"><img src="/Front/img/logo.png" style="width: 60px" /></a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                ${
                                  role === "админ"
                                    ? `
                                    <li class="nav-item">
                                        <a class="nav-link" href="" id="report">Рапортичка</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="" id="vedomost">Ведомость</a>
                                    </li>

                                <li class="nav-item">
                                    <a class="nav-link" href="" id="sort-groups-link">Группа</a>
                                </li>
                                <li class="nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Добавление
                                    </a>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" id="add-student-link">Добавление студента</a></li>
                                        <li><a class="dropdown-item" id="add-teacher-link">Добавление преподавателя</a></li>
                                        <li><a class="dropdown-item" id="add_subject">Добавление предмета</a></li>
                                        <li><a class="dropdown-item" id="add_groups">Добавление группы</a></li>
                                    </ul>
                                </li>
                                `
                                    : ""
                                }
                            </ul>
                            <button class="btn btn-outline-primary" type="button" id="authorization-link">Вход</button>
                        </div>
                    </div>
                </nav>
            `;
    }
    $("body").prepend(navbar);

    // Добавим обработчик для кнопки "Выйти"
    $("#logoutButton").click(function () {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      location.reload(); // Перезагрузим страницу, чтобы обновить навбар
    });

    // Добавим обработчик для кнопки "Вход"
    $("#authorization-link").click(function () {
      // Здесь можно добавить логику для показа формы авторизации
    });
  }

  updateNavbar();
});
