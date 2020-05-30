$(document).ready(function info() {
    // alert(id);
    // alert(name);
    // 获取实验列表
    $.post({
        url: '/user/teacher/getTestList',
        data: {
            id: id
        },
        success: function (json) {
            // alert(JSON.stringify(json));

            // 添加表格
            for (let i = 0; i < json.length; i++) {
                let addtr = '<tr><th scope="row">' + (i + 1) + '</th>';
                addtr += "<td>" + json[i].name + "</td>";
                addtr += "<td>" + dateFormat(json[i].createTime) + "</td>";
                addtr += "<td>" + dateFormat(json[i].startTime) + "</td>";
                addtr += "<td>" + dateFormat(json[i].endTime) + "</td>";
                addtr += "<td>" + json[i].finish + "</td>";
                addtr += '<td> <div class="progress progress-md mt-1 h-2">';
                if (json[i].finish * 1.0 / json[i].all >= 0.5) {
                    addtr += '<div class="progress-bar  bg-gradient-success" style="width: ' + toPercent(json[i].finish / json[i].all) + ';"id="visible_progress"></div>';
                } else {
                    addtr += '<div class="progress-bar  bg-gradient-danger" style="width: ' + toPercent(json[i].finish / json[i].all) + ';"id="visible_progress"></div>';
                }
                addtr += '</div></td>'
                addtr += '<td>\n';
                addtr += '<a class="btn btn-sm btn-primary"data-toggle="modal" data-target="#testEditModal"  onclick="editTest(\'' + json[i].name + '\')"><i class="fa fa-edit"></i>编辑</a>\n';
                addtr += '<a class="btn btn-sm btn-danger" onclick="deleteExperimentConfirm(\'' + json[i].name + '\')"><i class="fa fa-trash"></i>删除</a>\n';
                addtr += '</td>\n';
                addtr += '<td><a class="btn btn-sm btn-info" data-toggle="modal" data-target="#testDetailModal" onclick="testDetail(\'' + json[i].name + '\')" ><i class="fa fa-info-circle"></i>细节</a></td>';
                addtr += "</tr>";
                $("#testList").append(addtr);

            }

            // 即将过期
            var upEx = [];
            let j = 0;
            var now = new Date();
            for (var i = 0; i < json.length; i++) {
                let a = (json[i].endTime).replace(/-/g, "/");
                let dl = new Date(a);
                if (dl >= now) {
                    upEx[j] = json[i];
                    j++;
                }
            }
            upEx.sort(sortDate);
            // alert(JSON.stringify(upEx));
            trHTML = "";
            for (var i = 0; i < upEx.length; i++) {
                trHTML += "<tr align='center'>" +
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + upEx[i].name + "</td>" +
                    "<td>" + dateFormat(upEx[i].endTime) + "</td>" +
                    "<td>" + dateFormat(upEx[i].startTime) + "</td>" +
                    "<td>" + '<a class="btn btn-sm btn-outline-danger" data-toggle="modal" data-target="#dateModal1" onclick="setDateModal1(\'' + upEx[i].name + '\',\'' + dateFormat(upEx[i].endTime) + '\')"><i class="fa fa-edit"></i>截止日期</a>\n' +
                    '<a class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#dateModal2" onclick="setDateModal2(\'' + upEx[i].name + '\',\'' + dateFormat(upEx[i].startTime) + '\')"><i class="fa fa-edit"></i>可见日期</a>' +
                    "</td>" + "</tr>"
            }
            $("#upcomingExperimentTBody").append(trHTML);




        }



    })
    // 获取测试时间 测试成绩
    $.post({
        url: '/user/teacher/getTestTimeAndScore',
        data: {
            id: id
        },
        success: function (data) {
            // alert(JSON.stringify(data));
            let arrMin = [];
            let arrScore = [];
            let arrName = [];
            for (let i = 0; i < data.length; i++) {
                arrMin[i] = data[i].averageTime;
                arrName[i] = data[i].name;
                arrScore[i] = data[i].averageScore;
            }
            if (arrName.length <= 4) {
                arrMin.push("");
                arrMin.push("");
                arrName.push("");
                arrName.push("");
                arrScore.push("");
                arrScore.push("");
                arrMin.push("");
                arrMin.push("");
                arrName.push("");
                arrName.push("");
                arrScore.push("");
                arrScore.push("");
            }
            // 测试时间
            var chartdata = [{
                name: '平均用时',
                type: 'bar',
                data: arrMin,
                symbolSize: 10,
                itemStyle: {
                    normal: {
                        barBorderRadius: [0, 0, 0, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#32cafe'
                        }, {
                            offset: 1,
                            color: '#3582ec'
                        }])
                    }
                },
            }];

            var chart = document.getElementById('echart');

            var barChart = echarts.init(chart);


            var option = {
                grid: {
                    top: '6',
                    right: '0',
                    bottom: '17',
                    left: '25',
                },
                xAxis: {
                    data: arrName,
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLabel: {
                        fontSize: 10,
                        color: '#888080'
                    }
                },
                tooltip: {
                    show: true,
                    showContent: true,
                    alwaysShowContent: true,
                    triggerOn: 'mousemove',
                    trigger: 'axis',
                    axisPointer: {
                        label: {
                            show: false,
                        }
                    }
                },
                yAxis: {
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLabel: {
                        fontSize: 10,
                        color: '#000'
                    }
                },
                series: chartdata,
                color: ['#ff685c', '#32cafe']
            };
            barChart.setOption(option);
            //成绩图
            var chartdata2 = [{
                    name: 'sales',
                    type: 'line',
                    smooth: true,
                    data: arrScore,
                    symbolSize: 5,
                    color: ['#ff685c ']
                },

            ];
            var chart2 = document.getElementById('echart2');
            var barChart2 = echarts.init(chart2);
            var option2 = {
                grid: {
                    top: '6',
                    right: '0',
                    bottom: '17',
                    left: '25',
                },
                xAxis: {
                    data: arrName,
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLabel: {
                        fontSize: 10,
                        color: '#888080'
                    }
                },
                yAxis: {
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLabel: {
                        fontSize: 10,
                        color: '#888080'
                    }
                },
                series: chartdata2
            };
            barChart2.setOption(option2);

        }
    })
})

