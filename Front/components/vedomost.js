$(document).ready(function () {
    $("body").append(`
        <!-- Модальное окно для выбора группы и даты -->
        <div class="modal fade" id="vedomosSelectGroupDateModal" tabindex="-1" aria-labelledby="vedomosSelectGroupDateModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="vedomosSelectGroupDateModalLabel">Выбор группы и даты</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="vedomosSelectGroupDateForm">
                            <div class="mb-3">
                                <label for="vedomosSelectGroup" class="form-label">Группа:</label>
                                <select class="form-control" id="vedomosSelectGroup" name="Group"></select>
                            </div>
                            <div class="mb-3">
                                <label for="vedomosSelectStartDate" class="form-label">Дата начала:</label>
                                <input type="date" class="form-control" id="vedomosSelectStartDate" name="StartDate" />
                            </div>
                            <div class="mb-3">
                                <label for="vedomosSelectEndDate" class="form-label">Дата окончания:</label>
                                <input type="date" class="form-control" id="vedomosSelectEndDate" name="EndDate" />
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" id="vedomosSelectGroupDateBtn">Показать отчет</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    function loadGroups() {
        $.getJSON("http://localhost:8000/group", function (data) {
            var groupSelect = $("#vedomosSelectGroup");
            groupSelect.empty();
            data.forEach(function (group) {
                var option = "<option value='" + group.Group_ID + "'>" + group.Group_Name + "</option>";
                groupSelect.append(option);
            });
        });
    }

    function loadReport(groupId, startDate, endDate) {
        $.getJSON(`http://localhost:8000/report/${groupId}/${startDate}/${endDate}`, function (data) {
            console.log("Загруженные данные:", data);
            
            if (!data.report.length) {
                alert("На выбранный диапазон дат нет занятий.");
                return;
            }

            var content = "";
            content += `<h3 style='margin-top: 50px'>Отчет за период с ${startDate} по ${endDate}</h3>`;
            content += "<table class='table table-striped fixed-table'>";
            content += "<thead><tr><th>Фамилия И.О.</th>";
            
            var dates = Object.keys(data.subjects).sort();
            dates.forEach(function(date) {
                content += `<th>${date}</th>`;
            });

            content += "</tr></thead><tbody>";
            
            data.report.forEach(function (student) {
                content += "<tr>";
                content += `<td>${student.Last_Name} ${student.First_Name[0]}. ${student.Middle_Name ? student.Middle_Name[0] + '.' : ''}</td>`;
                dates.forEach(function(date) {
                    var classInfo = student.classes[date];
                    if (classInfo) {
                        var presenceOptions = `
                            <select class="form-control presence-select" data-class-id="${classInfo.Class_Class_ID}" data-user-id="${classInfo.Users_User_ID}" disabled>
                                <option value="Присутствует" ${classInfo.presence === null ? 'selected' : ''}>Присутствует</option>
                                <option value="Н" ${classInfo.presence === 'Н' ? 'selected' : ''}>Отсутствует</option>
                                <option value="Б" ${classInfo.presence === 'Б' ? 'selected' : ''}>Болеет</option>
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
        });
    }

    $("#vedomosSelectGroupDateBtn").click(function () {
        var selectedGroupId = $("#vedomosSelectGroup").val();
        var selectedStartDate = $("#vedomosSelectStartDate").val();
        var selectedEndDate = $("#vedomosSelectEndDate").val();
        if (selectedGroupId && selectedStartDate && selectedEndDate) {
            $("#vedomosSelectGroupDateModal").modal('hide');
            loadReport(selectedGroupId, selectedStartDate, selectedEndDate);
        }
    });

    // Открытие модального окна выбора группы и даты при загрузке страницы
    $("#vedomosSelectGroupDateModal").modal('show');

    loadGroups();
});
