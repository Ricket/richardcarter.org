window.console = window.console || {log:function(msg){}};

var VERTEX_SHADER = 
	"uniform mat4 uModelViewMatrix;\n"+
	"uniform mat4 uCameraMatrix;\n"+
	"uniform mat4 uProjMatrix;\n"+
	"attribute vec3 vPosition;\n"+
	"void main() {\n"+
	"	gl_Position = uProjMatrix * (uCameraMatrix * (uModelViewMatrix * vec4(vPosition, 1.0)));\n"+
	"}\n";
var FRAGMENT_SHADER = 
	"precision mediump float;\n"+
	"void main() {\n"+
	"	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n"+
	"}\n";
	
function MakeBox(x0, y0, z0, x1, y1, z1) {
	return {
		renderType : 0x0001, /* LINES */
		verts : [
			x0, y0, z0,
			x1, y0, z0,
			x1, y1, z0,
			x0, y1, z0,
			x1, y0, z1,
			x0, y0, z1,
			x0, y1, z1,
			x1, y1, z1
		],
		vertsBuf : null,
		indices : [
		/*
			0, 1, 2, 0, 2, 3, // front
			1, 4, 7, 1, 7, 2, // right
			4, 5, 6, 4, 6, 7, // back
			5, 0, 3, 5, 3, 6, // left
			3, 2, 7, 3, 7, 6, // top
			5, 4, 1, 5, 1, 0  // bottom
		*/
			0, 1, 1, 2, 2, 0,
			0, 2, 2, 3, 3, 0,
			1, 4, 4, 7, 7, 1,
			1, 7, 7, 2, 2, 1,
			4, 5, 5, 6, 6, 4,
			4, 6, 6, 7, 7, 4,
			5, 0, 0, 3, 3, 5,
			5, 3, 3, 6, 6, 5,
			3, 2, 2, 7, 7, 3,
			3, 7, 7, 6, 6, 3,
			5, 4, 4, 1, 1, 5,
			5, 1, 1, 0, 0, 5
		],
		indicesBuf: null
	};
}

var box = MakeBox(0,0,-0.5,1,1,0.5);
var playingField = MakeBox(0, 0, -0.5, WIDTH, HEIGHT, 0.5);

var vertexShader, fragmentShader, program;
var vertexPositionAttribute, modelViewMatrixUniform, cameraMatrixUniform, projMatrixUniform;
var projMatrix;

var ballTexture, ballImage;

function Check3DSupport() {
	var contextNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	var i;
	
	if(SUPPORTS3D) {
		for(i in contextNames) {
			try {
				gl = canvas.getContext(contextNames[i], { antialias: false });
			} catch(e) {}
			if(gl) {
				break;
			}
		}
		
		if(!gl) {
			SUPPORTS3D = false;
		}
	}
	
	if(SUPPORTS3D) {
		Setup3D();
		Set3D(true);
	} else {
		Set3D(false);
	}
}

function Error3D(msg) {
	console.log(msg);
	SUPPORTS3D = false;
	return null;
}

