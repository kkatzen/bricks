var curProblem = null;

var allFolders = {};
var folderTotScore = 0;
var folderStudScore = 0;
var totScore = 0;
var studScore = 0;

function addProblemToAccordian(problem,folderName){
	var earnedPointsDiv = "#earned-" +folderName;
	var availPointsDiv = "#avail-" +folderName;
	var checkDiv = "#check-" +folderName;
	var maxScore = 0;
	var probMax = Number(problem.value.correct) + Number(problem.value.style);
	totScore += probMax;
	var link = $('<li id="' + problem.id + '"></li>').append(
		$("<a></a>")
			.attr("href","#")
			.append(problem.name)
	);
	if(problem.phase == 0) {
	    link.css("text-decoration", "line-through");
	}
	link.click(function () { addProbInfo(problem); });

	if (loggedIn) {
		var results = { correct: false, style: false };
		$.post("/submission/read/" + problem.id, {}, function (submissions) {
		if (!submissions.length == 0) {
			submissions.forEach( function (submission) {
				var curSubScore = Number(submission.value.correct)+Number(submission.value.style);
				if(curSubScore > maxScore) {
					maxScore = curSubScore;
				}
				results.correct = 
					results.correct || (submission.value.correct == problem.value.correct);
				results.style = results.style || (submission.value.style == problem.value.style);
				if (results.correct && results.style) { return true; } 

				if($("#panel-" + folderName).hasClass("panel-danger")){
					$("#panel-" + folderName).removeClass("panel-danger");
					$("#panel-" + folderName).addClass("panel-warning");
				}

			});
			studScore += maxScore;
			if (maxScore < probMax) {
				$("#" + problem.id).css("color", "#ae4345");
				$("a", link).css("color", "#ae4345");
			} else {
				$("#" + problem.id).css("color", "green");
				$("a", link).css("color", "green");
			}
			var probGrade = $('<span style="float:right;padding-right:15px">' + maxScore + "/" + (Number(problem.value.correct) + Number(problem.value.style))+"</span>");
			$("a", link).append(probGrade);

			var currentEarned = $(earnedPointsDiv).text();
			var availablePoints = $(availPointsDiv).text();
			currentEarned = Number(currentEarned);
			currentEarned = currentEarned + maxScore;
			$(earnedPointsDiv).empty().append(currentEarned);

			if(availablePoints == currentEarned){
				$(checkDiv).append(correct("8px").css("float","right"));
				$("#panel-" + folderName).removeClass("panel-danger");
				$("#panel-" + folderName).removeClass("panel-warning");
				$("#panel-" + folderName).addClass("panel-success");
			}

		}
		$("#grade").empty().append(studScore + "/" + totScore);
		});
	}
	return link;
}

function correct (pad) {
   return $("<span></span>")
     .addClass("glyphicon")
     .addClass("glyphicon-ok")
     .css("color","green")
     .css("margin-left",pad);
}

function wrong (pad) {
   return $("<span></span>")
      .addClass("glyphicon")
      .addClass("glyphicon-remove")
      .css("color","red")
      .css("margin-left",pad);
}

function inProgress (pad) {
   return $("<span></span>")
     .addClass("glyphicon")
     .addClass("glyphicon-minus")
     .css("color","red")
     .css("margin-left",pad);
}

function addFolder (folder) {
	var accordianFolderName = "accoridanFolder" + folder.id;
	var toggleLabel = '<a data-toggle="collapse" data-parent="#accordion" href="#'+ accordianFolderName + '">' + folder.name + '</a>';
	var accordian = "<div id='panel-" + accordianFolderName  + "' class='panel panel-danger'><div class='panel-heading'><h4 class='panel-title'>" + toggleLabel + " <span id='earned-"+ accordianFolderName + "'>0</span>/<span id='avail-"+ accordianFolderName + "'></span><span id='check-"+ accordianFolderName + "'></span></h4></div><ul id = '" + accordianFolderName + "' class='panel-collapse collapse folderCollapse'></ul></div></div>";

	$("#folderAccordion").append(accordian);
	var accordianFolderBody = '';
	$("#" + accordianFolderName).append(accordianFolderBody);
	var folderScore = 0;
	$("#avail-" + accordianFolderName).empty().append(folderScore);
	$("#" + accordianFolderName).empty();
	$.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
		problems.forEach( function (problem) {
			var link = addProblemToAccordian(problem, accordianFolderName);
			folderScore += parseInt(problem.value.style) + parseInt(problem.value.correct);
			$("#" + accordianFolderName).append(link);
		});
		$("#avail-" + accordianFolderName).empty().append(folderScore);
	});

}


