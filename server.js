const express = require('express');
const cors= require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
app.use(cors({
    origin:"https://ihm-client-d280b8ad84d7.herokuapp.com/"
}))
app.use(express.json());
app.use(bodyParser.json()); // Để xử lý JSON payload từ request

const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123!@#',
    server: 'DESKTOP-HOME\\SQL2019DEV', // You can use 'localhost\\instance' to connect to named instance
    database: 'IHM',
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};
const connectionString= "Server=tcp:eu-az-sql-serv1.database.windows.net,1433;Initial Catalog=ihmproduction;Persist Security Info=False;User ID=vietlink;Password=G00dday!@#;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
// Middleware
app.use(express.json());

// Định nghĩa API
app.post('/api/questions', async (req, res) => {
    const { code, question, solution, difficulty, answer } = req.body;
    // Xử lý dữ liệu ở đây, ví dụ lưu vào database
    try {
        // Kết nối database
        await sql.connect(connectionString);

        // Tạo một đối tượng Request mới
        const request = new sql.Request();

        // Thêm tham số cho Stored Procedure
        const questionCode = req.params.code;
        request.input('code', sql.NVarChar(10), code);
        request.input('content', sql.NVarChar(10), question);
        request.input('solution', sql.NVarChar(10), solution);
        request.input('level', sql.Int, difficulty);
        request.input('answer', sql.NVarChar(10), answer);
        // Thực hiện gọi Stored Procedure
        const result = await request.execute('uspAddUpdateQuestion');

        // Kiểm tra và trả về kết quả
       
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).send('Server error');
    }
    // Gửi phản hồi lại cho client
    res.status(201).send({ message: 'Câu hỏi đã được tạo thành công' });
  });
app.get('/api/question/:code', async (req, res) => {
    try {
        // Kết nối database
        await sql.connect(config);

        // Tạo một đối tượng Request mới
        const request = new sql.Request();

        // Thêm tham số cho Stored Procedure
        const questionCode = req.params.code;
        request.input('QuestionCode', sql.NVarChar(50), questionCode);

        // Thực hiện gọi Stored Procedure
        const result = await request.execute('GetQuestionByCode');

        // Kiểm tra và trả về kết quả
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
