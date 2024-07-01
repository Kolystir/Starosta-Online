$(document).ready(function () {
    $("body").append(
        // Модальное окно для выбора группы и даты
        `<div class="modal fade" id="vedomosSelectGroupDateModal" tabindex="-1" aria-labelledby="vedomosSelectGroupDateModalLabel" aria-hidden="true">
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
        </div>`
    );

    function loadGroups() {
        $.getJSON("http://localhost:8000/group", function (data) {
            var groupSelect = $("#vedomosSelectGroup");
            groupSelect.empty();
            data.forEach(function (group) {
                var option = `<option value='${group.Group_ID}'>${group.Group_Name}</option>`;
                groupSelect.append(option);
            });
        });
    }

    function loadReport(groupId, startDate, endDate) {
        $.getJSON(`http://localhost:8000/report/${groupId}/${startDate}/${endDate}`, function (data) {

            if (!data.report || !data.report.length) {
                alert("На выбранный диапазон дат нет занятий.");
                $("#vedomosSelectGroupDateModal").modal('show');
                return;
            }

            var content = "";
            content += `<h3 style='margin-top: 50px'>Отчет за период с ${startDate} по ${endDate}</h3>`;
            content += `<button id="printBtn" class="btn btn-primary" style='margin-bottom: 20px;'>Печать</button>`;

            if (data.missing_dates && data.missing_dates.length) {
                content += "<p>Нет занятий на следующие даты:</p>";
                content += "<ul>";
                data.missing_dates.forEach(function(date) {
                    var day = new Date(date).getDay();
                    if (day !== 0) {
                        content += `<li>${date}</li>`;
                    }
                });
                content += "</ul>";
            }

            content += "<table class='table table-striped fixed-table'>";
            content += "<thead><tr><th>Фамилия И.О.</th>";

            var dates = Object.keys(data.subjects).sort();
            dates.forEach(function(date) {
                var day = new Date(date).getDay();
                if (day !== 0) {
                    content += `<th>${date}</th>`;
                }
            });

            

            content += "<th>Итог</th>";
            content += "</tr></thead><tbody>";

            data.report.sort((a, b) => a.Last_Name.localeCompare(b.Last_Name));

            var totalValidAll = 0;
            var totalInvalidAll = 0;

            data.report.forEach(function (student) {
                content += "<tr>";
                content += `<td>${student.Last_Name} ${student.First_Name[0]}. ${student.Middle_Name ? student.Middle_Name[0] + '.' : ''}</td>`;
                var totalValid = 0;
                var totalInvalid = 0;

                dates.forEach(function(date) {
                    var day = new Date(date).getDay();
                    if (day !== 0) {
                        var classInfo = student.classes[date];
                        if (classInfo) {
                            var dailyAbsence = student.daily_absences[date];
                            var presenceOptions = 
                                `<div>
                                    <p>Ув: ${dailyAbsence ? dailyAbsence.уважительная : 0} ч.</p>
                                    <p>Неув: ${dailyAbsence ? dailyAbsence.неуважительная : 0} ч.</p>
                                </div>`;
                            content += `<td>${presenceOptions}</td>`;
                            totalValid += dailyAbsence ? dailyAbsence.уважительная : 0;
                            totalInvalid += dailyAbsence ? dailyAbsence.неуважительная : 0;
                        } else {
                            content += "<td>Нет данных</td>";
                        }
                    }
                });

                content += `<td>Ув: ${totalValid} ч.<br>Неув: ${totalInvalid} ч.</td>`;

                totalValidAll += totalValid;
                totalInvalidAll += totalInvalid;

                content += "</tr>";
            });

            content += "<tr>";
            content += "<td><strong>Итог по всем студентам:</strong></td>";
            dates.forEach(function(date) {
                var day = new Date(date).getDay();
                if (day !== 0) {
                    content += "<td></td>";
                }
            });
            content += `<td><strong>Ув: ${totalValidAll} ч.<br>Неув: ${totalInvalidAll} ч.</strong></td>`;
            content += "</tr>";

            content += "</tbody></table>";

            $("#app").html(content);

            $("#printBtn").click(function () {
                window.print();
            });
        });
    }

    $("#vedomosSelectGroupDateBtn").click(function () {
        var selectedGroupId = $("#vedomosSelectGroup").val();
        var selectedStartDate = $("#vedomosSelectStartDate").val();
        var selectedEndDate = $("#vedomosSelectEndDate").val();
        if (selectedGroupId && selectedStartDate && selectedEndDate) {
            $("#vedomosSelectGroupDateModal").modal('hide');
            loadReport(selectedGroupId, selectedStartDate, selectedEndDate);
        } else {
            alert("Пожалуйста, выберите группу и даты.");
        }
    });

    $("#vedomosSelectGroupDateModal").modal('show');

    loadGroups();
});
