
//Color submission status boxes
function correct(){
   return $("<span class='glyphicon glyphicon-ok'></span>").css("color", "green").css("margin-right", "5px");
}
function wrong(){
   return $("<span class='glyphicon glyphicon-remove'></span>").css("color", "red").css("margin-right", "5px");
}


function fillProblemEdit(problem) {
	$("#edit").removeClass("hidden");
	$("#editPlaceholder").addClass("hidden");
	$("#editType").val(problem.type);
	$("#editPhase").val(problem.phase);
	$("#editProblemName").val(problem.name);
    $("#editfolderDropdown").val(problem.folder);
    $("#editLanguageDropdown").val(problem.language);
    $("#editDescription").val(problem.text);
    $("#editStylePoints").val(problem.value.style),
    $("#editCorrectPoints").val(problem.value.correct),
    $("#editOnSubmit").val(problem.onSubmit);
    $( "#deleteProblem" ).click(function() {   
        if (confirm('Are you sure you wish to delete this problem ?')) {
            $.post("/problem/delete", {id: problem.id}, function () {
                emptyProblem();
            });
        }
    });
}

function emptyProblem(){
    $("#edit").addClass("hidden");
    $("#editPlaceholder").removeClass("hidden");
    $("#pointbreakdown").addClass("hidden");
    $("#problemDisplayName").empty().append("Choose a Problem");
    $("#problemDisplayBody").empty().append("Select a problem from the left to view more information.");

}

function fillProblemDisplay(problem) {
    $("#pointbreakdown").removeClass("hidden");
    $("#problemDisplayName").empty().append(problem.name);
    $("#problemDisplayBody").empty().append(problem.text);
    $("#availablePtStyle").empty().append(problem.value.style);
    $("#availablePtCorrect").empty().append(problem.value.correct);
}

function getStudentResults(problem) {
    //Loads results of all students on a particular problem
    numfunct = 0;
    numstyle = 0;
    numattempted = 0;
    numearned = 0;
    var tbl = $("<table class='table'><thead><tr><th>Name</th><th># Tries</th><th>Functionality / Style Points</th></tr></thead><tbody id='allStudents1ProblemResults'></tbody></table>");
    $("#allStudents1ProblemTable").empty().append(tbl);
    $.post("/user/read/", {}, function(users){
        total = users.length;
        users.forEach(function (user) {
            var a = $("<td></td>")
                .html("<a href='#individualStudent' data-toggle='pill'>" + user.displayName + "</a>")
                .click(function (event) {
                    event.preventDefault();
                    $.post("/user/read/" + user.id, {}, function (user) {
                        if (!user) {
                            alert("No user with that id found");
                            return;
                        }
                        getIndividual(user,false);
                    });
                });
            var student = $("<tr></tr>");
            student.append(a);
            problemCorrect(user, problem, student, users.length);
        });
    });
}

function updateProblemProgressBar(problem){
    $("#pbp-yellow").css("width",Math.floor(((numattempted-numearned)/total)*100)+"%");
    $("#pbp-green").css("width",Math.floor((numearned/total)*100)+"%");
}

function problemCorrect(user, problem, student, totalStudents){
    //check score of a student for a problem
    var rsection = $("<td></td>");
    var results = {tried: false, correct: false, style: false};
    $.post("/submission/read/" + problem.id, {id: problem.id, student: user.username}, function(submissions){
        if(submissions.length == 0){
            student.append("<td>" + submissions.length + "</td>");
        } else {
        	student.append("<td><a data-toggle='collapse' data-parent='#accordion' href='#submissionUser" + user.id + "' >" + submissions.length + "</a></td>");
            results.tried = true;
            submissions.forEach(function(submission) {
                if(submission.value.correct == problem.value.correct && submission.value.style == problem.value.style) {
                    results.correct = true;
                    results.style = true;
                    return true;
                }
                else if(submission.value.correct == problem.value.correct && submission.value.style != problem.value.style) {
                    results.correct = true;
                }
            });
        }
        if(results.tried) {
            numattempted++;
            if(results.correct) {
                numfunct++;
                rsection.append(problem.value.correct + " / ");
            } else {
                rsection.append(problem.value.correct + " / ");
            } if(results.style) {
                numstyle++;
                rsection.append(problem.value.style);
            } else {
                rsection.append(problem.value.style);
            }
            if(results.correct && results.style){
                numearned++;
            }
        }
        student.append(rsection);
        $("#allStudents1ProblemResults").append(student);

        var collapseBody = $("<tr class='collapse out' id='submissionUser" + user.id + "'></tr>");
       	$("#allStudents1ProblemResults").append(collapseBody);

		submissions.forEach( function (submission) {
            var d = new Date(submission.createdAt);
			var a = $("<a></a>")
				.attr("href","#submission")
				.attr("data-toggle","pill")  //save
                .html(d.toLocaleString())
                .click(function (event) {
                    event.preventDefault();
                        getSubmission(submission,user,problem);
                });
        	$("#submissionUser" + user.id)
                .append($("<tr class='attemptProblem'></tr>")
                    .append($("<td></td>")
                        .append(a))
                    .append($("<td></td>")
                        .append(submission.value.correct + " /"))
                    .append($("<td></td>")
                        .append(" " + submission.value.style))

                );
        });
		console.log("collpasemf");

        //update progress labels
        $("#function").empty().append(Math.floor((numfunct/total)*100)+"%");
        $("#style").empty().append(Math.floor((numstyle/total)*100)+"%");
        updateProblemProgressBar(problem);

    });
}

