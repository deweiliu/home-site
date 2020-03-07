<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Dewei Liu</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="icon" type="image/png" href="images/favicon.png" />
    <meta name="theme-color" content="#40B1FA">
</head>

<body>
    <div class="w3-container">

        <h1><a href="/">Dewei Liu</a></h1>
        <p>Hi, welcome to my personal website.</p>
        <p>Please view my <a href="resume/Dewei Liu CV.pdf">resume</a> and <a href="resume/Dewei Liu transcript.pdf">academic transcript</a>.</p>
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
        <br>
        <br>

        <p>Updated on
            <?php
            $time = getenv('UPDATE_TIME');
            echo date("l d F Y", $time);
            ?>
        </p>
        <p>Thank you :)</p>
        <img src="/images/favicon.png" width="50px" height="50px">
    </div>
</body>

</html>