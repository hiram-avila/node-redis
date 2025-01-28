import express from 'express'; // Importar Express
import Redis from 'ioredis'; // Importar ioredis para conectarse a Redis
import axios from 'axios'; // Importar Axios para realizar solicitudes HTTP

const app = express();
const PORT = 3000;

// Conexión a Redis (usando ioredis)
const redis = new Redis({
    host: 'redis-server', // Nombre del contenedor de Redis si estás usando Docker
    port: 6379,           // Puerto de Redis
});

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
        if (error.response) {
            // Si la API responde con un código de error
            console.error('Error de la API:', error.response.status, error.response.data);
        } else if (error.request) {
            // Si no se recibe respuesta de la API
            console.error('No se recibió respuesta de la API:', error.request);
        } else {
            // Otros errores
            console.error('Error en la solicitud:', error.message);
        }
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
