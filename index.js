import express from 'express'; // Importar Express
import Redis from 'ioredis'; // Importar ioredis para conectarse a Redis
import axios from 'axios'; // Importar Axios para realizar solicitudes HTTP

const app = express();
const PORT = 3000;

// Conexión a Redis
const redis = new Redis(); // Asegúrate de que Redis esté corriendo en localhost y puerto 6379

// Función para obtener el clima desde la API de wttr.in
async function getWeather(city) {
    const url = `https://wttr.in/${city}?format=j1`; // Endpoint de JSON

    try {
        const response = await axios.get(url); // Realizar la solicitud con Axios
        const data = response.data;

        // Extraer y estructurar la información relevante
        const weatherData = {
            city: city,
            temperature: `${data.current_condition[0].temp_C}°C`,
            condition: data.current_condition[0].weatherDesc[0].value,
            humidity: `${data.current_condition[0].humidity}%`,
            wind: `${data.current_condition[0].windspeedKmph} km/h`,
        };

        return weatherData; // Devolver la información estructurada
    } catch (error) {
        throw new Error('Error al obtener datos de la API externa');
    }
}

// Función para obtener datos de Redis
async function getFromCache(key) {
    return await redis.get(key); // Obtener datos desde Redis
}

// Función para guardar datos en Redis
async function setInCache(key, value, expirationInSeconds) {
    return await redis.set(key, JSON.stringify(value), 'EX', expirationInSeconds); // Guardar en Redis con expiración
}

// Middleware para manejar solicitudes JSON
app.use(express.json());

// Ruta para obtener el clima
app.get('/weather/:city', async (req, res) => {
    const city = req.params.city.toLowerCase(); // Convertir a minúsculas
    const cacheKey = `weather:${city}`; // Crear clave para la caché

    try {
        // Verificar si hay datos en caché
        const cachedData = await getFromCache(cacheKey);
        if (cachedData) {
            console.log('Cache Hit: Recuperando datos desde Redis');
            return res.json(JSON.parse(cachedData)); // Enviar datos desde la caché
        }

        console.log('Cache Miss: Consultando API externa');
        const weatherData = await getWeather(city); // Consultar API externa

        // Guardar datos en Redis con expiración de 1 hora
        await setInCache(cacheKey, weatherData, 3600);

        res.json(weatherData); // Enviar datos al cliente
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
