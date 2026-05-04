const express = require('express');
const cors = require('cors');
const mfRoutes = require('./routes/mf');
const cbsRoutes = require('./routes/cbs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/mf', mfRoutes);
app.use('/api/cbs', cbsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
