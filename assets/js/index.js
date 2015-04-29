var curProblem = null;

var allFolders = {};
var folderTotScore = 0;
var folderStudScore = 0;
var totScore = 0;
var studScore = 0;


/*
fProto = {
   addProblem : function (problem) {
      var maxScore = 0;
      var probMax = Number(problem.value.correct) + Number(problem.value.style);
      totScore += probMax;
      var link = $("<li></li>").append(
			$("<a></a>")
				.attr("href","#")
				.append(problem.name)
		);
        if(problem.phase == 0) {
            link.css("background-color","lightgray");
        }
      link.click(function () { addProbInfo(problem); });
      if (loggedIn) {
         var results = { correct: false, style: false };
	 $.post("/submission/read/" + problem.id, {}, function (submissions) {
	    if (submissions.length == 0) {
            //do nothing
	    } else {
		submissions.forEach( function (submission) {
           var curSubScore = Number(submission.value.correct)+Number(submission.value.style);
           if(curSubScore > maxScore) {
                maxScore = curSubScore;
           }
		   results.correct = 
                      results.correct || (submission.value.correct == problem.value.correct);
		   results.style = results.style || (submission.value.style == problem.value.style);
		   if (results.correct && results.style) { return true; } 
         });
           studScore += maxScore;
           if (maxScore < probMax) {
                $("a", link).append(inProgress("8px"));
            } else {
                $("a", link).append(correct("8px"));
            }
            var probGrade = $("<span class='badge'>" + maxScore + "/" + (Number(problem.value.correct) + Number(problem.value.style))+"</span>");
            $("a", link).append(probGrade);
		}
        $("#grade").empty().append(studScore + "/" + totScore);
		});
		}
		$("ul",this.domNode).append(link);
	}
}
*/

function addProblemToAccordian(problem,folderName){
	var earnedPointsDiv = "#earned-" +folderName;
	var availPointsDiv = "#avail-" +folderName;
	var checkDiv = "#check-" +folderName;
	console.log("addProblemToAccordian()");
	var maxScore = 0;
	var probMax = Number(problem.value.correct) + Number(problem.value.style);
	totScore += probMax;
	var link = $('<li id="' + problem.id + '"></li>').append(
		$("<a></a>")
			.attr("href","#")
			.append(problem.name)
	);
	if(problem.phase == 0) {
	    link.css("background-color","lightgray");
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
			console.log("currentEarnedPre" +currentEarned);
			console.log("maxScore" +maxScore);
			currentEarned = Number(currentEarned);
			currentEarned = currentEarned + maxScore;
			console.log("currentEarnedPost" +currentEarned);
			$(earnedPointsDiv).empty().append(currentEarned);
			console.log("check a" + availablePoints + " e" + currentEarned);

			if(availablePoints == currentEarned){
				console.log("check is yes");
				$(checkDiv).append(correct("8px"));
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
	/*
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
	$("#folders").append(dropdown);
	*/
	var accordianFolderName = "accoridanFolder" + folder.id;
	var toggleLabel = '<a data-toggle="collapse" data-parent="#accordion" href="#'+ accordianFolderName + '">' + folder.name + '</a>';
	var accordian = "<div id='panel-" + accordianFolderName  + "' class='panel panel-danger'><div class='panel-heading'><h4 class='panel-title'>" + toggleLabel + " <span id='earned-"+ accordianFolderName + "'>0</span>/<span id='avail-"+ accordianFolderName + "'></span><span id='check-"+ accordianFolderName + "'></span></h4></div><ul id = '" + accordianFolderName + "' class='panel-collapse collapse folderCollapse'></ul></div></div>";

	$("#folderAccordion").append(accordian);
	var accordianFolderBody = '';
	$("#" + accordianFolderName).append(accordianFolderBody);
	var folderScore = 0;
	$("#avail-" + accordianFolderName).empty().append(folderScore);
	//var fObj = { domNode : dropdown, data : folder };
	//fObj.__proto__ = fProto;
	//allFolders[folder.id] = fObj;
	$("#" + accordianFolderName).empty();
	$.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
		problems.forEach( function (problem) {
			//fObj.addProblem(problem);
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
			console.log(submission.value.style);
			console.log(submission.value.correct);			
			if(submission.value.style > highestStyle){
				highestStyle = submission.value.style;
			}
			if(submission.value.correct > highestCorrect){
				highestCorrect = submission.value.correct;
			}
			console.log("highestCorrect" + highestCorrect);
			console.log("highestStyle" + highestStyle);			

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
    console.log("adding submission");
	var time = new Date(submission.updatedAt);
	var timeString = time.toLocaleDateString() + " " + time.toLocaleTimeString();
    var link = $("<tr></tr>");
	link.append("<td><a href='#'>" + timeString + "</a></td>");
    var gradeF = $("<td></td>");
    var gradeS = $("<td></td>");
    var results = { correct: false, style: false };
    results.correct = results.correct || (submission.value.correct == curProblem.value.correct);
    results.style = results.style || (submission.value.style == curProblem.value.style);
    // this gets you the pnut object that was created from the student's code - submission.style
    //YO LOOK HERE
    //add checks and x's to the submission
    if (results.correct) {
        $(gradeF).append(correct("8px"));
    } else {
        $(gradeF).append(wrong("8px"));
    }
    if (results.style) {
        $(gradeS).append(correct("18px"));
    } else {
        $(gradeS).append(wrong("18px"));
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
		//$("#errors").removeClass("hidden");
		$("#console").empty();
		$("#console").append(msg);
		console.log(msg);
	};
	$("#test").click(function () {
		var code = editor.getValue();
		//$("#errors").removeClass("hidden");
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
			var AST = acorn.parse(code);    // return an abstract syntax tree structure
			// var types = pnut.listTopLevelTypes(AST);
			var ssOb = pnut.collectStructureStyleFacts(AST);    // return a analysis of style grading by checking AST

			$.post("/submission/create", {problem: problem, code: code, style: JSON.stringify(ssOb)}, function (submission) {
				addSubmission(submission);
				foldersReload();
				setErrorMsg(submission.message);
				console.log(submission);
			});
		}
	});

	$('#accShow').on('click', function() {
	    if($(this).text() == 'Hide All') {
	        $(this).text('Expand Sections');
	        $('.folderCollapse').collapse('hide');
	    } else {
	        $(this).text('Hide All');
	        $('.folderCollapse').collapse('show');
	    }
	    return false;
	});

	resizeWindow();

	$( window ).resize(function() {
		resizeWindow();
	});

};