function getStudentList() {
    //Generate list of all students to view individuals
    $("#viewStudentsList").empty();
    var tbl = $("<table class='table' id='viewStudentsTable'></table>");
    //var tbl = $("<ul id='viewStudentsTable'></ul>");

    $("#viewStudentsList").append(tbl);
    $.post("/user/read/", {}, function(users){
        total = users.length;
        var student = $("<tr></tr>");
        var count = 0;
        users.forEach(function (user) {
            var a = $("<td></td>")
                .html("<a href='#individualStudent' data-toggle='pill'>" + user.displayName + "</a>")
                .click(function (event) {
                    event.preventDefault();
                    $.post("/user/read/" + user.id, {}, function (user) {
                        if (!user) {
                            alert("No user with that id found");
                            return;
                        }
                        getIndividual(user,false);
                    });
                });            
            student.append(a);
            count++;
            if(count > 3){
                $("#viewStudentsTable").append(student);
                student = $("<tr></tr>");
                count = 0;
            }
        });
        $("#viewStudentsTable").append(student);
    });
}

function getSubmission(submission,user,problem) {
    //Generate page for particular submission    
	var d = new Date(submission.createdAt);
    $("#submissionCreatedAt").html(d.toLocaleString());

    var currentId = submission.id;
    var a = $("<a></>")
    	.attr("href","#individualStudent")
    	.attr("data-toggle","pill")
    	.html(user.displayName)
        .click(function (event) {
            event.preventDefault();
            $.post("/user/read/" + user.id, {}, function (user) {
                if (!user) {
                    alert("No user with that id found");
                    return;
                }
                getIndividual(user,false);
            });
        });
    var b = $("<a></>")
    	.attr("href","#questions")
    	.attr("data-toggle","pill")
    	.html(problem.name)
        .click(function (event) {
            event.preventDefault();
	        curProblem = problem;
	        fillProblemEdit(curProblem);
	        fillProblemDisplay(curProblem);
	        getStudentResults(curProblem);

        });
    $("#submissionProblem").empty().append(b);
    $("#submissionCreatedBy").empty().append(a);
    $("#relatedSubmissions").empty();
    $("#ISL" + folder.id).append("<li>" + '<div class="problem-name-first left">' + "<a data-toggle='collapse' data-parent='#accordian' href='#ISL" + problem.id + "' >" + problem.name + "</a></div><span id='ipPoints" + problem.id + "'></span><span id='ipCount" + problem.id + "'></span><ul id='ISL" + problem.id + "' class='panel-collapse collapse'></ul></li>");
    console.log(submission.code);

    editor.setValue(submission.code);
    console.log("refresh editor");

    $("#submissionMessage").empty().html(submission.message);
    $("#submissionTitle").html(problem.name);
	$.post("/folder/read/", {id: problem.folder}, function(folder){
		console.log(folder.name);
		$("#submissionTitle").html(problem.name + "<i> in " + folder.name + "</i>");
	});

    $.post("/submission/read/", {id: problem.id, student: user.username}, function(submissions){
        submissions.forEach( function (submission) {
        	var d = new Date(submission.createdAt);

            if(currentId == submission.id){
                var a = $("<li></li>")
                .html(d.toLocaleString() + "<br /> -c" + submission.value.correct + " -s " + submission.value.style)
                .click(function (event) {
                    event.preventDefault();
                    getSubmission(submission,user,problem);
                });
            }else {
                var a = $("<li></li>")
                .html("<a href='#submission' data-toggle='pill'>" + d.toLocaleString() + "</a><br /> -c" + submission.value.correct + " -s " + submission.value.style)
                .click(function (event) {
                    event.preventDefault();
                    getSubmission(submission,user,problem);
                });
            }
            $("#relatedSubmissions").append(a);
        });
    });
    setTimeout( editor.refresh(), 0 );

}

