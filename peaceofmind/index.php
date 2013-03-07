<?php
/* TODO implement user system; until then, simulate settings */
session_start();
$_SESSION['username'] = 'Ricket';
$_SESSION['name'] = 'Ricky Carter';
$_SESSION['timezone'] = 'America/New_York';

/* automated user setup */
$timezone = new DateTimeZone($_SESSION['timezone']);
$now = new DateTime('now', $timezone);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Peace of Mind : advanced todo/agenda/note-taking web application and Android app</title>
<style type="text/css">
@import url("reset.css");

body {
	font-family:Monaco,monospace;
	font-size:7pt;
}

#header {
	text-align:center;
	background-color:#eef;
}

#maintable {
	width:95%;
}

.daycolumn {
	background-color:#f9f9f9;
	margin:30px; border-spacing:30px; border-collapse:separate;
	padding:30px;
}

.todaycolumn {
	background-color:#e9f9e9;
}

.daycolumnheading {
	text-align:center;
	font-weight:bold;
}

.daycolumndate {
	text-align:center;
	font-style:italic;
}

.todoentry {
	text-align:center;
}

.todoentry input {
	font-family:Monaco,monospace;
	font-size:7pt;
	width:98%;
	margin:auto;
	padding:0;
}

.row {
	border-bottom:1px solid #ddd;
	padding:0;
	margin:2px;
}
</style>
</head>

<body>
<div id="header">
	<span style="float:left;">Peace of Mind</span>
    <?php echo $now->format('D F j Y'); ?>
    <span style="float:right;"><?php echo $_SESSION['name']; ?></span>
</div>
<div id="bodycontainer">
	<table id="maintable" cellspacing="30"><tr>
    	<td><a href="#">(prev)</a></td>
		<?php
		$day = new DateTime('yesterday', $timezone);
        for($i = 0; $i < 5; $i++) {
			$num_todo_items = mt_rand(1,10);
			?>
			<td class="daycolumn<?php if($i == 1) echo ' todaycolumn'; ?>">
				<div class="daycolumnheading"><?php echo $day->format('l'); ?></div>
                <div class="daycolumndate"><?php echo $day->format('M j'); ?></div>
                <div class="todoentry"><input type="text" name="entry<?php echo $i; ?>" id="entry<?php echo $i; ?>" /></div>
				<?php
				for($row = 0; $row < 10; $row++) {
					?>
					<div class="row"><?php if($row < $num_todo_items) echo 'lorem ipsum dolor sit amet'; else echo '&nbsp;'; ?></div>
					<?php
				}
				?>
			</td>
			<?php
			$day->modify('+1 day');
		}
		?>
        <td><a href="#">(next)</a></td>
    </tr></table>
</div>
</body>
</html>