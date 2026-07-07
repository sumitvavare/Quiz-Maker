const express = require('express');
const fs = require('fs'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json()); 

app.post('/api/save-test', (req, res) => {
    const newTest = req.body; 
    newTest.id = Date.now(); 
    let allTests = [];
    if (fs.existsSync('database.json')) {
        const existingData = fs.readFileSync('database.json', 'utf8');
        allTests = JSON.parse(existingData);
    }
    allTests.push(newTest);
    fs.writeFileSync('database.json', JSON.stringify(allTests, null, 2));
    console.log(`Test "${newTest.title}" saved successfully!`);
    res.json({ message: "Test permanently saved to the database!" });
});

app.get('/api/get-tests', (req, res) => {
    if (fs.existsSync('database.json')) {
        const existingData = fs.readFileSync('database.json', 'utf8');
        res.json(JSON.parse(existingData));
    } else {
        res.json([]);
    }
});

app.delete('/api/delete-test/:id', (req, res) => {
    const testId = parseInt(req.params.id); 
    if (fs.existsSync('database.json')) {
        const existingData = fs.readFileSync('database.json', 'utf8');
        let tests = JSON.parse(existingData);
        const updatedTests = tests.filter(test => test.id !== testId);
        fs.writeFileSync('database.json', JSON.stringify(updatedTests, null, 2));
        console.log(`Test ID ${testId} was deleted.`);
        res.json({ message: "Test deleted successfully!" });
    } else {
        res.json({ message: "No database found." });
    }
});

app.post('/api/save-score', (req, res) => {
    const scoreData = req.body;
    scoreData.id = Date.now(); 
    let scores = [];
    if (fs.existsSync('scores.json')) {
        const existingScores = fs.readFileSync('scores.json', 'utf8');
        scores = JSON.parse(existingScores);
    }
    scores.push(scoreData);
    fs.writeFileSync('scores.json', JSON.stringify(scores, null, 2));
    console.log(`${scoreData.studentName} just scored ${scoreData.percentage}%`);
    res.json({ message: "Score saved to database!" });
});

app.get('/api/get-scores', (req, res) => {
    if (fs.existsSync('scores.json')) {
        const scores = fs.readFileSync('scores.json', 'utf8');
        res.send(scores);
    } else {
        res.json([]);
    }
});

app.delete('/api/delete-score/:id', (req, res) => {
    const scoreId = parseInt(req.params.id); 
    if (fs.existsSync('scores.json')) {
        const existingScores = fs.readFileSync('scores.json', 'utf8');
        let scores = JSON.parse(existingScores);
        const updatedScores = scores.filter(s => s.id !== scoreId);
        fs.writeFileSync('scores.json', JSON.stringify(updatedScores, null, 2));
        res.json({ message: "Score deleted successfully!" });
    } else {
        res.json({ message: "No score database found." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
