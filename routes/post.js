const validUrl = require('valid-url')
const urlExist = require('url-exist')
const database = require('../db/database')

exports.insert = async (req, res, baseUrl) => {
    const userUrl = req.body.data.value
    if(validUrl.isUri(userUrl)){
        var test = await urlExist(userUrl)
        if(!test){
            res.status(404).json({message: `${userUrl} non risulta essere un link attivo.`})
        }else{
            var check = 'SELECT * FROM urls WHERE longurl = ?'
            database.get(check, [userUrl], function(err, result) {
                if(err){
                    console.error(err.message)
                }
                if(result){
                    res.status(409).json({
                        message: `Questo link risulta già trasformato in seguente url <a target='_blank' href='${baseUrl + result.id}'>${baseUrl + result.id}</a>`
                    })
                }else{
                    var data = {
                        longurl: userUrl,
                        clicks: 0
                    }
                    var sql = 'INSERT INTO urls (longurl, clicks) Values (?,?)'
                    var params = [data.longurl, data.clicks]
                    database.run(sql, params, function(err, result) {
                        if(err){
                            res.status(400).json({message: err.message})
                        }
                        res.status(201).json({
                            message: `<a target='_blank' href=${baseUrl + this.lastID}>${baseUrl + this.lastID}</a>`
                        })
                    })
                }
            })
        }
    }else{
        res.status(422).json({message: `Inserire una Url valida, ${userUrl} non è un formato corretto.`})
    }
}

