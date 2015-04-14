///Krista sidebar for problem navigations that i copied from the index
fProto = {
   addProblem : function (problem) {
      var link = $("<li></li>").append(
            $("<a></a>")
                .attr("href","#")
                .append(problem.name)
        );
        if(problem.phase == 0) {
            link.css("background-color","lightgray");
        }
        $("ul",this.domNode).append(link);
    }
}

//Color submission status boxes
function correct(){
   return $("<span class='glyphicon glyphicon-ok'></span>").css("color", "green").css("margin-right", "5px");
}
function wrong(){
   return $("<span class='glyphicon glyphicon-remove'></span>").css("color", "red").css("margin-right", "5px");
}

function fillForm(problem) {
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
    //$("#editProblemLanguageDropdown").val(problem.language);
	// TODO - fill edit question panel
	// need a hidden form in the panel in the html
	// show the form, then fill the data

	// TODO - Finish inserting form data
}
function fillProblemDisplay(problem) {
    $("#pointbreakdown").removeClass("hidden");
    $("#problemDisplayName").empty().append(problem.name);
    $("#problemDisplayBody").empty().append(problem.text);
    $("#availablePtStyle").empty().append(problem.value.style);
    $("#availablePtCorrect").empty().append(problem.value.correct);
}

function getStudentResults(problem) {
    if(curProblem == null) {
        return;
    }
    numfunct = 0;
    numstyle = 0;
    numattempted = 0;
    numearned = 0;
    $("#studentResultsTable").empty();
    var tbl = $("<table class='table'><thead><tr><th>Name</th><th># Tries</th><th>Result</th></tr></thead><tbody id='studentResults'></tbody></table>");
    $("#studentResultsTable").append(tbl);
    $.post("/user/read/", {}, function(users){
        total = users.length;
        users.forEach(function (user) {
            var a = $("<td></td>")
                .html("<a href='#individual' data-toggle='pill'>" + user.displayName + "</a>")
                .click(function (event) {
                    event.preventDefault();
                    $.post("/user/read/" + user.id, {}, function (user) {
                        if (!user) {
                            alert("No user with that id found");
                            return;
                        }
                        getIndividual(user);
                    });
                });
            var student = $("<tr></tr>");
            student.append(a);
            problemCorrect(user, problem, student, users.length);
        });
    });
}

function getStudents() {
    $("#studentTable").empty();
    var tbl = $("<table class='table'><thead><tr><th>Name</th></tr></thead><tbody id='studentsTableBody'></tbody></table>");
    $("#studentTable").append(tbl);
    $.post("/user/read/", {}, function(users){
        total = users.length;
        users.forEach(function (user) {
            var a = $("<td></td>")
                .html("<a href='#individual' data-toggle='pill'>" + user.displayName + "</a>")
                .click(function (event) {
                    event.preventDefault();
                    $.post("/user/read/" + user.id, {}, function (user) {

                    //$.post("/user/read/", {id: user.id}, function (user) {
                        if (!user) {
                            alert("No user with that id found");
                            return;
                        }
                        getIndividual(user);
                    });
                });            
            var student = $("<tr></tr>");
            student.append(a);
            $("#studentsTableBody").append(student);

        });
    });
}

//load submission
function getSubmission(submission,user,problem) {
    $("#submissionCreatedAt").html(submission.createdAt);
    var a = $("<td></td>")
        .html("<a href='#individual' data-toggle='pill'>" + user.displayName + "</a>")
        .click(function (event) {
            event.preventDefault();
            $.post("/user/read/" + user.id, {}, function (user) {
                if (!user) {
                    alert("No user with that id found");
                    return;
                }
                getIndividual(user);
            });
        });
    $("#submissionCreatedBy").empty().append(a);
    $("#submissionProblem").html(problem.name);
    $("#submissionPoints").html("Style pts:" + submission.value.style +  "/" + problem.value.style + "<br/>Func Points: " + submission.value.correct + "/" + problem.value.correct);
    $("#submissionCodebox").html(submission.code);
    $("#submissionMessage").html(submission.message);
    $("#submissionTitle").html("heres a submission");
}

