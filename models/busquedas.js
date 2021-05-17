const fs = require('fs')
const axios = require('axios')

class Busquedas {

    historial = [];
    dbPath = './db/database.json'

    constructor() {
        //Todo: leer DB si existe
        this.leerDB()
    }

    get historialCapitalizado() {

        //capitalizar cada palabra
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ')
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1))

            return palabras.join(' ')
        })
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWet() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad(lugar = '') {

        try {

            //peticion http
            //const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/Ibagu%C3%A9%2C%20Tolima%2C%20Colombia.json?access_token=pk.eyJ1IjoiYnJ5YW5zdWdpIiwiYSI6ImNrb3NyaGtnNTAzcnYzMm5wYTBwODVkNWYifQ.LkaNig46vuYXCX1bX1jT4w&limit=5&language=es')
            const instancia = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            })

            const resp = await instancia.get()
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))


        } catch (error) {
            return []; // retornar los lugarres que coincidan

        }
    }

    async climaLugar(lat, lon) {

        try {

            //instancia axios
            const instancia = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWet, lat, lon }
            })

            //resp.data
            const resp = await instancia.get()
            const { weather, main } = resp.data;

            return {

                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp

            }

        } catch (error) {
            console.log(error)
        }

    }

    agregarHistorial(lugar = '') {
        // Todo: prevenir duplicados

        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }
        this.historial.unshift(lugar.toLocaleLowerCase())

        //grabarDB
        this.guardarDB()
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    leerDB() {
        //validar si existe
        if (!fs.existsSync(this.dbPath)) {
            return null
        }

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' })
        const data = JSON.parse(info)

        this.historial = data.historial

    }

}

module.exports = Busquedas