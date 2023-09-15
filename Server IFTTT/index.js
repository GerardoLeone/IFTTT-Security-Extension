const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors({
  origin: 'https://ifttt.com', // Sostituisci con l'origine consentita
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.get('/error', (req, res) => {
  res.send('Ci sono problemi in questa regola perchè i parametri non sono sicuri e dovresti risolvere.');
});  

app.get('/success', (req, res) => {
    res.send('Ok.');
  });    

app.listen(port, () => {
  console.log(`Il server è in ascolto sulla porta ${port}`);
});
