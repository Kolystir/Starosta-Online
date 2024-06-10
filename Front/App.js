$(document).ready(function() {
    // Подключаем файл navbar.js
    $.getScript("Front/paneli/navbar.js", function() {
        // Скрипт загружен и выполнен
    });

    // Handle click event for "Добавление студента" link
    $(document).on('click', '#add-student-link', function(e) {
        e.preventDefault();
        // Load and execute the crud_students.js script
        $.getScript("Front/components/crud_students.js", function() {
            // Скрипт загружен и выполнен
        });
    });

    // Подключаем файл footer.js
    $.getScript("Front/paneli/footer.js", function() {
        // Скрипт загружен и выполнен
    });
    // Подключаем файл auth.js
    $.getScript("Front/components/auth.js", function() {
        // Скрипт загружен и выполнен
    });

    


    // Handle click event for "Добавление студента" link
    $(document).on('click', '#autorization-link', function(e) {
        e.preventDefault();
        // Load and execute the crud_students.js script
        $.getScript("Front/components/auth.js", function() {
            // Скрипт загружен и выполнен
        });
    });

});
