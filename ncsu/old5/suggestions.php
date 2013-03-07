<?php

echo '<?xml version="1.0" encoding="utf-8"?>';

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8" />
<meta http-equiv="Content-Style-Type" content="text/css" />
<title>rickyc.org/ncsu</title>
<style type="text/css">
body {
	font-family:monospace;
	font-size:13px;
}
a {
	font-style:italic;
	color:#000000;
}
h1 {
	font-size:22pt;
}
#wholepage {
	border:0;
	padding:0;
	margin:auto;
}
#page {
	padding:0;
	position:relative;
	text-align:center;
}
#content {
	margin:0;
	padding:0;
}
table {
	margin:auto;
}
input[type="text"], input[type="submit"] {
	border:1px solid #000000;
	background-color:#ffffff;
	font-family:monospace;
	font-size:13px;
}
textarea {
	border:1px solid #000000;
	background-color:#ffffff;
	font-size:13px;
}
</style>
<style type="text/css" media="screen">
#wholepage {
	width:925px;
	min-width:920px;
	text-align:left;
}
#page {
	width:800px;
	min-height:600px;
	border:1px solid #000000;
}
#content {
	width:800px;
}
#adcontainer {
	float:right;
	width:120px;
	height:600px;
	padding:0;
}
.printonly {
	display:none;
}
</style>
<style type="text/css" media="print">
.noprint {
	display:none;
}
#page {
	width:100%;
}
#content {
	width:100%;
}

#adcontainer {
	display:none;
}
</style>
<script type="text/javascript">
var ncsuid = "rwcarter";
window.onload = function () {
	var emailspan = document.getElementById("emailspan");
	while(emailspan.childNodes.length > 0)
		emailspan.removeChild(emailspan.childNodes[0]);
	emailspan.appendChild(document.createTextNode(ncsuid+"@"+"ncsu.edu"));
}
</script>
</head>
<body>
<div id="wholepage">
	<div id="adcontainer">
		<script type="text/javascript">
		<!--
		google_ad_client = "pub-7531469642043577";
		/* RickyC.org/ncsu, 120x600 */
		google_ad_slot = "1499516858";
		google_ad_width = 120;
		google_ad_height = 600;
		//-->
		</script>
		<script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
	</div>
	<div id="page">
		<div id="content">
			<div id="title">
				<h1>comments/suggestions</h1>
			</div>
			<?php
			if(empty($_POST['msg'])):
			?>
			<div style="margin-bottom: 30px;">
				thank you for checking out my schedule maker. i hope you found<br />
				it to be useful. i would love to hear from you! please use the<br />
				form below to send me a message. if you prefer email, my email<br />
				address is <span id="emailspan">&nbsp;</span>.<br />
				<br />
				the only required field below is your message. if you include<br />
				your email, i will use it only to answer your question or reply<br />
				to your message. your name is just so i know who i'm talking to. :)
			</div>
			<div>
				<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post">
				<table>
				<tr><td align="right">name</td><td align="left"><input type="text" name="name" value="" style="width:300px;" maxlength="25" /></td></tr>
				<tr><td align="right">email</td><td align="left"><input type="text" name="email" value="" style="width:300px;" maxlength="40" /></td></tr>
				<tr><td align="right">message</td><td><textarea name="msg" style="width:300px;" cols="35" rows="7"></textarea></td></tr>
				<tr><td colspan="3"><input type="submit" value="send" /></td></tr>
				</table>
				</form>
			</div>
			
			<?php
			else:
				$message = "rickyc.org/ncsu/ suggestion\n\n";
				$email = "anonymous@rickyc.org";
				if(!empty($_POST['name'])) {
					$message .= "name: " . ereg_replace("[^A-Za-z0-9 ]","",$_POST['name']) . "\n";
				}
				if(!empty($_POST['email'])) {
					$email = ereg_replace("[^A-Za-z0-9 .@-_+]","",$_POST['email']);
					$message .= "email: " . $email . "\n";
				}
				$message .= "\n";
				$message .= $_POST['msg'];
				
				@mail("ricky28269+rickycncsu@gmail.com","rickyc.org/ncsu/ suggestion",
					str_replace("\n.", "\n..",$message),
					"From: ncsuschedule@rickyc.org\r\n".
					"Content-Type: text/plain");
			?>
			<div>
				<h2>thanks!</h2><br />
				<br />
				<a href="/ncsu/">back to printable schedule</a>
			</div>
			<?php
			endif;
			?>
		</div>
	</div>
</div>
<div class="noprint" style="font-size:10px;text-align:center;">made by <a href="/">richard carter</a>, an engineering freshman at ncsu</div>
<div class="printonly" style="font-size:8pt;text-align:center;">rickyc.org/ncsu</div>
<div class="noprint" style="font-size:10px;text-align:center;"><a href="/ncsu/">back to printable schedule</a></div>
</body>
</html>

