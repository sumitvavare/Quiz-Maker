const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).send('Test Server is Working Perfectly!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
