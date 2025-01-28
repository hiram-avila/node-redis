import express from 'express'; // Importar Express

const app = express();
const PORT = 3000;


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
