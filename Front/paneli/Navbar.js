// Navbar.js
$(document).ready(function() {
    var navbar = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">StarostaOnline</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item active">
                        <a class="nav-link" href="#">Главная <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Студенты</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Группы</a>
                    </li>
                </ul>
            </div>
        </nav>
    `;
    $('body').prepend(navbar); // Add the navbar to the top of the body
});
