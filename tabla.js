var fs = require('fs');
exports.data = [];

const SLURMDB = process.env.ES_SLURM_DB
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://'+SLURMDB })

let query = JSON.parse(fs.readFileSync('query.json'))
var now = new Date().getTime()
var mbefore = now - 2592000000

exports.setup = async function (tabla, user, group) {
    headers = ['JOBID', 'USUARIO', 'JOB']
    if (user != undefined)
        if (group) {
            query.query.bool.must = [{ term: { "groupname.keyword": user } }]
        } else {
            query.query.bool.must = [{ term: { "username.keyword": user } }]
            headers = ['JOBID', 'JOB']
        }
    query.query.bool.filter[0].range = {
        "@start": {
            "gte": mbefore,
            "lte": now,
            "format": "epoch_millis"
        }
    }
    tabla.focus()

    tabla.setData({
        headers: headers
        , data: await getData(user, group)
    })
}

async function getData(user, group) {
    const { body } = await client.search({
        index: 'slurm',
        type: 'jobcomp',
        body: query
    })
    if (body.status == 400) {
        console.log(body.error)
    }
    var rows = []
    rows.push(["Total", body.aggregations.total_cpu.value.toFixed(2) + "hrsCpu", body.hits.total + " jobs"])
    for (let hit of body.hits.hits) {
        var src = hit._source;
        var str = new Date(src["@start"])
        var end = new Date(src["@end"])
        var start = new Date(src["@start"] + "z")
        var submit = new Date(src["@submit"] + "z")
        if (end.getTime() - str.getTime() < 60000) {
            end = new Date(end.getTime() + 60000)
        }
        var job = {
            id: src.jobid.toString(),
            name: src.job_name.toString(),
            startLocal: start,
            start: dateString(str),
            submit: shortDate(submit),
            shortStart: shortDate(start),
            end: dateString(end),
            nodes: src.nodes.toString(),
            nodesArr: nodesArray(src.nodes.toString()),
            cpuhrs: src.cpu_hours.toFixed(4),
            elapsed: src.elapsed,
            state: src.state.toString()
        }
        exports.data.push(job)
        if (user == undefined || group)
            var r = [src.jobid, src.username, src.job_name]
        else
            var r = [src.jobid, src.job_name]
        rows.push(r)
    }
    return rows
}

function dateString(d) {
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}_${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`
}

function shortDate(date) {
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`
}

function nodesArray(n) {
    var nods = []
    if (n != "(null)") {
        if (n.includes("[")) {
            nods.push(n.slice(0, 2))
            nnumb = n.slice(3, n.length - 1)
            numbspl = nnumb.split(",")
            for (var j = 0; j < numbspl.length; j++) {
                num = numbspl[j]
                if (num.includes("-")) {
                    spl = num.split("-")
                    min = parseInt(spl[0])
                    max = parseInt(spl[1])
                    for (var i = min; i <= max; i++) {
                        nods.push(i.toString())
                    }
                } else {
                    nods.push(num)
                }
            }
        } else {
            return [n.substring(0, 2), n.substring(2)]
        }
    }
    return nods
}
