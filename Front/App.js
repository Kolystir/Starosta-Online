$(document).ready(function() {
    // Подключаем файл navbar.js
    $.getScript("Front/paneli/navbar.js", function() {
        // Скрипт загружен и выполнен
    });
    // Подключаем файл frontend.js
    $.getScript("Front/components/crud_students.js", function() {
        // Скрипт загружен и выполнен
    });
    // Подключаем файл footer.js
    $.getScript("Front/paneli/footer.js", function() {
        // Скрипт загружен и выполнен
    });
});
