$(document).ready(function () {

    // 获取我的表
    $.post({
        url: '/test/teacher/getAllTable',
        data: {
            id: id
        },
        success: function (json) {


            for (var i = 0; i < json.tables.length; i++) {
                //增加表的Tab按钮
                var addTab = "<li><a href=\"#tab" + (i + 1) + "\" id='tab_B" + (i + 1) + "'  data-toggle=\"tab\">" + json.tables[i].tableName + "</a></li>";
                $("#tab-div").append(addTab);
                //增加表的tab content
                var add_content = " <div class=\"tab-pane\" id=\"tab" + (i + 1) + "\">";
                //    增加表头
                add_content += " <div class=\"table-responsive\"><table id=\"table_" + (i + 1) + "\" class=\"table table-striped table-bordered w-100\">";
                //    增加th
                var map = json.tables[i].field;
                add_content += "<thead><tr>"
                for (var key in map) {
                    var fieldGroup = key + " (" + map[key] + ")";
                    add_content += "<th>" + fieldGroup + "</th>";
                }
                add_content += "</tr></thead>"

                //    增加tbody
                add_content += "<tbody>";
                /************************
                 * ***********************/

                //遍历行
                for (var j = 0; j < json.tables[i].rows.length; j++) {
                    var row = json.tables[i].rows[j];
                    add_content += "<tr>";
                    var arr = row.split("$$$");
                    //注意最后一项为空
                    for (var k = 0; k < arr.length - 1; k++) {
                        add_content += "<td>" + arr[k] + "</td>";
                    }
                    add_content += "</tr>";

                }

                /**********************
                 * *************************/
                add_content += "</tbody>";
                //    闭合元素
                add_content += "</table></div></div>";
                //    添加add_content
                $("#tab-content").append(add_content);
                //    开启
                $('#table_' + (i + 1)).DataTable();

            }
            //将第一项tab设置为初始可见
            $("#tab_B1").addClass("active");
            $("#tab1").addClass("active");

            // 创建临时表
            $.post({
                url: '/test/teacher/tempTableCreate',
                data: {
                    id: id,
                },
                success: function (data) {
                    if (data != "ok") {
                        notif({
                            msg: "<b>创建临时表出错</b>",
                            type: "error"
                        });
                        return;
                    } else {
                        notif({
                            msg: "<b>加载临时表成功</b>",
                            type: "success"
                        });
                        return;
                    }
                }

            })
        }
    })



    $.post({
        url: '/user/teacher/getMyTable',
        data: {
            id: id
        },
        success: function (data) {
            let addTr = "";
            for (let i = 0; i < data.length; i++) {
                if (i % 3 == 0) {
                    addTr += "<tr>";
                }
                addTr += "<td>";
                addTr += '<label class="colorinput" style="vertical-align: middle;">';


                addTr += '<input  name="color" type="checkbox" class="colorinput-input" />';



                addTr += '<span class="colorinput-color"onclick="writeTableInput(\'' + data[i] + '\')"></span>';
                addTr += '</label>';
                addTr += ' <span style="font-size: 20px;vertical-align: middle;">' + data[i] + '</span>';
                addTr += "</td>"

                if ((i - 2) % 3 == 0) {
                    addTr += "</tr>"
                }
            }

            if ((data.length - 1) % 3 == 0) {
                addTr += "<td></td><td></td></tr>";
            }
            if ((data.length - 2) % 3 == 0) {
                addTr += "<td></td></tr>";
            }

            $("#edit_table_check").children().remove();
            $("#edit_table_check").append(addTr);
        }
    })

})


function writeTableInput(name) {
    let input = $("#table").val();
    if (input.indexOf(name) != -1) {
        input = input.replace(name + "    ", "");
        $("#table").val(input);
        return;
    } else if (input.indexOf(name) == -1) {
        let s = name + "    ";
        input += s;
        $("#table").val(input);
        return;
    }
}


window.count = 4;

function addP() {
    window.count++;
    let addHTML = '<div id="P_div_' + window.count + '">'
    addHTML += '<div class="form-group">'
    addHTML += '  <textarea type="text" class="form-control" name="input"'
    addHTML += '  rows="2" placeholder="题目 ' + window.count + '" id="P_' + window.count + '"></textarea>'
    addHTML += '</div>'
    addHTML += '<div class="form-group">'
    addHTML += '   <textarea type="text" class="form-control" name="input"'
    addHTML += '     rows="2" placeholder="答案 ' + window.count + '" id="A_' + window.count + '"></textarea>'
    addHTML += '</div>'
    addHTML += '<hr>'
    addHTML += '</div>'
    $("#ADDP").before(addHTML);



}

function deleteP() {
    if (window.count == 1) {
        notif({
            msg: "<b>至少存在一道题目</b>",
            type: "error"
        });
        return;
    } else {
        $("#P_div_" + window.count).remove();
        window.count--;
    }
}

