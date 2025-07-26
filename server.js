const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const sql = require('mssql');
const sqlConfig = require('./dbConfig');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.json()); // Đã có trong code bạn rồi

// Lấy câu hỏi theo code
app.get('/api/question/:code', async (req, res) => {
    try {
        await sql.connect(sqlConfig);
        const request = new sql.Request();
        const questionCode = req.params.code;
        request.input('QuestionCode', sql.NVarChar(50), questionCode);

        const result = await request.execute('GetQuestionByCode');
        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).send('Question not found');
        }
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).send('Server error');
    }
});

// Kiểm tra đáp án
app.post('/api/answers', async (req, res) => {
    try {
        await sql.connect(sqlConfig);
        const { questionCode, answers } = req.body;
        const request = new sql.Request();
        request.input('code', sql.NVarChar(50), questionCode);
        request.input('answer', sql.NVarChar(sql.MAX), answers);

        const result = await request.execute('uspCheckAnswerByQuestionCode');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.json('Answer incorrect');
        }
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).send('Server error');
    }
});

app.post('/api/save-question', async (req, res) => {
    console.log(req.body);
    try {
        await sql.connect(sqlConfig);
        // req.body sẽ là object
        const { id, code, text, solution, answer, isMultiAnswer, Grade } = req.body;
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('code', sql.NVarChar(50), code);
        request.input('text', sql.NVarChar(sql.MAX), text);
        request.input('solution', sql.NVarChar(sql.MAX), solution);
        request.input('answer', sql.NVarChar(sql.MAX), answer);
        request.input('isMultiAnswer', sql.Int, isMultiAnswer);
        request.input('Grade', sql.Int, Grade);
        const result = await request.execute('AddUpdateQuestion');
        res.json({ success: true, result: result.recordset });
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).send('Server error');
    }
});
app.get('/api/question-by-id/:id', async (req, res) => {
    try {
        await sql.connect(sqlConfig);
        const request = new sql.Request();
        const questionId = req.params.id;
        request.input('id', sql.Int, questionId);

        const result = await request.execute('GetQuestionById');
        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).send('Question not found');
        }
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).send('Server error');
    }
});
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
