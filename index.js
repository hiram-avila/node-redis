import express from 'express'; // Importar Express
import { getWeather } from './weatherAPI.js'; // Importar la función getWeather desde weatherAPI.js
import { connectRedis, getFromCache, setInCache } from './cache.js'; // Importar funciones de cache.js

const app = express();
const PORT = 3000;

// Conectar a Redis
connectRedis();

// Middleware para manejar solicitudes
app.use(express.json());

// Ruta para obtener información meteorológica
app.get('/weather/:city', async (req, res) => {
    const city = req.params.city.toLowerCase(); // Convertir a minúsculas
    const cacheKey = `weather:${city}`; // Crear la clave para la caché

    try {
        // Verificar si el dato está en caché
        const cachedData = await getFromCache(cacheKey);
        if (cachedData) {
            console.log('Cache Hit: Recuperando datos desde Redis');
            return res.json(JSON.parse(cachedData)); // Devolver los datos almacenados
        }

        console.log('Cache Miss: Consultando API externa');
        const weatherData = await getWeather(city); // Consultar API externa

        // Guardar los datos en Redis con expiración de 1 hora
        await setInCache(cacheKey, weatherData, 3600); // Expira en 1 hora
        res.json(weatherData); // Enviar los datos al cliente
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