function Setup3D() {
	try {
		gl.viewport(0, 0, 800, 600);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);

		vertexShader = CreateShader(gl.VERTEX_SHADER, VERTEX_SHADER);
		if(!vertexShader) return Error3D("Error creating vertex shader");

		fragmentShader = CreateShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
		if(!fragmentShader) return Error3D("Error creating fragment shader");

		program = gl.createProgram();
		if(!program) return Error3D("Error creating program");

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			return Error3D("Unable to initialize the shader program.");
		}
		
		gl.useProgram(program);
		
		ballTexture = gl.createTexture();
		ballImage = new Image();
		ballImage.src = "images/ball.png";
		
		vertexPositionAttribute = gl.getAttribLocation(program, "vPosition");
		gl.enableVertexAttribArray(vertexPositionAttribute);
		modelViewMatrixUniform = gl.getUniformLocation(program, "uModelViewMatrix");
		cameraMatrixUniform = gl.getUniformLocation(program, "uCameraMatrix");
		projMatrixUniform = gl.getUniformLocation(program, "uProjMatrix");
		
		projMatrix = MatMakeOrthographic(0, 800, 600, 0, 1000, -1000);
		//projMatrix = MatMakePerspective();
		
		gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix);
		Debug3D("uniformMatrix4fv pr", gl.getError());
		
		
		// Initialize box
		box.vertsBuf = gl.createBuffer();
		Debug3D("createBoxVertsBuf", gl.getError());
		gl.bindBuffer(gl.ARRAY_BUFFER, box.vertsBuf);
		Debug3D("bindBoxVertsBuf", gl.getError());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(box.verts), gl.STATIC_DRAW);
		Debug3D("bufBoxVertsBuf", gl.getError());
		
		box.indicesBuf = gl.createBuffer();
		Debug3D("createBoxIndBuf", gl.getError());
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indicesBuf);
		Debug3D("bindBoxIndBuf", gl.getError());
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(box.indices), gl.STATIC_DRAW);
		Debug3D("bufBoxIndBuf", gl.getError());
		
		// Initialize playingField
		playingField.vertsBuf = gl.createBuffer();
		Debug3D("createPFVertBuf", gl.getError());
		gl.bindBuffer(gl.ARRAY_BUFFER, playingField.vertsBuf);
		Debug3D("bindPFVertBuf", gl.getError());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(playingField.verts), gl.STATIC_DRAW);
		Debug3D("bufPFVertBuf", gl.getError());
		
		playingField.indicesBuf = gl.createBuffer();
		Debug3D("createPFIndBuf", gl.getError());
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, playingField.indicesBuf);
		Debug3D("bindPFIndBuf", gl.getError());
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(playingField.indices), gl.STATIC_DRAW);
		Debug3D("bufPFIndBuf", gl.getError());
		

		if(gl.getError() != 0) {
			console.log("There was an error " + gl.getError());
		}
		console.log("3D initialized");
	} catch(x) {
		return Error3D(x);
	}
}

function Set3D(threeD) {
	console.log((threeD ? "Enabling" : "Disabling") + " 3D support");
	if(canvas) canvas.style.display = (threeD ? null : "none");
	if(pongtable) pongtable.style.display = (threeD ? "none" : null);
}

function Debug3D(module, err) {
	if(err != 0) {
		console.log(module + " error " + err);
	}
}

