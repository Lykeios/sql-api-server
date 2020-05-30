const express = require('express');

// 获取路由实例
const router = express.Router();


// db
const classManagerDao = require('../models/classManagerDao');



router.post('/getClass', (req, res) => {
    let {
        id
    } = req.body;
    classManagerDao.getClassInfo(id).then((data) => {
        res.send(data);
    })
})

router.post('/delete/student', (req, res) => {
    let {
        id,
        student_id
    } = req.body;
    classManagerDao.deleteAStudent(student_id).then((data) => {
        res.send(data);
    })
})

router.post('/add/student', (req, res) => {
    let {
        id,
        student
    } = req.body;
    classManagerDao.addAStudent(id, student).then((data) => {
        res.send(data);
    })
})


router.post('/delete/class', (req, res) => {
    let {
        id,
        class_id
    } = req.body;
    classManagerDao.deleteAClass(id).then((data) => {
        res.send(data);
    })
})

router.post('/import/class', (req, res) => {
    let {
        id,
        class_id,
        classObj
    } = req.body;


    classManagerDao.importAClass(id, class_id, classObj).then((data) => {
        res.send(data);
    })
})

router.post('/getGrade', (req, res) => {
    let {
        id,
        class_id,
    } = req.body;


    classManagerDao.exportGrade(id, class_id).then((data) => {
        res.send(data);
    })
})


// 导出模块
module.exports = router
