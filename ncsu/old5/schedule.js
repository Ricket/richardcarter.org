

function newTd(cn, text) {
	var retVal = document.createElement("td");
	if(text.length > 0)
		retVal.appendChild(document.createTextNode(text));
	retVal.className = cn;
	return retVal;
}

function newWeekday(text) {
	var retVal = document.createElement("td");
	retVal.appendChild(document.createTextNode(text));
	retVal.className = "weekday";
	return retVal;
}

function makeSchedule() {
	var tbody = document.getElementById("scheduletbody");
	
	/*
	var toprow = document.createElement("tr");
	toprow.appendChild(newTd(null,""));
	toprow.appendChild(newWeekday("Monday"));
	toprow.appendChild(newWeekday("Tuesday"));
	toprow.appendChild(newWeekday("Wednesday"));
	toprow.appendChild(newWeekday("Thursday"));
	toprow.appendChild(newWeekday("Friday"));
	tbody.appendChild(toprow);
	*/
	
	for(var hour=7;hour<=21;hour++) {
		if(hour < 12)
			var timeStr = hour+":00a";
		else if(hour == 12)
			var timeStr = "12:00p";
		else
			var timeStr = (hour-12)+":00p";
		
		var row00 = document.createElement("tr");
		row00.id = hour+":0";
		row00.className = "hourrow";
		
		var hourtd = newTd("hour firstcol",timeStr);
		hourtd.rowSpan = 12;
		row00.appendChild(hourtd);
		row00.appendChild(newTd(null,""));
		row00.appendChild(newTd(null,""));
		row00.appendChild(newTd(null,""));
		row00.appendChild(newTd(null,""));
		row00.appendChild(newTd(null,""));
		tbody.appendChild(row00);
		
		for(var minoffset=5;minoffset<=55;minoffset+=5) {
			var newrow = document.createElement("tr");
			newrow.id = hour+":"+minoffset;
			for(var i=0;i<5;i++)
				newrow.appendChild(newTd(null,""));
			tbody.appendChild(newrow);
		}
	}
}

function clampSchedule() {
	for(var i=7;i<=21;i++) {
		document.getElementById(i+":0").className = "hourrow";
		for(var j=5;j<=55;j+=5) {
			document.getElementById(i+":"+j).className="";
		}
	}
	
	clampBeginningToEnd();
	clampEndToBeginning();
}

function clampBeginningToEnd() {
	for(var i=7;i<=21;i++) {
		var hour = i;
		var am = ((hour<12)?true:false);
		if(hour>12) hour -= 12;
		for(var j=0;j<classes.length;j++) {
			if(classes[j].from.hour == hour && classes[j].from.am == am) {
				return;
			}
		}
		document.getElementById(i+":0").className = "hourrow noprint";
		for(var j=5;j<=55;j+=5) {
			document.getElementById(i+":"+j).className = "noprint";
		}
	}
}
function clampEndToBeginning() {
	for(var i=21;i>=7;i--) {
		var hour = i;
		var am = ((hour<12)?true:false);
		if(hour>12) hour -= 12;
		for(var j=0;j<classes.length;j++) {
			if(classes[j].to.hour == hour && classes[j].to.am == am) {
				return;
			}
		}
		document.getElementById(i+":0").className = "hourrow noprint";
		for(var j=5;j<=55;j+=5) {
			document.getElementById(i+":"+j).className = "noprint";
		}
	}
}

function addToSchedule(classobj) {
	classes.push(classobj);

	if(classobj.mon)
		_addScheduleTD(0,classobj);
	if(classobj.tues)
		_addScheduleTD(1,classobj);
	if(classobj.wed)
		_addScheduleTD(2,classobj);
	if(classobj.thurs)
		_addScheduleTD(3,classobj);
	if(classobj.fri)
		_addScheduleTD(4,classobj);
	
	clampSchedule();
}

