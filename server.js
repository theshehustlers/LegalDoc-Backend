import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000 || process.env.PORT;

app.get('/', (req, res) => {
  res.send('Legal Document Analyzer API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});