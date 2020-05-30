$(document).ready(function () {

    // 获取第一行info 全部测试/可见测试/已完成/通过测试/未及格
    // 格式如下
    // {"all":4,"fail":2,"visible":4,"pass":2,"completed":4}
    $.post({
        url: '/user/student/info_one',
        data: {
            id: id,
            class_id: class_id,
            name: name,
            teacher_id: teacher_id
        },
        success: function (json) {
            // 获得第一行结果
            //可见测试初始化
            $("#visible_count").html(json.visible);
            var visible_chart = $("#visible_chart");
            var values = [];
            values.push(json.visible);
            values.push(json.all - json.visible);
            visible_chart.text(values.join(",")).change();
            $("#visible_progress").css("width", toPercent(json.visible / json.all));


            //完成测试初始化
            $("#completed_count").html(json.completed);
            var completed_chart = $("#completed_chart");
            var values = [];
            values.push(json.completed);
            values.push(json.visible - json.completed);
            completed_chart.text(values.join(",")).change();
            $("#completed_progress").css("width", toPercent(json.completed / json.visible));


            //通过测试初始化
            $("#pass_count").html(json.pass);
            var pass_chart = $("#pass_chart");
            var values = [];
            values.push(json.pass);
            values.push(json.completed - json.pass);
            pass_chart.text(values.join(",")).change();
            $("#pass_progress").css("width", toPercent(json.pass / json.completed));

            fail = json.completed - json.pass;
            //未及格
            $("#fail_count").html(fail);
            var fail_chart = $("#fail_cart");
            var values = [];
            values.push(fail);
            values.push(json.completed - fail);
            fail_chart.text(values.join(",")).change();
            $("#fail_progress").css("width", toPercent(fail / json.completed));
        }
    })

    $.post({
        url: '/user/student/info_two',
        data: {
            id: id,
            class_id: class_id,
            name: name,
            teacher_id: teacher_id
        },
        success: function (json) {
            // alert(JSON.stringify(json));
            var exNameArr = [];
            var arrMin = [];
            var myTime = [];
            var myScore = [];
            var arrScore = [];
            for (var i = 0; i < json.length; i++) {


                exNameArr[i] = json[i].name;
                arrMin[i] = json[i].averageTime;
                myTime[i] = toMinute(json[i].myTime);
                myScore[i] = json[i].myScore;
                arrScore[i] = json[i].averageScore;
            }
            if (exNameArr.length <= 4) {
                exNameArr.push("");
                exNameArr.push("");
            }

            // 即将过期的实验提示
            var upEx = [];
            let j = 0;
            // 挑选出还未过期的实验
            // var now = formatDate(new Date());
            // now = new Date(2010,12,2);
            // alert(now);
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

            var trHTML = "";
            for (var i = 0; i < upEx.length; i++) {
                trHTML += "<tr align='center'>" +
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + upEx[i].name + "</td>" +
                    "<td>" + upEx[i].endTime + "</td>" +
                    "<td>" + upEx[i].problemCount + "</td>" +
                    "<td> <div class=\"progress progress-md mt-auto h-2\">\n" +
                    "                                                <div class=\"progress-bar  progress-bar-animated bg-success\" style=\"width:" + toPercent(upEx[i].progress) + "\"></div>\n" +
                    "                                            </div></td>" +
                    "</tr>";
            }
            $("#upcomingExperimentTBody").append(trHTML);



            // 测试时间
            var chartdata = [
                //第一组 我的用时
                {
                    name: '我的用时',
                    type: 'bar',
                    data: myTime,
                    symbolSize: 10,
                    itemStyle: {
                        normal: {
                            barBorderRadius: [0, 0, 0, 0],
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#ff685c '
                            }, {
                                offset: 1,
                                color: '#ff4f7a'
                            }])
                        }
                    },
                },
                //第二组我的用时
                {
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
                }
            ];

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
                    data: exNameArr,
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



            // 成绩图

            //成绩图
            var chartdata2 = [{
                name: 'sales',
                type: 'line',
                smooth: true,
                data: myScore,
                symbolSize: 5,
                color: ['#ff685c ']
            }, {
                name: 'Profit',
                type: 'line',
                smooth: true,
                size: 10,
                data: arrScore,
                symbolSize: 5,
                color: ['#32cafe']
            }];
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
                    data: exNameArr,
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




            //成绩card
            for (var i = 0; i < json.length; i++) {
                //测试水平导航栏id
                var addMyTest = "<li aria-haspopup=\"true\"><a href=\"/student/mytest?teacher_id=" + teacher_id + "&testname=" + json[i].name + "&id=" + id + "\">" + json[i].name + "</a></li>";
                $("#myTest").append(addMyTest);

                 //测试水平导航栏id
                 var addMyGrade = "<li aria-haspopup=\"true\"><a href=\"/student/mygrade?teacher_id=" + teacher_id + "&testname=" + json[i].name + "&id=" + id + "\">" + json[i].name + "</a></li>";
                 $("#myGrade").append(addMyGrade);



                var sub = "未提交";
                var a = "danger";
                var b = "down";
                var color_s = "#ffffff";
                var g = 0;
                if (json[i].isFinish == "y") {
                    sub = "提交:" + new Date(json[i].timeSub).toLocaleDateString();
                    a = "success";
                    b = "up";
                    g = json[i].myScore;
                    if (g < 60) {
                        color_s = "#ff685c";
                    }
                }

                var addHTML = " <div class=\"col-md-12 col-xl-4 col-lg-4 col-sm-12\">\n" +
                    "                        <div class=\"card\">\n" +
                    "                            <div class=\"card-body text-center\">\n" +
                    "                                <h3 class=\"mb-3 counter \">" + json[i].name + "</h3>\n" +
                    "                                <div class=\"\">\n" +
                    "                                    <div class=\"chart-circle mt-4\" data-value=\"0.77\" data-thickness=\"10\" data-color=\"#ff695c\"><canvas width=\"128\" height=\"128\"></canvas></div>\n" +
                    "                                </div>\n" +
                    "                                <h6 class=\" mb-0 mt-3 text-muted\"><span class=\"text-" + a + "\"><i class=\"fe fe-arrow-" + b + "-circle \"></i></span>" + sub + "</h6>\n" +
                    "\n" +
                    "                                <!-- 成绩 -->\n" +
                    "                                <div class=\"chart-circle-value text-center h3 mt-1\"><div class=\"text-xxl mt-2\" style='color:" + color_s + "'>" + g + "</div><small></small></div>\n" +
                    "                            </div>\n" +
                    "                        </div>\n" +
                    "                    </div>";
                $("#showGradeCard").append(addHTML);

            }






        }
    })




})

function toMinute(myTime) {
    let arr = myTime.split(":");
    let result = parseInt(arr[1]) + 60 * parseInt(arr[0]);
    if (parseInt(arr[2]) >= 40) {
        result += 1;
    }
    return result;
}



//小数转化为百分比
function toPercent(point) {
    var str = Number(point * 100).toFixed(1);
    str += "%";
    return str;
}


// 按时间排序json
function sortDate(a, b) {
    return (a.endTime > b.endTime) ? 1 : -1;
}
