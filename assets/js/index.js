var curProblem = null;

var allFolders = {};
var folderTotScore = 0;
var folderStudScore = 0;
var totScore = 0;
var studScore = 0;

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
	var fObj = { domNode : dropdown, data : folder };
	fObj.__proto__ = fProto;
	allFolders[folder.id] = fObj;
	$.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
		problems.forEach( function (problem) {
			fObj.addProblem(problem);
		});
	});
}


function addProbInfo (problem) {
	$("#initSubmit").removeAttr("disabled");
	$("#submissions").removeClass("hidden");
	$("#desc-title").empty().append(problem.name);
	$("#desc-body").empty().append(problem.text);
	curProblem = problem;
	$.post("/submission/read/" + problem.id, {}, function (submissions) {
        $("#subs").empty();
		submissions.forEach( function (submission) {
			addSubmission(submission);
		});
	});
}

function addSubmission(submission) {
    console.log("adding submission");
	var time = new Date(submission.updatedAt);
	var timeString = time.toLocaleDateString() + " " + time.toLocaleTimeString();
    var link = $("<tr></tr>");
	link.append("<td><a href='#'>" + timeString + "</a></td>");
    var grade = $("<td></td>");
    var results = { correct: false, style: false };
    results.correct = results.correct || (submission.value.correct == curProblem.value.correct);
    results.style = results.style || (submission.value.style == curProblem.value.style);
    //add checks and x's to the submission
    if (results.correct) {
        $(grade).append(correct("8px"));
    } else {
        $(grade).append(wrong("8px"));
    }
    if (results.style) {
        $(grade).append(correct("18px"));
    } else {
        $(grade).append(wrong("18px"));
    }
    link.append(grade);
    //make the problem link produce the submission code on click
	$("a", link).click(function() {
		alert(submission.code);
	});
    //attach the link to the submission
	$("#subs").prepend(link);
}

function foldersReload() {
    $("#folders").empty();
	$.post("/folder/read", {}, function (folders) {
        studScore = 0;
        totScore = 0;
		folders.forEach( function (folder) {
			addFolder(folder);
		});
	});
    if(curProblem) {
        addProbInfo(problem);
    }
}

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
	$.post("/folder/read", {}, function (folders) {
		folders.forEach( function (folder) {
			addFolder(folder);
		});
	});
	var editor = CodeMirror.fromTextArea(codemirror, {
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
			$("#console").append("See submission feedback above.");
			var problem = curProblem.id;
			var code = editor.getValue();
			var AST = acorn.parse(code);
			// var types = pnut.listTopLevelTypes(AST);
			var ssOb = pnut.collectStructureStyleFacts(AST);
			$.post("/submission/create", {problem: problem, code: code, style: JSON.stringify(ssOb)}, function (submission) {
				addSubmission(submission);
				foldersReload();
				setErrorMsg(submission.message);
			});
		}
	});
};

