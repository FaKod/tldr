var express = require('express');
var bodyParser = require('body-parser');
var Article = require('./db').Article;
var webshot = require('webshot');
var read = require('node-readability');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static('public'));

app.get('/articles', function (req, res, err) {
    Article.all(function (err, articles) {
        if (err) return next(err);
        res.send(articles);
    });
});

app.get('/articles/:id', function (req, res, next) {
    var id = req.params.id;
    Article.find(id, function (err, article) {
        if (err) return next(err);
        res.send(article);
    });
});

app.delete('/articles/:id', function (req, res, next) {
    var id = req.params.id;
    Article.delete(id, function (err) {
        if (err) return next(err);
        res.send({message: 'Deleted'});
    });
});

app.post('/articles', function (req, res, next) {
    var url = req.body.url;
    read(url, function (err, result) {


        Article.create(
            {title: result.title, content: result.content},
            function (err, article) {
                if (err) return next(err);
                res.send('OK');
            }
        );
    });
});

app.get('/image/:id', function (req, res, next) {
    var options = {
        screenSize: {
            width: 300,
            height: 300
        },
        siteType: 'html'
    };
    var id = req.params.id;
    Article.find(id, function (err, article) {
        if (err) return next(err);
        webshot(article.content, options).pipe(res);
    });
});

app.listen(process.env.PORT || 3000);

module.exports = app;
