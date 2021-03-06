$( document ).ready(function() {
    var userRole = $("#userRole").text();

    // DISABLE EXAM QUESTIONS TAB
    $("#subjectExamQuestionsTab").parent('li').addClass("disabled")
    $("#subjectExamQuestionsTab").removeAttr("data-toggle");


    // GLOBAL VARIABLES
    //var subjectSelected;
    //var qualificationLevelSelected;
    //var topicSelected;

    //var subjectSelectedObj;
    //var subjectQualificationTopicSelected;
    //var SUBJECT_QUALIFICATION_TOPIC_OBJS = [];
    //var SUBJECT_QUALIFICATION_TOPIC_SELECTED_OBJ;

    var subjectSelected;
    var SUBJECT_INFO = [];    // An array of information about subjects
                              // INFO: subject name, a topics including a descripton of it

    var TEACHER_INFO = [];
    var QUESTIONS = [];

    $("#revisionTabs").hide();
    $("#TeacherAreaTabs").hide();
    $("#backToFilterBtn").hide();
    //$("#quizAnswerModal").hide();

    filterUI();
    getSubjectInfo();

    function filterUI() {
        if ($("#userRole").text() == "Student") {
            $("#teachersAreaBtn").hide();
            $("#teachersLeagueBtn").hide();
            $("#studentsAreaBtn").show();
            document.getElementById("studentsAreaBtn").innerHTML = "<a href='#'>" + $("#userForename").text() + "'s Area</a>"
            $("#studentAreaStudentName").text($("#userForename").text() + " " + $("#userSurname").text());
            $("#studentModalDashboard p:contains(' example@lambeth-academy.org')").html("<span class='glyphicon glyphicon-envelope'></span> " + $("#userEmail").text());
        }

        if ($("#userRole").text() == "Teacher") {
            $("#studentsAreaBtn").hide();
            $("#teachersAreaBtn").show();

            $("#welcomeTeacherModalHeader").text("Welcome " + $("#userForename").text() + " " + $("#userSurname").text());
            var newText = $("#welcomeTeacherModalBody2").text().replace("TEACHER_NAME", $("#userForename").text() + " " + $("#userSurname").text());
            document.getElementById("welcomeTeacherModalBody2").innerHTML = newText;
            $('#welcomeTeacherModal').modal('show');
            getTeacherData();
        }

        // I.E. Diogo Costa is admin
        if ($("#userEmail").text() == "10dcosta@lambeth-academy.org") {
            // Becomes admin
            $("#teachersAreaBtn").show();
            $("#studentsAreaBtn").show();
            $("#teachersLeagueBtn").show();
            $("#userRole").text("Admin");
            userRole = $("#userRole").text();
            getTeacherData();
        }

        $('#profileImage').attr('title', "Click here to sign out " + $("#userForename").text() + " " + $("#userSurname").text() + " (" + $("#userEmail").text() +")");
        $('input[name="contactUsName"]').val($("#userForename").text() + " " + $("#userSurname").text());
        $('input[name="contactUsEmail"]').val($("#userEmail").text());

        $('input[name="contactUsName"]').prop('disabled', true);
        $('input[name="contactUsEmail"]').prop('disabled', true);
    }

    function getSubjectInfo() {
        $.post("/getSubjectInfo").done(function( data ) {
            var jsonData = JSON.parse(data);
            var currentSubject = jsonData[0].subject_name;
            var currentQualification = jsonData[0].qualification_level;

            var topics = [];
            for (var i = 1; i < jsonData.length; i++) {
                if (currentSubject != jsonData[i].subject_name || currentQualification != jsonData[i].qualification_level) {
                    currentSubject = jsonData[i].subject_name;
                    currentQualification = jsonData[i].qualification_level;
                    SUBJECT_INFO.push(new Subject(jsonData[i - 1].subject_name, jsonData[i - 1].qualification_level, topics));
                    topics = []; // clear array
                } else {
                    topics.push(new Topic(jsonData[i].topic_name, jsonData[i].topic_desc));
                }

                // For the last subject/qualification
                if (i == jsonData.length - 1) {
                    SUBJECT_INFO.push(new Subject(jsonData[i].subject_name, jsonData[i].qualification_level, topics));
                }
            }
        });
    }

    $('#subjectList li').unbind().click(function() {
        clearSubjectModal($(this).text());
        //populateQualificationDropdown(subjectSelectedObj);
    });

    $('[id^=revisionButton]').unbind().click(function() {
        var currentId = this.id;
        var subjectBoxId = currentId.replace("revisionButton", "subjectBox");
        clearSubjectModal($("#" + subjectBoxId).text());
        //populateQualificationDropdown(subjectSelectedObj);
    });
/*
    function getSubjectObj(subjectName) {
        var subjectSelectedObj;
        for (var i = 0; i < SUBJECT_INFO.length; i++) {
            if (SUBJECT_INFO[i].subjectName == subjectName) {
                subjectSelectedObj = SUBJECT_INFO[i];
            }
        }

        return subjectSelectedObj;
    }*/

    function clearSubjectModal (subjectName) {
        document.getElementById("subjectNameModalHeader").innerHTML = subjectName; // set modal header

        // Clear dropdown menus, then get info
        document.getElementById('topicsList').options.length = 0;
        document.getElementById('teacherTopicsDropdownList').options.length = 0;
        document.getElementById('qualificationList').options.length = 0;
        document.getElementById('teacherQualificationDropdownList').options.length = 0;

        document.getElementById('teacherRevisionTopicsDropdownList').options.length = 0;
        document.getElementById('teacherRevisionQualificationDropdownList').options.length = 0;

        $("#filterSubject").show();
        $("#filterSubjectButtons").show();
        $("#revisionTabs").hide();
        $("#startQuizBtn").hide();

        $("#startQuizBtn").hide();
        $("#updateFilterBtn").show();
    }

    function populateQualificationDropdown(subjectSelected) {
        var qualificationObj;
        for (var i = 0; i < subjectSelected.qualifications.length; i++) {
            $('#qualificationList').append("<option>" + subjectSelected.qualifications[i].qualificationName + "</option>");
        }
        $('#qualificationList').change();
    }

    function populateTopicsDropdown(subjectSelectedText, qualificationSelectedText) {
        for (var i = 0; i < SUBJECT_QUALIFICATION_TOPIC_OBJS.length; i++) {
            if (SUBJECT_QUALIFICATION_TOPIC_OBJS[i].subjectName == subjectSelectedText) {
                for (var i = 0; i < SUBJECT_QUALIFICATION_TOPIC_OBJS[i].qualifications.length; i++) {
                    if (SUBJECT_QUALIFICATION_TOPIC_OBJS[i].qualifications[i].qualificationName == qualificationSelectedText) {
                        $.each(SUBJECT_QUALIFICATION_TOPIC_OBJS[i].qualifications[i].topics, function(key, value) {
                            $('#topicsList').append("<option>" + value.topicName + "</option>");
                        });
                    }
                }
            }
        }
    }

    function getSubjectQualificationTopicObj(subjectText, qualificationText, topicText) {
        var subjectSelectedObj;
        var qualificationObj;
        var topicObj;

        for (var i = 0; i < SUBJECT_QUALIFICATION_TOPIC_OBJS.length; i++) {
            if (SUBJECT_QUALIFICATION_TOPIC_OBJS[i].subjectName == subjectText) {
                subjectSelectedObj = SUBJECT_QUALIFICATION_TOPIC_OBJS[i].getSubject();
            }
        }

        for (var i = 0; i < subjectSelectedObj.qualifications.length; i++) {
            if (subjectSelectedObj.qualifications[i].qualificationName == qualificationText) {
                qualificationObj = subjectSelectedObj.qualifications[i].getQualification();
            }
        }

        SUBJECT_QUALIFICATION_TOPIC_SELECTED_OBJ = subjectSelectedObj;

        delete SUBJECT_QUALIFICATION_TOPIC_SELECTED_OBJ.qualifications;
        SUBJECT_QUALIFICATION_TOPIC_SELECTED_OBJ.qualification = qualificationObj;

        $.each(subjectSelectedObj.qualification.topics, function(key, value) {
            if (value.topicName == topicText) {
                topicObj = value.getTopic();
            }
        });

        delete SUBJECT_QUALIFICATION_TOPIC_SELECTED_OBJ.qualification.topics;
        SUBJECT_QUALIFICATION_TOPIC_SELECTED_OBJ.topic = topicObj;
    }

    $("#qualificationList").unbind().change(function() {
        document.getElementById('topicsList').options.length = 0;
        document.getElementById('teacherTopicsDropdownList').options.length = 0;
        //populateTopicsDropdown(subjectSelectedObj, $(this).val())
        populateTopicsDropdown(document.getElementById("subjectNameModalHeader").innerHTML, $(this).val());
    });


    $('[id^=resetFilterBtn]').unbind().click(function() {
        var subjectSelectedObj = getSubjectObj($("#subjectNameModalHeader").text())
        clearSubjectModal(subjectSelectedObj);
        populateQualificationDropdown(subjectSelectedObj);
        $('#qualificationList').change();
    });

    // Update filter, hide filter and display tabs
    $('[id^=updateFilterBtn]').unbind().click(function() {
        // If student...
        if ($("#subjectModal").hasClass('in')) {
            getSubjectQualificationTopicObj($("#subjectNameModalHeader").text(), document.getElementById("qualificationList").value, document.getElementById("topicsList").value);
            getTopicSummary();
            //getTopicLeaderboard();
            //getRevisionMaterials();

            $("#filterSubject").hide();
            $("#filterSubjectButtons").hide();
            $("#revisionTabs").show();

            $("#updateFilterBtn").hide();
            $("#resetFilterBtn").hide();
            $("#backToFilterBtn").show();

            //getQuestionsStudent();

            document.getElementById('subjectSummaryTab').click();
        }

        // If teacher...
        else if ($("#teacherModal").hasClass('in')) {
            if ($("#teacherRevisionManagerTab").parent().hasClass('active')) {
                subjectSelected = document.getElementById("teacherRevisionSubjectDropdownList").value;
                qualificationLevelSelected = document.getElementById("teacherRevisionQualificationDropdownList").value;
                topicSelected = document.getElementById("teacherRevisionTopicsDropdownList").value;
            } else {
                subjectSelected = document.getElementById("teacherSubjectDropdownList").value;
                qualificationLevelSelected = document.getElementById("teacherQualificationDropdownList").value;
                topicSelected = document.getElementById("teacherTopicsDropdownList").value;
            }

            $("#teacherFilterSubject").hide();
            $("#teacherFilterSubjectButtons").hide();
            $("#teacherAreaTabs").show();
        }

        $("#startQuizBtn").hide();
    });

/*
    function displaySubjectInfo(data, subjectSelected) {
        $.each(JSON.parse(data), function(key, value) {
            SUBJECT_INFO.push({
                subject_name:   subjectSelected,
                qualification_level: value.qualification_level,
                topic_name: value.topic_name,
                topic_desc: value.topic_desc
            });
            // If there the current qualification level (e.g. A2), is not in the list, append it
            if ($("option:contains(" + value.qualification_level + ")", "#qualificationList").length == 0) {
                $('#qualificationList').append("<option>" + value.qualification_level + "</option>");
            }

            if ($("option:contains(" + value.qualification_level + ")", "#teacherQualificationDropdownList").length == 0) {
                $('#teacherQualificationDropdownList').append("<option>" + value.qualification_level + "</option>");
            }

            if ($("option:contains(" + value.qualification_level + ")", "#teacherRevisionQualificationDropdownList").length == 0) {
                $('#teacherRevisionQualificationDropdownList').append("<option>" + value.qualification_level + "</option>");
            }

            // If A2 is in the list, now begin to add the topic for it
            if (value.qualification_level == document.getElementById("qualificationList").value) {
                $('#topicsList').append("<option>" + value.topic_name + "</option>");
            }

            if (value.qualification_level == document.getElementById("teacherQualificationDropdownList").value) {
                $('#teacherTopicsDropdownList').append("<option>" + value.topic_name + "</option>");
            }

            if (value.qualification_level == document.getElementById("teacherRevisionQualificationDropdownList").value) {
                $('#teacherRevisionTopicsDropdownList').append("<option>" + value.topic_name + "</option>");
            }
        });
    }*/

    $('[id^=teacherAreaUpdateFilterBtn]').unbind().click(function() {
            if ($("#teacherRevisionManagerTab").parent().hasClass('active')) {
                subjectSelected = document.getElementById("teacherRevisionSubjectDropdownList").value;
                qualificationLevelSelected = document.getElementById("teacherRevisionQualificationDropdownList").value;
                topicSelected = document.getElementById("teacherRevisionTopicsDropdownList").value;
            } else {
                subjectSelected = document.getElementById("teacherSubjectDropdownList").value;
                qualificationLevelSelected = document.getElementById("teacherQualificationDropdownList").value;
                topicSelected = document.getElementById("teacherTopicsDropdownList").value;
            }

        //$("#teacherFilterSubject").hide();
        //$("#teacherFilterSubjectButtons").hide();
        //$("#teacherAreaTabs").show();
    });

    $('[id^=teacherAreaResetFilterBtn]').unbind().click(function() {
        $("select#teacherSubjectDropdownList").prop('selectedIndex', 0);
        document.getElementById('teacherTopicsDropdownList').options.length = 0;
        document.getElementById('teacherQualificationDropdownList').options.length = 0;

        $("select#teacherRevisionSubjectDropdownList").prop('selectedIndex', 0);
        document.getElementById('teacherRevisionTopicsDropdownList').options.length = 0;
        document.getElementById('teacherRevisionQualificationDropdownList').options.length = 0;

        if ($("#teacherRevisionManagerTab").parent().hasClass('active')) {
            subjectSelected = document.getElementById("teacherRevisionSubjectDropdownList").value;
        } else {
            subjectSelected = document.getElementById("teacherSubjectDropdownList").value;
        }

        //getSubjectInfo();
    });

    // Back to filters
    $('[id^=backToFilterBtn]').unbind().click(function() {
        if ($("#subjectModal").hasClass('in')) {

            //$('[href=#subjectSummary]').tab('show');

            $("#filterSubject").show();
            $("#revisionTabs").hide();

            $("#resetFilterBtn").show();
            $("#updateFilterBtn").show();

            $("#backToFilterBtn").hide();
            $("#startQuizBtn").hide();

            while (SUBJECT_QUALIFICATION_TOPIC_OBJS.length == 0) {
                getSubjects();
                console.log("Are we done?")
                console.log(subjectSelectedObj)
                console.log(SUBJECT_QUALIFICATION_TOPIC_OBJS)
                subjectSelectedObj = getSubjectObj($("#subjectNameModalHeader").text())
                clearSubjectModal(subjectSelectedObj);
                populateQualificationDropdown(subjectSelectedObj);
            }

            //console.log("Are we done?")
            //console.log(subjectSelectedObj)
            //console.log(SUBJECT_QUALIFICATION_TOPIC_OBJS)
            //clearSubjectModal(subjectSelectedObj);
            //populateQualificationDropdown(subjectSelectedObj);
            //document.getElementById('resetFilterBtn').click(); // simulates a reset filter click
        }

        else if ($("#teacherModal").hasClass('in')) {
            $("#teacherFilterSubject").show();
            $("#teacherFilterSubjectButtons").show();
            $("#teacherAreaTabs").hide();
            document.getElementById('resetFilterBtn').click(); // simulates a reset filter click
        }

        //$("#startQuizBtn").hide();
    });

    // GET QUESTIONS
    function getQuestionsStudent() {
        // Remove the previous results from the table
        $("#quizResultsModalReviewTable tbody").children().remove()

        $.post("/getQuestions", {
            subject: subjectSelected,
            qualification: qualificationLevelSelected,
    		topic: topicSelected
    	},
    	function(data) {
    	    data = JSON.parse(data);
    	    console.log(data.length);
    	    if (data.length >= 5) {
    	        questions = shuffle(data);
    	        quizLength = updateSlider(questions);

    	        console.log(data.length);

    	       //Enable the quiz tab
    	        $("#subjectQuizTab").parent('li').removeClass("disabled")
    	        $('#subjectQuizTab').attr('data-toggle', 'tab');
    	    }

    	    else {
    	        $("#subjectQuizTab").parent('li').addClass("disabled")
    	        $("#subjectQuizTab").removeAttr("data-toggle");
    	    }
    	});
    }

    $('[id^=subjectQuizTab]').unbind().click(function() {
        $("#startQuizBtn").show();
    });

    $('[id^=subjectSummaryTab]').unbind().click(function() {
        $("#startQuizBtn").hide();
    });

    function updateSlider(questions) {
        $('#quizLengthSlider').slider({
	        min: 5,
	        max: questions.length,
	        value: Math.round(questions.length / 2),
    	    formatter: function(value) {
    		    return 'Number of questions: ' + value;
    	    }
        });
    }

    $('[id^=startQuizBtn]').click(function() {
        $("#quizProgressBar").attr("aria-valuemax", quizLength);
        // RESET progress bar
        $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);

        quizQuestionManager(questions);
    });

    function quizQuestionManager(questions) {

        // IMPORTANT QUIZ VARIABLES
        var questionCounter = 0;
        var quizScore = 0;
        var quizLength = parseInt($('#quizLengthSlider').val());
        $("#quizScoreBadge").text(0);
        $("#quizPointsBadge").text(0);

        document.getElementById("quizSubmitAnswerBtn").disabled = false;

        $('#subjectModal').modal('hide');
        $('#quizQuestionModal').modal('show');

        displayQuestions(questions, questionCounter, quizScore, quizLength);
    }

    function displayQuestions(questions, questionCounter, quizScore, quizLength) {
        // Remove any radiobutton selection, from prev quizzes
        $("#quizAnswerOptions .btn-group button").removeClass("active");

        // Display question
        document.getElementById("quizQuestionNumber").innerHTML = "Question " + (questionCounter + 1); // plus one, since counter starts from 0
        document.getElementById("quizQuestionText").innerHTML = questions[questionCounter].question_name;
        $('#quizOptionA').get(0).nextSibling.data = questions[questionCounter].option_a;
        $('#quizOptionB').get(0).nextSibling.data = questions[questionCounter].option_b;
        $('#quizOptionC').get(0).nextSibling.data = questions[questionCounter].option_c;
        $('#quizOptionD').get(0).nextSibling.data = questions[questionCounter].option_d;

        $("#quizAnswerOptions").on("click", function() {
            document.getElementById("quizSubmitAnswerBtn").disabled = false;
        });

        // Unbind prevents it firing multiple times
        $('[id^=quizSubmitAnswerBtn]').unbind().click(function() {
            $("#quizProgressBar").attr("aria-valuenow", questionCounter + 1);
            $('.progress-bar').css('width', (questionCounter + 1) / quizLength * 100 +'%').attr('aria-valuenow', (questionCounter + 1) / quizLength * 100);
            $("#quizProgressBar").text(Math.round((questionCounter + 1) / quizLength * 100) + '%');

            checkAnswer(questionCounter, quizScore, quizLength);
        });
    }

    // Checks whether the answer is correct
    function checkAnswer(questionCounter, quizScore, quizLength) {
        var optionSelected = $('#quizAnswerOptions label.active input').val();
        var correctAnswer = questions[questionCounter].correct_answer;

        var newRowContent;

        $('#quizAnswerModal').modal('show');

        if (optionSelected == correctAnswer) {
            $("#quizAnswerReasonPanel").attr("class", "panel panel-success");
            $('#quizAnswerModal').data('bs.modal').$backdrop.css('background-color','green')
            document.getElementById("quizCorrectIncorrectModalHeader").innerHTML = "Correct!";

            // Green
            newRowContent = "<tr bgcolor=#ccffcc><td>" + document.getElementById("quizQuestionText").innerHTML + "</td><td>" + $('#quizAnswerOptions label.active input').get(0).nextSibling.data  + "</td><td>" + $('#quizOption' + questions[questionCounter].correct_answer).get(0).nextSibling.data + "</td><td>" + questions[questionCounter].answer_reason + "</td></tr>";

            quizScore++;
            $("#quizScoreBadge").text(quizScore);
            $("#quizPointsBadge").text(quizScore * 10);
        }

        else {
            $("#quizAnswerReasonPanel").attr("class", "panel panel-danger");
            $('#quizAnswerModal').data('bs.modal').$backdrop.css('background-color','red')
            document.getElementById("quizCorrectIncorrectModalHeader").innerHTML = "Incorrect!";

            // Red
            newRowContent = "<tr bgcolor=#ffe6e6><td>" + document.getElementById("quizQuestionText").innerHTML + "</td><td>" + $('#quizAnswerOptions label.active input').get(0).nextSibling.data  + "</td><td>" + $('#quizOption' + questions[questionCounter].correct_answer).get(0).nextSibling.data + "</td><td>" + questions[questionCounter].answer_reason + "</td></tr>";
        }

        // Reason applies to whether user got the question correct or not
        document.getElementById('quizCorrectIncorrectReason').innerHTML = questions[questionCounter].answer_reason;

        // Add the user option plus the correct answer to the result table
        $("#quizResultsModalReviewTable tbody").append(newRowContent);

        document.getElementById("quizSubmitAnswerBtn").disabled = true;

        $("#quizNextQuestionBtn").unbind().on("click", function() {
            questionCounter++;

            $('#quizAnswerOptions label.active input').parent().removeClass("active");
            $('#quizAnswerModal').modal('hide');

            if (questionCounter < quizLength) {
                displayQuestions(questions, questionCounter, quizScore, quizLength);
            }

            else {
                displayQuizData(questionCounter, quizScore)
            }
        });
    }

    // SUMMARY PAGE AFTER QUIZ
    function displayQuizData(questionCounter, quizScore) {
        $('#quizAnswerReasonPanel').modal('hide');
        $('#quizAnswerModal').modal('hide');
        $('#quizQuestionModal').modal('hide');

        document.getElementById("quizResultsModalQualificationLevel").innerHTML = qualificationLevelSelected;
        document.getElementById("quizResultsModalSubjectName").innerHTML = subjectSelected;
        document.getElementById("quizResultsModalTopicName").innerHTML = topicSelected;
        document.getElementById("quizResultsModalScore").innerHTML = quizScore;
        document.getElementById("quizResultsModalQuizLength").innerHTML = parseInt($('#quizLengthSlider').val());

        var quizPercentage = 0;
        var quizResultsImageLocation;

        // Score / Length of quiz
        quizPercentage = quizScore / parseInt($('#quizLengthSlider').val())
        quizPercentage = quizPercentage * 100
        quizPercentage = Math.round(quizPercentage)

        // Which image to use?
        if (quizPercentage < 50) {
            quizResultsImageLocation = "/static/images/red-smiley-face.png"
            $('#quizAnswerModal').data('bs.modal').$backdrop.css('background-color','red')
        }

        else if (quizPercentage < 75 && quizPercentage >= 50) {
            quizResultsImageLocation = "/static/images/yellow-neutral-face.png"
            $('#quizAnswerModal').data('bs.modal').$backdrop.css('background-color','#ffcc66')
        }

        else if (quizPercentage >= 75) {
            quizResultsImageLocation = "/static/images/green-happy-face.png"
            $('#quizAnswerModal').data('bs.modal').$backdrop.css('background-color','green')
        }

        $("#quizResultsModalImage").attr("src", quizResultsImageLocation);
        document.getElementById("quizResultsModalScorePercentage").innerHTML = quizPercentage + "%";

        $('#quizResultsModal').modal('show');

        if ($("#userRole").text() == "Student" || $("#userEmail").text() == "10dcosta@lambeth-academy.org") {
            storeQuizResults(quizScore);
        }

        quizResultsShowCorrectAnswers();
    }

    function storeQuizResults(quizScore) {
        $.post("/storeQuizResults", {
            qualification: qualificationLevelSelected,
    		topic: topicSelected,
    		subject: subjectSelected,
    		score: quizScore,
    		length: parseInt($('#quizLengthSlider').val()),
            date: new Date().toISOString().slice(0,10),
            email: $("#userEmail").text()
    	});
    	storeQuizPoints(quizScore);
    }


    function storeQuizPoints(quizScore) {
        var quizPoints = quizScore * 10;
        console.log(quizPoints, $("#userEmail").text())
        $.post("/storeQuizPoints", {
            email: $("#userEmail").text(),
            points: quizPoints
    	});
    }

    function quizResultsShowCorrectAnswers() {
        if(document.getElementById("quizResultsModalReviewIncorrectAnswers").checked == true) {
            $("#quizResultsModalReviewTable tbody").find("tr").each(function() { //get all rows in table
                if ($(this).css('background-color') == "rgb(204, 255, 204)") { // if answer is correct, view green background color
                    $(this).hide();
                }
            });
        }

        else {
            $("#quizResultsModalReviewTable tbody").find("tr").each(function() { //get all rows in table
                $(this).show();
            });
        }
    }

    $('#quizResultsModalReviewIncorrectAnswers').unbind().click(function() {
        quizResultsShowCorrectAnswers();
    });

    function getTopicSummary() {
        $("#subjectTopicDesc").text(SUBJECT_QUALIFICATION_TOPIC_SELECTED_OBJ.topic.topicDesc)
    }

    function getTopicLeaderboard() {
        clearTable('#subjectTopicLeaderboard tbody');

        $.post("/getSubjectTopicLeaderboard", {
            subject: subjectSelected,
            topic: topicSelected,
            qualification: qualificationLevelSelected
    	},
    	function(data) {
            $.each(JSON.parse(data), function(key, value) {
                $("#subjectTopicLeaderboardData").append("<tr><td>" + (key + 1) + "</td><td>" + value.name + "</td><td>" + parseInt(value.average)  + "</td></tr>");
            });
        });
    }

    $('[id^=subjectRevisionPresentationsTab]').unbind().click(function() {
        getRevisionMaterials('Presentation');
    });

    $('[id^=subjectRevisionKeyWordsTab]').unbind().click(function() {
        getRevisionMaterials('Key Words');
    });

    $('[id^=subjectRevisionNotesTab]').unbind().click(function() {
        getRevisionMaterials('Notes');
    });

    $('[id^=subjectRevisionVideosTab]').unbind().click(function() {
        getRevisionMaterials('Videos');
    });

    function getRevisionMaterials(revisionType) {
        $("#revisionMaterialsPresentationsTable tbody").children().remove()
        $("#revisionMaterialsKeyWordsForm").children().remove()
        $("#revisionMaterialsRevisionNotesForm").children().remove()
        $("#revisionMaterialsRevisionVideosForm").children().remove()

        $.post("/getRevisionMaterials", {
            subject: subjectSelected,
            qualification: qualificationLevelSelected,
    		topic: topicSelected,
    		material_type: revisionType
    	},
    	function(data) {
            if(revisionType == "Presentation") {
                $.each(JSON.parse(data), function(key, value) {
                    var newRevisionMaterial = value.material_link;
                    newRevisionMaterial = newRevisionMaterial.replace("/edit?usp=sharing", "");
                    $('#subjectRevisionPresentations').append("<center><iframe src=" + newRevisionMaterial + "/embed?start=false&loop=true&delayms=15000 frameborder='1' allowfullscreen='true' mozallowfullscreen='true' webkitallowfullscreen='true'></iframe></center>");
                });

            }

            else if (revisionType == "Key Words") {
                $.each(JSON.parse(data), function(key, value) {
                    var newRevisionMaterial = value.material_link;
                    newRevisionMaterial = newRevisionMaterial.replace("/edit?usp=sharing", "/export?format=pdf");
                    console.log(newRevisionMaterial);
                    /*
                    $('#subjectRevisionKeyWords tbody').append(
                        "<tr><td><iframe src=" + "https://docs.google.com/viewer?srcid=10SlnTGcoji7FHenvSWVX_VdeZ3W9y4h_r4SbguC3og0&pid=explorer&efh=false&a=v&chrome=false&embedded=true" frameborder='0' height='100%' width='100%'></iframe></td>
                                                    <td><button type="button" class="btn btn-default" onclick=" window.open('https://docs.google.com/document/d/10SlnTGcoji7FHenvSWVX_VdeZ3W9y4h_r4SbguC3og0/export?format=pdf','_blank')">Download</button></td>
                                                </tr>
                        "<center><iframe src=" + newRevisionMaterial + "pub? frameborder='1'></iframe></center>"
                        );
                        */
                });
            }

            else if (revisionType == "Notes") {
                $.each(JSON.parse(data), function(key, value) {
                    var newRevisionMaterial = value.material_link;
                    newRevisionMaterial = newRevisionMaterial.replace("/edit?usp=sharing", "/export?format=pdf");
                    //PDFObject.embed(newRevisionMaterial, "#subjectRevisionNotes");
                    //$('#subjectRevisionNotes').append("<center><iframe src=" + newRevisionMaterial + "pub? frameborder='1'></iframe></center>");
                });
            }

            else if (revisionType == "Videos") {
                $.each(JSON.parse(data), function(key, value) {
                    var newRevisionMaterial = value.material_link;
                    newRevisionMaterial = newRevisionMaterial.replace("https://www.youtube.com/watch?v=", "");
                    var youtubeStartLink = "https://www.youtube.com/embed/"
                    $('#subjectRevisionVideos').append("<center><iframe src=" + youtubeStartLink + newRevisionMaterial + " frameborder='0' allowfullscreen></iframe><center>");
                });
            }
        });
    }

    $('[id^=subjectExamQuestions]').unbind().click(function() {
        getExamQuestions();
    });

    function getExamQuestions() {
        //$("#revisionMaterialsPresentationForm").children().remove()
        //$("#revisionMaterialsKeyWordsForm").children().remove()
        //$("#revisionMaterialsRevisionNotesForm").children().remove()
        //$("#revisionMaterialsRevisionVideosForm").children().remove()

        $.post("/getRevisionMaterials", {
            subject: subjectSelected,
            qualification: qualificationLevelSelected,
    		topic: topicSelected,
    		material_type: revisionType
    	},
    	function(data) {
    	    PDFObject.embed("myfile.pdf", "#my-container", {page: "2"});
        });
    }

    // STUDENT'S AREA
    $('#studentsAreaBtn').unbind().click(function() {
        clearTable('#studentAreaLeaderboard tbody');

        // Place the summary tag as selected
        $("#studentAreaLeagueTab").tab('show');

        loadStudentLeaderboard();
        getStudentQuizResults();

        $("#studentModal").modal('show');

        // Need this otherwise, modal is too slow and if statement will state that the modal is closed.
        // While in fact it is just taking a while for it to open
        $('#teacherModal').on('shown.bs.modal', function () {
    	    // Load qualification and topics as well
    	    subjectSelected = document.getElementById("teacherSubjectDropdownList").value;
    	    getSubjectInfo();

    	    // Prevents this event from firing multiple times
    	    $(this).off('shown.bs.modal');
        });

    });

    function getStudentQuizResults() {
        $.post("/getStudentQuizResults", {
            email: $("#userEmail").text(),
    	},
    	function(data) {
    	    if (data.length > 0) {
    	        // Create collapisble boxes for each subject and qualification
    	        getUniqueSubjectTopics(data);

    	        //quizResults = JSON.parse(data);
    	        //studentPerformanceGraph = createStudentPerformanceGraph();
    	        //studentTopicResultData = segregateStudentResultsData(quizResults);
    	        //addStudentResultsToGraph(quizResults, studentPerformanceGraph);
                //studentPerformanceGraph.render();

    	        $("#studentAreaPerformanceTab").parent('li').removeClass("disabled")
    	        $('#studentAreaPerformanceTab').attr('data-toggle', 'tab');
    	    }

            //displayQuizResultsOnGraph(quizResults);
        });
    }

    function getUniqueSubjectTopics(data) {
        var uniqueSubjectTopicData = [];

        uniqueSubjectTopicData.push({qualification: data[0].qualification_level, subject: data[0].subject_name});

        for (i = 1; i < data.length; i++) {
            // If student is the same as previous continue adding results for that student
            if (data[i - 1].subject_name == data[i].subject_name && data[i - 1].qualification_level == data[i].qualification_level) {
                uniqueSubjectTopicData.push({qualification: data[i].qualification_level, subject: data[i].subject_name});
            }
        }

        console.log(uniqueSubjectTopicData)
    }

    function createStudentPerformanceGraph() {
        var studentPerformanceGraph = new CanvasJS.Chart("studentPerformanceChartContainer",{
            zoomEnabled: true,
            panEnabled: true,
            animationEnabled: true,
            animationDuration: 1500,
            exportEnabled: true,
            //The g character means to repeat the search through the entire string
            exportFileName: ("QuizResults - " + $('#userForename').text() + " " + $('#userSurname').text()),
            title:{
                text:"Quiz Results"
            },
    		subtitles:[
    		{
    			text: $('#userForename').text() + " " + $('#userSurname').text(),
    			fontColor: "red"
    		}
    		],
    		toolTip: {
    			shared: false,
    			animationEnabled: true,
    			contentFormatter: function (e) {
    				var content = " ";
    				for (var i = 0; i < e.entries.length; i++) {
    					content += "Subject/Topic: <strong>" + e.entries[i].dataSeries.name + "</strong><br>";
    					content += "Percentage: <strong>" + e.entries[i].dataPoint.y + "%</strong><br>";
    					content += "Date Taken: <strong>" + CanvasJS.formatDate( e.entries[i].dataPoint.x, "DD MMM YY") + "</strong><br>";
    				}
    				return content;
    			}
		    },
            axisX:{
    			labelFormatter: function (e) {
    				return CanvasJS.formatDate( e.value, "DD MMM");
    			},
    			labelAngle: -20,
    			title: "Date Assessed",
            },
            axisY:{
    			title: "Percentage",
    			maximum: 105, // Ability to see the line at 100%
    			interval: 25,
    			suffix: "%",
    			stripLines:[
    			{
    				value:50,
    				labelPlacement:"inside",
    				label: "Minimum Pass Requirement",
    			}
    			],
    		},
    		legend: {
    		    cursor: "pointer",
                itemclick: function (e) {
                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    }

                    else {
                        e.dataSeries.visible = true;
                    }
                    e.chart.render();
                }
            },
            data: []
        });
        return studentPerformanceGraph;
    }

    //function displayQuizResultsOnGraph(data) {
    //
    //}

    function segregateStudentResultsData() {

    }

    function addStudentResultsToGraph(studentData, graph) {
        $.each(studentData, function(key, value) {

            var result = []

            result.push({x: new Date(value.date_taken), y: parseInt(value.percentage)});

            var newData = {
                showInLegend: true,
                type: "spline",
                dataPoints: result
            };
            graph.options.data.push(newData);
        });
    }

    function clearTable(tableReference) {
        $(tableReference).children().remove();
    }

    $('#subjectTopicFilterLeaderboardBtn').unbind().click(function() {
        var $panel = $(this).parents('#subjectTopicLeaderboardTable'),
        $filters = $panel.find('.filters input'),
        $tbody = $panel.find('.table tbody');

        if ($filters.prop('disabled') == true) {
            $filters.prop('disabled', false);
            $filters.first().focus();
        }

        else {
            $filters.val('').prop('disabled', true);
            $tbody.find('.no-result').remove();
            $tbody.find('tr').show();
        }

    });

    $('#studentAreaFilterLeaderboardBtn').unbind().click(function() {
        var $panel = $(this).parents('#studentAreaLeaderboardTable'),
        $filters = $panel.find('.filters input'),
        $tbody = $panel.find('.table tbody');

        if ($filters.prop('disabled') == true) {
            $filters.prop('disabled', false);
            $filters.first().focus();
        }

        else {
            $filters.val('').prop('disabled', true);
            $tbody.find('.no-result').remove();
            $tbody.find('tr').show();
        }

    });

    $('#teacherAreaFilterLeaderboardBtn').unbind().click(function() {
        var $panel = $(this).parents('#teacherAreaLeaderboardTable'),
        $filters = $panel.find('.filters input'),
        $tbody = $panel.find('.table tbody');

        if ($filters.prop('disabled') == true) {
            $filters.prop('disabled', false);
            $filters.first().focus();
        }

        else {
            $filters.val('').prop('disabled', true);
            $tbody.find('.no-result').remove();
            $tbody.find('tr').show();
        }

    });

    $('.filterable .filters input').keyup(function(e){
        /* Ignore tab key */
        var code = e.keyCode || e.which;
        if (code == '9') return;
        /* Useful DOM data and selectors */
        var $input = $(this),
        inputContent = $input.val().toLowerCase(),
        $panel = $input.parents('.filterable'),
        column = $panel.find('.filters th').index($input.parents('th')),
        $table = $panel.find('.table'),
        $rows = $table.find('tbody tr');
        /* Dirtiest filter function ever ;) */
        var $filteredRows = $rows.filter(function(){
            var value = $(this).find('td').eq(column).text().toLowerCase();
            return value.indexOf(inputContent) === -1;
        });
        /* Clean previous no-result if exist */
        $table.find('tbody .no-result').remove();
        /* Show all rows, hide filtered ones (never do that outside of a demo ! xD) */
        $rows.show();
        $filteredRows.hide();
        /* Prepend no-result row if all rows are filtered */
        if ($filteredRows.length === $rows.length) {
            $table.find('tbody').prepend($('<tr class="no-result text-center"><td colspan="'+ $table.find('.filters th').length +'">No result found</td></tr>'));
        }
    });

    // TEACHER'S AREA
    $('#teachersAreaBtn').unbind().click(function() {
        $("#teacherAreaResetFilterBtn").hide();
        $("#teacherAreaUpdateFilterBtn").hide();
        $("#teacherAreaBackToFilterBtn").hide();

        //getTeacherData();

        document.getElementById("teacherSubjectDropdownList").options.length = 0;
        document.getElementById("teacherRevisionSubjectDropdownList").options.length = 0;
        // Place the summary tag as selected
        $("#teacherAreaDashboardTab").tab('show');

        // Waste of resources/time going back to the server,
        // just get subjects from the subjects dropdown
        $('#subjectList li').each(function(index, value) {
            $('#teacherSubjectDropdownList').append("<option>" + value.innerText + "</option>");
            $('#teacherRevisionSubjectDropdownList').append("<option>" + value.innerText + "</option>");
        });

        if ($("#teacherRevisionManagerTab").parent().hasClass('active')) {
            subjectSelected = document.getElementById("teacherRevisionSubjectDropdownList").value;
        } else {
            subjectSelected = document.getElementById("teacherSubjectDropdownList").value;
        }
        getSubjectInfo();

        $("#teacherModal").modal('show');
    });

    $('[id^=teacherQuestionManagerTab]').unbind().click(function() {
        document.getElementById("teacherTopicsDropdownList").options.length = 0;
        subjectSelected = document.getElementById("teacherSubjectDropdownList").value;
        qualificationLevelSelected = document.getElementById("teacherQualificationDropdownList").value;

        getSubjectInfo();
    });

    $('[id^=teacherRevisionManagerTab]').unbind().click(function() {
        document.getElementById("teacherRevisionTopicsDropdownList").options.length = 0;
        subjectSelected = document.getElementById("teacherRevisionSubjectDropdownList").value;
        qualificationLevelSelected = document.getElementById("teacherRevisionQualificationDropdownList").value;

        getSubjectInfo();
    });


    $('#teacherAreaManagerTab').unbind().click(function() {
        $("#teacherAreaResetFilterBtn").show();
        $("#teacherAreaUpdateFilterBtn").show();
        $("#teacherAreaBackToFilterBtn").hide();
    });

    $('#teacherAreaStudentPerformanceTab').unbind().click(function() {
        document.getElementById('teacherAreaStudentPerformanceDropdown').options.length = 0;
        $("#teacherAreaStudentPerformance").children().not('#teacherAreaStudentPerformanceFilterPanel').remove();

        $.get("/getStudents", function (data) {
            $.each(JSON.parse(data), function(key, value) {
                $('#teacherAreaStudentPerformanceDropdown').append("<option>" + value.name + "</option>");
                $("#teacherAreaStudentPerformanceDropdown").selectpicker("refresh");
            });
        });
    });

    function getTeacherData() {
        $("#teacherAreaLeaderboard tbody").children().remove()
        $("#teachersAreaContactList").children().remove()

        $.get("/getTeacherData", function (data) {
            $.each(JSON.parse(data), function(key, value) {
                if ($("#userEmail").text() == value.email_address) {
                    // LEAGUE
                    $("#teacherLeaderboardDataTable").append("<tr><td><b>" + (key + 1) + "</td><td>" + value.name + "</td><td>" + value.points  + "</td></tr></b>");
                    $("#teacherPoints").text(value.points + " points");
                }

                else {
                    $("#teacherLeaderboardDataTable").append("<tr><td><b>" + (key + 1) + "</td><td>" + value.name + "</td><td>" + value.points  + "</td></tr></b>");
                }
            });

            $('#teacherDashboardImage').attr("src", $("#profileImage").attr('src') + "?sz=120");
            $('#teacherLeagueName').text($('#userForename').text() + " " + $('#userSurname').text());

            data = JSON.parse(data);
    	    teachers = shuffle(data);

    	    for (i = 0; i < teachers.length; i++) {
    	        if (teachers[i].email_address == $("#userEmail").text()) {
    	            delete teachers[i]
    	        }
            }

            $.getJSON('http://picasaweb.google.com/data/entry/api/user/' + teachers[0].email_address +'?alt=json', function(data) {
                $("#teachersAreaContactList").append("<li class='list-group-item'><div class='col-xs-12 col-sm-3'><img src=" + data.entry.gphoto$thumbnail.$t + " alt=" + teachers[0].name + " class='img-responsive img-circle' /></div><div class='col-xs-12 col-sm-9'><span class='name'>" + teachers[0].name + "</span> <span class='label label-default rank-label'>" + teachers[0].points + " points</span><br/><button type='button' class='btn btn-default' onclick=window.location.href='mailto:" + teachers[0].email_address + "'><span class='glyphicon glyphicon-envelope'></span> Email</button></div><div class='clearfix'></div></li>");
            });

            $.getJSON('http://picasaweb.google.com/data/entry/api/user/' + teachers[1].email_address +'?alt=json', function(data) {
                $("#teachersAreaContactList").append("<li class='list-group-item'><div class='col-xs-12 col-sm-3'><img src=" + data.entry.gphoto$thumbnail.$t + " alt=" + teachers[1].name + " class='img-responsive img-circle' /></div><div class='col-xs-12 col-sm-9'><span class='name'>" + teachers[1].name + "</span> <span class='label label-default rank-label'>" + teachers[1].points + " points</span><br/><button type='button' class='btn btn-default' onclick=window.location.href='mailto:" + teachers[1].email_address + "'><span class='glyphicon glyphicon-envelope'></span> Email</button></div><div class='clearfix'></div></li>");
            });

            $.getJSON('http://picasaweb.google.com/data/entry/api/user/' + teachers[2].email_address +'?alt=json', function(data) {
                $("#teachersAreaContactList").append("<li class='list-group-item'><div class='col-xs-12 col-sm-3'><img src=" + data.entry.gphoto$thumbnail.$t + " alt=" + teachers[2].name + " class='img-responsive img-circle' /></div><div class='col-xs-12 col-sm-9'><span class='name'>" + teachers[2].name + "</span> <span class='label label-default rank-label'>" + teachers[2].points + " points</span><br/><button type='button' class='btn btn-default' onclick=window.location.href='mailto:" + teachers[2].email_address + "'><span class='glyphicon glyphicon-envelope'></span> Email</button></div><div class='clearfix'></div></li>");
            });
        });
    }

    $("#teacherAreaStudentPerformanceDropdown").change(function() {
        teacherAreaLoadStudentQuizResults(document.getElementById("teacherAreaStudentPerformanceDropdown").value);
    });

    function teacherAreaLoadStudentQuizResults(studentSelected) {
        averageTopicResults = getStudentAverageTopicResults(studentSelected);
    }

    function getStudentAverageTopicResults(studentSelected) {
        $.post("/getStudentAverage", {
            student: studentSelected
        },
    	function(data) {
    	    filterAverageTopicResults(data)
    	});
    }

    function filterAverageTopicResults(results) {
        results = JSON.parse(results)

        // Must filter the results. Get those with the same qualification and subject
        subject = results[0].subject_name;
        qualificationLevel = results[0].qualification_level;

        $("#teacherAreaStudentPerformance").append("<div class='panel panel-primary'><div class='panel-heading'>" + results[0].subject_name + " (" + results[0].qualification_level + ")" + "</div><div class='panel-body'><div id=averageTopicGraph0 style='height:300px;'></div></div>")
        averageTopicGraph = createAverageTopicGraph("averageTopicGraph0");
        averageTopicGraph.data[0].addTo("dataPoints", {y: parseInt(results[0].average), label: String(results[0].topic_name) });

        chartCount = 0;

        for (i = 1; i < results.length; i++) {
            console.log(results[i])
            if (results[i].subject_name == subject && results[i].qualification_level == qualificationLevel) {
                averageTopicGraph.data[0].addTo("dataPoints", {y: parseInt(results[i].average), label: String(results[i].topic_name) });
            }

            else {
                chartCount += 1
                $("#teacherAreaStudentPerformance").append("<div class='panel panel-primary'><div class='panel-heading'>" + results[i].subject_name + " (" + results[i].qualification_level + ")" + "</div><div class='panel-body'><div id='" + "averageTopicGraph" + String(chartCount) + "' style='height:300px;'></div></div>")
                averageTopicGraph = createAverageTopicGraph("averageTopicGraph" + String(chartCount));
                averageTopicGraph.data[0].addTo("dataPoints", {y: parseInt(results[i].average), label: String(results[i].topic_name) });

                subject = results[i].subject_name;
                qualificationLevel = results[i].qualification_level;

            }
        }
    }

    function createAverageTopicGraph(chartName) {
        var chart = new CanvasJS.Chart(chartName,{
            exportEnabled: true,
            axisX:{
    			title: "Topics"
    		},
            axisY:{
    			title: "Average Percentage"
    		},
    		legend: {
                verticalAlign: "bottom",
                horizontalAlign: "center"
    		},
    		data: [{
    		    color: "#ffbd4a",
    		    type: "column",
    		    dataPoints: []
    		}]
        });


        chart.render();

        return chart
    }

    $("#teacherSubjectDropdownList").change(function() {
       subjectSelected = document.getElementById("teacherSubjectDropdownList").value;

       qualificationLevelSelected = document.getElementById("teacherQualificationDropdownList").options.length = 0;
       topicSelected = document.getElementById("teacherTopicsDropdownList").options.length = 0;

       getSubjectInfo();
    });

    $("#teacherQualificationDropdownList").change(function() {
       topicSelected = document.getElementById("teacherTopicsDropdownList").options.length = 0;
       qualificationLevelSelected = document.getElementById("teacherQualificationDropdownList").value;
       getSubjectInfo();
    });

    $("#teacherTopicsDropdownList").change(function() {
       topicSelected = document.getElementById("teacherTopicsDropdownList").value;
    });

    $("#teacherRevisionSubjectDropdownList").change(function() {
       subjectSelected = document.getElementById("teacherRevisionSubjectDropdownList").value;

       qualificationLevelSelected = document.getElementById("teacherRevisionQualificationDropdownList").options.length = 0;
       topicSelected = document.getElementById("teacherRevisionTopicsDropdownList").options.length = 0;

       getSubjectInfo();
    });

    $("#teacherRevisionQualificationDropdownList").change(function() {
       topicSelected = document.getElementById("teacherRevisionTopicsDropdownList").options.length = 0;
       qualificationLevelSelected = document.getElementById("teacherRevisionQualificationDropdownList").value;
       getSubjectInfo();
    });

    $("#teacherRevisionTopicsDropdownList").change(function() {
       topicSelected = document.getElementById("teacherRevisionTopicsDropdownList").value;
    });

    function loadStudentLeaderboard() {
        $.get("/getStudentPoints", function (data) {
            $.each(JSON.parse(data), function(key, value) {
                if ($("#userEmail").text() == value.email_address) {
                    $("#studentAreaLeaderboardData").append("<tr><td><b>" + (key + 1) + "</td><td>" + value.name + "</td><td>" + value.points  + "</td></tr></b>");
                    $("#studentPoints").text(value.points + " points");
                }

                else {
                    $("#studentAreaLeaderboardData").append("<tr><td>" + (key + 1) + "</td><td>" + value.name + "</td><td>" + value.points  + "</td></tr>");
                }
            });

            $('#studentDashboardImage').attr("src", $("#profileImage").attr('src') + "?sz=120");
            $('#studentLeagueName').text($('#userForename').text() + " " + $('#userSurname').text());
        });
    }

    $('#questionEntrySubmit').click(function() {
        var questionEntryText = $('textarea#questionEntryText').val();
        var questionEntryOptionA = $("#questionEntryOptionA").val();
        var questionEntryOptionB = $("#questionEntryOptionB").val();
        var questionEntryOptionC = $("#questionEntryOptionC").val();
        var questionEntryOptionD = $("#questionEntryOptionD").val();
        var questionEntryCorrectOption = $('#questionEntryCorrectOption label.active input').val();
        var questionEntryReason = $("#questionEntryReason").val();

        // CLEAR
        $('textarea#questionEntryText').val("");
        $("#questionEntryOptionA").val("");
        $("#questionEntryOptionB").val("");
        $("#questionEntryOptionC").val("");
        $("#questionEntryOptionD").val("");
        $('#questionEntryCorrectOption label').removeClass("active");
        $("#questionEntryReason").val("");

        submitQuestion(questionEntryText, questionEntryOptionA, questionEntryOptionB, questionEntryOptionC, questionEntryOptionD, questionEntryCorrectOption, questionEntryReason);
    });

    function submitQuestion(questionEntryText, questionEntryOptionA, questionEntryOptionB, questionEntryOptionC, questionEntryOptionD, questionEntryCorrectOption, questionEntryReason) {
        $.post("/submitQuestion", {
            subject: document.getElementById("teacherSubjectDropdownList").value,
            qualification: document.getElementById("teacherQualificationDropdownList").value,
    		topic: document.getElementById("teacherTopicsDropdownList").value,
    		question: questionEntryText,
    		optionA: questionEntryOptionA,
    		optionB: questionEntryOptionB,
    		optionC: questionEntryOptionC,
    		optionD: questionEntryOptionD,
    		correctOption: questionEntryCorrectOption,
    		questionReason: questionEntryReason
        });
    }

