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

        $scope.buildings =
        {
            hut: { space: 1, mushrooms: 1, buildcost: 10, description: "A hollowed out mushroom." },
            house: { space: 0, mushrooms: 3, buildcost: 30, description: "A lovely two story mushroom house." },
            village: { space: 0, mushrooms: 30, stone: 10, buildcost: 300, description: "The first step in rebuilding the gnomish civilization." },
            town: { space: 0, mushrooms: 200, stone: 50, buildcost: 600, description: "A growing community." },
            city: { space: 0, mushrooms: 1000, stone: 100, buildcost: 900, description: "Only the best gnomes can afford to live here." },
            castle: { space: 2, mushrooms: 5000, stone: 500, buildcost: 6000, description: "Triumph of gnomish engineering." }
        };

        $scope.research =
            [
                { id: 1, name: "Left-Handed Hammers", description: "Now all the builders can work effectively", cost: 360, stat: 4, bonus: .2, unlock: 8 },
                { id: 2, name: "Broken Mining Pick", description: "Not great but works better then nothing.", cost: 360, stat: 1, bonus: .2, unlock: 7 },
                { id: 3, name: "Soft Shoes", description: "Makes stealing a little easier.", cost: 360, stat: 3, bonus: 5, unlock: 0 },
                { id: 4, name: "Watering Can", description: "Every farmer needs one.", cost: 360, stat: 2, bonus: .2, unlock: 9 },
                { id: 5, name: "House Plans", description: "With this you can start building houses.", cost: 360, special: 1, unlock: 6 },
                { id: 6, name: "Well", description: "They key to building villages.", cost: 600, special: 2, unlock: 10 },
                { id: 7, name: "Mineral Scope", description: "You won't dig any faster but you'll find more stone.", cost: 600, stat: 5, bonus: 5, unlock: 0 },
                { id: 8, name: "Tools", description: "Makes everything easier.", cost: 600, stat: 6, bonus: .2, unlock: 0 },
                { id: 9, name: "Fly Agaric", description: "A new kind of mushroom.", cost: 600, stat: 2, bonus: .5, unlock: 0 },
                { id: 10, name: "Town Hall", description: "Can't build a town without this.", cost: 1200, special: 3, unlock: 0 }
            ]

        $scope.buildQueue = [
            { name: "Hut", buildingId: 1, progress: 0, built: 0, cost: $scope.buildings.hut.buildcost }
        ];

        var init = function () {

            if($cookieStore.get('version')==1)
                {
                $scope.gamedata = $cookieStore.get('gamedata');
                }

        }

        init();

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

        var autoSaveTimer = $interval(function () {
            $cookieStore.put('version', 1);
            $cookieStore.put('gamedata', $scope.gamedata);

        }, 60000, 0);

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

            while ($scope.gamedata.thieving_points >= cost) {
                $scope.gamedata.thieving_points -= cost;
                var rnd = Math.floor((Math.random() * 100) + 1);
                if (rnd <= $scope.gamedata.thiefBonus) {
                    $scope.gamedata.underpants++;
                }
            }

            if ($scope.buildQueue.length > 0 && $scope.gamedata.builders > 0) {
                var building = $scope.buildQueue[0];
                building.built += $scope.gamedata.builders * $scope.gamedata.builderBonus;
                building.progress = (building.built / building.cost) * 100;

                if (building.built >= building.cost) {

                    if (building.buildingId == 1) {
                        //hut
                        $scope.gamedata.gnomes++;
                        $scope.gamedata.totalGnomes++;
                        $scope.gamedata.buildings.huts++;
                        if ($scope.gamedata.buildings.houseResearched) {
                            $scope.gamedata.buildings.houseVisible = true;
                        }
                    }
                    else if (building.buildingId == 2) {
                        //house
                        $scope.gamedata.gnomes++;
                        $scope.gamedata.totalGnomes++;
                        $scope.gamedata.buildings.houses++;
                        if ($scope.gamedata.buildings.villageResearched) {
                            $scope.gamedata.buildings.villageVisible = true;
                        }
                    }
                    else if (building.buildingId == 3) {
                        //village
                        $scope.gamedata.gnomes += 2;
                        $scope.gamedata.totalGnomes += 2;
                        $scope.gamedata.buildings.villages++;
                        if ($scope.gamedata.buildings.townResearched) {
                            $scope.gamedata.buildings.townVisible = true;
                        }
                    }
                    else if (building.buildingId == 4) {
                        //town
                        $scope.gamedata.gnomes += 10;
                        $scope.gamedata.totalGnomes += 10;
                        $scope.gamedata.buildings.towns++;
                        $scope.gamedata.buildings.cityVisible = true;
                    }
                    else if (building.buildingId == 5) {
                        //city
                        $scope.gamedata.gnomes += 10;
                        $scope.gamedata.totalGnomes += 10;
                        $scope.gamedata.buildings.cities++;
                        $scope.gamedata.buildings.castleVisible = true;
                    }
                    else if (building.buildingId == 6) {
                        $scope.gamedata.gnomes += 50;
                        $scope.gamedata.totalGnomes += 50;
                        $scope.gamedata.buildings.castles++;
                    }
                    $scope.buildQueue.shift();
                }
            }


        }, 1000, 0);


        $scope.changeMiners = function (delta) {
            if ((delta > 0 && $scope.gamedata.gnomes >= delta) || (delta < 0 && $scope.gamedata.miners >= (delta * -1))) {
                $scope.gamedata.gnomes -= delta;
                $scope.gamedata.miners += delta;
            }
        }

        $scope.changeFarmers = function (delta) {
            if ((delta > 0 && $scope.gamedata.gnomes >= delta) || (delta < 0 && $scope.gamedata.farmers >= (delta * -1))) {
                $scope.gamedata.gnomes -= delta;
                $scope.gamedata.farmers += delta;
            }
        }

        $scope.changeThieves = function (delta) {
            if ((delta > 0 && $scope.gamedata.gnomes >= delta) || (delta < 0 && $scope.gamedata.thieves >= (delta * -1))) {
                $scope.gamedata.gnomes -= delta;
                $scope.gamedata.thieves += delta;
            }
        }

        $scope.changeResearchers = function (delta) {
            if ((delta > 0 && $scope.gamedata.gnomes >= delta) || (delta < 0 && $scope.gamedata.researchers >= (delta * -1))) {
                $scope.gamedata.gnomes -= delta;
                $scope.gamedata.researchers += delta;
            }
        }

        $scope.changeBuilders = function (delta) {
            if ((delta > 0 && $scope.gamedata.gnomes >= delta) || (delta < 0 && $scope.gamedata.builders >= (delta * -1))) {
                $scope.gamedata.gnomes -= delta;
                $scope.gamedata.builders += delta;
            }
        }

        $scope.miningRate = function () {
            return (($scope.gamedata.miners * $scope.gamedata.minerBonus) / ($scope.gamedata.cost * $scope.gamedata.depth * $scope.gamedata.hardness)).toFixed(3);
        }

        $scope.farmingRate = function () {
            return (($scope.gamedata.farmers * $scope.gamedata.farmerBonus) / $scope.gamedata.cost).toFixed(3);
        }

        $scope.buildingRate = function () {
            return (($scope.gamedata.builders * $scope.gamedata.builderBonus) / $scope.gamedata.cost).toFixed(3);
        }

        $scope.thievingRate = function () {
            return $scope.gamedata.thiefBonus;
        }

        $scope.miningLevel = function () {
            return ($scope.gamedata.minerBonus).toFixed(3);
        }

        $scope.farmingLevel = function () {
            return ($scope.gamedata.farmerBonus).toFixed(3);
        }

        $scope.buildingLevel = function () {
            return ($scope.gamedata.builderBonus).toFixed(3);
        }

        $scope.miningProgress = function () {
            return Math.min(((($scope.gamedata.dug * $scope.gamedata.cost) + $scope.gamedata.mining_points) / ($scope.gamedata.cost * $scope.gamedata.depth)) * 100, 100);
        }

        $scope.farmingProgress = function () {
            return Math.min(($scope.gamedata.farming_points / $scope.gamedata.cost) * 100, 100);
        }

        $scope.thievingProgress = function () {
            return Math.min(($scope.gamedata.thieving_points / $scope.gamedata.cost) * 100, 100);
        }

        $scope.buyHutEnabled = function () {
            return $scope.gamedata.space >= $scope.buildings.hut.space && $scope.gamedata.mushrooms >= $scope.buildings.hut.mushrooms;
        }

        $scope.buyHouseEnabled = function () {
            return $scope.gamedata.buildings.huts >= 1 && $scope.gamedata.mushrooms >= $scope.buildings.house.mushrooms;
        }

        $scope.buyVillageEnabled = function () {
            return $scope.gamedata.buildings.houses >= 4 && $scope.gamedata.mushrooms >= $scope.buildings.village.mushrooms && $scope.gamedata.stone >= $scope.buildings.village.stone;
        }

        $scope.buyTownEnabled = function () {
            return $scope.gamedata.buildings.villages >= 1 && $scope.gamedata.mushrooms >= $scope.buildings.town.mushrooms && $scope.gamedata.stone >= $scope.buildings.town.stone;
        }

        $scope.buyCityEnabled = function () {
            return $scope.gamedata.buildings.towns >= 2 && $scope.gamedata.mushrooms >= $scope.buildings.city.mushrooms && $scope.gamedata.stone >= $scope.buildings.city.stone;
        }

        $scope.buyCastleEnabled = function () {
            return $scope.gamedata.buildings.cities >= 1 && $scope.gamedata.mushrooms >= $scope.buildings.castle.mushrooms && $scope.gamedata.stone >= $scope.buildings.castle.stone;
        }

        $scope.buyHut = function () {
            if ($scope.buyHutEnabled()) {
                $scope.gamedata.space -= $scope.buildings.hut.space;
                $scope.gamedata.mushrooms -= $scope.buildings.hut.mushrooms;

                $scope.buildQueue.push({ name: "Hut", buildingId: 1, progress: 0, built: 0, cost: $scope.buildings.hut.buildcost });
            }
        }

        $scope.buyHouse = function () {
            if ($scope.buyHouseEnabled()) {
                $scope.gamedata.mushrooms -= $scope.buildings.house.mushrooms;
                $scope.gamedata.buildings.huts--;

                $scope.buildQueue.push({ name: "House", buildingId: 2, progress: 0, built: 0, cost: $scope.buildings.house.buildcost });
            }
        }
        $scope.buyVillage = function () {
            if ($scope.buyVillageEnabled()) {
                $scope.gamedata.mushrooms -= $scope.buildings.village.mushrooms;
                $scope.gamedata.stone -= $scope.buildings.village.stone;
                $scope.gamedata.buildings.houses -= 4;

                $scope.buildQueue.push({ name: "Village", buildingId: 3, progress: 0, built: 0, cost: $scope.buildings.village.buildcost });
            }
        }
        $scope.buyTown = function () {
            if ($scope.buyTownEnabled()) {
                $scope.gamedata.mushrooms -= $scope.buildings.town.mushrooms;
                $scope.gamedata.stone -= $scope.buildings.town.stone;

                $scope.gamedata.buildings.villages--;

                $scope.buildQueue.push({ name: "Town", buildingId: 4, progress: 0, built: 0, cost: $scope.buildings.town.buildcost });
            }
        }
        $scope.buyCity = function () {
            if ($scope.buyCityEnabled()) {
                $scope.gamedata.mushrooms -= $scope.buildings.city.mushrooms;
                $scope.gamedata.stone -= $scope.buildings.city.stone;

                $scope.gamedata.buildings.towns -= 2;

                $scope.buildQueue.push({ name: "City", buildingId: 5, progress: 0, built: 0, cost: $scope.buildings.city.buildcost });
            }
        }
        $scope.buyCastle = function () {
            if ($scope.buyCastleEnabled()) {
                $scope.gamedata.mushrooms -= $scope.buildings.castle.mushrooms;
                $scope.gamedata.stone -= $scope.buildings.castle.stone;

                $scope.gamedata.buildings.cities--;

                $scope.buildQueue.push({ name: "Castle", buildingId: 6, progress: 0, built: 0, cost: $scope.buildings.castle.buildcost });
            }
        }

        $scope.canResearch = function (id) {

            angular.forEach($scope.research, function (value, key) {
                if (value.id == id) {


                    if (value.available && !value.complete && value.cost <= $scope.gamedata.research) {
                        return "buyable-true";
                    }
                }
            });

            return "buyable-false";
        }

        getResearchState = function (id) {
            var result = UNAVAILABLE;
            angular.forEach($scope.gamedata.researchStates, function (value, key) {
                if (value.id == id) {
                    result = value.value;
                }
            });

            return result;
        }

        setResearchState = function (id, newValue) {
            var found = false;
            angular.forEach($scope.gamedata.researchStates, function (value, key) {
                if (value.id == id) {
                    value.value = newValue;
                    found = true;
                }
            });

            if (!found) {
                $scope.gamedata.researchStates.push({ id: id, value: newValue });
            }
        }

        $scope.isResearchAvailable = function (id) {
            return getResearchState(id) == AVAILABLE;
        }

        $scope.buyResearch = function (id) {
            angular.forEach($scope.research, function (value, key) {
                if (value.id == id) {

                    if ($scope.isResearchAvailable(id) && value.cost <= $scope.gamedata.research) {

                        $scope.gamedata.research -= value.cost;
                        setResearchState(value.id, COMPLETE);

                        if (value.unlock > 0) {
                            setResearchState(value.unlock, AVAILABLE);
                        }

                        if (angular.isDefined(value.stat)) {
                            switch (value.stat) {
                                case 1:
                                    $scope.gamedata.minerBonus += value.bonus;
                                    break;
                                case 2:
                                    $scope.gamedata.farmerBonus += value.bonus;
                                    break;
                                case 3:
                                    $scope.gamedata.thiefBonus += value.bonus;
                                    break;
                                case 4:
                                    $scope.gamedata.builderBonus += value.bonus;
                                    break;
                                case 5:
                                    $scope.gamedata.stoneBonus += value.bonus;
                                    break;
                                case 6:
                                    $scope.gamedata.minerBonus += value.bonus;
                                    $scope.gamedata.farmerBonus += value.bonus;
                                    $scope.gamedata.thiefBonus += value.bonus;
                                    $scope.gamedata.builderBonus += value.bonus;
                                    $scope.gamedata.stoneBonus += value.bonus;
                                    break;
                            }
                        }
                        if (angular.isDefined(value.special)) {
                            switch (value.special) {
                                case 1:
                                    $scope.gamedata.buildings.houseResearched = true;
                                    if ($scope.gamedata.buildings.huts > 0) {
                                        $scope.gamedata.buildings.houseVisible = true;
                                    }
                                    break;
                                case 2:
                                    $scope.gamedata.buildings.villageResearched = true;
                                    if ($scope.gamedata.buildings.houses > 0) {
                                        $scope.gamedata.buildings.villageVisible = true;
                                    }
                                    break;
                                case 3:
                                    $scope.gamedata.buildings.townResearched = true;
                                    if ($scope.gamedata.buildings.villages > 0) {
                                        $scope.gamedata.buildings.townVisible = true;
                                    }
                                    break;
                            }
                        }
                    }
                }
            });
        }


    }]);

