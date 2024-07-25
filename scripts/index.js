define(['text'], function (text) {

    //const { networkInterfaces } = require('os');
    //const { start } = require("repl");
    //const prompt = require("prompt-sync")({sigint:true});
    const filename = 'adjacency_matrix.txt';    //Filename of .txt file containing original (clean) adjacency matrix
    //const filename = 'http://localhost:8080/scripts/adjacency_matrix.txt';    //Filename of .txt file containing original (clean) adjacency matrix

    function GetFileData(startCoords, endCoords) {
        fetch(filename)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok' + response.statusText);
                }
                return response.text();
            })
            .then(fileContent => {
                const adjacencyMatrix = ReadAdjacencyMatrixText(fileContent);
                Main(startCoords, endCoords, adjacencyMatrix);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    function Popup(message) {
        window.alert(message);
    }

    //Popup("test");

    async function getCoordinates(address) {
        const apiKey = `${process.env.GOOGLE_API_KEY}`; // Replace with your Google API key
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                return [location.lat, location.lng];
            } else {
                Popup("No address found, consider copying address format from google maps or using coordinates");
                throw new Error('No results found for the given address.');
            }
        } catch (error) {
            console.error('Error fetching geocoding data:', error);
            throw error;
        }
    }

    function ClearHTMLRouteDiv(divID) {
        const div = document.getElementById(divID);
        
        while(div.firstChild) {
            div.removeChild(div.firstChild);
        }
    }

    function DisplayListOnHtml(list, startAddress, endAddress) {
        //Debugging
        //document.getElementById("debugText3").innerHTML = list;

        var outputDiv = document.getElementById("routingOutput");

        ClearHTMLRouteDiv("routingOutput");

        list.forEach(line => {
            const p = document.createElement("p");
            p.textContent = line;
            outputDiv.appendChild(p);   //Find code for outputDiv
        });
    }

    function GetMapKeyFromValue(map, value) {   //Assumes no values are the same, keys are sequential 0-(length of map)
        //console.log("Map size:", map.size);
        for (var i = 0; i < map.size; i++) {
            //console.log("Map.get(i):", map.get(i));
            if (map.get(i) == value) {
                return i;
            }
        }
        return false;
    }

    //Start of Coord class declaration
    class Coord {
        constructor(lat, lon) {
            this.lat = lat;
            this.lon = lon;
        }

        Print() {
            var outputStr = "";
            outputStr += String(this.lat);
            outputStr += ",";
            outputStr += String(this.lon);
            return outputStr;
        }
    }
    //End of Coord class declaration

    //Start of Node class declaration
    class Node {
        // constructor(lat, lon, name) {
        //     this.lat = lat;
        //     this.lon = lon;
        //     this.name = name;
        //     this.PrintStationName();
        // }

        constructor() {
            //this.strText = "";
            //this.strText = initString;
            //this.SplitStationName();
            //this.Coord = new Coord(this.lat, this.lon);
        }
        // constructor(initString) {
        //     this.strText = initString;
        //     this.SplitStationName();
        //     //this.Coord = new Coord(this.lat, this.lon);
        // }

        PrintStationName() {
            var nameStr = "";
            nameStr += String(this.coord.lat);
            nameStr += ",";
            nameStr += String(this.coord.lon);
            nameStr += ";";
            nameStr += this.name;
            this.strText = nameStr;
            //console.log("this.strText:", this.strText);
            //console.log("nameStr:", nameStr);
            return nameStr;
        }

        SplitStationName() {
            var initStrSplit = (this.strText).split(";");
            //console.log("initStrSplit:", initStrSplit);
            this.name = initStrSplit[1];
            //console.log("Name:", this.name);
            var coord = (initStrSplit[0]).split(":");
            //console.log("Coord:", coord);
            var lat = Number(coord[0]);
            //this.lat = coord[0];
            var lon = Number(coord[1]);
            this.coord = new Coord(lat, lon);
            //this.lon = coord[1];
        }
    }
    //End of Node class declaration

    //Start of Graph class declaration
    class Graph {
        constructor(nodeList) {
            this.nodeList = nodeList;
            //console.log("nodeList:", nodeList);
            this.map = new Map();   //Connects nodes to nodeIDs (index in adjacencyMatrix)
            this.numNodes = nodeList.length;
            this.adjacencyMatrix = [];
            for (let i = 0; i < this.numNodes; i++) {
                (this.map).set(i, nodeList[i]);
                this.adjacencyMatrix[i] = new Array(this.numNodes).fill(0); //Add code to populate adjacency matrix from adjacency matrix in file
            }
        }

        //Methods

        AddNode(node) {
            this.map.set((this.map.size), node);
            this.nodeList.push(node);
            (this.adjacencyMatrix).push(new Array(this.numNodes).fill(0));

            (this.adjacencyMatrix).forEach(row => {
                row.push(0);
            });
            this.numNodes++;
        }

        AddEdge(startNode, endNode, weight) {

            // if (weight == 1000000) {
            //     weight = Math.random() * 10;
            // }

            const startNodeID = GetMapKeyFromValue(this.map, startNode);
            //console.log("Start node ID:", startNodeID);
            const endNodeID = GetMapKeyFromValue(this.map, endNode);
            //console.log("End node ID:", endNodeID);
            this.adjacencyMatrix[startNodeID][endNodeID] = weight;
            this.adjacencyMatrix[endNodeID][startNodeID] = weight;

            //console.log("Weight:", this.adjacencyMatrix[startNodeID][endNodeID], "=", this.adjacencyMatrix[endNodeID][startNodeID]);
        }

        AddUnidirectionalEdge(startNode, endNode, weight) {
            const startNodeID = GetMapKeyFromValue(this.map, startNode);
            const endNodeID = GetMapKeyFromValue(this.map, endNode);
            this.adjacencyMatrix[startNodeID][endNodeID] = weight;
        }

        // RemoveEdge(startNode, endNode) {
        //     if
        // }

        GetNeighbours(node) {
            var neighbourValues = [];
            (this.adjacencyMatrix[node]).forEach(element => {
                if (element > 0) {
                    neighbourValues.push(element);
                    //console.log(element);
                }

            });
            return neighbourValues;
        }

        PrintMap() {
            for (var i = 0; i < (this.nodeList).length; i++) {
                //console.log(String(i), ((this.map).get(i)));
                //console.log(String(i), this.nodeList[i]);
                //console.log("i:", String(i), "| nodelist[i]:", this.nodeList[i], "| node from map using nodeID:", this.map.get(i));
                console.log("i:", String(i), "| node from map using nodeID:", this.map.get(i));
            }
        }

        // GenerateRandomWaitingTime() {
        //     const random = Math.floor(Math.random() * 10);
        //     return { val: random, min: 1, max: 10 };
        // }

        GetWeight(startNode, endNode) {
            // const startNodeID = GetMapKeyFromValue(this.map, startNode) + 1;
            const startNodeID = GetMapKeyFromValue(this.map, startNode);
            // const endNodeID = GetMapKeyFromValue(this.map, endNode) + 1;
            const endNodeID = GetMapKeyFromValue(this.map, endNode);

            var edgeWeight = (this.adjacencyMatrix)[startNodeID][endNodeID];

            //Debugging
            // console.log("Edge weight between", startNode.name, "and", endNode.name);
            // console.log(edgeWeight);

            // if (edgeWeight == 1000000) {    //Signifies internal station connection, generate random waiting time;
            //     return this.GenerateRandomWaitingTime();
            // }

            // else  {
            //     return {val: edgeWeight, min: edgeWeight, max: edgeWeight };
            // }

            //Random wait times will now be calculated in the Route class

            return edgeWeight;
        }
        // PrintMap() {
        //     this.map.forEach(element => {
        //         console.log(element);
        //     });
        // }

        // GetWeight(node1, node2) {
        //     const node1ID = GetMapKeyFromValue(node1);
        //     const node2ID = GetMapKeyFromValue(node2);
        //     console.log(node1.name, "id:", node1ID, "|", node2.name, "id:", node2ID);

        //     const edgeWeight = this.adjacencyMatrix[node1ID][node2ID];

        //     console.log("Weight of edge between", node1.name, "and", node2.name, "=", edgeWeight);
        //     return edgeWeight;
        // }

        PopulateAdjacencyMatrixFromExisting(existingAdjMat) {

            /*
            //Debugging
            var populatedEdgeCount = 0;
            const totalEdgeCount = Math.pow((this.adjacencyMatrix).length, 2);
            console.log("Total number of edges:", totalEdgeCount);
            */

            //Debugging
            // const checkStr = "0\r"
            // console.log("CheckStr:", checkStr);

            for (var i = 0; i < (this.adjacencyMatrix).length; i++) {
                for (var j = 0; j < (this.adjacencyMatrix).length; j++) {
                    var val = existingAdjMat[i + 1][j + 1];
                    val = val.replace("\r", "");
                    (this.adjacencyMatrix)[i][j] = Number(val);

                    /*
                    //Debugging
                    var rowNodeName = ((this.map).get(i)).name;
                    var colNodeName = ((this.map).get(j)).name;
                    console.log("Cycle num:", populatedEdgeCount, "i:", i, "j:", j);
                    console.log("Current edge being populated:", rowNodeName, "to", colNodeName);
                    console.log("Current edge weight:", existingAdjMat[i+1][j+1]);
                    populatedEdgeCount++;
                    */
                }
            }
            // for (var i = 1; i < (this.adjacencyMatrix).length; i++) {
            //     for (var j = 1; j < (this.adjacencyMatrix).length; j++) {
            //         (this.adjacencyMatrix)[i-1][j-1] = existingAdjMat[i][j];

            //         //Debugging
            //         var rowNodeName = ((this.map).get(i)).name;
            //         var colNodeName = ((this.map).get(j)).name;
            //         console.log("Cycle num:", populatedEdgeCount, "i:", i, "j:", j);
            //         console.log("Current edge being populated:", rowNodeName, "to", colNodeName);
            //         console.log("Current edge weight:", existingAdjMat[i-1][j-1]);
            //         populatedEdgeCount++;
            //     }
            // }
        }

        MakeAllEdgesBidirectional() {
            for (var i = 0; i < this.adjacencyMatrix.length; i++) {
                for (var j = 0; j < this.adjacencyMatrix[i].length; j++) {
                    if (this.adjacencyMatrix[i][j] != this.adjacencyMatrix[j][i]) {
                        const maxValue = Math.max(this.adjacencyMatrix[i][j], this.adjacencyMatrix[j][i]);
                        this.adjacencyMatrix[i][j] = maxValue;
                        this.adjacencyMatrix[j][i] = maxValue;
                    }
                }
            }
        }
    }
    //End of Graph class declaration

    //Start of Route class declaration
    class Route {
        constructor(graphInstance, startNode, endNode) {
            this.graph = graphInstance;
            this.startNode = startNode;
            //console.log("Route startnode:", this.startNode);
            this.endNode = endNode;
            //console.log("Route endnode:", this.endNode);
            this.nodeList = [];
            this.durationList = [];
            this.CalculateFastestRoute();
            // this.routeStr = this.GenerateRouteStr();
            // this.CalculateRouteDurationFromDurationList();
            //this.GenerateRouteStr();
            //this.OutputRouteAsList();
            this.DisplayRouteListOnHtml();

            //Debugging
            //console.log("RouteStr:", this.routeStr);
            console.log(this.routeStr);
        }

        CalculateRouteDurationFromDurationList() {
            var avgDuration = 0;
            var minDuration = 0;
            var maxDuration = 0;

            //Debugging
            //console.log("Durationlist:", this.durationList);

            this.durationList.forEach(duration => {
                //console.log("Current duration:" + duration);
                avgDuration += duration.val;
                minDuration += duration.min;
                maxDuration += duration.max;
            });
            this.duration = { avg: avgDuration, min: minDuration, max: maxDuration };
        }

        GenerateRandomWaitingTime() {
            const random = Math.floor(Math.random() * 11);  //Multiply by 11 so that 10 is a possible and likely outcome with floor function
            return { val: random, min: 1, max: 10 };
        }

        CalculateDistanceDuration(distance) {
            if (distance == 1000000) {    //Signifies internal station connection, generate random waiting time;
                return this.GenerateRandomWaitingTime();
            }

            else {
                var duration = ((distance / 1000) / 50) * 60;   //Converts distance m -> km, divide by 50kph placeholder speed, divide by 60 to convert h -> m
                return { val: duration, min: duration, max: duration }; //PLACEHOLDER VALUE
            }

            // else if (distance ) {     //Populate with values, consider using a switch/case statement instead
            //     //return { val: , min: , max: };
            // }
        }

        PopulateDurationList(routeNodeList) {
            var durationList = [];
            durationList.push(this.GenerateRandomWaitingTime());
            for (var i = 0; i < routeNodeList.length - 1; i++) {
                var currentDistance = (this.graph).GetWeight(routeNodeList[i], routeNodeList[i + 1]);
                //console.log("current distance:", currentDistance);
                //Getting time from distance
                var currentDuration = this.CalculateDistanceDuration(currentDistance);
                durationList.push(currentDuration);
            }
            this.durationList = durationList;

            //Debugging
            // durationList.forEach(durationVal => {  
            //     console.log(durationVal);
            // });
        }

        CalculateFastestRoute() {
            //const averageSpeed = 0; //Fill in with average speed (most likely in meters/hour)
            var nodeList = [];
            //var durationList = [];

            //Routing code

            const dijkstraResult = this.Dijkstra();

            //Debugging
            //console.log("Dijkstra result:", dijkstraResult);

            nodeList = dijkstraResult.path;    //Populating nodeList

            //Debugging
            //console.log("NodeList:", nodeList);

            //Replace node IDs from dijkstra algorithm with node objects
            for (let i = 0; i < nodeList.length; i++) {
                nodeList[i] = this.graph.map.get(nodeList[i]);
            }

            //console.log("Nodelist:", nodeList);

            this.nodeList = nodeList;

            if (nodeList.length == 3) {
                console.log("No ideal train route");
                this.noTrainRoute = true;
            }

            this.PopulateDurationList(nodeList);

            this.RoundDurationListValues();

            this.CalculateRouteDurationFromDurationList();
        }

        RoundDurationListValues() {
            this.durationList.forEach(durationObj => {
                //durationObj.val = Math.round(durationObj.val*10)/10;  //Rounds to 1dp
                durationObj.val = Math.round(durationObj.val);
            });
        }

        GenerateRouteStr() {
            var routeStr = "";
            routeStr += `Start -> ${this.nodeList[1].name} (${this.durationList[1].val} mins)\n`;
            routeStr += `Waiting for train (${this.durationList[0].val} mins)\n`;
            for (var i = 1; i < this.durationList.length - 1; i++) {    //Potentially add in walking or driving (depending on distance to station) for trip segments between start/end nodes and stations
                routeStr += this.nodeList[i].name;
                routeStr += " -> ";
                routeStr += this.nodeList[i + 1].name;
                routeStr += " (";
                routeStr += String(this.durationList[i + 1].val);
                routeStr += " mins) \n";
            }
            //Consider adding mode of transport between end nodes and end stations (i.e. driving or walking)
            //console.log("RouteStr:", routeStr, "\npart 2: total trip time:", this.duration.avg, "between", this.duration.min, "and", this.duration.max);
            this.routeStr = routeStr;
            //return routeStr;
        }

        //Decide whether to implement
        /*
        GenerateRouteStrList() {
            var routeStrList = [];
            routeStrList.push(`Wait time: ${this.durationList[0].val}`);
            for (var i = 0; i < this.durationList.length; i++) {
                var currentStr = "";
                currentStr += this.nodeList[i].name;
                currentStr += " ";
                currentStr += String(this.durationList[i].val);
                routeStrList.push(currentStr);
            }
            routeStrList.push()
        }
        */

        Dijkstra() {
            const adjMatrix = this.graph.adjacencyMatrix;
            //const startNodeObj = GetNodeByName(startNodeName, graphInstance.nodeList);
            const startNode = GetMapKeyFromValue(this.graph.map, this.startNode);
            //const targetNodeObj = GetNodeByName(targetNodeName, graphInstance.nodeList);
            const targetNode = GetMapKeyFromValue(this.graph.map, this.endNode);
            const numNodes = adjMatrix.length;

            //Debugging
            // console.log("Start node object:", this.startNode);
            // console.log("Target node object:", this.endNode);
            // console.log("StartnodeID:", startNode);
            // console.log("TargetnodeID:", targetNode);
            // console.log("numNodes:", numNodes);

            //Error reporting
            if (!this.startNode || !this.endNode) {
                console.log("startNodeObj/endNodeObj false");
            }

            const distances = new Array(numNodes).fill(Infinity);
            const visited = new Array(numNodes).fill(false);
            const previous = new Array(numNodes).fill(null);

            distances[startNode] = 0;
            const priorityQueue = [[0, startNode]]; // [distance, node]

            //Debugging
            // console.log("Queue at start:", priorityQueue);

            // console.log("Starting dijkstra while loop");
            // var count = 0;

            while (priorityQueue.length > 0) {

                //Debugging
                //console.log("Dijkstra while loop round");
                // console.log("Dijkstra for loop round", count);
                // count++;

                // Extract the node with the minimum distance
                priorityQueue.sort((a, b) => a[0] - b[0]);
                const [currentDistance, currentNode] = priorityQueue.shift();

                //Debugging
                // console.log("Current node:", currentNode);

                if (currentNode === targetNode) {

                    //Debugging
                    // console.log("Current node == target node");

                    // Target node reached, build the path
                    const path = [];
                    var node = targetNode;
                    //while (node !== null) {
                    while (node != null) {
                        path.unshift(node);
                        node = previous[node];

                        //Debugging
                        // console.log("Current node in path:", node);
                    }
                    return { distance: distances[targetNode], path: path };
                }

                if (visited[currentNode]) continue;
                visited[currentNode] = true;

                // Update distances for each neighbor

                //Debugging
                // console.log("Updating distances for each neighbour");

                for (let neighbor = 0; neighbor < numNodes; neighbor++) {
                    const weight = adjMatrix[currentNode][neighbor];
                    if (weight > 0 && !visited[neighbor]) {
                        const distance = currentDistance + weight;
                        //console.log("dijkstra distance:", distance);

                        if (distance < distances[neighbor]) {
                            distances[neighbor] = distance;
                            previous[neighbor] = currentNode;
                            priorityQueue.push([distance, neighbor]);
                        }
                    }
                }
                //console.log("Priority queue:", priorityQueue);
            }

            //Debugging
            // console.log("Dijkstra while loop ended");

            // If the target node is not reachable, return null
            console.log("Target node not reachable");
            return null;
        }

        OutputRouteAsList() {
            this.GenerateRouteStr();
            this.routeStrList = (this.routeStr).split("\n");
            console.log("RouteStrList:", this.routeStrList);
        }

        DisplayRouteListOnHtml() {
            const startAddress = document.getElementById("startAddressField").value;
            const endAddress = document.getElementById("endAddressField").value;
            document.getElementById("routeHeader").innerHTML = `Route from ${startAddress} to ${endAddress}:`;
            console.log("DisplayRouteListOnHtml() called");

            if (this.noTrainRoute) {
                const htmlOutput = ["No ideal train route found - either addresses are too close together or area is not served well by trains"];
                DisplayListOnHtml(htmlOutput);
            }

            else {
                this.OutputRouteAsList();
                DisplayListOnHtml(this.routeStrList);
            }
        }
    }
    //End of Route class declaration

    function MakeStationNameList(stationList) {
        var nameList = [];
        stationList.forEach(station => {
            nameList.push(station.name);
        });
        return nameList;
    }

    /*
    function GetNodeByName(name, nodeList) {
        nodeList.forEach(node => {
            //Debugging
            console.log("Getnodebyname node name:", node.name);
            if (node.name == name) {
                return node;
            }
        });
        return false;
    }
    */

    function GetNodeByName(name, nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
            if (Object.is(name, nodeList[i].name)) {
                console.log("Found");
                return nodeList[i];
            }
        }
    }

    // function ReadAdjacencyMatrixFromFile(filename) {
    //     try {
    //         // Read the file synchronously (you can use asynchronous version if needed)
    //         const data = fs.readFileSync(filename, 'utf8');

    //         // Split the file content into lines
    //         const lines = data.trim().split('\n');

    //         // Initialize an empty adjacency matrix
    //         let adjacencyMatrix = [];

    //         // Process each line to extract the matrix values
    //         lines.forEach((line) => {
    //             // Split the line by comma to get individual values
    //             //const row = line.split(',').map(Number);
    //             const row = line.split(',');
    //             adjacencyMatrix.push(row);
    //         });

    //         return adjacencyMatrix;
    //     } catch (err) {
    //         console.error('Error reading file:', err);
    //         return null;
    //     }
    // }

    function ReadAdjacencyMatrixText(data) {
        //Debugging
        //Popup(data);

        try {
            // Split the text into lines
            const lines = data.trim().split('\n');

            // Initialize an empty adjacency matrix
            let adjacencyMatrix = [];

            // Process each line to extract the matrix values
            lines.forEach((line) => {
                // Split the line by comma to get individual values
                //const row = line.split(',').map(Number);
                const row = line.split(',');
                adjacencyMatrix.push(row);
            });

            return adjacencyMatrix;
        } catch (err) {
            console.error('Error reading file:', err);
            return null;
        }
    }

    function MakeStationList(adjacencyMatrix) {
        //console.log("adjacencyMatrix[0] original length:", adjacencyMatrix.length);
        var rawStationList = adjacencyMatrix[0];  //Shift removes first element of list (blank - corner of matrix)
        rawStationList.shift();
        //console.log("rawStationList length:", rawStationList.length);
        var stationList = [];
        rawStationList.forEach(element => {
            var currentStation = new Node();
            currentStation.strText = element;
            //console.log("strText:", element);
            currentStation.SplitStationName();
            stationList.push(currentStation);
            //console.log("Station name:", currentStation.name, "| station coords:", currentStation.coord.Print());
        });
        return stationList;
    }

    function Pythagoras(p1, p2) {
        var a = p1.lat - p2.lat;
        a *= a;
        var b = p1.lon - p2.lon;
        b *= b;
        return Math.sqrt(a + b);
    }

    function Find3NearestStations(startPoint, originalStationList) {
        var nearestDists = [1000001, 1000002, 1000003]; //Closest station at pos 0
        var closestStations = [];   //Closest station at pos 0
        var currentDist = 0;

        originalStationList.forEach(station => {

            currentDist = Pythagoras(startPoint, station.coord);

            if (currentDist < nearestDists[0]) { //Shorter than all distances in the list

                nearestDists[2] = nearestDists[1];
                closestStations[2] = closestStations[1];

                nearestDists[1] = nearestDists[0];
                closestStations[1] = closestStations[0];

                nearestDists[0] = currentDist;
                closestStations[0] = station;

            }

            else if (currentDist < nearestDists[1] && currentDist > nearestDists[0]) {  //Second shortest distance

                nearestDists[2] = nearestDists[1];
                closestStations[2] = closestStations[1];

                nearestDists[1] = currentDist;
                closestStations[1] = station;

            }

            else if (currentDist < nearestDists[2] && currentDist > nearestDists[1] && currentDist > nearestDists[0]) { //Third shortest distance

                nearestDists[2] = currentDist;
                closestStations[2] = station;

            }
        });

        return closestStations;
    }

    function SetUpNode(coord, name) {
        //console.log("Setupnode coord:", coord);
        //console.log("Setupnode lat:", coord.lat, "setupnode lon:", coord.lon);
        const node = new Node();
        node.lat = coord.lat;
        //console.log("Lat:", node.lat);
        node.lon = coord.lon;
        //console.log("Lon:", node.lon);
        node.coord = coord;
        node.name = name;
        return node;
    }

    function GetDrivingTime(startCoord, endCoord) { //Gets driving time from Google Maps API (or walking time if distance by line is less than 500m)
        return Math.floor(Math.random() * 10);   //For testing purposes only
    }

    function ConnectEndNodesToGraph(graph, startNode, endNode, stationList) {
        if (!stationList.includes(startNode)) {
            graph.AddNode(startNode);
            const closest3StationsByLineToStart = Find3NearestStations(startNode, stationList);

            //Debugging
            //console.log("Closest 3 stations to startNode:", closest3StationsByLineToStart);

            closest3StationsByLineToStart.forEach(station => {
                var travelTimeToStation = GetDrivingTime(startNode.coord, station.coord);
                graph.AddUnidirectionalEdge(startNode, station, travelTimeToStation);
                //console.log("Weight between", startNode.name, "and", station.name, "=", graph.GetWeight(startNode, station));
            });


        }

        if (!stationList.includes(endNode)) {
            graph.AddNode(endNode);
            const closest3StationsByLineToDestination = Find3NearestStations(endNode, stationList);

            //Debugging
            //console.log("Closest 3 stations to endNode:", closest3StationsByLineToDestination);

            closest3StationsByLineToDestination.forEach(station => {
                var travelTimeFromStation = GetDrivingTime(station.coord, endNode.coord);
                //graph.AddEdge(station, endNode, travelTimeFromStation);
                graph.AddUnidirectionalEdge(station, endNode, travelTimeFromStation);
                //console.log("Weight between", station.name, "and", endNode.name, "=", graph.GetWeight(station, endNode));
            });

        }

        //Debugging
        // console.log("StartNodeMapKey:", GetMapKeyFromValue(graph.map, startNode));
        // console.log("EndNodeMapKey:", GetMapKeyFromValue(graph.map, endNode));
    }

    function Main(startCoordArr, endCoordArr, adjacencyMatrix) {   //Code to be executed once geocoded address returns from APi/async function
        //Convert parameter coordinates into Coord class
        const startCoord = new Coord(Number(startCoordArr[0]), Number(startCoordArr[1]));
        const endCoord = new Coord(Number(endCoordArr[0]), Number(endCoordArr[1]));

        //Debugging
        //console.log("DEBUG: Start coord", startCoord);
        //console.log("DEBUG: End coord", endCoord);

        //Initialise adjacency matrix
        //const adjacencyMatrix = ReadAdjacencyMatrixFromFile(filename);
        //const adjacencyMatrix = ReadAdjacencyMatrixText();

        //Then make station list
        const originalStationList = MakeStationList(adjacencyMatrix);

        //Debug: make list of station names:
        //const originalStationNameList = MakeStationNameList(originalStationList);

        //Create graph instance
        var graphInstance = new Graph(originalStationList);

        //Populate graphInstance from imported adjacency matrix
        graphInstance.PopulateAdjacencyMatrixFromExisting(adjacencyMatrix);
        graphInstance.MakeAllEdgesBidirectional();

        //Debugging
        // console.log("Populated adjacency matrix:", graphInstance.adjacencyMatrix);

        //Debugging: testing populated adjacency matrix
        //const testNode1 = originalStationList[0];
        //console.log(originalStationNameList[0]);
        //console.log("Station name list:");
        // console.log(originalStationNameList);

        // for (var i = 0; i < originalStationNameList.length; i++) {
        //     console.log("ID", i, ":", originalStationNameList[i]);
        // }



        // const startStationQuery = prompt("Enter start station name:");
        // const startStation = GetNodeByName(startStationQuery, originalStationList);

        // const endStationQuery = prompt("Enter destination station name:");
        // const endStation = GetNodeByName(endStationQuery, originalStationList);

        // console.log("Weight of edge between", startStation.name, "and", endStation.name);
        // console.log(graphInstance.GetWeight(startStation, endStation));

        //Find 3 nearest stations as the crow flies/by line
        //const closest3StationsByLineToStart = Find3NearestStations(startCoord, originalStationList);
        //const closest3StationsByLineToDestination = Find3NearestStations(endCoord, originalStationList);

        //Create nodes for start and end coordinates/points4
        const startNode = SetUpNode(startCoord, "Start");
        const endNode = SetUpNode(endCoord, "Destination");

        ConnectEndNodesToGraph(graphInstance, startNode, endNode, originalStationList);

        //Obsolete due to ConnectEndNodesToGraph function
        /*
        //Add start and end nodes to graphInstance
        graphInstance.AddNode(startNode);
        graphInstance.AddNode(endNode);

        //Get travel times between start and end nodes and 3 closest respective stations and connect them on graphInstance where weight = travel time
        closest3StationsByLineToStart.forEach(station => {
            var travelTimeToStation = GetDrivingTime(startCoord, station.coord);
            graphInstance.AddEdge(startNode, station, travelTimeToStation);
        });

        closest3StationsByLineToDestination.forEach(station => {
            var travelTimeFromStation = GetDrivingTime(station.coord, endCoord);
            graphInstance.AddEdge(station, endNode, travelTimeFromStation);
        });
        */

        //Debugging
        // console.log("StartNode:", startNode, "EndNode:", endNode);

        // console.log("Nearest station from start node:", closest3StationsByLineToStart[0], "distance:", graphInstance.GetWeight(startNode, closest3StationsByLineToStart[0]));
        // console.log("Nearest station to end node:", closest3StationsByLineToDestination[0], "distance:", graphInstance.GetWeight(endNode, closest3StationsByLineToDestination[0]));

        const route = new Route(graphInstance, startNode, endNode);
        //document.getElementById("debugText2").innerHTML = "Route created";

        //Find shortest route
        //....

        //Return shortest route (of class Route)
    }

    async function GetAddressesAndConvertToCoords() {
        const startAddress = document.getElementById("startAddressField").value;
        //document.getElementById("debugText1").innerHTML = startAddress;

        getCoordinates(startAddress)
            .then(startCoordinates => {
                const endAddress = document.getElementById("endAddressField").value;
                //document.getElementById("debugText2").innerHTML = endAddress;

                getCoordinates(endAddress)
                    .then(endCoordinates => {
                        Main(startCoordinates, endCoordinates);
                    })
                    .catch(err => {
                        console.log("Destination address not found:", err);
                    });
                //Add catch and finally statements
            })
            .catch(err => {
                console.log("Start address not found:".err);
            });
        //Add catch and finally statements
    }

    function GetRoute() {
        //document.getElementById("debugText1").innerHTML = "Route requested";
        GetAddressesAndConvertToCoords();
        const testList = [1, 2, 3, 4];
        DisplayListOnHtml(testList);
    }

    return {
        getAddressesAndConvertToCoords: async function () {
            const startAddress = document.getElementById("startAddressField").value;
            //document.getElementById("debugText1").innerHTML = startAddress;

            getCoordinates(startAddress)
                .then(startCoordinates => {
                    const endAddress = document.getElementById("endAddressField").value;
                    //document.getElementById("debugText2").innerHTML = endAddress;

                    getCoordinates(endAddress)
                        .then(endCoordinates => {
                            GetFileData(startCoordinates, endCoordinates);
                            //Main(startCoordinates, endCoordinates);
                        })
                        .catch(err => {
                            console.log("Destination address not found:", err);
                        });
                    //Add catch and finally statements
                })
                .catch(err => {
                    console.log("Start address not found:".err);
                });
            //Add catch and finally statements
        }
    };
});