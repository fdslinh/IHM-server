const express = require('express');
const cors= require('cors');
const app = express();
const PORT = 8000 || 3001;
const bodyParser = require('body-parser');
// const websocket= require('ws');
// const wss= new websocket.Server({port:PORT});
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // Để xử lý JSON payload từ request
const {Pool}= require('pg');
const postgresConfig= require('./dbConfig');
const pool= new Pool(
    //postgresConfig
    {connectionString:"postgres://postgres:OWtwhRz4agC15A9@ihm-db.flycast:5432",
    ssl:{rejectUnauthorized:false}
}
);
//websocket
// wss.on('connection',(ws)=>{
//    console.log('Client kết nối đến WebSocket server.');

//   // Gửi tin nhắn cho client khi kết nối thành công
//     ws.send(JSON.stringify({ message: 'Chào mừng bạn đã kết nối với WebSocket server!' }));
//     ws.on('message', (message) => {
//         console.log('Tin nhắn nhận được từ client:', message);

//         // Parse dữ liệu nếu tin nhắn từ client là JSON
//         let data;
//         try {
//             data = JSON.parse(message);
//         } catch (error) {
//             console.error('Không thể parse dữ liệu từ client:', error);
//             return;
//         }
//         if (data.action === 'getQuestionInfo' && data.questionId) {
//             try {
//                 // Kết nối database
//                 pool.connect(function (err, client, done) {
//                     if (err) {
//                         return console.error('Error fetching client from Pool', err);
//                     }
//                     const questionCode = req.params.code;
//                     const query = `CALL getquestionbycode($1, $2, $3, $4, $5, $6, $7);`;
//                     // Tạo một đối tượng Request mới
//                     client.query(query, [questionCode, null, null, null, null, null, null], function (err, result) {
//                         done();
//                         if (err) {
//                             return console.error('Error running query', err);
//                         }
//                         // Kiểm tra và trả về kết quả
//                         if (result.rows.length > 0 && result.rows[0].question_id != null) {
//                             res.json(result.rows);
//                         } else {
//                             res.status(404).send('Question not found');
//                         }
//                     });
//                 });

//             } catch (err) {
//                 console.error('Database connection error', err);
//                 res.status(500).send('Server error');
//             }
//         }
//     });
// });
// Middleware
// app.use(express.json());
//sqlServer
// Định nghĩa API
// app.post('/api/questions', async (req, res) => {
//     const { code, question, solution, difficulty, answer } = req.body;
//     // Xử lý dữ liệu ở đây, ví dụ lưu vào database
//     try {
//         // Kết nối database
//         await sql.connect(connectionString);

//         // Tạo một đối tượng Request mới
//         const request = new sql.Request();

//         // Thêm tham số cho Stored Procedure
//         const questionCode = req.params.code;
//         request.input('code', sql.NVarChar(50), code);
//         request.input('content', sql.NVarChar(sql.MAX), question);
//         request.input('solution', sql.NVarChar(sql.MAX), solution);
//         request.input('level', sql.Int, difficulty);
//         request.input('answer', sql.NVarChar(sql.MAX), answer);
//         // Thực hiện gọi Stored Procedure
//         const result = await request.execute('uspAddUpdateQuestion');

//         // Kiểm tra và trả về kết quả
       
//     } catch (err) {
//         console.error('Database connection error', err);
//         res.status(500).send('Server error');
//     }
//     // Gửi phản hồi lại cho client
//     res.status(201).send({ message: 'Câu hỏi đã được tạo thành công' });
//   });
// app.post('/api/answers',async(req, res)=>{
//     const {questionCode, answers}= req.body;
//     try{
//         await sql.connect(connectionString);
//         const request= new sql.Request();
//         request.input('code', sql.NVarChar(50), questionCode);
//         request.input('answer', sql.NVarChar(sql.MAX), answers);
//         const result = await request.execute('uspCheckAnswerByQuestionCode');
//         if(result.recordset.length>0){
//             res.json(result.recordset);
//         }else{
//             res.json('Answer incorrect');
//         }
//     }catch (err) {
//         console.error('Database connection error', err);
//         res.status(500).send('Server error');
//     }
// })
  
// app.get('/api/question/:code', async (req, res) => {
//     try {
//         // Kết nối database
//         await sql.connect(connectionString);

//         // Tạo một đối tượng Request mới
//         const request = new sql.Request();

//         // Thêm tham số cho Stored Procedure
//         const questionCode = req.params.code;
//         request.input('QuestionCode', sql.NVarChar(50), questionCode);

//         // Thực hiện gọi Stored Procedure
//         const result = await request.execute('GetQuestionByCode');

//         // Kiểm tra và trả về kết quả
//         if (result.recordset.length > 0) {
//             res.json(result.recordset);
//         } else {
//             res.status(404).send('Question not found');
//         }
//     } catch (err) {
//         console.error('Database connection error', err);
//         res.status(500).send('Server error');
//     }
// });
//postgress
app.get('/api/question/:code', async (req, res) => {
    try {
        // Kết nối database
        pool.connect(function(err, client, done){
            if(err){
                return console.error('Error fetching client from Pool', err);                
            }
            const questionCode = req.params.code;
            const query = `CALL getquestionbycode($1, $2, $3, $4, $5, $6, $7);`;
            // Tạo một đối tượng Request mới
            client.query(query, [questionCode, null, null, null, null, null, null], function(err, result){
                done();
                if(err){
                    return console.error('Error running query', err);
                }
                // Kiểm tra và trả về kết quả
                if (result.rows.length > 0 && result.rows[0].question_id != null) {
                    res.json(result.rows);
                } else {
                    res.status(404).send('Question not found');
                }
            });                        
        });
        
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).send('Server error');
    }
});
app.post('/api/answers',async(req, res)=>{
    
    try{
        pool.connect(function(err, client, done){
            if (err){
                return console.error('Error fetching client from pool', err);
            }
            const {questionCode, answers}= req.body;
            const query = `CALL checkanswerbyquestioncode($1, $2, $3);`;                
            client.query(query, [questionCode, answers, null], function (err, result){
                done();
                if(err){
                    return console.error('Error running query', err);
                }
                if (result.rows.length > 0 && result.rows[0].question_grade!= null) {
                    res.json(result.rows[0].question_grade);
                }else{
                    res.json('Answer incorrect');
                }
            });
        });
        
        
    }catch (err) {
        console.error('Database connection error', err);
        res.status(500).send('Server error');
    }
})
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});
