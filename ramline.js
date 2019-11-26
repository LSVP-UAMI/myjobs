const axios = require('axios')
color = ['yellow', 'green', 'blue']

exports.setData = async function (line, job) {
    //console.error(job.cpuhrs)
    //console.error(job.nodesArr)
    if (parseFloat(job.cpuhrs) > 0) {
        var template = `http://148.206.50.80:32785/render?target=aliasByNode(scale(telegraf.${nodes(job.nodesArr)}.system.memUsed, ${scale(job.nodesArr)}), 1)&from=${job.start}&until=${job.end}&format=json&maxDataPoints=100`
        var tmpl2 = `http://148.206.50.80:32785/render?target=aliasByNode(scale(telegraf.${nodes(job.nodesArr)}.system.memUsedSwap, 0.000011921), 1)&from=${job.start}&until=${job.end}&format=json&maxDataPoints=100`
        var resram = await axios({ url: template, method: "POST" }).catch((error) => {
            console.error(error)
        })
        sram = serie('Ram', 'yellow', job, resram)
        var resswap = await axios({ url: tmpl2, method: "POST" }).catch((error) => {
            console.error(error)
        })
        sswap = serie('Swap', 'red', job, resswap)
        line.setData([sram, sswap])
    } else {
        line.setData([{
            title: "No Data",
            x: [],
            y: [],
        }])
        //console.error(job.name, "not completed")
    }
}

function serie(name, color, job, res) {
    var s = {
        title: name,
        x: [],
        y: [],
        style: {
            line: color
        }
    }
    start = new Date(job.startLocal)
    first = res.data[0]
    for (var j = 0; j < first.datapoints.length; j++) {
        time = new Date(start.getTime() + (first.datapoints[j][1] - first.datapoints[0][1]) * 1000)
        s.x.push(`${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`)
        s.y.push(0.0)
    }
    for (var i = 0; i < res.data.length; i++) {
        nodo = res.data[i]
        fillData(nodo.datapoints)
        //console.error(nodo)
        for (var j = 0; j < nodo.datapoints.length; j++) {
            p = nodo.datapoints[j]
            if (p[0] != null) {
                s.y[j] += parseFloat(p[0])
            }
        }
    }
    if (s.x.length == 1) {
        s.y.push(s.y[0])
        s.x.push(s.x[0])
    }
    for (let i = 0; i < s.y.length; i++) {
        s.y[i] /= (job.nodesArr.length - 1)
    }
    return s
}

function nodes(n) {
    var nods = "{"
    if (n.length == 2) {
        return n[0] + n[1]
    } else if (n.length > 2) {
        for (let i = 1; i < n.length; i++) {
            nods += n[0] + n[i]
            if (i < n.length - 1) {
                nods += ","
            }
        }
        nods += "}"
    }
    return nods
}

function scale(n) {
    if (n.length > 1 && n[0] == "tt") {
        if (parseInt(n[1]) > 58) {
            return 4e-7
        } else {
            return 8e-7
        }
    }
    return 0.00000161
}

function fillData(dp) {
    i = -1;
    for (var j = 0; j < dp.length; j++) {
        if (dp[j][0] != null) {
            if (i == -1 && j > 0) {
                for (var k = i + 1; k < j; k++) {
                    dp[k][0] = dp[j][0];
                }
            } else if (i < j - 1) {
                var inc = (dp[j][0] - dp[i][0]) / (j - i)
                for (var k = i + 1; k < j; k++) {
                    dp[k][0] = dp[k - 1][0] + inc
                }
            }
            i = j;
        } else if (j == dp.length - 1 && i >= 0) {
            for (var k = i + 1; k < dp.length; k++) {
                dp[k][0] = dp[i][0]
            }
        }
    }
}