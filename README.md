# Cache Weather App

## Descripción

Esta es una aplicación que obtiene información meteorológica de una ciudad utilizando la API de [wttr.in](https://wttr.in/), y utiliza **Redis** para almacenar en caché los resultados de las consultas, evitando llamadas repetitivas a la API externa.

## Tecnologías

- **Node.js** (para la creación del servidor)
- **Express** (para el servidor HTTP)
- **Redis** (para el almacenamiento en caché)
- **Axios** (para realizar solicitudes HTTP)
- **Docker** (para la contenerización de la aplicación)

## Requisitos previos

Antes de ejecutar la aplicación, asegúrate de tener lo siguiente instalado:

- [Docker](https://www.docker.com/get-started) (si deseas ejecutar la aplicación en contenedores)
- [Node.js](https://nodejs.org/) (si deseas ejecutar la aplicación de forma local sin Docker)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/cache-weather-app.git
cd cache-weather-app

