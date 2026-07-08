async function verifyAndStartTest() {
    const nameInput = document.getElementById('student-name-input').value.trim();
    const errorElement = document.getElementById('error-message');

    // 1. Prevent empty names
    if (!nameInput) {
        errorElement.textContent = "Please enter your name to continue.";
        return;
    }

    const startBtn = document.getElementById('start-test-btn');
    startBtn.innerText = "Checking...";
    startBtn.disabled = true;

    try {
        // 2. Fetch scores and check for duplicates
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

        // 3. Success! Hide the popup
        errorElement.textContent = "";
        document.getElementById('name-modal').style.display = 'none';
        
        // 4. Reveal the main quiz container
        document.getElementById('main-quiz-ui').style.display = 'block';
        
        // 5. Update the "Anonymous Student" text (Make sure to add this ID to your HTML later!)
        const nameDisplay = document.getElementById('student-name-display');
        if (nameDisplay) {
            nameDisplay.innerText = `Student: ${nameInput}`;
        }
        
        console.log(`Starting test for ${nameInput}`);

        // IMPORTANT: Call your function that actually loads the questions here
        // startQuiz(nameInput); 

    } catch (error) {
        console.error("Database error:", error);
        errorElement.textContent = "Failed to connect to the server. Please try again.";
        startBtn.innerText = "Start Test";
        startBtn.disabled = false;
    }
}
