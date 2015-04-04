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
function getStudentResults(problem) {
    if(curProblem == null) {
        return;
    }
    numfunct = 0;
    numstyle = 0;
    $("#studentResultsTable").empty();
    var tbl = $("<table class='table'><thead><tr><th>Name</th><th># Tries</th><th>Result</th></tr></thead><tbody id='studentResults'></tbody></table>");
    $("#studentResultsTable").append(tbl);
    $.post("/user/read/", {}, function(users){
        total = users.length;
        users.forEach(function (user) {
            console.log("a user");
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
                        curStudent = user;
                        console.log("help ive been clicked");
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
    console.log("getStudents();");
    $("#studentTable").empty();
    var tbl = $("<table class='table'><thead><tr><th>Name</th></tr></thead><tbody id='studentsTableBody'></tbody></table>");
    $("#studentTable").append(tbl);
    $.post("/user/read/", {}, function(users){
        total = users.length;
        users.forEach(function (user) {
            console.log("a user");
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
                        curStudent = user;
                        console.log("help ive been clicked");
                        getIndividual(user);
                    });
                });            
            var student = $("<tr></tr>");
            student.append(a);
            $("#studentsTableBody").append(student);

        });
    });
}


function getIndividual(user) {
    console.log("getIndividual");
    if(user == null) {
        console.log("user null");
        return;
    }else{
        console.log("user not null");
    }
    $("#individualName").html(user.displayName);
    createIndividualProgressBar(user);
    loadIndividualProblems(user);
    $("#individualSubmissionList").empty();
    $("#individualSubmissionList").append("<ul></ul>");

}
function createIndividualProgressBar(user){
    $("#individualProgessBar").empty().append("placefiller");
/*
    $.post("/submission/read/", {student: user.username}, function(submissions){
        //student.append("<td>" + submissions.length + "</td>");
        pointsEarned = 0;
        pointsAttempted = 0;
        pointsUnattempted = 0;
        if(submissions.length == 0){
            console.log("no submission");
        } else {
            var attempted = true;
            submissions.forEach(function(submission) {
                    pointsEarned += parseInt(submission.value.correct);
                    pointsEarned += parseInt(submission.value.style);
            });
            console.log("some submission");
            $("#individualProgessBar").append("pointsEarned = " + pointsEarned);
        }
        /*if(results.tried) {
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
        }
        student.append(rsection);
        $("#studentResults").append(student);
        //update quickview progress labels
        $("#function").empty().append(Math.floor((numfunct/total)*100)+"%");
        $("#style").empty().append(Math.floor((numstyle/total)*100)+"%");
        
    });*/

}

function loadIndividualProblems(user){
    console.log("loadIndividualProblems called");
    $.post("/folder/read", null, function (folders) {
        numFolders = folders.length;
        folders.forEach(function (folder) {
            var button = $("<button></button>")
            .attr("type","button")
            .attr("class","btn btn-default dropdown-toggle")
            .attr("data-toggle","dropdown")
            .html(folder.name + " <span class='caret'></span>");
           $("#individualSubmissionList").append("<li>" + folder.name + "</li>");
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
        }
        student.append(rsection);
        $("#studentResults").append(student);
        //update quickview progress labels
        $("#function").empty().append(Math.floor((numfunct/total)*100)+"%");
        $("#style").empty().append(Math.floor((numstyle/total)*100)+"%");
    });
}

function reloadFolders() {
	$("#folders").empty();
	$("#folderBar").empty();
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
    //append name and buttons to folder label
	var label = $("<li></li>").attr("class","list-group-item").append(removeButton).append(folder.name).append(moveUpButton).append(moveDownButton);
    //add label to folder ui lists
	$("#folders").append(label);
	$("#folderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
	$("#problemsfolderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
	$("#editfolderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
    //make folder object
	var fObj = {
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
	$("#folderBar").append(fObj.menuNode);
    //if necessary, update folder of current problem - it shifted back to the first folder during reload
    if(curProblem) {
        $("#editfolderDropdown").val(curProblem.folder);
    }
    if(curFolder) {
        $("#problemsfolderDropdown").val(curFolder);
    }

////krista

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

function loadFolders() {
	$.post("/folder/read", null, function (folders) {
        numFolders = folders.length;
		folders.forEach(function (folder) {
			addFolder(folder);
		});
        addProblems();
	});
}

function loadSortableFolders() {

    $.post("/folder/read", null, function (folders) {
        $("#folderBar").append('<ul id="sortable"></ul>');

        numFolders = folders.length;
        folders.forEach(function (folder) {
            var myAppend = '<li class="ui-state-default" id="' + folder.id + '"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>'+ folder.name + '</li>';
             $("#sortable").append(myAppend);

        });

        $( "#sortable" ).sortable({
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
                $.post("/user/removeAdmin", {id: admin.id}, function () {
                    loadUsers();
                });
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
    //create a new folder
	$("#newFolderBtn").click(function () {
		$("#newFolderError").empty();
		if($("#newFolder").val()==""){
			var noNameError = $("<div class='alert alert-danger' role='alert'>Please enter a folder name</div>");
			$("#newFolderError").append(noNameError);
		} else {
			$.post("/folder/create", {name: $("#newFolder").val()}, function (folder) {
                reloadFolders();
				$("#newFolder").val("");
			});
		}
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
        if($(this).text() == 'Sort Folders') {
            blinking($("#sortFolders"));
            $(this).text('Done');
            $("#folderBar").empty();
            loadSortableFolders();
        } else {
            clearInterval(blinkTimer);
            $(this).text('Sort Folders');
            reloadFolders();
        }
    });
};