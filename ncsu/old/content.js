function ClassTime(hour, minute, am) {
	this.hour = hour;
	this.minute = minute;
	this.am = am;
	
	this.isLessThan = function (othertime) {
		if(this.am && !othertime.am)
			return true;
		if(!this.am && othertime.am)
			return false;
		
		if(this.hour == 12 && othertime.hour < 12)
			return true;
		else if(othertime.hour == 12 && this.hour < 12) {
			return false;
		} else if(this.hour < othertime.hour) {
			return true;
		} else if(othertime.hour < this.hour) {
			return false;
		} else {
			if(this.minute < othertime.minute)
				return true;
			else
				return false;
		}
	}
	
	this.minutesUntil = function (othertime) {
		var hourdiff = othertime.hour - this.hour;
		var mindiff = othertime.minute - this.minute;
		if(hourdiff < 1)
			hourdiff += 12;
		
		return hourdiff*60 + mindiff;
	}
	
	this.minuteNearestMultipleOfFive = function () {
		return parseInt(Math.round(this.minute / 5.0) * 5);
	}
	
	this.equals = function (othertime) {
		if(this.hour == othertime.hour && this.minute == othertime.minute && this.am == othertime.am)
			return true;
		else
			return false;
	}
	
	this.toString = function () {
		var ret = "";
		if(hour < 10)
			ret += "0";
		ret += hour;
		ret += ":";
		if(minute < 10)
			ret += "0";
		ret += minute;
		if(am)
			ret += "am";
		else
			ret += "pm";
		return ret;
	}
}

function Class(id, cn, from, to, mon,tues,wed,thurs,fri) {
	this.id = id;
	this.courseName = cn;
	this.from = from;
	this.to = to;
	this.mon=mon;
	this.tues=tues;
	this.wed=wed;
	this.thurs=thurs;
	this.fri=fri;
}

function isInvalidTime(time) {
	if(time.am && time.hour<7 && time.hour != 12)
		return true;
	if(!time.am && time.hour > 9 && time.hour != 12)
		return true;
	
	return false;
}

function timeparse(time) {
	time = time.replace(/[ ]/,"");
	if(time.indexOf(':') == -1)
		return null;
		
	if(time.toLowerCase().indexOf('am') == -1 && time.toLowerCase().indexOf('pm') == -1)
		return null;
	else if(time.toLowerCase().indexOf('am') > -1) {
		var am = true;
		var lastIdx = time.toLowerCase().indexOf('am');
	} else {
		var am = false;
		var lastIdx = time.toLowerCase().indexOf('pm');
	}
	
	var colonIdx = time.indexOf(':');
	try {
		var hour = parseInt(time.substring(0,colonIdx));
		if(hour != time.substring(0,colonIdx)-0)
			return null;
		var min = parseInt(time.substring(colonIdx+1,lastIdx));
		if(min != time.substring(colonIdx+1, lastIdx)-0)
			return null;
	} catch(err) {
		return null;
	}
	
	if(hour <= 0 || hour > 12)
		return null;
	if(min < 0 || min > 59)
		return null;
	
	return new ClassTime(hour, min, am);
}

var rownum = 1;
var numClasses = 0;

function addClass() {
	var from = timeparse(document.forms[0].elements[1].value);
	if(from == null) {
		alert("please format the 'from' time according to the examples");
		return;
	} else if(isInvalidTime(from)) {
		alert("'from' time must be between 7:00am and 9:59pm");
		return;
	}
	var to = timeparse(document.forms[0].elements[2].value);
	if(to == null) {
		alert("please format the 'to' time according to the examples");
		return;
	} else if(isInvalidTime(to)) {
		alert("'to' time must be between 7:00am and 9:59pm");
		return;
	}
	
	if(!from.isLessThan(to)) {
		alert("the 'from' time must be earlier than the 'to' time");
		return;
	}
	var minuntil = from.minutesUntil(to);
	if(minuntil < 45) {
		alert("for aesthetic reasons, a class must be at least 45 minutes long. do you really have a class that short?");
		return;
	}
	
	var oneIsChecked = false;
	for(var i=3;i<=7;i++) {
		if(document.forms[0].elements[i].checked) {
			oneIsChecked = true;
			break;
		}
	}
	if(!oneIsChecked) {
		alert("your class must have at least one day");
		return;
	}
	
	var newclass = new Class("row_"+rownum, document.forms[0].elements[0].value, from, to,
	document.forms[0].elements[3].checked,document.forms[0].elements[4].checked,
	document.forms[0].elements[5].checked,document.forms[0].elements[6].checked,document.forms[0].elements[7].checked);
	addToSchedule(newclass);
	
	var row = document.createElement("tr");
	row.id = "row_"+rownum;
	rownum++;
	
	var nametd = document.createElement("td");
	nametd.appendChild(document.createTextNode(document.forms[0].elements[0].value));
	row.appendChild(nametd);
	
	var timetd = document.createElement("td");
	timetd.appendChild(document.createTextNode(from.toString()+"-"+to.toString()));
	row.appendChild(timetd);
	
	var daystd = document.createElement("td");
	var days = "";
	if(document.forms[0].elements[3].checked)
		days += "M";
	if(document.forms[0].elements[4].checked)
		days += "T";
	if(document.forms[0].elements[5].checked)
		days += "W";
	if(document.forms[0].elements[6].checked)
		days += "H";
	if(document.forms[0].elements[7].checked)
		days += "F";
	daystd.appendChild(document.createTextNode(days));
	row.appendChild(daystd);
	
	var removetd = document.createElement("td");
	removetd.className = "removecol";
	var removelink = document.createElement("a");
	removelink.appendChild(document.createTextNode('rem'));
	removelink.href = "#";
	removelink.onclick = removeMe;
	removetd.appendChild(removelink);
	row.appendChild(removetd);
	
	document.getElementById('emptyschedulemsg').style.display="none";
	document.getElementById('schedulelisttbody').appendChild(row);
	
	numClasses++;
	clearForm();
	updateSchedulePositions();
}

function removeMe(e) {
	if(!e) var e = window.event;
	
	if(e.srcElement)
		var node = e.srcElement;
	else if(e.target)
		var node = e.target;
	else {
		alert("e.srcElement, e.target; neither found");
		return;
	}
	
	while(node != null && node.nodeName.toLowerCase() != "tr")
		node = node.parentNode;
	if(node == null) {
		alert("node == null");
		return;
	}
	
	removeFromSchedule(node.id);
	removeNode(node.id);
	numClasses--;
	
	if(numClasses == 0) {
		document.getElementById('emptyschedulemsg').style.display="";
	}
	
	return false;
}

function removeNode(id) {
	var node = document.getElementById(id);
	if(node)
		node.parentNode.removeChild(node);
}

function clearForm() {
	for(var i=0;i<=2;i++)
		document.forms[0].elements[i].value = "";
	
	for(var i=3;i<=7;i++)
		document.forms[0].elements[i].checked = false;
}
