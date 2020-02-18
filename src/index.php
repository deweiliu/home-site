<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Dewei Liu</title>
    <script type="text/javascript"></script>
    <link rel="shortcut icon" type="image/png" href="images/favicon.png" />

</head>

<body>
    <h1><a href="/">Dewei Liu</a></h1>
    <p>Hi, welcome to my personal website.</p>
    <br>
    <p>Please view my <a href="resume/Dewei Liu CV.pdf">resume</a> and <a href="resume/Dewei Liu transcript.pdf">academic transcript</a>.</p>
    <br>
    <p>Below are my on-going projects</p>
    <p><a href="http://repeater.deweiliu.com/">Webpage Repeater</a> - A service that helps you browse the Internet
        without revealing your IP address</p>
    <p><a href="http://best-friends.deweiliu.com/">Best Friends App</a> - An online chatbot that does simple
        conversations</p>
    <p><a href="http://paperborne.deweiliu.com/">Paperborne</a> - An Android card game with an online demo.</p>
    <br>
    <p>You can also follow me via the following sites.</p>
    <p><a href="https://www.linkedin.com/in/deweiliu/">LinkedIn</a></p>
    <p><a href="https://github.com/deweiliu">GitHub</a></p>

    <div style="bottom: 1%;left: 1%;position: absolute;">
        <p>Updated on 
            <?php
            $time = getenv('UPDATE_TIME');            
            echo date("l d F Y", $time);
            ?>
        </p>
        <p>Thank you :)</p>
        <img src="/images/favicon.png" width="10%" height="10%">
    </div>

</body>

</html>