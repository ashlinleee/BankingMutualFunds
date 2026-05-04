const express = require('express');
const cors = require('cors');
const mfRoutes = require('./routes/mf');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/mf', mfRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
