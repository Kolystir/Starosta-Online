$(document).ready(function() {
  var navbar = `
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
          <div class="container-fluid">
              <a class="navbar-brand" href="logo.png"><img src="/Front/img/logo.png" style = "width: 50px"/></a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                      
                      <li class="nav-item">
                          <a class="nav-link" href="" id="report">Рапортичка</a>
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="#">Ведомость</a>
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="#" id="sort-groups-link">Группа</a>
                      </li>
                      <li class="nav-item dropdown">
                          <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Добавление
                          </a>
                          <ul class="dropdown-menu">
                              <li><a class="dropdown-item" id="add-student-link">Добавление студента</a></li>
                              <li><a class="dropdown-item">Добавление преподавателя</a></li>
                              <li><a class="dropdown-item">Добавление предмета</a></li>
                          </ul>
                      </li>
                  </ul>
                  <form class="d-flex" role="search" >
                      <button class="btn btn-outline-primary" type="submit" id="autorization-link ">Вход</button>
                  </form>
              </div>
          </div>
      </nav>
  `;
  $('body').prepend(navbar);
});
