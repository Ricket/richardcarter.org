window.console = window.console || {log:function(msg){}};

var mouseX, mouseY;
var mouseYOffset;
var controllingPaddle = 0;
function MouseDown(e) {
	if(!e) var e = window.event;

	var elem;
	if(e.target) elem = e.target;
	else if(e.srcElement) elem = e.srcElement;
	if(elem.nodeType == 3) elem = elem.parentNode;
	
	if (e.pageX || e.pageY) 	{
		mouseX = e.pageX - page.offsetLeft;
		mouseY = e.pageY - page.offsetTop;
	}
	else if (e.clientX || e.clientY) 	{
		mouseX = e.clientX + document.body.scrollTop + document.documentElement.scrollTop - page.offsetLeft;
		mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - page.offsetTop;
	}
	
	var rightPaddle = (mouseX > WIDTH/2);
	if((!rightPaddle && mouseY >= paddle1Y && mouseY <= paddle1Y+PADDLEHEIGHT) || (rightPaddle && mouseY >= paddle2Y && mouseY <= paddle2Y+PADDLEHEIGHT)) {
		if(rightPaddle) controllingPaddle = 2;
		else controllingPaddle = 1;
		if(controllingPaddle == 1) {
			paddle1Vy = 0;
			mouseYOffset = mouseY - paddle1Y;
		} else if(controllingPaddle == 2) {
			paddle2Vy = 0;
			mouseYOffset = mouseY - paddle2Y;
		}
		return false;
	} else
		return true;
}

document.onmousemove = function(e) { // called on mouse move while button is down
	if(!e) var e = window.event;

	if (e.pageX || e.pageY) 	{
		mouseX = e.pageX - page.offsetLeft;
		mouseY = e.pageY - page.offsetTop;
	}
	else if (e.clientX || e.clientY) 	{
		mouseX = e.clientX + document.body.scrollTop + document.documentElement.scrollTop - page.offsetLeft;
		mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - page.offsetTop;
	}

	if(controllingPaddle == 1)
		paddle1Y = mouseY - mouseYOffset;
	else if(controllingPaddle == 2)
		paddle2Y = mouseY - mouseYOffset;
	
	if(controllingPaddle > 0) {
		UpdatePaddlePos(controllingPaddle);
		SetPaddlePos();
	}
	
	return true;
}

function MouseUp(e) {
	controllingPaddle = 0;
	return true;
}