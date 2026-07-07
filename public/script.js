// --- SECTION 1: CREATING QUESTIONS ---
const addQuestionBtn = document.getElementById('addQuestionBtn');
const questionsContainer = document.getElementById('questionsContainer');
let questionCount = 1;

addQuestionBtn.addEventListener('click', function() {
    questionCount++;
    const newQuestion = document.createElement('div');
    newQuestion.className = 'question-box';
    newQuestion.innerHTML = `
        <h3>Question ${questionCount}</h3>
        <input type="text" class="questionText" placeholder="Type your question here...">
        <div class="options">
            <input type="text" placeholder="Option A">
            <input type="text" placeholder="Option B">
            <input type="text" placeholder="Option C">
            <input type="text" placeholder="Option D">
            <div style="margin-top: 15px; font-weight: bold;">
                <label>Which option is correct? </label>
                <select class="correctAnswer">
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                </select>
            </div>
        </div>
    `;
    questionsContainer.appendChild(newQuestion);
});

const saveTestBtn = document.getElementById('saveTestBtn');
saveTestBtn.addEventListener('click', async function() {
    const title = document.getElementById('testTitle').value;
    const timeLimit = document.getElementById('timeLimit').value; 
    const questionBoxes = document.querySelectorAll('.question-box');
    let questionsArray = [];

    if (!timeLimit) {
        alert("Please enter a time limit for the test.");
        return;
    }

    questionBoxes.forEach((box) => {
        const questionText = box.querySelector('.questionText').value;
        const optionInputs = box.querySelectorAll('.options input');
        const correctAns = box.querySelector('.correctAnswer').value;
        questionsArray.push({
            question: questionText,
            options: [ optionInputs[0].value, optionInputs[1].value, optionInputs[2].value, optionInputs[3].value ],
            correctAnswer: correctAns
        });
    });

    const testPayload = { title: title, timeLimit: parseInt(timeLimit), questions: questionsArray };

    const response = await fetch('/api/save-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
    });

    const serverReply = await response.json();
    alert(serverReply.message);
    loadActiveTests();
});

// --- SECTION 2: MANAGING & DELETING TESTS ---
async function loadActiveTests() {
    const container = document.getElementById('manageTestsContainer');
    const response = await fetch('/api/get-tests');
    const tests = await response.json();
    
    container.innerHTML = '';
    if (tests.length === 0) {
        container.innerHTML = '<p>No active tests. Create one above!</p>';
        return;
    }
    
    tests.forEach(test => {
        const box = document.createElement('div');
        box.style = "display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-left: 4px solid #dc3545;";
        box.innerHTML = `
            <div>
                <h3 style="margin: 0 0 5px 0;">${test.title}</h3>
                <span style="font-size: 14px; color: #666;">ID: ${test.id} | ${test.questions.length} Questions</span>
            </div>
            <button onclick="deleteTest(${test.id})" style="background-color: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Delete</button>
        `;
        container.appendChild(box);
    });
}

async function deleteTest(id) {
    const isConfirmed = confirm("Are you sure you want to delete this test? This cannot be undone.");
    if (!isConfirmed) return;
    const response = await fetch(`/api/delete-test/${id}`, { method: 'DELETE' });
    const result = await response.json();
    alert(result.message);
    loadActiveTests();
}

loadActiveTests();

// --- SECTION 3: VIEWING & DELETING STUDENT SCORES ---
async function loadScores() {
    const container = document.getElementById('scoresContainer');
    container.innerHTML = '<p>Fetching records from database...</p>';
    
    const response = await fetch('/api/get-scores');
    const scores = await response.json();
    
    if (scores.length === 0) {
        container.innerHTML = '<p>No students have taken a test yet.</p>';
        return;
    }
    
    // UPDATED: Added an "Action" column for our delete button
    let html = `
        <table style="width: 100%; text-align: left; border-collapse: collapse;">
            <tr style="background: #f4f7f6; border-bottom: 2px solid #ccc;">
                <th style="padding: 10px;">Student Name</th>
                <th style="padding: 10px;">Test Title</th>
                <th style="padding: 10px;">Score</th>
                <th style="padding: 10px;">Percentage</th>
                <th style="padding: 10px;">Action</th>
            </tr>
    `;
    
    scores.forEach(s => {
        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${s.studentName}</td>
                <td style="padding: 10px;">${s.testTitle}</td>
                <td style="padding: 10px; font-weight: bold;">${s.score} / ${s.total}</td>
                <td style="padding: 10px;">${s.percentage}%</td>
                <td style="padding: 10px;">
                    ${s.id ? `<button onclick="deleteScore(${s.id})" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>` : `<span style="font-size: 12px; color: #999;">Old Record</span>`}
                </td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

// Attach the load function to the button
document.getElementById('loadScoresBtn').addEventListener('click', loadScores);

// NEW: Delete Score Function
async function deleteScore(id) {
    const isConfirmed = confirm("Delete this student's score?");
    if (!isConfirmed) return;
    
    const response = await fetch(`/api/delete-score/${id}`, { method: 'DELETE' });
    await response.json(); // We don't really need an alert for this, it's smoother without one
    
    loadScores(); // Instantly refresh the table
}