//load individual's page
function getIndividual(user) {
    if(curStudent == user){
        return;
    }
    $("#pbp-yellow").css("width","0%");
    $("#pbp-green").css("width","0%");
    $("#pbp-red").css("width","0%");

    curStudent = user;
    $("#individualName").html(user.displayName + " " + user.username);
    $("#individualSubmissionList").empty();
    var tooltipGreen = "Problems for which full points were earned";
    var tooltipYellow = "Attempted problems that did not recieve full credit";
    $("#individualProgessBar").empty().append('<div class="progress"><div id="pbgreen" class="progress-bar progress-bar-success" style="width: 0%;" data-toggle="tooltip" data-placement="top" title="' + tooltipGreen + '"><span class="sr-only">35% Complete (success)</span></div> <div id="pbyellow" class="progress-bar progress-bar-warning progress-bar-striped" style="width: 0%" data-toggle="tooltip" data-placement="top" title="' + tooltipYellow + '"><span class="sr-only">20% Complete (warning)</span></div><div id="pbred" class="progress-bar progress-bar-danger" style="width: 0%"><span class="sr-only">10% Complete (danger)</span></div></div>');
    //must enable tooltips
    $('[data-toggle="tooltip"]').tooltip()

    $.post("/folder/read", null, function (folders) {
        var totalEarned = 0;
        var totalAttempted = 0;
        numFolders = folders.length;
        folders.forEach(function (folder) {
            var toggleLabel = '<h4><a data-toggle="collapse" data-parent="#accordion" href="#ISL'+ folder.id + '">' + folder.name + '</a></h4>';
            $("#individualSubmissionList").append(toggleLabel + "<ul id ='ISL" + folder.id + "' class='panel-collapse collapse'></ul>");
            $.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
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
                            var a = $("<li></li>")
                            .html("<a href='#submission' data-toggle='pill'>" + submission.createdAt + "</a>")
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
                            $("#ipCount" + problem.id).append("<br />" + submissions.length + "submissons");
                        }
                        var percent = parseInt(totalAttempted) / parseInt(numpoints) * parseInt(100);
                        percent = percent + "%";
                        $("#pbyellow").css("width",percent);
                        $("#ipPoints" + problem.id).append("<br />Points:  " + earnedStylePoints  + "/" + availableStylePoints + " and " + earnedFuncPoints + "/" + availableFuncPoints)
                    });
                });
            });
        });
    });
}

//check score of student for problem
function problemCorrect(user, problem, student, totalStudents){
    var rsection = $("<td></td>");
    var results = {tried: false, correct: false, style: false};
    $.post("/submission/read/" + problem.id, {id: problem.id, student: user.username}, function(submissions){
        student.append("<td>" + submissions.length + "</td>");
        if(submissions.length == 0){
        } else {
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
                rsection.append(correct());
            } else {
                rsection.append(wrong());
            } if(results.style) {
                numstyle++;
                rsection.append(correct());
            } else {
                rsection.append(wrong());
            }
            if(results.correct && results.style){
                numearned++;
            }
        }
        student.append(rsection);
        $("#studentResults").append(student);
        //update quickview progress labels
        $("#function").empty().append(Math.floor((numfunct/total)*100)+"%");
        $("#style").empty().append(Math.floor((numstyle/total)*100)+"%");

        $("#pbp-yellow").css("width",Math.floor(((numattempted-numearned)/total)*100)+"%");
        $("#pbp-green").css("width",Math.floor((numearned/total)*100)+"%");

    });
}

function reloadFolders() {
	$("#folders").empty();
	$("#folderBar").empty();
    $("#folderAccordion").empty();
	$("#folderDropdown").empty();
    $("#problemsfolderDropdown").empty();
    $("#editfolderDropdown").empty();
	allFolders = {};
	loadFolders();
}

var allFolders = {};
var folderActions = {
	remove: function () {
		// TODO - call remove on each individual problem
		for (var i in this.allProblems) {
			this.allProblems[i].remove();
		}
		this.listNode.remove();
		this.menuNode.remove();
	},
	reload: function () {
		var that = this;
		$.post("/problem/read", {folder: that.data.id}, function (problems) {
			var button = $("<button></button>")
			.attr("type","button")
			.attr("class","btn btn-default dropdown-toggle")
			.attr("data-toggle","dropdown")
			.html(that.data.name + " <span class='caret'></span>");
			var pList = $("<ul></ul>").attr("class","dropdown-menu").attr("role","menu");
			problems.forEach(function (p) {
				var a = $("<a href='#'></a>")
				.html(p.name)
				.click(function (event) {
                    $("#editProblemError").empty();
					event.preventDefault();
					$.post("/problem/read/" + p.id, {}, function (problem) {
						if (!problem) {
							alert("No problem with that id found");
							return;
						}
                        curProblem = problem;
						fillForm(curProblem);
                        fillProblemDisplay(curProblem);
                        getStudentResults(curProblem);
					});
				});
				var item = $("<li></li>").append(a);
				pList.append(item);
				var pObj = {
					data: p,
					domNode: item
				};
				pObj.__proto__ = problemActions;
				that.allProblems[p.id] = pObj;
			});
			that.menuNode.empty();
			that.menuNode.append(button).append(pList);
		});
	}
};
var problemActions = {
	remove: function () {
		$.post("/problem/delete/" + this.data.id, {}, function (response) {
			alert("deleted");
		});
		this.domNode.remove();
	}
};

