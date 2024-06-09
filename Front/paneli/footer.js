$(document).ready(function() {
    // Создание HTML структуры для футера
    var footerContent = `
        <footer class="footer mt-auto py-3 bg-light">
            <div class="container">
                <span class="text-muted">© 2024 Your Company. All rights reserved.</span>
            </div>
        </footer>
    `;

    // Добавление футера в конец body
    $("body").append(footerContent);
});