window.count = 0;
window.record = 0;

function editTest(name) {
    $.post({
        url: '/user/teacher/getTestDetail',
        data: {
            id: id,
            name: name
        },
        success: function (json) {
            $("#old_name").text(name);
            $("#edit_name").val(name);
            $("#edit_aim").val(json.aim);
            $("#edit_describe").val(json.describe);
            $("#edit_table_input").val(json.table);
            $.post({
                url: '/user/teacher/getMyTable',
                data: {
                    id: id
                },
                success: function (data) {

                    let table_k = json.table.split("    ");
                    table_k.pop();
                    let addTr = "";
                    for (let i = 0; i < data.length; i++) {
                        if (i % 3 == 0) {
                            addTr += "<tr>";
                        }
                        addTr += "<td>";
                        addTr += '<label class="colorinput" style="vertical-align: middle;">';
                        let bool = false;
                        for (let j = 0; j < table_k.length && bool == false; j++) {
                            if (table_k[j] == data[i]) {
                                bool = true;
                                addTr += '<input  checked name="color" type="checkbox" class="colorinput-input" />';
                            }
                        }
                        if (bool == false) {
                            addTr += '<input  name="color" type="checkbox" class="colorinput-input" />';

                        }

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

                    // 获得题目
                    $.post({
                        url: '/user/teacher/getTestDetail',
                        data: {
                            id: id,
                            name: name
                        },
                        success: function (json) {
                            window.count = 0;
                            window.record = 0;
                            $("#edit_show_problem").children().remove();
                            // 添加题目a
                            let addP = "";
                            for (let i = 0; i < json.problem.length; i++) {
                                window.count++;
                                window.record++;
                                addP += "<div id='P_div_" + (i + 1) + "'>"
                                addP += "<span>题目</span>";
                                addP += "<textarea id='P_" + (i + 1) + "' spellcheck='false' class='form-control' row='2'>" + json.problem[i] + "</textarea>";

                                addP += "<span>答案</span>";
                                addP += "<textarea id='A_" + (i + 1) + "' spellcheck='false' class='form-control' row='2'>" + json.answer[i] + "</textarea>";
                                addP += "<button onclick='deleteP(\"P_div_" + (i + 1) + "\")' class='btn btn-outline-danger' style='display:block;margin:0 auto;margin-top:20px'><i class='fa fa-trash'></i>删除本题</button>"

                                addP += "<hr>";
                                addP += "</div>";
                            }
                            addP += "<button id='addP_before' class='btn btn-success' onclick='addP()' style='display:block;margin:0 auto;margin-top:20px'><i class='fa fa-plus'></i>添加题目</button>"
                            $("#edit_show_problem").append(addP);
                            // alert(window.count);
                        }
                    })


                }
            })
        }
    })

}

function confirmTheEdit() {
    // 获取原名
    let oldName = $("#old_name").text();
    // 获得名字 目的 描述 关联库表
    let name = $("#edit_name").val();
    let aim = $("#edit_aim").val();
    let describe = $("#edit_describe").val();
    let table = $("#edit_table_input").val();
    if (name == "" || aim == "" || describe == "" || table == "") {
        notif({
            msg: "<b>实验名、目的、描述和关联表不能为空</b>",
            type: "error"
        });
        return;
    }
    // 获取答案 存放为对象数组 注意 此处使用record为循环体目标 而不是count
    // 注意判断是否为空
    let problems = [];
    let answers = [];
    let j = 0;
    for (let i = 1; i <= window.record; i++) {
        if ($("#P_" + i).length > 0) {
            if ($("#P_" + i).val() == "" || $("#A_" + i).val() == "") {
                notif({
                    msg: "<b>题目或答案不能为空</b>",
                    type: "error"
                });
                return;
            } else {
                // 存入数组

                problems[j] = $("#P_" + i).val();
                answers[j] = $("#A_" + i).val();
                j++;
            }
        }
    }
    // 上传新信息
    $.ajax({
        url: "/user/teacher/editTest",
        type: "post",
        data: {
            id: id,
            old_name: oldName,
            name: name,
            aim: aim,
            describe: describe,
            table: table,
            problems: problems,
            answers: answers
        },
        traditional: true,
        cache: false,
        success: function (data) {
            if (data.error == 0) {
                notif({
                    msg: "<b>修改成功</b>",
                    type: "success"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            }
        }
    })
}



function addP() {
    let addP = "";
    window.count++;
    window.record++;
    addP += "<div id='P_div_" + window.record + "'>"
    addP += "<span>题目</span>";
    addP += "<textarea id='P_" + window.record + "' spellcheck='false' class='form-control' row='2'></textarea>";

    addP += "<span>答案</span>";
    addP += "<textarea id='A_" + window.record + "' spellcheck='false' class='form-control' row='2'></textarea>";
    addP += "<button onclick='deleteP(\"P_div_" + window.record + "\")' class='btn btn-outline-danger' style='display:block;margin:0 auto;margin-top:20px'><i class='fa fa-trash'></i>删除本题</button>"

    addP += "<hr>";
    addP += "</div>";
    $("#addP_before").before(addP);

}

// 只减少window.count
function deleteP(div) {
    if (window.count == 1) {
        notif({
            msg: "<b>无法删除,至少有一道题目</b>",
            type: "error"
        });
        return;
    } else {
        $("#" + div).remove();
        window.count--;
    }
}


function writeTableInput(name) {
    let input = $("#edit_table_input").val();
    if (input.indexOf(name) != -1) {
        input = input.replace(name + "    ", "");
        $("#edit_table_input").val(input);
        return;
    } else if (input.indexOf(name) == -1) {
        let s = name + "    ";
        input += s;
        $("#edit_table_input").val(input);
        return;
    }
}

function testDetail(name) {
    $("#detailModalTitle").text(name);
    $.post({
        url: '/user/teacher/getTestDetail',
        data: {
            id: id,
            name: name
        },
        success: function (json) {
            $("#detail_name").text(name);
            $("#detail_aim").text(json.aim);
            $("#detail_describe").text(json.describe);
            $("#detail_table").text(json.table);
            $("#detail_problem").children().remove();
            // 添加题目
            for (let i = 0; i < json.problem.length; i++) {
                let addP = "";
                addP = "<h5 style=\"text-indent:50px\">序号:<" + (i + 1) + "> " + json.problem[i] + "</h5>";
                // alert(json.problem[i]);
                let arr = json.answer[i].split("$$$");
                for (let j = 0; j < arr.length - 1; j++) {
                    addP += "<h6 style=\"text-indent:60px\">答案:<" + (i + 1) + "." + (j + 1) + "> " + arr[j] + "</h6>";
                }
                $("#detail_problem").append(addP);
            }


        }
    })
}






function confirmendTime() {
    // 获取信息
    let name = $("#dateModal1_name").val();
    let date = $("#dateModal1_date").val();
    // 接口
    $.post({
        url: '/user/teacher/changeDate',
        data: {
            id: id,
            name: name,
            date: date,
            type: "endTime"
        },
        success: function (data) {
            // alert(JSON.stringify(data));
            if (data.error == 0) {
                notif({
                    msg: "<b>修改成功</b>",
                    type: "success"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
                // $("#dateModal1_close")[0].click();

            } else {
                notif({
                    msg: "<b>" + data.msg + "</b>",
                    type: "error"
                });
            }
        }


    })
}

function confirmstartTime() {
    // 获取信息
    let name = $("#dateModal2_name").val();
    let date = $("#dateModal2_date").val();
    // 接口
    $.post({
        url: '/user/teacher/changeDate',
        data: {
            id: id,
            name: name,
            date: date,
            type: "startTime"
        },
        success: function (data) {
            if (data.error == 0) {
                notif({
                    msg: "<b>修改成功</b>",
                    type: "success"
                });
                // $("#dateModal2_close")[0].click();
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            } else {
                notif({
                    msg: "<b>" + data.msg + "</b>",
                    type: "error"
                });
            }
        }


    })
}


function setDateModal1(name, endTime) {
    // 设置模态框内部信息
    $("#dateModal1_name").val(name);
    $("#dateModal1_date").val(endTime);

}

function setDateModal2(name, startTime) {
    // 设置模态框内部信息
    $("#dateModal2_name").val(name);
    $("#dateModal2_date").val(startTime);
}



$(function () {
    $('.datetimepicker').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: moment.locale('zh-cn')
    });
})


//小数转化为百分比
function toPercent(point) {
    var str = Number(point * 100).toFixed(1);
    str += "%";
    return str;
}

// 确认删除实验
function deleteExperimentConfirm(name) {
    notif({
        type: "error",
        msg: "<b>确认删除 `" + name + "` ?无法复原</b><button style='margin-left:50px' onclick='deleteE(\"" + name + "\")' class='btn btn-outline-light'>确认</button><button style='margin-left:10px' class='btn btn-outline-light'>取消</button>",
        width: 500,
        height: 100,
        position: "center",
        opacity: 0.8
    });


}

function deleteE(name) {
    $.post({
        url: '/user/teacher/deleteTest',
        data: {
            id: id,
            name: name
        },
        success: function (data) {
            if (data.error == 0) {
                notif({
                    msg: "<b>删除成功</b>",
                    type: "success"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            } else {
                notif({
                    msg: "<b>删除失败</b>",
                    type: "error"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            }
        }
    })
}


// 按时间排序json
function sortDate(a, b) {
    return (a.endTime > b.endTime) ? 1 : -1;
}

// 日期转化
function dateFormat(data) {
    let arr = data.split("-");
    if (arr[1].length == 1) {
        arr[1] = "0" + arr[1];
    }
    if (arr[2].length == 1) {
        arr[2] = "0" + arr[2];
    }
    let str = arr[0] + "-" + arr[1] + "-" + arr[2];
    return str;
}
