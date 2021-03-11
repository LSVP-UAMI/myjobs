var blessed = require('blessed')
    , contrib = require('blessed-contrib')
    , table = require('./tabla.js')
    , line = require('./cpuline.js')
    , rline = require('./ramline.js')
    , itable = require('./inftable.js')
    , meow = require('meow')

const SLURMDB = process.env.ES_SLURM_DB
    , TGDB = process.env.TELEGRAF_DB


setup().catch(console.log)

async function setup() {
    const cli = meow(`
myjobs muestra el uso de recursos (CPU,RAM,SWAP) 
de los jobs ejecutados en el cluster.
Usage
    $ myjobs [-g|--group][(-d|--days) n]

Options
    --help, -h      Mostrar este mensaje de ayuda.
    --days n, -d n  El programa mostrara los datos de los ultimos n dias 
                    (por defecto n=30). 
    --group, -g     Mostrar los jobs del grupo (solo para investigadores).

Examples
    $ myjobs -g
    $ myjobs -d 10
`, {
        flags: {
            group: {
                type: 'boolean',
                default: false,
                alias: 'g'
            },
            days:{
                type:'number',
                alias:'d',
                default: 30,
                isMultiple: false
            }
        }
    });

    if(Number.isNaN(cli.flags.days)){ cli.flags.days=30}

    if (cli.flags.help){
        cli.showHelp()
        process.exit()
    }

    if(typeof SLURMDB=='undefined' || SLURMDB == null){
    	console.log("ERROR: No hay base de datos de SLURM establecida.")
	return process.exit()
    }
    if(typeof TGDB=='undefined' || TGDB == null){
    	console.log("ERROR: No hay base de datos de telegraf establecida.")
	return process.exit()
    }
    var screen = blessed.screen()
    screen.key(['escape', 'q', 'C-c'], function (ch, key) {
        return process.exit(0);
    });   

    var grid = new contrib.grid({ rows: 7, cols: 5, screen: screen })

    var jobsTable = grid.set(0, 0, 7, 2, contrib.table, {
        keys: true
        , vi: true
        , fg: 'white'
        , selectedFg: 'white'
        , selectedBg: 'blue'
        , interactive: true
        , label: cli.input[0] + ' MyJobs'
        , width: '100%'
        , height: '100%'
        , border: { type: "line", fg: "cyan" }
        , columnSpacing: 5 //in chars
        , columnWidth: [8, 15, 20] /*in chars*/
    });

    var infoTable = grid.set(0, 2, 1, 3, contrib.table, {
        fg: 'white'
        , selectedFg: 'white'
        , selectedBg: 'blue'
        , interactive: true
        , label: 'Info'
        , width: '100%'
        , height: '100%'
        , border: { type: "line", fg: "cyan" }
        , columnSpacing: 5 //in chars
        , columnWidth: [8, 10, 10, 5, 10, 8, 8] /*in chars*/
    })

    var cpuLine = grid.set(1, 2, 3, 3, contrib.line, {
        style:
        {
            line: "yellow"
            , text: "green"
            , baseline: "green"
        }
        , height: '100%'
        , showLegend: true
        , xLabelPadding: 3
        , xPadding: 5
        , showLegend: true
        , wholeNumbersOnly: false
        , label: 'Promedio %CPU'
    });

    var ramLine = grid.set(4, 2, 3, 3, contrib.line, {
        style:
        {
            line: "yellow"
            , text: "green"
            , baseline: "green"
        }
        , height: '100%'
        , showLegend: true
        , xLabelPadding: 3
        , xPadding: 5
        , showLegend: true
        , wholeNumbersOnly: false
        , label: 'Promedio %Ram'
    });


    await jobsTable.rows.on('select', async function (item, index) {
        if (index > 0) {
            await line.setData(cpuLine, table.data[index - 1])
            await rline.setData(ramLine, table.data[index - 1])
            await itable.setData(infoTable, table.data[index - 1])
            screen.render()
        }
    });


    await table.setup(jobsTable, cli.input[0], cli.flags.group, cli.flags.days);
    
    screen.on('resize', function () {
        ramLine.emit('attach');
        cpuLine.emit('attach')
    });
    jobsTable.focus()

    blessed.text({
        parent:screen,
        left:3,
        bottom:0,
        content:'Esc, q, Ctr-c para salir.',
    })

    screen.render()
}