function getIndividual(user, refresh) {
    console.log("getIndividual called");
    //Generate page for particular individual student    
    if(curStudent == user.id && refresh == false){
        return;
    }
    curStudent = user.id;

    $("#pbp-yellow").css("width","0%");
    $("#pbp-green").css("width","0%");
    $("#pbp-red").css("width","0%");
    $("#individualProgessBar").removeClass("hidden");
    $("#individualSubmissionList").empty();
    $("#studentRefresh").attr("disabled", "disabled");

    $("#individualName").html(user.displayName + " " + user.username);

    var tooltipGreen = "Problems for which full points were earned";
    var tooltipYellow = "Attempted problems that did not recieve full credit";
    $("#individualProgessBar").empty().append('<div class="progress"><div id="pbgreen" class="progress-bar progress-bar-success" style="width: 0%;" data-toggle="tooltip" data-placement="top" title="' + tooltipGreen + '"><span class="sr-only">35% Complete (success)</span></div> <div id="pbyellow" class="progress-bar progress-bar-warning progress-bar-striped" style="width: 0%" data-toggle="tooltip" data-placement="top" title="' + tooltipYellow + '"><span class="sr-only">20% Complete (warning)</span></div><div id="pbred" class="progress-bar progress-bar-danger" style="width: 0%"><span class="sr-only">10% Complete (danger)</span></div></div>');
    //must enable tooltips
    $('[data-toggle="tooltip"]').tooltip()
    var totalSubmissionNumber = 100000000000000;

    
    $.post("/submission/read/", {student: user.username}, function(submissions){
        totalSubmissionNumber = submissions.length;
        /*
        Code for catching deleting "hanging" submissions whose folder/problem have been deleted
        submissions.forEach( function (submission) {
            
            $.post("/problem/read", {id: submission.problem}, function (problem) {
                if(!problem){
                    console.log("no problem");
                    $.post("/submission/delete", {id: submission.id}, function (submission) {
                        console.log("deleted submission" + submission.id);
                    });
                }
                $.post("/folder/read", {id: problem.folder}, function (folder) {
                    if(!folder){
                        console.log("no folder");
                        $.post("/problem/delete", {id: problem.id}, function (problem) {
                            console.log("deleted problem " + problem.id);
                        });

                    }
                });
            });
        });*/
    });

    if(totalSubmissionNumber == 0){
        $("#studentRefresh").removeAttr('disabled');
    }
    var submissionCount = 0;
    $.post("/folder/read", null, function (folders) {
        var totalEarned = 0;
        var totalAttempted = 0;
        folders.forEach(function (folder) {
            var toggleLabel = '<h4><a data-toggle="collapse" data-parent="#accordion" href="#ISL'+ folder.id + '">' + folder.name + '</a></h4>';
            $("#individualSubmissionList").append(toggleLabel + "<ul id ='ISL" + folder.id + "' class='panel-collapse collapse'></ul>");
            $.post("/problem/read", {folder: folder.id}, function (problems) {
                problems.forEach( function (problem) {
                    var availableStylePoints = problem.value.style;
                    var availableFuncPoints = problem.value.correct;
                    var earnedStylePoints = parseInt(0);
                    var earnedFuncPoints = parseInt(0);
                    var attemptedStylePoints = parseInt(0);
                    var attemptedFuncPoints = parseInt(0);
                    $.post("/submission/read/", {id: problem.id, student: user.username}, function(submissions){
                        $("#ISL" + folder.id).append("<li>" + "<a data-toggle='collapse' data-parent='#accordian' href='#ISL" + problem.id + "' >" + problem.name + "</a><span id='ipPoints" + problem.id + "'></span><span id='ipCount" + problem.id + "'></span><ul id='ISL" + problem.id + "' class='panel-collapse collapse'></ul></li>");
                        submissions.forEach( function (submission) {
                            submissionCount++;
                            console.log(user.displayName + " " + submissionCount + "/" + totalSubmissionNumber);
                            if(totalSubmissionNumber == submissionCount){
                                $("#studentRefresh").removeAttr('disabled');
                            }

							var d = new Date(submission.createdAt);

                            var a = $("<li></li>")
                            .html("<a href='#submission' data-toggle='pill'>" + d.toLocaleString() + "</a>")
                            .click(function (event) {
                                event.preventDefault();
                                    getSubmission(submission,user,problem);
                            });
                            $("#ISL" + problem.id).append(a);
                            $("#ISL" + problem.id).append("style: " + submission.value.style  + "correct: " + submission.value.correct + "</li>");
                            if (parseInt(submission.value.style) > parseInt(earnedStylePoints)){
                                earnedStylePoints = parseInt(submission.value.style);
                                totalEarned += parseInt(earnedStylePoints);
                            }
                            if (parseInt(submission.value.correct) > parseInt(earnedFuncPoints)){
                                earnedFuncPoints = parseInt(submission.value.correct);
                                totalEarned += parseInt(earnedFuncPoints);
                            }
                            var percent = parseInt(totalEarned) / parseInt(numpoints) * parseInt(100);
                            percent = percent + "%";
                            $("#pbgreen").css("width",percent);
                        });
                        if(submissions.length > 0){
                            totalAttempted += parseInt(availableStylePoints) - parseInt(earnedStylePoints);
                            totalAttempted += parseInt(availableFuncPoints) - parseInt(earnedFuncPoints);
                        }
                        if(submissions.length >= 0){
                            $("#ipCount" + problem.id).append("<div class='left'>" + submissions.length + " submissons</div>");
                        }
                        var percent = parseInt(totalAttempted) / parseInt(numpoints) * parseInt(100);
                        percent = percent + "%";
                        $("#pbyellow").css("width",percent);
                        $("#ipPoints" + problem.id).append("<div class='left'>Functional points: " + earnedStylePoints  + "/" + availableStylePoints + "</div><div class='left'>Style points: " + earnedFuncPoints + "/" + availableFuncPoints + "</div>")
                    });
                });
            });
        });
    });
    $("#studentRefresh").unbind('click');
    $("#studentRefresh").click(function () { 
        $.post("/user/read", {id: curStudent}, function (user) {
            if (!user) {
                alert("error");
            }else {
                getIndividual(user, true);
                $("#studentRefresh").attr("disabled", "disabled");
            }
        });

    });
    
}

