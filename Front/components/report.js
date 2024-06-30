$(document).ready(function () {
    $("body").append(`
        <!-- Модальное окно для выбора группы и даты -->
        <div class="modal fade" id="selectGroupDateModal" tabindex="-1" aria-labelledby="selectGroupDateModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="selectGroupDateModalLabel">Выбор группы и даты</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="selectGroupDateForm">
                            <div class="mb-3">
                                <label for="selectGroup" class="form-label">Группа:</label>
                                <select class="form-control" id="selectGroup" name="Group"></select>
                            </div>
                            <div class="mb-3">
                                <label for="selectDate" class="form-label">Дата:</label>
                                <input type="date" class="form-control" id="selectDate" name="Date" />
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" id="selectGroupDateBtn">Показать отчет</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно для создания занятия -->
        <div class="modal fade" id="createClassModal" tabindex="-1" aria-labelledby="createClassModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="createClassModalLabel">Создание нового занятия</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="createClassForm">
                            <div class="mb-3">
                                <label for="numPairs" class="form-label">Количество пар:</label>
                                <input type="number" class="form-control" id="numPairs" name="NumPairs" min="1" max="6" required />
                            </div>
                            <div id="pairsContainer"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" id="createClassBtn">Создать занятия</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно для подтверждения успешного добавления -->
        <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="successModalLabel">Успех</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Занятия успешно добавлены!
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    function loadGroups() {
        $.getJSON("http://localhost:8000/group", function (data) {
            var groupSelect = $("#selectGroup");
            groupSelect.empty();
            data.forEach(function (group) {
                var option = "<option value='" + group.Group_ID + "'>" + group.Group_Name + "</option>";
                groupSelect.append(option);
            });
        });
    }

    function loadSubjects() {
        $.getJSON("http://localhost:8000/predmets", function (data) {
            var subjectSelects = $(".subjectSelect");
            subjectSelects.empty();
            data.forEach(function (subject) {
                var option = "<option value='" + subject.Subject_ID + "'>" + subject.Title + "</option>";
                subjectSelects.append(option);
            });
        });
    }

    function loadReport(groupId, date) {
        $.getJSON(`http://localhost:8000/report/${groupId}/${date}`, function (data) {
            console.log("Загруженные данные:", data); // Логируем полученные данные
    
            if (Object.keys(data.subjects).length === 0) {
                if (confirm("На выбранную дату нет занятий. Создать новые занятия?")) {
                    $("#createClassModal").modal('show');
                    $("#createClassBtn").off('click').on('click', function () {
                        createClasses(groupId, date);
                    });
                }
            } else {
                var content = "";
                content += `<h3 style='margin-top: 50px'>Рапортичка за ${date}</h3>`;
                content += "<table class='table table-striped fixed-table'>";
                content += "<thead><tr><th>Фамилия И.О.</th>";
    
                var pairs = Object.keys(data.subjects).sort();
                pairs.forEach(function(pairNumber) {
                    content += `<th>${data.subjects[pairNumber]}</th>`;
                });
    
                content += "</tr></thead><tbody>";
    
                data.report.forEach(function (student) {
                    content += "<tr>";
                    content += `<td>${student.Last_Name} ${student.First_Name[0]}. ${student.Middle_Name ? student.Middle_Name[0] + '.' : ''}</td>`;
                    pairs.forEach(function(pairNumber) {
                        var classInfo = student.classes[pairNumber];
                        if (classInfo) {
                            console.log(`Class Info: `, classInfo);  // Логируем classInfo для проверки структуры данных
                            var presenceOptions = `
                                <select class="form-control presence-select" data-class-id="${classInfo.Class_Class_ID}" data-user-id="${classInfo.Users_User_ID}">
                                    <option value="Присутствует" ${classInfo.presence === null ? 'selected' : ''}>Присутствует</option>
                                    <option value="Н" ${classInfo.presence === 'Н' ? 'selected' : ''} class="option-absent">Отс. по неуваж.</option>
                                    <option value="УВ" ${classInfo.presence === 'УВ' ? 'selected' : ''} class="option-absent">Отс. по уваж.</option>
                                    <option value="Б" ${classInfo.presence === 'Б' ? 'selected' : ''} class="option-sick">Болеет</option>
                                </select>
                            `;
                            content += `<td>${presenceOptions}</td>`;
                        } else {
                            content += `<td>Нет данных</td>`;
                        }
                    });
                    content += "</tr>";
                });
    
                content += "</tbody></table>";
    
                $("#app").html(content);
    
                // Проверяем корректность установки значений атрибутов
                $(".presence-select").each(function() {
                    var classId = $(this).data("class-id");
                    var userId = $(this).data("user-id");
                    console.log(`Первоначальный Class ID: ${classId}, Первоначальный User ID: ${userId}`);
                });
    
                // Обработчик изменения селектора присутствия
                $(".presence-select").change(function() {
                    var classId = $(this).data("class-id");
                    var userId = $(this).data("user-id");
                    var presence = $(this).val();
    
                    console.log(`Class ID: ${classId}, User ID: ${userId}, Присутствие: ${presence}`);
    
                    if (classId && userId) {
                        createStatement({
                            Class_Class_ID: classId,
                            Users_User_ID: userId,
                            Presence: presence
                        });
                    } else {
                        console.error("Class ID или User ID не определены");
                    }
                });
            }
        });
    }
    
    
    



    


    function createStatement(statementData) {
        console.log("Отправляемые данные на сервер:", statementData); // Выводим данные в консоль перед отправкой
    
        $.ajax({
            type: "POST",
            url: "http://localhost:8000/statements",
            data: JSON.stringify(statementData),
            contentType: "application/json",
            success: function (response) {
                console.log(response);
            },
            error: function (error) {
                console.log(error);
                alert("Не удалось добавить присутствие");
            }
        });
    }
    
    

    function createClasses(groupId, date) {
        var numPairs = $("#numPairs").val();
        var classes = [];
        for (var i = 1; i <= numPairs; i++) {
            var subjectId = $("#subjectId_" + i).val();
            classes.push({
                Pair_number: i,
                Date: date,
                subject_id: subjectId,
                Group_List_Group_ID: groupId
            });
        }
    
        console.log("Classes to be sent:", JSON.stringify(classes));
    
        $.ajax({
            type: "POST",
            url: "http://localhost:8000/classes",
            data: JSON.stringify(classes),
            contentType: "application/json",
            success: function (response) {
                console.log("Response:", response);
                loadReport(groupId, date);
                $("#createClassModal").modal('hide');
                $("#successModal").modal('show');

            },
            error: function (error) {
                console.log("Error:", error);
                alert("Не удалось создать занятия");
            }
        });
    }
    

    $("#numPairs").on('change', function () {
        var numPairs = $(this).val();
        var pairsContainer = $("#pairsContainer");
        pairsContainer.empty();

        for (var i = 1; i <= numPairs; i++) {
            pairsContainer.append(`
                <div class="mb-3">
                    <label for="subjectId_${i}" class="form-label">Предмет для пары № ${i}:</label>
                    <select class="form-control subjectSelect" id="subjectId_${i}" name="SubjectId_${i}"></select>
                </div>
            `);
        }

        loadSubjects();
    });

    $("#selectGroupDateBtn").click(function () {
        var selectedGroupId = $("#selectGroup").val();
        var selectedDate = $("#selectDate").val();
        if (selectedGroupId && selectedDate) {
            $("#selectGroupDateModal").modal('hide');
            loadReport(selectedGroupId, selectedDate);
        }
    });

    // Открытие модального окна выбора группы и даты при загрузке страницы
    $("#selectGroupDateModal").modal('show');

    loadGroups();
    loadSubjects();
});