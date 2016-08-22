# angularjs-game01
AngularJS - Game 01

Based on 'Anatomy of an Idle Game -  A Starters Guide to AngularJS' at http://www.gamedev.net/page/resources/_/technical/game-programming/anatomy-of-an-idle-game-a-starters-guide-to-angularjs-r3767

A little background is an order first I think to give some context to what you are reading. I’ve been a software engineer for over 10 years but during that time I have done very little web development. It’s just not an area I was interested in career-wise, but there is a saying - ‘If you’re not moving forward, you’re moving backwards’. So after moving back to Canada in an effort to make myself more employable I decided to learn about the hot new technologies that companies are looking for at the moment here in Toronto, which are mainly NodeJS, AngularJS, and python. To that end I decided to challenge myself to learn and build a simple idle game using AngularJS in 12 hours. This article is based on that effort.

This article is targeting the advanced beginner level; it assumes that you know the basics of HTML, javascript, and programming.

I also recommend you download the attached zip file which contains all the HTML, CSS, and javascript files. I'll be calling out key parts but the full code is available for you to look at and will run straight out of the box. At least in Chrome - cross browser compatability is out of scope for this article.

You can learn more about angularJS at https://angularjs.org/


It All Starts with Spreadsheets

Spreadsheets. Seriously, use them. Learn to love them. With an idle game everything comes down to time and clicks which means you can do all your planning in a nice friendly spreadsheet. You can work out all your buildings and upgrades, figure out how much each will cost and how the costs will change over time without ever writing any code. 

A good plan is to think in terms of multipliers, limiters, and diminishing returns. For Gnomore Heroes the main limiter was intended to be free space. Free space was designed to limit how fast the player can expand, forcing them to invest in bigger more expensive buildings to house their gnome population. I used both a percentage increase and fixed cost increase. 

The formula is 10 * hardness * depth 

Each unit of free space increases depth by 1 and hardness by 5%. That determines the number of gnome seconds it takes to dig out the next free space. As you can see from the chart below the cost jumps up initially but eventually only the 5% increase will be significant.


Depth 1 - 10 GS(gnome seconds)
Depth 2 - 21 GS (31 GS total)
Depth 5 - 61 GS (171 GS total)
Depth 10 - 155 GS (742 GS total)
Depth 20 - 505 GS (4000 GS total)


Once you have everything in your spreadsheet and you have toyed around with the numbers so that it looks good - easy at the start but taking progressively longer to get the same benefit - you can start on coding.


The Bones

angular.module('gnomoreHeroesApp', ['ngCookies'])
    .controller('GameController', ['$scope', '$interval', '$cookieStore', function ($scope, $interval, $cookieStore) {

        const UNAVAILABLE = 0;
        const AVAILABLE = 1;
        const COMPLETE = 2;

        $scope.gamedata =
        {
            gnomes: 2, space: 0, mushrooms: 0, stone: 0, underpants: 0, research: 0,
            miners: 0, farmers: 0, thieves: 0, researchers: 0, builders: 0,
            mining_points: 0, farming_points: 0, thieving_points: 0,
            totalGnomes: 2, totalSpace: 1, dug: 0.0, depth: 1, hardness: 1,
            minerBonus: 1, farmerBonus: 1, thiefBonus: 10, stoneBonus: 25, builderBonus: 1, researchBonus: 1,
            cost: 10.0,
            buildings: { huts: 0, houses: 0, houseVisible: false, houseResearched: false, villages: 0, villageVisible: false, villageResearched: false, towns: 0, townVisible: false, townResearched: false, cities: 0, cityVisible: false, castles: 0, castleVisible: false },
            researchStates: [{ id: 1, value: AVAILABLE }, { id: 2, value: AVAILABLE }, { id: 4, value: AVAILABLE }, { id: 5, value: AVAILABLE }]
        };
    }]);

That block of code makes up the main game object. Gamedata is where all of the dynamic data lives. It contains all the state specific data and when any action occurs in the game it either uses some information within this object or it updates some information within this object. Keeping most of your game state information in one class makes things easier in terms of maintainable code and adding features. There is no confusion with local variables in methods, it’s clear when you are updating or accessing this information and when it comes to save your game data you can save the entire object without the need to parse out specific parts.

The other important part of the code is 