function addProblems() {

    $.post("/problem/read/", {folder: curFolder}, function (problems) {
        $("#problems").empty();
        if(problems.length == 0) {
            label = $("<li>No Problems</li>").attr("class", "list-group-item");
            $("#problems").append(label);
        }
        numProblems = problems.length;
        problems.forEach(function(problem) {
            var removeButton = $("<a href='#'></a>")
            .css("color","red")
            .html("<span class='glyphicon glyphicon-remove'></span> ") // the trailing space is important!
            .click(function () {
                $.post("/problem/destroy", {id: problem.id}, function (problem) {
                   reorderProblems();
                });
             });
                //add buttons to change order of problems
                var moveUpButton = $("<a href='#'></a>")
                .html(" <span class='glyphicon glyphicon-chevron-up'></span> ")
                .css("float","right");
                var moveDownButton = $("<a href='#'></a>")
                .html(" <span class='glyphicon glyphicon-chevron-down'> </span>")
                .css("float","right");
                //move up button is enabled
            if(problem.num == 0) {
                //move up button is disabled
               moveUpButton.click(function(e) {
                    e.preventDefault();
               })
               .css("color", "gray");
               //move down button is functional
                moveDownButton.click(function() {
                    $.post("/problem/update", {id: problem.id, folder: curFolder, num: problem.num, dir: -1}, function (problem) {
                        reloadFolders();
                        addProblems();
                    });
                });
            }
            //if last problem
            else if(problem.num == (numProblems - 1)) {
                //move up button is functional
                moveUpButton.click(function() {
                    $.post("/problem/update", {id: problem.id, folder: curFolder, num: problem.num, dir: 1}, function (problem) {
                        reloadFolders();
                        addProblems();
                    });
                });
                //move down button is disabled
               moveDownButton.click(function(e) {
                    e.preventDefault();
               })
               .css("color", "gray");
            }
            else {
                //move up button is enabled
                moveUpButton.click(function() {
                    $.post("/problem/update", {id: problem.id, folder: curFolder, num: problem.num, dir: 1}, function (problem) {
                        reloadFolders();
                        addProblems();
                    });
                });
                //move down button is enabled
                moveDownButton.click(function() {
                    $.post("/problem/update", {id: problem.id, folder: curFolder, num: problem.num, dir: -1}, function (problem) {
                        reloadFolders();
                        addProblems();
                    });
                });
            }
            var label = $("<li></li>").attr("class","list-group-item").append(removeButton).append(problem.name).append(moveUpButton).append(moveDownButton);
            //add label to folder ui lists
            $("#problems").append(label);
        });

    });

};

function reorderFolders() {
   $.post("/folder/reorder", {}, function () {
        reloadFolders();
   });        
}

function reorderProblems() {
   $.post("/problem/reorder", {folder: curFolder}, function () {
        addProblems();
        reloadFolders();
   });        
}