function runSQL() {
    var sql = $("#sqltextarea").val();
    sql = sql.trim();
    $.ajax({
        url: "/test/teacher/runSql",
        type: "post",
        data: {
            id: id,
            sql: sql
        },
        success: function (json) {
            // alert(JSON.stringify(json));
            if (json.error != 0 || json.type == 1) {
                $("#result_div").children().remove();
                var addHTML = "<span  style='font-size: small;color: #ffffff'>" + json.msg + "</span>"
                $("#result_div").append(addHTML);
            } else {
                // alert(JSON.stringify(json));
                // 格式修正
                let arr = [];
                arr[0] = "SELECT";
                // alert(JSON.stringify(json.msg.fields))
                arr[1] = json.msg.fields.length;
                for (let i = 0; i < json.msg.fields.length; i++) {
                    arr[i + 2] = json.msg.fields[i];
                }
                // 字段信息
                let index_ = 2 + json.msg.fields.length;

                // alert(json.msg.rows.toString());

                let tempA = json.msg.rows.toString().replace(/,/g, "").split("$$$");

                for (let j = 0; j < tempA.length - 1; j++) {
                    arr[index_] = tempA[j];
                    index_++;
                }
                // alert(arr);
                // SELECT, 8, name, area, population, dat, f, d, s, ss, 上海, 2000, 1000, 2020-02-24, null, null, null, null, 北京, 2000, 3000, 2020-02-26, null, null, null, null, 纽约, 2000, 4000, 2020-02-20, null, null, null, null, 山东, 100, 100, 2020-02-19, null, null, null, nul

                //
                // 显示表格
                $("#result_div").children().remove();
                //字段数
                var columnCount = parseInt(arr[1]);
                var trHTML = "<table id=\"aa\"\n" +
                    "                style=\" border: 1px solid #ffffff;text-align: center;min-height: 150px;color: #2d74a3;border-collapse: collapse;font-size: 12px;border: 1px solid #B2CEDD;border-radius: 5px\"\n" +
                    "            class=\"w-80\">";
                trHTML = " <tr style=\";color: black;background-color: #ebf7fd;\">";
                for (var i = 1; i <= columnCount; i++) {
                    if (i == columnCount) {

                        var addTh = "<td style=' border: 1px solid #ffffff; text-align: center;'>" + arr[i + 1] + "</td>";
                        trHTML += addTh;
                    } else {
                        var addTh = "<td style=' border: 1px solid #ffffff; border-right: none;text-align: center;'>" + arr[i + 1] + "</td>";
                        trHTML += addTh;
                    }

                }
                trHTML += "</tr>";
                //在获取内部内容


                //    先算有几行内容
                var sum_line = (arr.length - 2) / arr[1] - 1;
                var index = 2 + columnCount;
                for (var row_count = 1; row_count <= sum_line; row_count++) {
                    trHTML += "<tr>";
                    for (var column_count = 1; column_count <= columnCount; column_count++) {
                        if (column_count == columnCount) {
                            trHTML += "<td style=' border: 1px solid #ffffff;border-top: none;text-align: center;' height='15px' width='100px'>" + arr[index] + "</td>";
                            index++;
                        } else {
                            trHTML += "<td style=' border: 1px solid #ffffff;border-top: none;border-right: none;text-align: center;' height='15px' width='100px'>" + arr[index] + "</td>";
                            index++;
                        }

                    }
                    trHTML += "</tr>"
                }
                trHTML += ""
                trHTML += "</table>";
                $("#result_div").append(trHTML);


            }
        }
    })
}
// 刷新表
function renewTables() {
    // 创建临时表
    $.post({
        url: '/test/teacher/tempTableCreate',
        data: {
            id: id,
        },
        success: function (data) {
            if (data != "ok") {
                notif({
                    msg: "<b>刷新失败</b>",
                    type: "error"
                });
                return;
            } else {
                notif({
                    msg: "<b>刷新成功</b>",
                    type: "success"
                });
                return;
            }
        }

    })
}

function createTest() {
    let name = $("#name").val();
    let aim = $("#aim").val();
    let describe = $("#describe").val();
    let table = $("#table").val();
    let startTime = $("#startTime").val();
    let endTime = $("#endTime").val();
    let problems = [];
    let answers = [];

    if (name == "" || aim == "" || describe == "" || table == "" || startTime == "" || endTime == "") {
        notif({
            msg: "<b>信息填写不完整</b>",
            type: "error"
        });
        return;
    }
    if (startTime > endTime) {
        notif({
            msg: "<b>可见日期不能晚于截止日期</b>",
            type: "error"
        });
        return;
    }
    for (let i = 0; i < window.count; i++) {
        problems[i] = $("#P_" + (i + 1)).val();
        answers[i] = $("#A_" + (i + 1)).val();
        if (problems[i] == "") {
            notif({
                msg: "<b>请先填写题目 " + (i + 1) + " </b>",
                type: "error"
            });
            return;
        }
        if (answers[i] == "") {
            notif({
                msg: "<b>请先填写答案 " + (i + 1) + " </b>",
                type: "error"
            });
            return;
        }
    }
    $.post({
        url: '/test/teacher/createTest',
        data: {
            id: id,
            name: name,
            aim: aim,
            describe: describe,
            table: table,
            startTime: startTime,
            endTime: endTime,
            problems: problems,
            answers: answers
        },
        traditional: true,
        cache: false,
        success: function (data) {
            if (data.error == 0) {
                notif({
                    msg: "<b>创建成功</b>",
                    type: "success"
                });
                setTimeout(function () {
                    location.href = "/teacherhome";
                }, 2000);
            } else {
                notif({
                    msg: "<b>" + data.msg + "</b>",
                    type: "error"
                });
            }
        }

    })

    // alert(name+aim+describe+table+startTime+endTime+problems+answers);
}



$(function () {
    $('.datetimepicker').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: moment.locale('zh-cn')
    });
})
