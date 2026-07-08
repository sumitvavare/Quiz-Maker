let globalTests = []; 
let currentActiveTest = null;
let currentStudentName = ""; 
let timerInterval; 

// NEW: A variable to track which question the student is currently looking at
let currentQuestionIndex = 0; 

async function loadTests() {
    const testsContainer = document.getElementById('testsContainer');
    const response = await fetch('/api/get-tests');
    globalTests = await response.json(); 
    testsContainer.innerHTML = '';
    
    if (globalTests.length === 0) {
        testsContainer.innerHTML = '<p>No tests are currently available.</p>';
        return;
    }
    
    globalTests.forEach((test) => {
        const testBox = document.createElement('div');
        testBox.className = 'question-box';
        
        const timeText = test.timeLimit ? `${test.timeLimit} minutes` : 'No time limit';
        
        testBox.innerHTML = `
            <h3>${test.title}</h3>
            <p>Contains ${test.questions.length} questions | <strong>Time: ${timeText}</strong></p>
            <button onclick="startTest(${test.id})">Start Test</button>
        `;
        testsContainer.appendChild(testBox);
    });
}

function startTest(testId) {
    currentStudentName = prompt("Please enter your full name to begin:") || "Anonymous Student";
    currentActiveTest = globalTests.find(t => t.id === testId);
    
    // Reset the question index to 0 every time a new test starts
    currentQuestionIndex = 0; 
    
    document.getElementById('testList').style.display = 'none';
    const activeContainer = document.getElementById('activeTestContainer');
    activeContainer.style.display = 'block';
    
    let testHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; margin-bottom: 20px; padding-bottom: 10px;">
            <h2 style="margin: 0;">${currentActiveTest.title}</h2>
            <h2 id="timerDisplay" style="margin: 0; color: #dc3545; font-family: monospace; font-size: 32px;">--:--</h2>
        </div>
        <p style="font-weight: bold;">Student: ${currentStudentName}</p>
    `;
    
    // Create all the questions, but set them to display: none initially
    currentActiveTest.questions.forEach((q, index) => {
        testHTML += `
            <div class="question-slide" id="slide-${index}" style="display: none;">
                <div class="question-box">
                    <h3 style="color: #666; font-size: 14px; margin-top: 0;">Question ${index + 1} of ${currentActiveTest.questions.length}</h3>
                    <h3>${q.question}</h3>
                    <div class="options">
                        <label><input type="radio" name="q${index}" value="A"> A) ${q.options[0]}</label><br><br>
                        <label><input type="radio" name="q${index}" value="B"> B) ${q.options[1]}</label><br><br>
                        <label><input type="radio" name="q${index}" value="C"> C) ${q.options[2]}</label><br><br>
                        <label><input type="radio" name="q${index}" value="D"> D) ${q.options[3]}</label>
                    </div>
                </div>
            </div>
        `;
    });

    // Add our new navigation buttons below the questions
    testHTML += `
        <div style="display: flex; justify-content: space-between; gap: 10px; margin-top: 20px;">
            <button id="prevBtn" onclick="changeQuestion(-1)" class="primary-btn" style="background-color: #6c757d;">Previous</button>
            <button id="nextBtn" onclick="changeQuestion(1)" class="primary-btn">Next Question</button>
            <button id="submitTestBtn" onclick="submitTest()" class="primary-btn" style="background-color: #28a745; display: none;">Submit Test</button>
        </div>
    `;

    activeContainer.innerHTML = testHTML;

    // Reveal the very first question!
    updateQuestionView();

    if (currentActiveTest.timeLimit) {
        startCountdown(currentActiveTest.timeLimit);
    }
}

// --- NEW PAGINATION LOGIC ---

function changeQuestion(direction) {
    // direction will be 1 (Next) or -1 (Previous)
    currentQuestionIndex += direction;
    updateQuestionView();
}

function updateQuestionView() {
    const totalQuestions = currentActiveTest.questions.length;

    // 1. Hide every single question slide
    const allSlides = document.querySelectorAll('.question-slide');
    allSlides.forEach(slide => slide.style.display = 'none');

    // 2. Reveal ONLY the slide that matches our current index
    document.getElementById(`slide-${currentQuestionIndex}`).style.display = 'block';

    // 3. Logic to hide/show the buttons depending on where we are
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitTestBtn');

    // Hide "Previous" button if we are on the very first question
    if (currentQuestionIndex === 0) {
        prevBtn.style.visibility = 'hidden'; // Keeps the layout from shifting
    } else {
        prevBtn.style.visibility = 'visible';
    }

    // Hide "Next" and show "Submit" if we are on the very last question
    if (currentQuestionIndex === totalQuestions - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// --- EXISTING CLOCK & SUBMIT LOGIC ---

function startCountdown(minutes) {
    let timeRemaining = minutes * 60; 
    const timerDisplay = document.getElementById('timerDisplay');

    timerInterval = setInterval(() => {
        const mins = Math.floor(timeRemaining / 60);
        let secs = timeRemaining % 60;
        if (secs < 10) secs = '0' + secs;

        timerDisplay.innerText = `${mins}:${secs}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert("Time is up! Submitting your test automatically.");
            submitTest(); 
        }
        timeRemaining--;
    }, 1000); 
}