function addFolder(folder) {
    /*
	// add in Folders list
	var removeButton = $("<a href='#'></a>")
	.css("color","red")
	.html("<span class='glyphicon glyphicon-remove'></span> ") // the trailing space is important!
	.click(function () {
		$.post("/folder/destroy", {id: folder.id}, function () {
            reorderFolders();
            //reloadFolders();
        });
       //allFolders[folder.id].remove();
	});
    //add buttons to change order of folders
    var moveUpButton = $("<a href='#'></a>")
    .html(" <span class='glyphicon glyphicon-chevron-up'></span> ")
    .css("float","right");
    var moveDownButton = $("<a href='#'></a>")
    .html(" <span class='glyphicon glyphicon-chevron-down'> </span>")
    .css("float","right");
    //if first folder
    if(folder.num == 0) {
        //move up button is disabled
       moveUpButton.click(function(e) { 
            e.preventDefault();
       })
       .css("color", "gray");
       //move down button is functional
        moveDownButton.click(function() {
            $.post("/folder/update", {id: folder.id, num: folder.num, dir: -1}, function (folder) {
                reloadFolders();
            });
        });
    }
    //if last folder
    else if(folder.num == (numFolders - 1)) {
        //move up button is functional
        moveUpButton.click(function() {
            $.post("/folder/update", {id: folder.id, num: folder.num, dir: 1}, function (folder) {
                reloadFolders();
            });
        });
        //move down button is disabled
       moveDownButton.click(function(e) {
            e.preventDefault();
       })
       .css("color", "gray");
    }
    else {
        //move up button is enabled
        moveUpButton.click(function() {
            $.post("/folder/update", {id: folder.id, num: folder.num, dir: 1}, function (folder) {
                reloadFolders();
            });
        });
        //move down button is enabled
        moveDownButton.click(function() {
            $.post("/folder/update", {id: folder.id, num: folder.num, dir: -1}, function (folder) {
                reloadFolders();
            });
        });

    }
    */
    //append name and buttons to folder label
	//var label = $("<li></li>").attr("class","list-group-item").append(removeButton).append(folder.name).append(moveUpButton).append(moveDownButton);
    //add label to folder ui lists
	//$("#folders").append(label);
	$("#folderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
	$("#problemsfolderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
	$("#editfolderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
    //make folder object
	/*var fObj = {
		data: folder,
		listNode: label,
		menuNode: $("<div class='btn-group'></div>"),
		allProblems: {}
	};
	fObj.__proto__ = folderActions;

    //add folder object to allFolders
	allFolders[folder.id] = fObj;
	fObj.reload();

    //setup menu bar of folders
	$("#folderBar").append(fObj.menuNode);*/
    //if necessary, update folder of current problem - it shifted back to the first folder during reload

    if(curProblem) {
        $("#editfolderDropdown").val(curProblem.folder);
    }
    if(curFolder) {
        $("#problemsfolderDropdown").val(curFolder);
    }

////krista

    var accordianFolderName = "accoridanFolder" + folder.id;
    var toggleLabel = '<a data-toggle="collapse" data-parent="#accordion" href="#'+ accordianFolderName + '">' + folder.name + '</a>';
    var accordian = "<div class='panel panel-default'><div class='panel-heading'><h4 class='panel-title'>" + toggleLabel + "</h4></div><div id = 'accoridanFolder" + folder.id + "' class='panel-collapse collapse folderCollapse'></div>";


    $("#folderAccordion").append(accordian);
    var accordianFolderBody = '';
    $("#" + accordianFolderName).append(accordianFolderBody);
    var folderScore = 0;
    $("#avail-" + accordianFolderName).empty().append(folderScore);
    //var fObj = { domNode : dropdown, data : folder };
    //fObj.__proto__ = fProto;
    //allFolders[folder.id] = fObj;
    numpoints = 0;
    $("#" + accordianFolderName).empty();
    $.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
        problems.forEach( function (problem) {
            //fObj.addProblem(problem);
            var link = addProblemToAccordian(problem, accordianFolderName);
            folderScore += parseInt(problem.value.style) + parseInt(problem.value.correct);
            numpoints += parseInt(problem.value.style) + parseInt(problem.value.correct);
            $("#" + accordianFolderName).append(link);
        });
    });

    var dropdown = $("<li></li>").addClass("dropdown");
    var toggle = $("<a></a>")
        .attr("href","#")
        .attr("data-toggle","dropdown")
        .addClass("dropdown-toggle")
        .append(folder.name)
        .append( $("<b></b>").addClass("caret") );
    var menu = $("<ul></ul>")
        .addClass("dropdown-menu")
        .attr("id","f-" + folder.id);
    dropdown.append(toggle).append(menu);
    var fObj = { domNode : dropdown, data : folder };
    fObj.__proto__ = fProto;
    allFolders[folder.id] = fObj;
    $.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
        problems.forEach( function (problem) {
            fObj.addProblem(problem);
        });
    });

}

function addProblemToAccordian(problem,folderName){
    var link = $("<li></li>").append(
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
        fillForm(curProblem);
        fillProblemDisplay(curProblem);
        getStudentResults(curProblem);
    });
    return link;
}

