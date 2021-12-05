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

        <div style="float: right;">
            <div data-iframe-width="150" data-iframe-height="270" data-share-badge-id="8c545d9d-fab9-437c-bdd2-254fc07e8bb4" data-share-badge-host="https://www.credly.com"></div>
            <script type="text/javascript" async src="//cdn.credly.com/assets/utilities/embed.js"></script>
        </div>

        <h1><a href="/">Dewei Liu</a></h1>

        <p>Hi, welcome to my personal website.</p>
        <p>Please view my <a href="doc/resume.pdf">resume</a>.</p>
        <p>Below are my on-going projects</p>
        <p><a href="http://jenkins.dliu.com">Jenkins Pipelines</a> - I manage the entire Jenkins CI/CD environment hosted on AWS. The environment is defined as Infrastructure as Code (IaC) and I made it <a href="https://github.com/deweiliu/jenkins">avilable to public</a>.</p>
        <p><a href="http://bfa.dliu.com/">Best Friends App</a> - An online chatbot that does simple
            conversations</p>
        <p><a href="http://paperborne.dliu.com/">Paperborne</a> - An Android card game with an online demo.</p>
        <br>
        <p>Below are my games</p>
        <p><a href="https://rps.deweiliu.com/">Rock Paper Scissors</a></p>
        <p><a href="https://super-mario.deweiliu.com/">Super Mario Brothers</a></p>
        <p><a href="https://pacman.deweiliu.com/">Pac-Man</a></p>
        <p><a href="https://racer.deweiliu.com/">3D Racer</a></p>
        <p><a href="https://clumsy-bird.deweiliu.com/">Clumsy Bird</a></p>
        <br>

        <p>You can also follow me via the following sites.</p>
        <p><a href="https://www.linkedin.com/in/de-wei-liu/">LinkedIn</a></p>
        <p><a href="https://github.com/deweiliu">GitHub</a></p>
        <br>
        <br>


        <p>Updated on
            <?php
            $time = getenv('UPDATE_TIME');
            echo date("d F Y", $time);
            ?>
        </p>
        <p>Thank you :)</p>
        <img src="/images/favicon.png" width="50px" height="50px">
    </div>
</body>

</html>