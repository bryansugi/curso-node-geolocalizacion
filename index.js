require('dotenv').config()
require('colors')

const { leerInput, inquirerMenu, pausa, listadoLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');



const main = async() => {

    let opt;

    const busquedas = new Busquedas()

    do {
        opt = await inquirerMenu()

        switch (opt) {
            case 1:
                //mostrar mensaje
                const ciudad = await leerInput('Ciudad: ')

                //vamos hacer la peticion http para consumir el apis
                const lugares = await busquedas.ciudad(ciudad)

                //vamos a seleccionar el lugar
                const id = await listadoLugares(lugares)

                if (id === '0') continue

                const lugarSel = lugares.find(l => l.id === id)

                busquedas.agregarHistorial(lugarSel.nombre)

                //vamos a seleccionar el clima
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng)
                const { temp, desc, min, max } = clima

                console.log('\nInformacion de la ciudad\n'.green)
                console.log('Ciudad:', lugarSel.nombre.green)
                console.log('Lat:', lugarSel.lat)
                console.log('Lng:', lugarSel.lng)
                console.log('Temperatura:', temp)
                console.log('Minima:', min)
                console.log('Maxima:', max)
                console.log('Ambiente:', desc.green)

                break;
            case 2:

                busquedas.leerDB()
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i+1}`.green
                    console.log(`${idx} ${lugar}`)
                })
                break;
        }

        if (opt !== 0) await pausa();

    } while (opt !== 0)
}

main();