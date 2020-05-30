const express = require('express');

// 获取路由实例
const router = express.Router();

// db
const experimentDao = require('../models/experimentDao');



router.post('/experiment/create', (req, res) => {
    let {
        id,
        experiment
    } = req.body;
    experimentDao.createExperiment(id, experiment).then(data => {
        res.send(data);
    })
})
router.post('/experiment/getAll', (req, res) => {
    let {
        id,
    } = req.body;
    experimentDao.getAllExperiment(id).then(data => {
        res.send(data);
    })
})

router.post('/experiment/edit', (req, res) => {
    let {
        id,
        name,
        experiment
    } = req.body;
    experimentDao.editExperiment(id,name,experiment).then(data => {
        res.send(data);
    })
})

router.post('/getVisibleExperiment', (req, res) => {
    let {
        student_id,
    } = req.body;
    experimentDao.getVisibleExperiment(student_id).then(data => {
        res.send(data);
    })
})
router.post('/getExperimentInfo', (req, res) => {
    let {
        exp_id
    } = req.body;
    experimentDao.getExperimentInfo(exp_id).then(data => {
        res.send(data);
    })
})
router.post('/testing', (req, res) => {
    let {
        test_name
    } = req.body;
    experimentDao.getTest(test_name).then(data => {
        res.send(data);
    })
})
router.post('/test/createTmpTable', (req, res) => {
    let {
        id,
        test_id
    } = req.body;
    experimentDao.createTestTmpTable(id,test_id).then(data => {
        res.send(data);
    })
})

router.post('/runTestSql', (req, res) => {
    let {
        id,
        teacher_id,
        test_name,
        sql
    } = req.body;
    experimentDao.runTestSql(id,teacher_id,test_name,sql).then(data => {
        res.send(data);
    })
})


router.post('/test/submit', (req, res) => {
    let {
        id,
        test_id,
        answer
    } = req.body;
    experimentDao.testSubmit(id,test_id,answer).then(data => {
        res.send(data);
    })
})

router.post('/student/getGrade', (req, res) => {
    let {
        id,
        test_id
    } = req.body;
    experimentDao.getGrade(id,test_id).then(data => {
        res.send(data);
    })
})



// 导出模块
module.exports = router