async function submitTest() {
    clearInterval(timerInterval);

    let score = 0;
    let totalQuestions = currentActiveTest.questions.length;

    // The grader still works perfectly because it checks the hidden slides too!
    currentActiveTest.questions.forEach((q, index) => {
        const selectedRadio = document.querySelector(`input[name="q${index}"]:checked`);
        if (selectedRadio && selectedRadio.value === q.correctAnswer) {
            score++;
        }
    });

    const percentage = Math.round((score / totalQuestions) * 100);

    const scorePayload = {
        studentName: currentStudentName,
        testTitle: currentActiveTest.title,
        score: score,
        total: totalQuestions,
        percentage: percentage
    };

    await fetch('/api/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scorePayload)
    });

    document.getElementById('activeTestContainer').style.display = 'none';
    document.getElementById('scoreDisplay').innerText = `${score} / ${totalQuestions}`;
    document.getElementById('scoreMessage').innerText = `You scored ${percentage}%`;
    document.getElementById('resultsContainer').style.display = 'block';
}

loadTests();

async function verifyAndStartTest() {
    const nameInput = document.getElementById('student-name-input').value.trim();
    const errorElement = document.getElementById('error-message');

    if (!nameInput) {
        errorElement.textContent = "Please enter your name to continue.";
        return;
    }

    const startBtn = document.getElementById('start-test-btn');
    startBtn.innerText = "Checking...";
    startBtn.disabled = true;

    try {
        const response = await fetch('/api/get-scores');
        const existingScores = await response.json();

        const hasAlreadyTaken = existingScores.some(
            score => score.studentName.toLowerCase() === nameInput.toLowerCase()
        );

        if (hasAlreadyTaken) {
            errorElement.textContent = "A student with this name has already completed the test. Please use your full name.";
            startBtn.innerText = "Start Test";
            startBtn.disabled = false;
            return;
        }

        // If the name is new, hide the popup!
        errorElement.textContent = "";
        document.getElementById('name-modal').style.display = 'none';
        
        // ---> IMPORTANT: CALL YOUR ACTUAL START QUIZ FUNCTION HERE <---
        // For example, if your old start function was startQuiz(), uncomment the line below:
        // startQuiz(nameInput);
        
        console.log(`Starting test for ${nameInput}`);

    } catch (error) {
        console.error("Database error:", error);
        errorElement.textContent = "Failed to connect to the server. Please try again.";
        startBtn.innerText = "Start Test";
        startBtn.disabled = false;
    }
}