function addProbInfo (problem) {
	$("#initSubmit").removeAttr("disabled");
	$("#submissions").removeClass("hidden");
	$("#pointbreakdown").removeClass("hidden");
	$("#desc-title").empty().append(problem.name);
	$.post("/folder/read/", {id: problem.folder}, function(folder){
        $("#desc-title").html(problem.name + "<i> in " + folder.name + "</i>");
    });

	$("#desc-body").empty().append(problem.text);
	curProblem = problem;
	$("#availablePtStyle").empty().append(problem.value.style);
	$("#availablePtCorrect").empty().append(problem.value.correct);
	var highestStyle = 0;
	var highestCorrect = 0;
	$.post("/submission/read/" + problem.id, {}, function (submissions) {
        $("#subs").empty();

		submissions.forEach( function (submission) {
			addSubmission(submission);
			if(submission.value.style > highestStyle){
				highestStyle = submission.value.style;
			}
			if(submission.value.correct > highestCorrect){
				highestCorrect = submission.value.correct;
			}
		});
		$("#highestPtCorrect").empty().append(highestCorrect);
		$("#highestPtStyle").empty().append(highestStyle);
		$("#correctCheck").empty();
		$("#styleCheck").empty();

		//append checks xs if they have attempted
		if(submissions.length > 0){
			if(problem.value.correct == highestCorrect){
				$("#correctCheck").append(correct("8px"));
			}else {
	        	$("#correctCheck").append(wrong("8px"));
			}	
			if(problem.value.style == highestStyle){
				$("#styleCheck").append(correct("8px"));
			}else {
	        	$("#styleCheck").append(wrong("8px"));
			}
		}		
	});
}

function addSubmission(submission) {
	var time = new Date(submission.updatedAt);
	var timeString = time.toLocaleDateString() + " " + time.toLocaleTimeString();
    var link = $("<tr></tr>");
	link.append("<td><a href='#'>" + timeString + "</a></td>");
    var gradeF = $("<td></td>");
    var gradeS = $("<td></td>");
    var results = { correct: false, style: false };
    results.correct = results.correct || (submission.value.correct == curProblem.value.correct);
    results.style = results.style || (submission.value.style == curProblem.value.style);

    $(gradeF).append("<span class='badge'>" + submission.value.correct + "/" +curProblem.value.correct + "</span>");
    if (results.correct) {
        $(gradeF).append(correct("8px"));
    } else {
        $(gradeF).append(wrong("8px"));
    }
    $(gradeS).append("<span class='badge'>" + submission.value.style + "/" +curProblem.value.style + "</span>");
    if (results.style) {
        $(gradeS).append(correct("8px"));
    } else {
        $(gradeS).append(wrong("8px"));
    }
    link.append(gradeF);
    link.append(gradeS);
    //make the problem link produce the submission code on click
	$("a", link).click(function() {
		if (confirm('Put the following into the console? \n' + submission.code)) {
			editor.setValue(submission.code);
		}
	});
    //attach the link to the submission
	$("#subs").prepend(link);
}

function resizeWindow(){
/*	var window_height = $("#consoleHeader").height();
    var window_height2 = $("#codemirror").height();
    var window_height3 = $("#instructions").height();
    var height = parseInt(window_height) + parseInt(window_height2) + parseInt(window_height3);
    console.log(window_height + " " + window_height2 + " " + window_height3 + " "  + height);
    */
    $('.scrollableAccordian').height($(window).height());
}

function foldersReload() {
    $("#folderAccordion").empty();
	$.post("/folder/read", {}, function (folders) {
        studScore = 0;
        totScore = 0;
		folders.forEach( function (folder) {
			addFolder(folder);
		});
	});
    if(curProblem) {
        addProbInfo(curProblem);
    }
}
var editor;
window.onload = function () {
	(function () {
		var u = document.URL.split("/");
		u.pop();
		$("#target").val(u.join("/") + "/login/authenticate");
	})();
    
    //save student's code on interval
    setInterval(
        function() {
          //save current code into user modelget  
            var code = editor.getValue();
            $.post("/user/saveCode", {code: code}, function(user) {
            });
        },
        120000 /* 120000ms = 2 min*/
    );
    $("#folderAccordion").empty();
	$.post("/folder/read", {}, function (folders) {
		folders.forEach( function (folder) {
			addFolder(folder);
		});
	});
	editor = CodeMirror.fromTextArea(codemirror, {
		mode: "javascript",
		styleActiveLine: true,
		lineNumbers: true,
		lineWrapping: true,
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
	var setErrorMsg = function (msg) {
		$("#console").empty();
		$("#console").append(msg);
	};
	$("#test").click(function () {
		var code = editor.getValue();
		$("#console").empty();
		try {
			eval(code);
			$("#console").append("No error reports");
		} catch (e) {
			//alert(e);
			$("#console").append(e);
		}
	});
	
	$("#submit").click(function () {
		if (curProblem == null) {
			alert("You must select a problem before submitting");
		} else {
			$("#console").empty();
			var problem = curProblem.id;
			var code = editor.getValue();
			try {
				var AST = acorn.parse(code);    // return an abstract syntax tree structure
				// var types = pnut.listTopLevelTypes(AST);
				var ssOb = pnut.collectStructureStyleFacts(AST);    // return a analysis of style grading by checking AST
				$.post("/submission/create", {problem: problem, code: code, style: JSON.stringify(ssOb)}, function (submission) {
					addSubmission(submission);
					foldersReload();
					setErrorMsg(submission.message);
				});
			} catch (e) {
				$("#console").append("Error! Be sure to test your code locally before submitting.");
			}

		}
	});

	$('#accShow').on('click', function() {
	    if($(this).text() == 'Close Folders') {
	        $(this).text('Expand Folders');
	        $('.folderCollapse').collapse('hide');
	    } else {
	        $(this).text('Close Folders');
	        $('.folderCollapse').collapse('show');
	    }
	    return false;
	});

	resizeWindow();

	$( window ).resize(function() {
		resizeWindow();
	});

};



