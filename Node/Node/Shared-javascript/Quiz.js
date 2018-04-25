function Quiz(id,title, description){
    this.id = id;
    this.title = title;
    this.description = description;
    this.questions = [];
    this.imgUrl = ""
}

Quiz.prototype.addQuestion = function (question) {
    this.questions.push(question);
};

Quiz.prototype.getQuestion = function (index) {
    return this.questions[index];
};

function Question(question, answer1, answer2, answer3, answer4){
    this.question = question;
    this.answer1 = answer1;
    this.answer2 = answer2;
    this.answer3 = answer3;
    this.answer4 = answer4;
}
if(typeof window !== 'object')
    module.exports = {"Quiz": Quiz, "Question": Question};