function getIndividualNone(onyen) {

    $("#pbp-yellow").css("width","0%");
    $("#pbp-green").css("width","0%");
    $("#pbp-red").css("width","0%");
    $("#individualSubmissionList").empty();
    $("#individualProgessBar").addClass("hidden");

    $("#individualName").html("No user with found with onyen <i>\"" + onyen + "\"</i>");
    var heading = $("<h3></h3>");
    var backLink = $("<a></a>")
        .attr("href","#students")
        .attr("data-toggle","pill")
        .html("Back to Students List");
    $("#individualSubmissionList").append(heading.append(backLink));

}

function reloadFolders() {
    $("#leftSideFolders").empty();
	$("#folderDropdown").empty();
    $("#editFolderDropdown").empty();
    numpoints = 0;
    $.post("/folder/read", null, function (folders) {
        folders.forEach(function (folder) {
            addFolder(folder);
        });
    });
}

function addFolder(folder) {

	$("#folderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
	$("#problemsfolderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
	$("#editfolderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));

    if(curProblem) {
        $("#editfolderDropdown").val(curProblem.folder);
    }
    if(curFolder) {
        $("#problemsfolderDropdown").val(curFolder);
    }

    var accordianFolderId = "accoridanFolder" + folder.id;
    var toggleLabel = '<a data-toggle="collapse" data-parent="#accordion" href="#'+ accordianFolderId + '">' + folder.name + '</a>';
    var accordian = "<div class='panel panel-default'><div class='panel-heading'><h4 class='panel-title'>" + toggleLabel + "</h4></div><div id = 'accoridanFolder" + folder.id + "' class='panel-collapse collapse folderCollapse'></div>";
    $("#leftSideFolders").append(accordian);

    $("#" + accordianFolderId).empty();
    $.post("/problem/read", {folder: folder.id}, function (problems) {
        problems.forEach( function (problem) {
            numpoints += parseInt(problem.value.style) + parseInt(problem.value.correct);
            var link = addProblemToAccordian(problem, accordianFolderId);
          //  console.log(problem.name + " " + problem.id);
            $("#" + accordianFolderId).append(link);
        });
    });
}

function addProblemToAccordian(problem,folderName){
    var link = $("<p></p>").append(
        $("<a></a>")
            .attr("href","#questions")
            .attr("data-toggle","pill")
            .append(problem.name)
    );
    if(problem.phase == 0) {
        link.css("background-color","lightgray");
    }
    link.click(function () { 
        curProblem = problem;
        fillProblemEdit(curProblem);
        fillProblemDisplay(curProblem);
        getStudentResults(curProblem);
    });
    return link;
}

function reloadSortableFolders() {
    $("#leftSideFolders").empty();
    
    //Create new folder
    var addFolder = $('<div></div>')
    .attr("id","addFolder")
    .append("<div class='input-group'><input type='text' id='newFolder' class='form-control' placeholder='Add folder...'></input><span class='input-group-btn'><button type='submit' id='newFolderBtn' class='btn btn-default'><span class='glyphicon glyphicon-plus' style='color:green;''></span></button></span></div><div id='newFolderError'></div>");
    $("#leftSideFolders").append(addFolder);
    $("#newFolderBtn").click(function () {
            $("#newFolderError").empty();
            if($("#newFolder").val()==""){
                var noNameError = $("<div class='alert alert-danger' role='alert'>Please enter a folder name</div>");
                $("#newFolderError").append(noNameError);
            } else {
                $.post("/folder/create", {name: $("#newFolder").val()}, function (folder) {
                    if(blinkTimer > 0){
                        reloadSortableFolders();
                    }else {
                       reloadFolders();
                    }
                    $("#newFolder").val("");
                });
            }
        });

    //Iterate and add each sortable folder and its sortable children
    $("#leftSideFolders").append('<ul id="sortable" class="panel-default"></ul>');
    $.post("/folder/read", null, function (folders) {
        folders.forEach(function (folder) {


            var expandButton = $("<a href='#accoridanFolder" + folder.id + "'></a>")
            .attr("data-parent","#accordion")
            .attr("data-toggle","collapse")
            .html('<span class="glyphicon expand-folders glyphicon-folder-open" style="padding:0 8px;float:right"></span>')
            .click(function () {
                if ($(".expand-folders").hasClass("glyphicon-folder-open")) {
                    $(".expand-folders").removeClass("glyphicon-folder-open").addClass("glyphicon-folder-close");
                } else {
                    $(".expand-folders").removeClass("glyphicon-folder-close").addClass("glyphicon-folder-open");
                }
            });


            var removeButton = $("<a href='#'></a>")
            .css("color","red")
            .html('<span class="glyphicon glyphicon-remove" style="padding:0 5px;float:right"></span>') // the trailing space is important!
            .click(function () {
                if (confirm('Are you sure you wish to delete this folder ?')) {
                    $.post("/folder/delete", {id: folder.id}, function () {
                        reloadSortableFolders();
                    });
                }
            });

            var heading = $("<h4></h4>")
            .addClass("panel-title")
            .html('<span class="sortableGrip ui-icon ui-icon-arrowthick-2-n-s"></span>' + folder.name + "</h4>")
            .append(removeButton).append(expandButton);

            var expandableFolder = $("<div></div>")
            .attr("id","accoridanFolder" + folder.id)
            .attr("class","panel-collapse collapse folderCollapse")
            .html("<ul id='sortableFolder" + folder.id + "' class='sortable2' ></ul>");

            var sortableItem = $("<li></li>")
            .attr("class","ui-state-default sortableFolder panel-heading")
            .attr("id",folder.id);
            sortableItem.append(heading);
            sortableItem.append(expandableFolder);

            $.post("/problem/read", {folder: folder.id}, function (problems) {
                problems.forEach( function (problem) {

                    var removeButton = $("<a href='#'></a>")
                    .css("color","red")
                    .html('<span class="glyphicon glyphicon-remove" style="padding: 0 5px;float:right"></span>') // the trailing space is important!
                    .click(function () {
                        if (confirm('Are you sure you wish to delete this problem ?')) {
                            $.post("/problem/delete", {id: problem.id}, function () {
                                console.log('reloadSortableFolders();')
                            });
                        }
                        reloadSortableFolders();

                    });

                    var sortableProblem = $("<li></li>")
                    .attr("class","ui-state-default")
                    .attr("id",problem.id)
                    .append('<span class="sortableGrip2 ui-icon ui-icon-arrowthick-2-n-s"></span>' + problem.name).append(removeButton);
                    $("#sortableFolder" + folder.id).append(sortableProblem);
                });
            });

            $("#sortable").append(sortableItem);

            $( "#sortableFolder" + folder.id ).sortable({
                handle: ".sortableGrip2",
                start: function(e, ui) {
                    // creates a temporary attribute on the element with the old index
                    $(this).attr('data-previndex', ui.item.index());
                },
                update : function (e, ui) {
                    var newIndex = ui.item.index();
                    var oldIndex = $(this).attr('data-previndex');
                    var id = ui.item.attr('id');
                    var difference = oldIndex - newIndex;
                    $.post("/problem/update", {id: id, folder: folder, num: oldIndex, dir: difference}, function (problem) {
                    });
                }
            });
            $( "#sortableFolder" + folder.id ).disableSelection();

        });

        $( "#sortable" ).sortable({
            handle: ".sortableGrip",
            start: function(e, ui) {
                // creates a temporary attribute on the element with the old index
                $(this).attr('data-previndex', ui.item.index());
            },
            update : function (e, ui) {
                var newIndex = ui.item.index();
                var oldIndex = $(this).attr('data-previndex');
                var id = ui.item.attr('id');
                var difference = oldIndex - newIndex;
                $.post("/folder/update", {id: id, num: oldIndex, dir: difference}, function (folder) {
                });
            }
        });
        $( "#sortable" ).disableSelection();
    });
}

function loadUsers() {
    //interface for editing who is an admin
    $("#admins").empty();
    $.post("/user/readAdmin", null, function (admins) {
        admins.forEach(function(admin) {
            var removeButton = $("<a href='#'></a>")
            .css("color","red")
            .html("<span class='glyphicon glyphicon-remove'></span> ") // the trailing space is important!
            .click(function () {
                if (confirm('Are you sure you wish to delete ?')) {
                    $.post("/user/removeAdmin", {id: admin.id}, function () {
                        loadUsers();
                    });
                }
             });
            var label = $("<li></li>").attr("class","list-group-item").append(removeButton).append(admin.displayName);
            $("#admins").append(label);
        });
    });
}

//controls for the blinking on the edit folder side
var blinkTimer;
function blinking(elm) {
    blinkTimer = setInterval(blink, 10);
    function blink() {
        elm.fadeOut(600, function() {
           elm.fadeIn(600);
        });
    }
} 

var editor;
window.onload = function () {
    curProblem = null;
    curStudent = null;
    curFolder = null;
    numProblems = 0;
    numfunct = 0; //num solutions with correct functionality
    numstyle = 0; //num solutions with correct style
    numattempted = 0; //num students submitted anything
    numearned = 0; //num students earned full points
    numpoints = 0; //num of total points it is possible to earn

	reloadFolders();
    loadUsers();
    getStudentList();
    /*
    setInterval(
        function() {
            getStudentResults(curProblem);
        },
        30000 /* 30000 ms = 30 sec */
   // ); 
    
    setInterval(
        function() {
            updateProblemProgressBar(curProblem);
        },
        500 /* 30000 ms = 30 sec */
    );

    editor = CodeMirror.fromTextArea(codemirror, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        readOnly: true,
        theme: "mbo",
        extraKeys: {
            "F11": function (cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    //reset student data
    $("#refreshData").click(function() {
        getStudentResults(curProblem);
    });
    //add problems
	$("#addProblem").click(function (event) {
		// Grab the values from the form and submit to the server.
		// TODO - this might be better in a $(form).submit(...)
		event.preventDefault();
		var opts = {
			type: $("#type").val(),
			phase: $("#phase").val(),
			name: $("#problemName").val(),
			folder: $("#folderDropdown").val(),
            language: $("#languageDropdown").val(),
			text: $("#description").val(),
            style: $("#stylePoints").val(),
            correct: $("#correctPoints").val(),
			onSubmit: $("#onSubmit").val()
		};
        $("#newProblemError").empty();
		// TODO - Build errors with jQuery
        if($("#problemName").val()=="") {
			var noNameError = $("<div class='alert alert-danger' role='alert'>Please enter a problem name</div>");
            $("#newProblemError").append(noNameError);
        } else if($("#description").val()=="") {
			var noDescriptionError = $("<div class='alert alert-danger' role='alert'>Please enter a problem description</div>");
            $("#newProblemError").append(noDescriptionError);
        } else if($("#stylePoints").val()=="" || $("#correctPoints").val()=="") {
            var noPointsError = $("<div class='alert alert-danger' role='alert'>Please enter style and correctness points</div>");
            $("#newProblemError").append(noPointsError);
        } else {
            console.dir(opts);
            $.post("/problem/create", opts, function (problem) {
                reloadFolders();
            });
        }
	});
	$("#editProblem").click(function (event) {
		// Grab the values from the form and submit to the server.
		// TODO - this might be better in a $(form).submit(...)
		event.preventDefault();
		var opts = {
            id: curProblem.id,
			type: $("#editType").val(),
			phase: $("#editPhase").val(),
			name: $("#editProblemName").val(),
			folder: $("#editfolderDropdown").val(),
            language: $("#editLanguageDropdown").val(),
			text: $("#editDescription").val(),
            correct: $("#editCorrectPoints").val(),
            style: $("#editStylePoints").val(),
			onSubmit: $("#editOnSubmit").val()
		};
        $("#editProblemError").empty();
		//Build errors with jQuery
        if($("#editProblemName").val()=="") {
			var noNameError = $("<div class='alert alert-danger' role='alert'>Please enter a problem name</div>");
            $("#editProblemError").append(noNameError);
        } else if($("#editDescription").val()=="") {
			var noDescriptionError = $("<div class='alert alert-danger' role='alert'>Please enter a problem description</div>");
            $("#editProblemError").append(noDescriptionError);
        } else if($("#editStylePoints").val()=="" || $("#editCorrectPoints").val()=="") {
            var noPointsError = $("<div class='alert alert-danger' role='alert'>Please enter style and correctness points</div>");
            $("#editProblemError").append(noPointsError);
        } else {
            console.dir(opts);
            $.post("/problem/update", opts, function (problem) {
                var updateSuccessMessage = $("<div class='alert alert-success' role='alert'>Problem Updated</div>");
                $("#editProblemError").append(updateSuccessMessage);
                curProblem = problem;
                reloadFolders();
            });
        }
	});
    $("#newAdminBtn").click(function() {
        $.post("/user/setAdmin", {user: $("#newAdmin").val()}, function(admin) {
            if(admin) {
                var updateSuccessMessage = $("<div class='alert alert-success' role='alert'>Update Succeeded</div>");
                $("#newAdmin").val("");
                $("#newAdminError").empty().append(updateSuccessMessage);
                loadUsers();
            } else {
                var updateErrorMessage = $("<div class='alert alert-danger' role='alert'>That username is not in our database</div>");

                $("#newAdminError").empty().append(updateErrorMessage);
            }
        });
    });
    //handle the alternating and blinking for editing folders button
    $('#sortFolders').on('click', function() {
        if($(this).text() == 'Edit Folders') {
            blinking($("#sortFolders"));
            $(this).text('Done');
            reloadSortableFolders();
        } else {
            clearInterval(blinkTimer);
            $(this).text('Edit Folders');
            reloadFolders();
        }
    });

    $('#onyenSearchButton').on('click', function( event ) {
        var onyenValue = $("#onyen").val();
        console.log("onyen " + onyenValue);
        if(onyenValue == ""){
            getIndividualNone("null");
            return;
        }
        $.post("/user/read", {onyen: onyenValue}, function (user) {
            if (!user) {
                getIndividualNone(onyenValue);
            }else {
                $("#individual").tab('show');
                getIndividual(user, false);
            }
        });

    });

    $('#submissionCollapseAll').on('click', function() {
        if($(this).text() == 'Hide Student Info') {
            $(this).text('Show Student Info');
            $('.submissionCollapse').collapse('hide');
        } else {
            $(this).text('Hide Student Info');
            $('.submissionCollapse').collapse('show');
        }
        return false;
    });

    //enable tooltips
    $('[data-toggle="tooltip"]').tooltip()
};