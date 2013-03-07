var classes = new Array();

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
		
		var hourtd = newTd("hour",timeStr);
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
}

function _addScheduleTD(idx, classobj) {
	var item = document.createElement("span");
	item.id = "scheduleitem_"+classobj.id+"_"+idx;
	item.className = "scheduleitem";
	item.appendChild(document.createTextNode(classobj.courseName));
	item.appendChild(document.createElement("br"));
	item.appendChild(document.createTextNode(classobj.from.toString()+" "+classobj.to.toString()));

	item.rowSpan = getTimespan(classobj.from, classobj.to);
	
	var templatetd = getTdForTime(classobj.from, idx);
	// console.log(templatetd);
	var templatetd2 = getTdForTime(classobj.to, idx);
	// console.log(templatetd2);
	
//	item.style.display="inline";
	item.style.position="absolute";
	item.style.left = getTimeOffsetLeft(templatetd)+"px";
	item.style.top = getTimeOffsetTop(templatetd)+"px";
	item.style.width = templatetd.offsetWidth+"px";
	var totalheight = (getTimeOffsetTop(templatetd2)-getTimeOffsetTop(templatetd));
	item.style.height = (totalheight/2+14)+"px";
	item.style.paddingTop = (totalheight/2-14)+"px";
	
	document.getElementById("schedule").appendChild(item);
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
	
	var therow = document.getElementById(hour+":"+minute);
	if(minute == 0)
		idx++;
	return therow.childNodes[idx];
}

function removeFromSchedule(id) {
	var classFound = false;
	for(var i=0;i<classes.length;i++) {
		if(classes[i].id == id) {
			classFound = true;
			classes.splice(i,1);
			break;
		}
	}
	if(!classFound) {
		alert("warning: classToRemove is null");
		return;
	}
	for(var i=0;i<5;i++)
		removeNode("scheduleitem_"+id+"_"+i);
	return;
}

function updateSchedulePositions() {
	if(classes.length == 0)
		return;
	
	for(var i=0;i<classes.length;i++) {
		var classobj = classes[i];
		for(var j=0;j<5;j++) {
			var classnode = document.getElementById("scheduleitem_"+classobj.id+"_"+j);
			if(classnode) {
				classnode.parentNode.removeChild(classnode);
				_addScheduleTD(j, classobj);
			}
		}
	}
}