/*
    function storeUploadedQuestions() {
        console.log("Storing questions")
        $.each(uploadedQuestionsAnswers, function(index, value) {
            console.log(subjectSelected, qualificationLevelSelected, topicSelected)
            $.post("/submitQuestion", {
                subject: subjectSelected,
                qualification: qualificationLevelSelected,
                topic: topicSelected,
                question: value.question_name,
                optionA: value.option_a,
                optionB: value.option_b,
                optionC: value.option_c,
                optionD: value.option_d,
                correctOption: value.correct_answer,
                questionEntryReason: value.answer_reason
            });
        });
    }
*/
    $('#teacherQuestionsDropdownList').change(function() {
        //$("#questionEditorCorrectOption .btn-group button").removeClass("active");
        $('#questionEditorCorrectOption label').removeClass("active");
        var questionIndex = $("#teacherQuestionsDropdownList")[0].selectedIndex;

        $('textarea#questionEditorQuestionText').val(questions[questionIndex].question_name);
        $("#questionEditorOptionA").val(questions[questionIndex].option_a);
        $("#questionEditorOptionB").val(questions[questionIndex].option_b);
        $("#questionEditorOptionC").val(questions[questionIndex].option_c);
        $("#questionEditorOptionD").val(questions[questionIndex].option_d);
        $("#questionEditorCorrectOption" + questions[questionIndex].correct_answer).parent().addClass("active");
        $("#questionEditorReason").val(questions[questionIndex].answer_reason);
    });

    $('#questionEditorDiscardChanges').click(function() {
        $('#teacherQuestionsDropdownList').change(); // simulates a question change, thus doing has been programmed above
    });

    $('#questionEditorSubmitButton').click(function() {
        var questionEntryText = $('textarea#questionEntryText').val();
        var questionEntryOptionA = $("#questionEntryOptionA").val();
        var questionEntryOptionB = $("#questionEntryOptionB").val();
        var questionEntryOptionC = $("#questionEntryOptionC").val();
        var questionEntryOptionD = $("#questionEntryOptionD").val();
        var questionEntryCorrectOption = $("input[name='questionEntryOptions']:checked").val();
        var questionEntryReason = $("#questionEntryReason").val();

        submitQuestion(questionEntryText, questionEntryOptionA, questionEntryOptionB, questionEntryOptionC, questionEntryOptionD, questionEntryCorrectOption, questionEntryReason);
    });

    $('#teacherAreaQuestionManagerUploadQ').click(function() {
        //$('#teacherAreaQuestionManagerHeading').text('Uploading Question(s)');
        //$('#teacherAreaQuestionManager').modal('show');
        //document.getElementById('teacherAreaUploadQTab').click();
    });

    $('#teacherAreaQuestionManagerAddQ').click(function() {
        $('#teacherAreaQuestionManagerHeading').text('Adding Question');
        $('#teacherAreaQuestionManager').modal('show');
        document.getElementById('teacherAreaAddQTab').click();
    });

    $('#teacherAreaQuestionManagerEditQ').click(function() {
        document.getElementById("teacherAreaEditQDropdown").options.length = 0;
        QUESTIONS = []; // clear list

        $.post("/getQuestions", {
            subject: document.getElementById("teacherSubjectDropdownList").value,
            qualification: document.getElementById("teacherQualificationDropdownList").value,
    		topic: document.getElementById("teacherTopicsDropdownList").value
        },
    	function(data) {
    	    $.each(JSON.parse(data), function(key, value) {
    	        QUESTIONS.push({
    	            question_id: value.question_id,
    	            question_name: value.question_name,
    	            option_a: value.option_a,
    	            option_b: value.option_b,
    	            option_c: value.option_c,
    	            option_d: value.option_d,
    	            correct_option: value.correct_answer,
    	            question_reason: value.answer_reason
    	        });
    	        $('#teacherAreaEditQDropdown').append("<option>" + value.question_name + "</option>");
            });
    	});

        $('#teacherAreaQuestionManagerHeading').text('Editing Question');
        $('#teacherAreaQuestionManager').modal('show');
        document.getElementById('teacherAreaEditQTab').click();

        $('#teacherAreaQuestionManager').on('shown.bs.modal', function () {
            $('textarea#questionEditText').val("");
            $('#questionEditOptionA').val("");
            $('#questionEditOptionB').val("");
            $('#questionEditOptionC').val("");
            $('#questionEditOptionD').val("");
            $('#questionEditReason').val("");
            $('#questionEditCorrectOption label').removeClass("active");

            $('textarea#questionEditText').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].question_name);
            $('#questionEditOptionA').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].option_a);
            $('#questionEditOptionB').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].option_b);
            $('#questionEditOptionC').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].option_c);
            $('#questionEditOptionD').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].option_d);
            $('#questionEditReason').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].question_reason);
            $("#questionEditCorrectOption input[value=" + QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].correct_option +"]").parent().addClass("active")

    	    // Prevents this event from firing multiple times
    	    $(this).off('shown.bs.modal');
        });
    });

    $('#teacherAreaEditQDropdown').change(function() {
        $('textarea#questionEditText').val("");
        $('#questionEditOptionA').val("");
        $('#questionEditOptionB').val("");
        $('#questionEditOptionC').val("");
        $('#questionEditOptionD').val("");
        $('#questionEditReason').val("");
        $('#questionEditCorrectOption label').removeClass("active");

        $('textarea#questionEditText').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].question_name);
        $('#questionEditOptionA').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].option_a);
        $('#questionEditOptionB').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].option_b);
        $('#questionEditOptionC').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].option_c);
        $('#questionEditOptionD').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].option_d);
        $('#questionEditReason').val(QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].question_reason);
        $("#questionEditCorrectOption input[value=" + QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].correct_option +"]").parent().addClass("active")
    });

    $('#questionEditSubmit').unbind().click(function() {
        $.post("/updateQuestion", {
    		question_id: QUESTIONS[$("#teacherAreaEditQDropdown").get(0).selectedIndex].question_id,
            question_text: $('textarea#questionEditText').val(),
            option_a: $("#questionEditOptionA").val(),
            option_b: $("#questionEditOptionB").val(),
            option_c: $("#questionEditOptionC").val(),
            option_d: $("#questionEditOptionD").val(),
            correct_option: $('#questionEditCorrectOption label.active input').val(),
            answer_reason: $("#questionEditReason").val()
        });

        $('#teacherAreaQuestionManager').modal('hide');
    });

