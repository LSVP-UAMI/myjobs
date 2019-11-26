exports.setData = async function (tabla, job) {
    //console.error(job)
    tabla.setData({
        headers: ['ID', 'Job', 'Horas CPU', 'Nodos', 'Estado', 'Submit', 'Start']
        , data: [[job.id, job.name.substring(0, 10), job.cpuhrs, job.nodesArr.length - 1, job.state, job.submit, job.shortStart]]
    })
}