function _addScheduleTD(idx, classobj) {
	var item = document.createElement("span");
	item.id = "scheduleitem_"+classobj.id+"_"+idx;
	item.appendChild(document.createTextNode(classobj.courseName));
	item.appendChild(document.createElement("br"));
	item.appendChild(document.createTextNode(classobj.from.toString()+" "+classobj.to.toString()));

	var thetd = getTdForTime(classobj.from, idx);
	thetd.rowSpan = getTimespan(classobj.from, classobj.to);
	thetd.className = "scheduleitem";
	thetd.appendChild(item);
	
	setAllOverlaps(classobj.from, classobj.to, idx, "none");
}

function setAllOverlaps(from, to, idx, display) {
	var minute = from.minuteNearestMultipleOfFive();
	var hour = from.hour;
	if(!from.am && hour != 12)
		hour += 12;
	if(minute == 60) {
		hour++;
		minute = 0;
	}
	
	var numberOfFives = getTimespan(from, to);
	for(var i=0;i<numberOfFives-1;i++) {
		minute+=5;
		if(minute == 60) {
			minute = 0;
			hour++;
		}
		if(hour > 21)
			return;
		
		var thetd = getTdForTime2(hour,minute,idx);
		thetd.style.display = display;
	}
}

function getTimespan(from, to) {
	return parseInt(Math.round(from.minutesUntil(to) / 5.0));
}

function getTimeOffsetLeft(timeTd) {
	var offset = 0;
	offset += timeTd.offsetLeft;
	// offset += timeTd.parentNode.offsetLeft;
	return offset;
}

function getTimeOffsetTop(timeTd) {
	var offset = 0;
	
	offset += timeTd.offsetTop;
	//console.log(timeTd.offsetTop);
	/*
	offset += timeTd.parentNode.offsetTop;
	// console.log(timeTd.parentNode.offsetTop);
	*/
	//offset += timeTd.parentNode.parentNode.offsetTop;
	//console.log(timeTd.parentNode.parentNode.offsetTop);
	
	//offset += timeTd.parentNode.parentNode.parentNode.offsetTop;
	//console.log(timeTd.parentNode.parentNode.parentNode.offsetTop);
	
	return offset;
}

function getTdForTime(time, idx) {
	var minute = time.minuteNearestMultipleOfFive();
	var hour = time.hour;
	if(!time.am && hour != 12)
		hour += 12;
	if(minute == 60) {
		hour++;
		minute = 0;
	}
	
	return getTdForTime2(hour,minute,idx);
}

function getTdForTime2(hour, minute, idx) {
	var therow = document.getElementById(hour + ":" + minute);
	if(minute == 0)
		idx++;
	return therow.childNodes[idx];
}

function setAllOverlapsForClass(classobj, display) {
	if(classobj.mon)
		setAllOverlaps(classobj.from, classobj.to, 0, display);
	if(classobj.tues)
		setAllOverlaps(classobj.from, classobj.to, 1, display);
	if(classobj.wed)
		setAllOverlaps(classobj.from, classobj.to, 2, display);
	if(classobj.thurs)
		setAllOverlaps(classobj.from, classobj.to, 3, display);
	if(classobj.fri)
		setAllOverlaps(classobj.from, classobj.to, 4, display);
}

function removeFromSchedule(id) {
	var classFound = false;
	for(var i=0;i<classes.length;i++) {
		if(classes[i].id == id) {
			classFound = true;
			setAllOverlapsForClass(classes[i], "");
			classes.splice(i,1);
			break;
		}
	}
	if(!classFound) {
		alert("warning: classToRemove is null");
		return;
	}
	for(var i=0;i<5;i++) {
		var node = document.getElementById("scheduleitem_"+id+"_"+i);
		if(node) {
			node.parentNode.className="";
			node.parentNode.rowSpan=1;
			node.parentNode.removeChild(node);
		}
	}
	clampSchedule();
	return;
}