angular.module('gnomoreHeroesApp', ['ngCookies'])
    .controller('GameController', ['$scope', '$interval', '$cookieStore', function ($scope, $interval, $cookieStore) {

This is your first piece of angularJS code and it forms the heart of application. Everything we will be using is contained in the module. Pay careful attention to the first parameter, gnomoreHeroesApp - this name is how we will link the HTML page to this code module.

You’ll also see $scope, $interval, and $cookieStore. these are essentially include statements that provide access to additional functionality and services. In this app we will be using:


$scope, which allows us to bind objects and methods in the controller to HTML view.
$interval, which lets us create methods that are triggered based on a timer.
$cookieStore, which lets us read and write cookie information.


You’ll notice several other objects like:

$scope.buildings =
        {
            hut: { space: 1, mushrooms: 1, buildcost: 10, description: "A hollowed out mushroom." },
            house: { space: 0, mushrooms: 3, buildcost: 30, description: "A lovely two story mushroom house." },
            village: { space: 0, mushrooms: 30, stone: 10, buildcost: 300, description: "The first step in rebuilding the gnomish civilization." },
            town: { space: 0, mushrooms: 200, stone: 50, buildcost: 600, description: "A growing community." },
            city: { space: 0, mushrooms: 1000, stone: 100, buildcost: 900, description: "Only the best gnomes can afford to live here." },
            castle: { space: 2, mushrooms: 5000, stone: 500, buildcost: 6000, description: "Triumph of gnomish engineering." }
        };

Their purpose is to hold the static data about the game. In this case the building object contains information on the different buildings available, the costs of producing those buildings, and descriptions that will appear on the front end.


The Body

One thing that angularJS does extremely well is making webpages dynamic. It makes adding click events and manipulating content very easy and it allows you to bind HTML content to your javascript objects. This means that when you change the data it automatically updates the front end without the need for the developer to write any code.

This is the important. If you don’t get this first part right nothing else is going to work and as I found out you might just end up with some confusing errors.

<HTML ng-app="gnomoreHeroesApp">
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.15/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.15/angular-cookies.min.js"></script>
  <script src="js/controller.js"></script>

<body ng-controller="GameController">

ng-app="gnomoreHeroesApp" - this is the first gotcha moment. That HTML property is what binds everything together. It identifies that not only is everything within an AngularJS application, it also tells AngularJS what module to use. Make sure that app field is the same as the module name in your javascript file, otherwise it won’t be able to locate your controller or any other part of its code.

The rest handles the importing of the javascript libraries and then telling AngularJS to bind everything in the body to the GameController.

Now let’s look at the status bar code first. This is the bar at the top that lets you know how many gnomes you have, how many mushrooms etc...

<div>
        <span><label>Gnomes:</label> {{gamedata.gnomes}}/{{gamedata.totalGnomes}}</span>
        <span><label>Free Space:</label> {{gamedata.space}}</span>
        <span><label>Mushrooms:</label> {{gamedata.mushrooms}}</span>
        <span><label>Stone:</label> {{gamedata.stone}}</span>
        <span><label>Underpants!!!:</label> {{gamedata.underpants}}</span>
        <span><label>Research:</label> {{gamedata.research}}</span>
        <span><label>Depth:</label> {{gamedata.depth}}</span>
    </div>

The {{}} notation is the AngularJS notation for creating a template which binds that space to some data in $scope. In this case {{gamedata.gnomes}} binds the field gnomes in gamedata to that span. AngularJS will then replace that template with the current value of gamedata.gnomes along with creating a hook which will update the value whenever it changes.

And it’s just that easy if you want to display any field in your controller - all you need is to use a template. The same works for methods:

<span class="top-gap">{{miningRate()}}/sec</span>

$scope.miningRate = function () {
            return (($scope.gamedata.miners * $scope.gamedata.minerBonus) / ($scope.gamedata.cost * $scope.gamedata.depth * $scope.gamedata.hardness)).toFixed(3);
        }

In this case I’ve bound the miningRate method to a template which will display how much free space is dug a second.

Another worthwhile point to talk about in the body of the app is using repeaters and click events. Let's take a look at the research repeater.

<div class="research-list">
                <div class="research-item " ng-repeat="item in research" ng-click="buyResearch(item.id)"
                     ng-show="isResearchAvailable(item.id)" ng-class="{'buyable-true' : gamedata.research >= item.cost, 'buyable-false' : gamedata.research < item.cost}">
                    <label class="research-name">{{item.name}}</label>
                    <strong class="research-cost">{{item.cost}}</strong>
                    <br />
                    <em class="research-text">{{item.description}}</em>

                </div>
            </div>

ng-repeat is a piece of built-in AngularJS functionality that iterates over an array and generates HTML code and bindings. In this case I'm iterating over the research array to create a div that contains all the information related to a research item. I've also bound a click event to that div which will call buyResearch with the id associated for the current research item displayed in that div. In addition to that the ng-show method will dynamically show or hide the div based on whether it is available, and the ng-class method will inject a dynamic class into the div, which means it can be styled differently in CSS depending on whether the player has enough research points or not.


The Guts

Still here? Don’t worry it’s almost over. The final part that needs going over is the guts of the game and this is your timer or game loop.

var timer = $interval(function () {
            var cost = $scope.gamedata.cost;
            $scope.gamedata.mining_points += $scope.gamedata.miners * $scope.gamedata.minerBonus;
            $scope.gamedata.farming_points += $scope.gamedata.farmers * $scope.gamedata.farmerBonus;
            $scope.gamedata.thieving_points += $scope.gamedata.thieves;
            $scope.gamedata.research += $scope.gamedata.researchers * $scope.gamedata.researchBonus;


            while ($scope.gamedata.mining_points >= cost * $scope.gamedata.hardness) {
                $scope.gamedata.dug++;
                $scope.gamedata.mining_points -= cost;
                if ($scope.gamedata.dug >= $scope.gamedata.depth) {
                    $scope.gamedata.space++;
                    $scope.gamedata.dug = 0;
                    $scope.gamedata.depth++;
                    $scope.gamedata.hardness *= 1.05;

                }

                var rnd = Math.floor((Math.random() * 100) + 1);

                if (rnd <= $scope.gamedata.stoneBonus) {
                    $scope.gamedata.stone++;
                }
            }

            while ($scope.gamedata.farming_points >= cost) {
                $scope.gamedata.farming_points -= cost;
                $scope.gamedata.mushrooms++;
            }


        }, 1000, 0);

The timer or game loop is where all the idle work is done. In this case it fires every second, and repeats until cancelled. I’ve removed part of the code for brevity, the rest can be seen in the source files, but as you can see it is pretty straight-forward. The timer fires every second and the game data progress fields all increase by the number of gnomes working on them, plus bonuses.

If cost is less than the number of points accumulated then it adds another level dug or a mushroom.

One important thing to note is that you have to destroy the timer when you’re done or it will cause performance problems for the user. The code block below performs that function.

$scope.$on('$destroy', function () {
            // Make sure that the interval nis destroyed too
            if (angular.isDefined(timer)) {
                $interval.cancel(timer);
                timer = undefined;
            }

            if (angular.isDefined(autoSaveTimer)) {
                $interval.cancel(autoSaveTimer);
                autoSaveTimer = undefined;
            }
        });

Lastly let’s talk about saving. Idle games take time and because of that you are going to want to save the data to a cookie that will let the player continue whenever they want to. Fortunately AngularJS makes that simple enough:

var autoSaveTimer = $interval(function () {
            $cookieStore.put('version', 1);
            $cookieStore.put('gamedata', $scope.gamedata);

        }, 60000, 0);

var init = function () {

            if($cookieStore.get('version')==1)
                {
                $scope.gamedata = $cookieStore.get('gamedata');
                }

        }

        init();


Using $interval and $cookiesstore I’ve created a second timer that every minute writes the contents of gamedata to the cookie. It also writes the current version number of the game to the cookie for compatibility reasons. When the application starts, the init method checks the version number and then loads the contents of the cookie into the gamedata. 

The reason it does a version check is that as your game expands and you add new options and make other changes you’ll want to ensure that loading still works for existing players. When loading old versions of the game data you’ll want to perform a mapping operation to convert the old gamedata format to the new one, if required.


Conclusion

That’s it - that’s idle games and AngularJS in a nutshell. It might not be a traditional idle game but now you have the tools to make your own cookie clicker or dark room. If I was developing Gnomore Heroes into a real idle game I would have to add a lot more research, sort out balance issues, and I was planning on adding a quest mechanic. Eagle-eyed coders might also notice there is one key state object that isn’t saved and loaded but I’ll leave that for you to figure out.


Article Update Log

31 July 2014: Initial release
07 August 2014: Added Missing CSS files to zip  


 Download attached article resource 




License

GDOL (Gamedev.net Open License) 