function loadFolders() {
	$.post("/folder/read", null, function (folders) {
        numFolders = folders.length;
		folders.forEach(function (folder) {
			addFolder(folder);
		});
        //Add Folder
        addProblems();
	});
}

function loadSortableFolders() {
    $("#folderBar").empty();
    $("#folderAccordion").empty();
    
    var addFolder = $('<div></div>')
    .attr("id","addFolder")
    .append("<div class='input-group'><input type='text' id='newFolder' class='form-control' placeholder='Add folder...'></input><span class='input-group-btn'><button type='submit' id='newFolderBtn' class='btn btn-default'><span class='glyphicon glyphicon-plus' style='color:green;''></span></button></span></div><div id='newFolderError'></div>");
    
    $("#folderBar").append(addFolder)

    $("#newFolderBtn").click(function () {
            $("#newFolderError").empty();
            if($("#newFolder").val()==""){
                var noNameError = $("<div class='alert alert-danger' role='alert'>Please enter a folder name</div>");
                $("#newFolderError").append(noNameError);
            } else {
                $.post("/folder/create", {name: $("#newFolder").val()}, function (folder) {
                    if(blinkTimer > 0){
                        loadSortableFolders();
                    }else {
                       reloadFolders();
                    }
                    $("#newFolder").val("");
                });
            }
        });

    $.post("/folder/read", null, function (folders) {

        $("#folderBar").append('<ul id="sortable" class="panel-default"></ul>');

        numFolders = folders.length;
        folders.forEach(function (folder) {

            var removeButton = $("<a href='#'></a>")
            .css("color","red")
            .html("<span class='glyphicon glyphicon-remove'></span> ") // the trailing space is important!
            .click(function () {
                if (confirm('Are you sure you wish to delete this folder ?')) {
                    $.post("/folder/destroy", {id: folder.id}, function () {
                        loadSortableFolders();
                    });
                }
            });

            var expandButton = $("<a href='#accoridanFolder" + folder.id + "'></a>")
            .attr("data-parent","#accordion")
            .attr("data-toggle","collapse")
            .html("<span class='glyphicon glyphicon-folder-open'></span>");

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
                    var sortableProblem = $("<li></li>")
                    .attr("class","ui-state-default")
                    .attr("id",problem.id)
                    .append('<span class="sortableGrip2 ui-icon ui-icon-arrowthick-2-n-s"></span>' + problem.name);
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
var blinkTimer;
function blinking(elm) {
    blinkTimer = setInterval(blink, 10);
    function blink() {
        elm.fadeOut(600, function() {
           elm.fadeIn(600);
        });
    }
} 

window.onload = function () {
    curProblem = null;
    curStudent = null;
    curFolder = null;
    numProblems = 0;
    numFolders = 0;
    numfunct = 0; //num solutions with correct functionality
    numstyle = 0; //num solutions with correct style
    numattempted = 0; //num students submitted anything
    numearned = 0; //num students earned full points
    numpoints = 0; 

	loadFolders();
    loadUsers();
    getStudents();
    setInterval(
        function() {
            getStudentResults(curProblem);
        },
        30000 /* 30000 ms = 30 sec */
    );
    //reset student data
    $("#refreshData").click(function() {
        getStudentResults(curProblem);
    });
    //show and hide folder and problem sections
    $(".folderContent").toggle("hidden");
    $(".questionContent").toggle("hidden");
    $("#folderDisplay").click(function () {
        $(".folderContent").toggle("hidden");
    });
    $("#questionDisplay").click(function () {
        $(".questionContent").toggle("hidden");
    });

    //read problems from specified folder
    $("#showProblems").click(function(event) {
		event.preventDefault();
        curFolder = $("#problemsfolderDropdown").val();
        addProblems();
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
                /*for (var i in allFolders) {
                    if (allFolders[i].data.id === opts.folder) {
                        allFolders[i].reload();
                        break;
                    }
                }
				$("#addProblemForm")[0].reset();*/
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
    $('#sortFolders').on('click', function() {
        if($(this).text() == 'Edit Folders') {
            blinking($("#sortFolders"));
            $(this).text('Done');
            loadSortableFolders();
        } else {
            clearInterval(blinkTimer);
            $(this).text('Edit Folders');
            reloadFolders();
        }
    });
      $('[data-toggle="tooltip"]').tooltip()

};