function Draw3D(delta) {
	var mvMatrix, camMatrix;
	var camOffsetX, camOffsetY;
	
	// Suppress error before calling the Draw3D function (*ahem* Safari)
	gl.getError();
	
	// Clear the screen
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	Debug3D("clear", gl.getError());
	
	// Set the camera matrix
	// ---------------------
	
	
	camOffsetX = mouseX; // [-inf,inf]
	if(camOffsetX < 0) camOffsetX = 0; // [0,inf]
	else if(camOffsetX > WIDTH) camOffsetX = WIDTH; // [0,width]
	camOffsetX /= WIDTH; // [0,1]
	camOffsetX -= 0.5; // [-0.5, 0.5]
	camOffsetX *= Math.PI/2.0; // [-45deg,45deg]
	
	camOffsetY = mouseY;
	if(camOffsetY < 0) camOffsetY = 0;
	else if(camOffsetY > HEIGHT) camOffsetY = HEIGHT;
	camOffsetY /= HEIGHT;
	camOffsetY -= 0.5;
	camOffsetY *= Math.PI/2.0;
	
	
	
	camMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	MatTranslate(camMatrix, -WIDTH/2, -HEIGHT/2, 0);
	MatRotate(camMatrix, camOffsetX, 0, 1, 0);
	MatRotate(camMatrix, camOffsetY, 1, 0, 0);
	//MatSkewX(camMatrix, camOffsetX, 1.0);
	MatTranslate(camMatrix, WIDTH/2, HEIGHT/2, 0);
	
	gl.uniformMatrix4fv(cameraMatrixUniform, false, camMatrix);
	
	// Draw the first box
	// ------------------
	
	// Construct its modelview matrix
	mvMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	MatScale(mvMatrix, 12, 80, 1);
	MatTranslate(mvMatrix, 4, paddle1Y, 0);
	
	// Set the modelview matrix to the shader
	gl.uniformMatrix4fv(modelViewMatrixUniform, false, mvMatrix);
	Debug3D("uniformMatrix4fv mv", gl.getError());
	
	// Bind the cube verts and indices and draw the cube
	gl.bindBuffer(gl.ARRAY_BUFFER, box.vertsBuf);
	Debug3D("bindBuffer", gl.getError());
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	Debug3D("vertAttrPoint", gl.getError());
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indicesBuf);
	Debug3D("bindBuffer", gl.getError());
	
	gl.drawElements(box.renderType, box.indices.length, gl.UNSIGNED_SHORT, 0);
	Debug3D("drawElements", gl.getError());
	
	// Draw the second box
	// -------------------
	
	// Construct its modelview matrix
	mvMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	MatScale(mvMatrix, 12, 80, 1);
	MatTranslate(mvMatrix, WIDTH-12-4, paddle2Y, 0);
	
	// Set the modelview matrix to the shader
	gl.uniformMatrix4fv(modelViewMatrixUniform, false, mvMatrix);
	Debug3D("uniformMatrix4fv mv", gl.getError());
	
	// Bind the cube verts and indices and draw the cube
	gl.bindBuffer(gl.ARRAY_BUFFER, box.vertsBuf);
	Debug3D("bindBuffer", gl.getError());
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	Debug3D("vertAttrPoint", gl.getError());
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indicesBuf);
	Debug3D("bindBuffer", gl.getError());
	
	gl.drawElements(box.renderType, box.indices.length, gl.UNSIGNED_SHORT, 0);
	Debug3D("drawElements", gl.getError());
	
	// Draw the ball
	// -------------
	
	// Construct its modelview matrix
	mvMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	MatScale(mvMatrix, 11, 11, 1);
	MatTranslate(mvMatrix, ballX, ballY, 0);
	
	// Set the modelview matrix to the shader
	gl.uniformMatrix4fv(modelViewMatrixUniform, false, mvMatrix);
	Debug3D("uniformMatrix4fv mv", gl.getError());
	
	// Bind the cube verts and indices and draw the cube
	gl.bindBuffer(gl.ARRAY_BUFFER, box.vertsBuf);
	Debug3D("bindBuffer", gl.getError());
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	Debug3D("vertAttrPoint", gl.getError());
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indicesBuf);
	Debug3D("bindBuffer", gl.getError());
	
	gl.drawElements(box.renderType, box.indices.length, gl.UNSIGNED_SHORT, 0);
	Debug3D("drawElements", gl.getError());
	
	// Draw the playing field
	// ----------------------
	
	// playingField
	// Construct its modelview matrix
	mvMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	//MatScale(mvMatrix, 11, 11, 1);
	//MatTranslate(mvMatrix, ballX, ballY, 0);
	
	// Set the modelview matrix to the shader
	gl.uniformMatrix4fv(modelViewMatrixUniform, false, mvMatrix);
	Debug3D("uniformMatrix4fv mv", gl.getError());
	
	// Bind the cube verts and indices and draw the cube
	gl.bindBuffer(gl.ARRAY_BUFFER, playingField.vertsBuf);
	Debug3D("bindBuffer", gl.getError());
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	Debug3D("vertAttrPoint", gl.getError());
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, playingField.indicesBuf);
	Debug3D("bindBuffer", gl.getError());
	
	gl.drawElements(playingField.renderType, playingField.indices.length, gl.UNSIGNED_SHORT, 0);
	Debug3D("drawElements", gl.getError());
	
	
	// Finish, so that the screen can go ahead and render while we do the rest
	// of our per-frame processing
	gl.finish();
	Debug3D("finish", gl.getError());
}

function CreateShader(type, src) {
	var shader;
	
	shader = gl.createShader(type);
	if(!shader) return null;
	
	gl.shaderSource(shader, src);
	
	gl.compileShader(shader);
	
	// TODO check if it successfully compiled?
	
	return shader;
}

