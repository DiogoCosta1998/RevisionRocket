class Subject {
    constructor(subjectName, qualificationLevel, topics) {
        this.subjectName = subjectName;
        this.qualificationLevel = qualificationLevel;
        this.topics = topics;
    }
}

class Topic {
    constructor(topicName, desc) {
        this.topicName = topicName;
        this.topicDesc = desc;
    }
}

class Question {
    constructor(questionText, optionA, optionB, optionC, optionD, correctOption, correctReasonText) {
        this.questionText = questionText;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption;
        this.correctReasonText;
    }
}