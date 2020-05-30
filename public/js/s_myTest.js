function doTest(a) {
    if (confirm("确定开始作答?只有一次作答机会") == true) {
        let address = "/user/student/test?id=" + id + "&teacherid=" + teacher_id + "&testname=" + testname;
        window.location =address;
    }
}

$(document).ready(function () {
    $.post({
        url: '/user/student/info_two',
        data: {
            id: id,
            teacher_id: teacher_id
        },
        success: function (json) {
            for (var i = 0; i < json.length; i++) {
                //测试水平导航栏id
                var addMyTest = "<li aria-haspopup=\"true\"><a href=\"/student/mytest?teacher_id=" + teacher_id + "&testname=" + json[i].name + "&id=" + id + "\">" + json[i].name + "</a></li>";
                $("#myTest").append(addMyTest);

                var addMyGrade = "<li aria-haspopup=\"true\"><a href=\"/student/mygrade?teacher_id=" + teacher_id + "&testname=" + json[i].name + "&id=" + id + "\">" + json[i].name + "</a></li>";
                $("#myGrade").append(addMyGrade);
            }
        }
    })
    // 获得信息
    $.post({
        url: "/test/student/testInfo",
        data: {
            id: id,
            teacher_id: teacher_id,
            testname: testname
        },
        success: function (json) {
            // alert(JSON.stringify(json));
            $("#s_mytest_aim").html(json.aim);
            $("#s_mytest_describe").html(json.describe);
            $("#s_mytest_tables").html(json.table);
            $("#s_mytest_endTime").html("截止日期 : " + json.endTime);
            if (json.isFinish == "n") {
                $("#s_mytest_isFinish").html("完成情况 : 未完成");
            } else if (json.isFinish == "y") {
                $("#s_mytest_isFinish").html("完成情况 : 已完成");
                $("#s_mytest_button").attr("disabled", true);
                $("#s_mytest_button").html("已经作答");
                $("#s_mytest_button").attr("title", "测试只能提交一次 已完成测试");
            }
            $("#s_mytest_problem_count").html(json.problemCount);
        }
    })


})