/* Matrix functions */
/* When writing functions, remember that the matrix is transposed compared to 
   what it might seem like. Refer to MatIdx and the existing functions if you
   don't know what I mean. */
function MatLoadIdentity(mat4) {
	var i,j;
	for(i=0; i<4; i++) {
		for(j=0; j<4; j++) {
			if(i == j) {
				mat4[i*4+j] = 1.0;
			} else {
				mat4[j*4+i] = 0.0;
			}
		}
	}
}

function MatMakeOrthographic(left, right, bottom, top, near, far) {
	return [
		2.0 / (right-left), 0, 0, 0,
		0, 2.0 / (top-bottom), 0, 0,
		0, 0, -2.0 / (far-near), 0,
		-(right+left)/(right-left), -(top+bottom)/(top-bottom), -(far+near)/(far-near), 1
	];
}

function MatTranslate(mat4, x, y, z) {
	mat4[MatIdx(0,3)] += x;
	mat4[MatIdx(1,3)] += y;
	mat4[MatIdx(2,3)] += z;
}

function MatScale(mat4, x, y, z) {
	mat4[MatIdx(0,0)] *= x;
	mat4[MatIdx(1,1)] *= y;
	mat4[MatIdx(2,2)] *= z;
}

function MatIdx(row,col) {
	return col*4+row;
}

function MatMakeAdd(mat0, mat1) {
	var matResult = [];
	MatAdd(matResult, mat0, mat1);
	return matResult;
}

function MatAdd(matResult, mat0, mat1) {
	var i;
	
	for(i=0; i<16; i++) {
		matResult[i] = mat0[i] + mat1[i];
	}
}

function MatMakeMultiply(mat0, mat1) {
	var matResult = [];
	MatMultiply(matResult, mat0, mat1);
	return matResult;
}

function MatMultiply(matResult, mat0, mat1) {
	var i, j, k;
	
	// If mat0 or mat1 == matResult, the multiply will mess up. Make copies
	// to account for this. This allows you to do something like:
	//     MatMultiply(mvMatrix, someTranslation, mvMatrix);
	
	if(matResult == mat0) {
		mat0 = mat0.slice(0); // clone
	}
	if(matResult == mat1) {
		mat1 = mat1.slice(0); // clone
	}
	
	for(i=0; i<16; i++) {
		matResult[i] = 0;
	}
	
	for(i=0; i<4; i++) { // row of rotMat
		for(j=0; j<4; j++) { // col of mat4
			for(k=0; k<4; k++) { // col of rotMat/row of mat4
				matResult[MatIdx(i,j)] += mat0[MatIdx(i,k)] * mat1[MatIdx(k,j)];
			}
		}
	}
}

function MatRotate(mat4, angle_rad, x, y, z) {
	var rotMat, resultMat;
	var i,j,k;
	var cosAng, sinAng;
	var mag;
	
	mag = Math.sqrt(x*x + y*y + z*z);
	x = x/mag;
	y = y/mag;
	z = z/mag;
	
	cosAng = Math.cos(angle_rad);
	sinAng = Math.sin(angle_rad);
	
	rotMat = [
		x*x + (y*y + z*z) * cosAng,
		x*y*(1-cosAng) + z*sinAng,
		x*z*(1-cosAng) - y*sinAng,
		0,
		
		x*y*(1-cosAng) - z*sinAng,
		y*y + (x*x + z*z) * cosAng,
		y*z*(1-cosAng) + x*sinAng,
		0,
		
		x*z*(1-cosAng) + y*sinAng,
		y*z*(1-cosAng) - x*sinAng,
		z*z + (x*x + y*y) * cosAng,
		0,
		
		0,
		0,
		0,
		1
	];
	
	MatMultiply(mat4, rotMat, mat4);
}

function MatSkewX(mat4, angle_rad, amount) {
	var skewMat = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		amount*Math.tan(angle_rad), 0, 1, 0,
		0, 0, 0, 1
	];
	MatMultiply(mat4, skewMat, mat4);
}
