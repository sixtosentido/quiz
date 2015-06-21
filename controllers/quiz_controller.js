var models = require('../models/models.js');

//Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req,res,next,quizId){
	models.Quiz.find(quizId).then(
		function(quiz){
			if(quiz){
				req.quiz=quiz;
				next();
			} else {next(new Error('No existe el quizId: '+quizId));}
		}
	).catch (function(error){next(error);});
};

// GET /quizes/:quizId(\\d+)
exports.show = function (req,res){
		res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// GET /quizes/:quizId(\\d+)/answer
exports.answer = function (req,res){
	var resultado = 'Incorrecto';
	if(req.query.respuesta === req.quiz.respuesta){
		resultado = 'Correcto';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes
exports.index = function (req,res){
	var search = '%';
	if (req.query.search){
		search = '%'+req.query.search+'%';
		search = search.trim().replace(/\s/g,'%');
	}

	models.Quiz.findAll({
		where: ["upper(pregunta) like ?", search.toUpperCase()],
		order: "pregunta ASC"
	}).then(function(quizes){
		res.render('quizes/index.ejs', {quizes: quizes, errors: []});
	}).catch (function(error){next(error);});
};

// GET /quizes/author
exports.author = function (req,res){
	res.render('quizes/author', {errors: []});
};

// GET /quizes/new
exports.new = function (req,res){
	var quiz = models.Quiz.build(
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function (req,res){
	var quiz = models.Quiz.build(req.body.quiz);

	quiz.validate().then(function(err){
		if(err){
			res.render('quizes/new', {quiz: quiz, errors: err.errors});
		} else {
			quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
				res.redirect('/quizes');
			});
		}
	});
};