/*
    function loadStudentsAvaliable() {
        document.getElementById('studentResultsStudentDropdown').options.length = 0;
        $.post("/loadStudentsAvaliable", {
        },
    	function(data) {
    	    $.each(JSON.parse(data), function(key, value) {
    	        $('#studentResultsStudentDropdown').append("<option>" + value.name + "</option>");
            });
    	});
    }
*/
    function loadStudentResult() {
        $.post("/loadStudentResult", {
            subject: subjectSelected,
            qualification: qualificationLevelSelected,
    		topic: topicSelected,
    		role: $("#userRole").text(),
    		email: $("#userEmail").text()
        },
    	function(data) {
    	    // Results that are returned are those students whom have taken the quiz multiple times
    	    // One point on the graph doesn't make sense
    	    if ($("#userRole").text() == "Teacher" || $("#userEmail").text() == "10dcosta@lambeth-academy.org") {
    	        resultGraph = renderGraph(JSON.parse(data));
    	        createResultGraph(JSON.parse(data), resultGraph);
    	    }

    	    if ($("#userRole").text() == "Student" ) {
                console.log(JSON.parse(data))
    	    }
    	});
    }

    function renderGraph(data) {
        var chart = new CanvasJS.Chart("chartContainer",{
            zoomEnabled: true,
            panEnabled: true,
            animationEnabled: true,
            animationDuration: 1500,
            exportEnabled: true,
            //The g character means to repeat the search through the entire string
            exportFileName: ("QuizResults-" + qualificationLevelSelected + subjectSelected + topicSelected).replace(/ /g,''),
            title:{
                text:"Quiz Results (all students)"
            },
    		subtitles:[
    		{
    			text: qualificationLevelSelected + " " + subjectSelected + " - " + topicSelected,
    			fontColor: "red"
    		}
    		],
    		toolTip: {
    			shared: false,
    			animationEnabled: true,
    			contentFormatter: function (e) {
    				var content = " ";
    				for (var i = 0; i < e.entries.length; i++) {
    					content += "Student: <strong>" + e.entries[i].dataSeries.name + "</strong><br>";
    					content += "Percentage: <strong>" + e.entries[i].dataPoint.y + "%</strong><br>";
    					content += "Date Taken: <strong>" + CanvasJS.formatDate( e.entries[i].dataPoint.x, "DD MMM YY") + "</strong><br>";
    				}
    				return content;
    			}
		    },
            axisX:{
    			labelFormatter: function (e) {
    				return CanvasJS.formatDate( e.value, "DD MMM");
    			},
    			labelAngle: -20,
    			title: "Date Assessed",
            },
            axisY:{
    			title: "Percentage",
    			maximum: 105, // Ability to see the line at 100%
    			interval: 25,
    			suffix: "%",
    			stripLines:[
    			{
    				value:50,
    				labelPlacement:"inside",
    				label: "Minimum Pass Requirement",
    			}
    			],
    		},
    		legend: {
    		    cursor: "pointer",
                itemclick: function (e) {
                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    }

                    else {
                        e.dataSeries.visible = true;
                    }
                    e.chart.render();
                }
            },
            data: []
        });

        chart.render();
        return chart;
    }

    function createResultGraph(data, resultGraph) {
        var results = [];

        results.push({x: new Date(data[0].date_taken), y: parseInt(data[0].percentage)});

        for (i = 1; i < data.length; i++) {
            // If student is the same as previous continue adding results for that student
            if (data[i - 1].name == data[i].name) {
                var studentName = data[i].name;
                results.push({x: new Date(data[i].date_taken), y: parseInt(data[i].percentage)});
            }

            else {
                var newStudentIndex = i;
                addDataToGraph(results, studentName, resultGraph);
                var results = []; // clears array, by overwritting
                results.push({x: new Date(data[newStudentIndex].date_taken), y: parseInt(data[newStudentIndex].percentage)});
            }
        }

        // Loop ends add the last student to the graph
        addDataToGraph(results, studentName, resultGraph);
        calculateOverallAverageResults();
        resultGraph.render();
    }

    function addDataToGraph(results, studentName, resultGraph) {
        var newData = {
            name: studentName,
            showInLegend: true,
            type: "spline",
            dataPoints: results
        };
        resultGraph.options.data.push(newData);
    }

    function calculateOverallAverageResults() {
        var averageOverallResult;
        var averageStudentResults = 0;

        for (i = 0; i < resultGraph.options.data.length; i++) {
            var averageResult = 0;
            for (j = 0; j < resultGraph.options.data[i].dataPoints.length; j++) {
                averageResult += (resultGraph.options.data[i].dataPoints[j].y / resultGraph.options.data[i].dataPoints.length);
            }
            averageStudentResults += averageResult;
        }
        // Average student resultsa (totalled) divided by the number of students
        averageOverallResult = Math.round((averageStudentResults / resultGraph.options.data.length))

        var newStripline = {
            value:averageOverallResult,
            labelPlacement:"inside",
            lineDashType: "dash",
            color:"black",
            labelFontColor:"black",
    		label: "Average Result (" + averageOverallResult + "%)",
    		labelAlign: "near" // due to potential overlapping
        };
        resultGraph.options.axisY.stripLines.push(newStripline);
    }

    //$('a[data-toggle="tab"]').on('shown.bs.tab', function () {
        //loadStudentResult();
        // Resizes the graph, without this graph will not resize
        //resultGraph.render();

    //    $(this).off('shown.bs.tab');
    //});

    $('[id^=contactUsSubmit]').unbind().click(function() {
        $('input[name="contactUsName"]').prop('disabled', false);
        $('input[name="contactUsEmail"]').prop('disabled', false);
    });

    // LOG OUT
    $('[id^=profileImage]').click(function() {
        $.confirm({
            title: 'Sign out?',
            content: 'Are you sure you wish to sign out?',
            buttons: {
                yes: function () {
                    window.location.replace("http://diogocosta1998.pythonanywhere.com/logout");
                },
                no: function () {
                }
            }
        });
    });

    // Fisher–Yates shuffle
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
});