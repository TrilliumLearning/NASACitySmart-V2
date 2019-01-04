/*
* Copyright 2015-2017 WorldWind Contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

requirejs(['./WorldWindShim',
        './LayerManager',
        './OptionList',
        './AutoMenu',
        '../src/heatmap/GlobeInterface',
        '../src/heatmap/Globe',
        '../src/heatmap/Controls',
        '../src/heatmap/HeatmapPanel',
        '../src/ogc/wms/WmsLayerCapabilities'
        ],
    function (WorldWind,
              LayerManager,
              OptionList,
              AutoMenu,
              GlobeInterface,
              Globe,
              Controls,
              HeatmapPanel) {
        "use strict";
        // Load Globe
        // console.log(WorldWind);
        var globe = new Globe({id: "canvasOne"});
        var globeID = "canvasOne";
        var controls = new Controls(globe);
        var gInterface = new GlobeInterface(globe);

        var heatmapPanel = new HeatmapPanel(globe, gInterface.globe.navigator, gInterface.globe.worldWindowController, controls);

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        // Create a layer manager for controlling layer visibility.
        var layerManager = new LayerManager(globe);

        //Tell wouldwind to log only warnings and errors.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));

        // Web Map Service information from NASA's Near Earth Observations WMS
        // var serviceAddress = "http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=WMS&request=GetCapabilities&version=1.1.1";
        // var serviceAddress = "https://cors.aworldbridgelabs.com/http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities";

        var preloadWMSLayerName = [];
        var highlightedItems= [];
        var layerName = [];
        var preloadLayer = []; //preload entire layer name
        var layers = globe.layers;
        let bob=[];
        var checked = []; //selected toggle switch value
        var alertVal = true;
        var LayerSelected;
        var arrMenu = [];
        var checkedCount=0;
        var j = 0;
        var Altitude;
        var allCheckedArray=[];
        var nextL = $(".next");
        var previousL = $("#previousL");
        var currentSelectedLayer = $("#currentSelectedLayer");
        var infobox;

        function createWMSLayer (xmlDom) {

            // console.log(xmlDom);
            // Create a WmsCapabilities object from the XML DOM
            var wms = new WorldWind.WmsCapabilities(xmlDom);
            // console.log(wms.getNamedLayer);

            console.log(preloadWMSLayerName);
            // Retrieve a WmsLayerCapabilities object by the desired layer name
            for (var n = 0; n < preloadWMSLayerName.length; n++) {
                // console.log(preloadWMSLayerName[n]);
                var wmsLayerCapability = wms.getNamedLayer(preloadWMSLayerName[n]);
                console.log(wmsLayerCapability);

                // Form a configuration object from the wmsLayerCapability object
                var wmsConfig = WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapability);

                // Modify the configuration objects title property to a more user friendly title
                wmsConfig.title = preloadWMSLayerName[n];
                // console.log (wmsConfig.title);

                // Create the WMS Layer from the configuration object
                var wmsLayer = new WorldWind.WmsLayer(wmsConfig);

                // console.log(wmsLayer);
                // Add the layers to WorldWind and update the layer manager
                globe.addLayer(wmsLayer);
                layerManager.synchronizeLayerList();
            }
        }

        // Called if an error occurs during WMS Capabilities document retrieval
        var logError = function (jqXhr, text, exception) {
            console.log("There was a failure retrieving the capabilities document: " + text + " exception: " + exception);
        };

        var Placemark_Creation = function (RGB,PKValue, coLat, coLong, LayerName) {
            console.log(coLong);

            var placemark;
            var highlightAttributes;
            var placemarkLayer = new WorldWind.RenderableLayer(LayerName);
            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            // console.log(latandlong[0]);


            // Create the custom image for the placemark.

            var canvas = document.createElement("canvas"),
                ctx2d = canvas.getContext("2d"),
                size = 60, c = size / 2, innerRadius = 12, outerRadius = 20;

            canvas.width = size;
            canvas.height = size;
            //This is the color of the placeholder and appearance (Most likely)
            //             console.log(RGB);

            var gradient = ctx2d.createRadialGradient(c, c, innerRadius, c, c, outerRadius);
            gradient.addColorStop(0, RGB[0]);
            gradient.addColorStop(0.5, RGB[1]);
            gradient.addColorStop(1, RGB[2]);


            ctx2d.fillStyle = gradient;
            ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
            ctx2d.fill();

            // var ImageLibrary = WorldWind.configuration.baseUrl + "home/Pics/" ;// location of the image files
            // console.log(ImageLibrary);


            // Set up the common placemark attributes.
            placemarkAttributes.imageScale = 0.75; //placemark size!
            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 0.5);
            placemarkAttributes.imageColor = WorldWind.Color.WHITE;


            placemark = new WorldWind.Placemark(new WorldWind.Position(coLat, coLong, 1e2), true, null);
            // console.log(PKValue);
            // placemark.label = "Placemark" + "\n"
            placemark.displayName = LayerName;
            //     + "Lat " + placemark.position.latitude.toPrecision(4).toString() + "\n"
            //     + "Lon " + placemark.position.longitude.toPrecision(5).toString();
            placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

            // Create the placemark attributes for this placemark. Note that the attributes differ only by their
            // image URL.
            placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
            placemark.attributes = placemarkAttributes;

            // Create the highlight attributes for this placemark. Note that the normal attributes are specified as
            // the default highlight attributes so that all properties are identical except the image scale.
            highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            highlightAttributes.imageScale = 1.2;
            placemark.highlightAttributes = highlightAttributes;
            placemark.primarykeyAttributes = PKValue;

            // console.log(placemark);

            // Add the placemark to the layer.
            placemarkLayer.addRenderable(placemark);
            placemarkLayer.enabled = false;
            // console.log(placemarkLayer);
            // console.log(placemark);
            globe.addLayer(placemarkLayer);
        };

        var handlePick = function (o) {

            // alert("ttyy");
            // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
            // the mouse or tap location.
            var x = o.clientX,
                y = o.clientY;

            var redrawRequired = highlightedItems.length > 0; // must redraw if we de-highlight previously picked items

            // De-highlight any previously highlighted placemarks.
            for (var h = 0; h < highlightedItems.length; h++) {
                highlightedItems[h].highlighted = false;
            }
            highlightedItems = [];

            // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
            // relative to the upper left corner of the canvas rather than the upper left corner of the page.
            var pickList = globe .pick(globe.canvasCoordinates(x, y));
            if (pickList.objects.length > 0) {
                redrawRequired = true;
            }

            // Highlight the items picked by simply setting their highlight flag to true.
            if (pickList.objects.length > 0) {
                for (var p = 0; p < pickList.objects.length; p++) {
                    pickList.objects[p].userObject.highlighted = true;

                    // Keep track of highlighted items in order to de-highlight them later.
                    highlightedItems.push(pickList.objects[p].userObject);

                    // Detect whether the placemark's label was picked. If so, the "labelPicked" property is true.
                    // If instead the user picked the placemark's image, the "labelPicked" property is false.
                    // Applications might use this information to determine whether the user wants to edit the label
                    // or is merely picking the placemark as a whole.
                    if (pickList.objects[p].labelPicked) {
                        // console.log("Label picked");
                    }
                }
            }

            // Update the window if we changed anything.
            if (redrawRequired) {
                globe.redraw(); // redraw to make the highlighting changes take effect on the screen
            }
        };

        var handleMouseCLK = function (a)   {
            var x = a.clientX,
                y = a.clientY;
            var pickListCLK = globe.pick(globe.canvasCoordinates(x, y));
            // console.log(pickListCLK);
            for (var m = 0; m < pickListCLK.objects.length; m++) {
                // console.log (pickListCLK.objects[m].position.latitude);
                var pickedPM = pickListCLK.objects[m].userObject;
                if (pickedPM instanceof WorldWind.Placemark) {

                    // sitePopUp(pickedPM.label);
                    // alert(pickedPM.label);
                    // sitePopUp(pickListCLK.objects[m].position.latitude, pickListCLK.objects[m].position.longitude);
                    // sitePopUp(pickListCLK.objects[m].position.longitude);
                    console.log(pickListCLK.objects[m].userObject.primarykeyAttributes);
                    sitePopUp(pickListCLK.objects[m].userObject.primarykeyAttributes);
                    // console.log(pickedPM);

                    $(document).ready(function () {

                        var modal = document.getElementById('popupBox');
                        var span = document.getElementById('closeIt');
                        console.log(modal);
                        modal.style.display = "block";



                        span.onclick = function () {
                            modal.style.display = "none";

                            window.onclick = function (event) {
                                if (event.target === modal) {
                                    modal.style.display = "none";

                                }
                            }
                        }
                    });
                }
            }
        };

        var sitePopUp = function (PKValue) {
            var popupBodyItem = $("#popupBody");
            var c = PKValue;
            console.log(c);

            // console.log(infobox);


            for (var k = 0, lengths = infobox.length; k < lengths; k++) {
                // alert("popup info");
                console.log(infobox[k].PK);
                if (infobox[k].PK === c) {
                    console.log("good-bye");

                    popupBodyItem.children().remove();
                    // alert(infobox[k].sitename);
                    //     alert("hi");


                    var popupBodyName = $('<p class="site-name"><h4>' + infobox[k].LayerName + '</h4></p>');
                    var popupBodyDesc = $('<p class="site-description">' + infobox[k].Site_Description + '</p><br>');
                    var fillerImages = $('<img style="width:100%; height:110%;" src="../images/Pics/' + infobox[k].Picture_Location + '"/>');
                    var imageLinks = $('<p class="site-link" <h6>Site Link: </h6></p><a href="' + infobox[k].Link_to_site_location + '">Click here to navigate to the site&#8217;s website </a>');
                    var copyrightStatus = $('<p  class="copyright" <h6>Copyright Status: </h6>' + infobox[k].Copyright + '</p><br>');
                    var coordinates = $('<p class="coordinate" <h6>Latitude and Longitude: </h6>'+ infobox[k].Latitude + infobox[k].Longitude + '</p><br>');

                    popupBodyItem.append(popupBodyName);
                    popupBodyItem.append(popupBodyDesc);
                    popupBodyItem.append(fillerImages);
                    popupBodyItem.append(imageLinks);
                    popupBodyItem.append(copyrightStatus);
                    popupBodyItem.append(coordinates);
                    break

                    // alert(popupBodyName);
                }
            }

            // alert("hello" + pmDescription[0].Layer_Name);
            // alert ("length: " + pmDescription.length);

            // for (var k = 0, lengths = pmDescription.length; k < lengths; k++) {
            //     var pmLayerName = pmDescription[k].Layer_Name;
            //     var pmSiteNam
            // e = pmDescription[k].Site_Name;
            //     var pmColor = pmDescription[k].Color;
            //     var pmPicLoc = pmDescription[k].Picture_Location;
            //
            //     // if (pmLayerName[k]) {
            //     //
            //     //     popupBodyItem.children().remove();
            //     //.
            //     // }
            // }
        };//

        var globlePosition = function(layerRequest){
            $.ajax({
                url: 'position',
                type: 'GET',
                dataType: 'json',
                data: layerRequest, //send the most current value of the selected switch to server-side
                async: false,
                success: function (results) {
                    console.log(results);
                    LayerSelected = results[0];//the first object of an array --- Longitude: " ", Latitude: "", Altitude: "", ThirdLayer: "", LayerName: ""
                    console.log(LayerSelected);
                    // console.log(LayerSelected);
                    Altitude = LayerSelected.Altitude * 1000;
                    globe.goTo(new WorldWind.Position(LayerSelected.Latitude, LayerSelected.Longitude, Altitude));
                }
            })
        };

        var buttonControl = function(allCheckedArray,layer1){
            if (alertVal){
                confirm("Some layers may take awhile to load. Please be patient.")
            }
            if (allCheckedArray.length > checkedCount){ //if there is new array was inserted into the allCheckedArray ( If user choose more than 1 switch)
                console.log(LayerSelected.ThirdLayer);
                checked.push(layer1); //insert current value to "checked" array
                checkedCount = allCheckedArray.length; //checkedCount now equals to the numbers of arrays that were inserted to allCheckedArray
                alertVal = false; //alert (only appear at the first time)
                currentSelectedLayer.prop('value', LayerSelected.ThirdLayer); //if there are new array was inserted into the allCheckedArray,the value of the opened layer button equals to the name of the switch that user selected
                console.log(currentSelectedLayer);
                arrMenu.push(LayerSelected.ThirdLayer);//insert current ThirdLayer value to arrMenu
                j = arrMenu.length - 1; //count
                console.log(arrMenu.length);
                if(arrMenu.length === 1){ //if the length of arrMenu is equal to 1 /if user only checks one switch.
                    nextL.prop('disabled',true);
                    previousL.prop('disabled',true);
                    currentSelectedLayer.prop('disabled',false);
                }else{//if user checks over 1 switch
                    previousL.prop('disabled',false);
                    nextL.prop('disabled',true);
                }
                // LayerPosition.push(LayerSelected);
            } else { //if there is not new array was inserted into the allCheckedArray / If user un-checks a switch)
                for( var i = 0 ; i < checked.length; i++) {
                    if (checked[i] === layer1) {
                        checked.splice(i,1); //remove current value from checked array
                        arrMenu.splice(i,1); //remove current ThirdLayer from the array
                        // LayerPosition.splice(i,1); //remove current Latlong from the array
                    }
                }
                // val = checked[checked.length - 1];
                checkedCount = allCheckedArray.length;
                alertVal = false;
                currentSelectedLayer.prop('value',arrMenu[arrMenu.length - 1]);
                // currentSelectedLayer.value = arrMenu[arrMenu.length - 1];
                j = arrMenu.length - 1;
                if(arrMenu.length === 1){
                    nextL.prop('disabled',true);
                    previousL.prop('disabled',true)
                }else{
                    if(arrMenu.length === 0){
                        // currentSelectedLayer.value = "No Layer Selected";
                        currentSelectedLayer.prop('value','No Layer Selected');
                        currentSelectedLayer.prop('disabled',true);
                        previousL.prop('disabled',true);
                        nextL.prop('disabled',true);
                        // globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
                    } else{
                        previousL.prop('disabled',false);
                        nextL.prop('disabled',true);
                    }
                }
            }

        };

        //preload function
        $(document).ready(function() {
            currentSelectedLayer.prop('value','No Layer Selected');
            nextL.prop('disabled',true);
            previousL.prop('disabled',true);
            console.log(currentSelectedLayer);
            //preload wmsLayer
            $(".wmsLayer").each(function (i) {
                preloadLayer[i] = $(this).val();
            });
            var preloadLayerStr = preloadLayer + '';//change preloadLayer into a string
            preloadWMSLayerName = preloadLayerStr.split(",");//split preloadLayerStr with ","

            $.get("../config/ows.xml").done(createWMSLayer).fail(logError);

            //preload placemark
            $.ajax({
                url: '/placemark',
                dataType: 'json',
                success: function(result) {
                    if (!result.err) {
                        // console.log(result.data);
                        infobox = result.data;
                        for (var k = 0; k < infobox.length; k++) {
                            // alert (data[0].Color);

                            var colorAttribute = infobox[k].Color;
                            var cAtwo = colorAttribute.split(" ");
                            // console.log(cAtwo);

                            var coLat = infobox[k].Latitude;

                            // console.log(coLat);

                            var coLong = infobox[k].Longitude;
                            console.log(coLong);

                            var PK = infobox[k].PK;
                            // var ptwo = location.split(",");

           // $.get(serviceAddress).done(createWMSLayer).fail(logError);

                            var LayerName = infobox[k].LayerName;
                            // console.log(LayerName);


                            // console.log(Placemark_Creation);
                            Placemark_Creation(cAtwo, PK, coLat, coLong, LayerName);
                        }
                    }

                }
            });

            $('.placemarkLayer').click(function(){
                var val1;
                allCheckedArray = $(':checkbox:checked');
                if ($('.placemarkLayer').is(":checkbox:checked")) {
                    // alert("hi");

                    $(':checkbox:checked').each(function () {
                        val1 = $(this).val();
                        // var str = val+'';
                        // val = str.split(",");
                        // console.log(val1);
                        // console.log(layers);
                        var layerRequest = 'layername=' + val1;

                        globlePosition(layerRequest);

                        buttonControl(allCheckedArray,val1);

                        for (var a = 0; a < layers.length; a++) {

                            if (layers[a].displayName === val1) {
                                // alert(layers[a].displayName + " works now!");
                                layers[a].enabled = true;
                                console.log('KEA_Wind_Turbine'); //find out how to console the problem

                            }
                        }
                    });
                }else{
                    console.log("enable:false");
                    var val2;
                    $(":checkbox:not(:checked)").each(function (i) {
                        val2 = $(this).val();

                        // console.log(str);
                        // console.log(val2[i]);

                        // alert("it doesn't works");
                        // console.log(val);
                        // console.log("s"+val2s[a].displayName);
                        for (var a = 0; a < layers.length; a++) {
                            if (layers[a].displayName === val2) {

                                layers[a].enabled = false;

                                // console.log("str: " + layers[a].displayName);
                                // console.log(layers[a]);
                            }
                        }
                    });
                }
            });

            $(".wmsLayer").click(function () {
                var layer1 = $(this).val(); //the most current value of the selected switch
                allCheckedArray = $(':checkbox:checked');
                // console.log(layer1);
                // console.log(allCheckedArray);
                // console.log(allCheckedArray.length)

                var layerRequest = 'layername=' + layer1;
                console.log(layer1);
                globlePosition(layerRequest);
                // alertVal = false;
                // arrMenu.push(LayerSelected.ThirdLayer);
                console.log(layerRequest);

                buttonControl(allCheckedArray,layer1);

                // if (allCheckedArray.length > checkedCount){ //if there is new array was inserted into the allCheckedArray ( If user choose more than 1 switch)
                //     console.log(LayerSelected.ThirdLayer);
                //     checked.push(layer1); //insert current value to "checked" array
                //     checkedCount = allCheckedArray.length; //checkedCount now equals to the numbers of arrays that were inserted to allCheckedArray
                //     alertVal = false; //alert (only appear at the first time)
                //     currentSelectedLayer.prop('value', LayerSelected.ThirdLayer); //if there are new array was inserted into the allCheckedArray,the value of the opened layer button equals to the name of the switch that user selected
                //     console.log(currentSelectedLayer);
                //     arrMenu.push(LayerSelected.ThirdLayer);//insert current ThirdLayer value to arrMenu
                //     j = arrMenu.length - 1; //count
                //     console.log(arrMenu.length);
                //     if(arrMenu.length === 1){ //if the length of arrMenu is equal to 1 /if user only checks one switch.
                //         nextL.prop('disabled',true);
                //         previousL.prop('disabled',true);
                //         currentSelectedLayer.prop('disabled',false);
                //     }else{//if user checks over 1 switch
                //         previousL.prop('disabled',false);
                //         nextL.prop('disabled',true);
                //     }
                //     // LayerPosition.push(LayerSelected);
                // } else { //if there is not new array was inserted into the allCheckedArray / If user un-checks a switch)
                //     for( var i = 0 ; i < checked.length; i++) {
                //         if (checked[i] === layer1) {
                //             checked.splice(i,1); //remove current value from checked array
                //             arrMenu.splice(i,1); //remove current ThirdLayer from the array
                //             // LayerPosition.splice(i,1); //remove current Latlong from the array
                //         }
                //     }
                //     // val = checked[checked.length - 1];
                //     checkedCount = allCheckedArray.length;
                //     alertVal = false;
                //     currentSelectedLayer.prop('value',arrMenu[arrMenu.length - 1]);
                //     // currentSelectedLayer.value = arrMenu[arrMenu.length - 1];
                //     j = arrMenu.length - 1;
                //     if(arrMenu.length === 1){
                //         nextL.prop('disabled',true);
                //         previousL.prop('disabled',true)
                //     }else{
                //         if(arrMenu.length === 0){
                //             // currentSelectedLayer.value = "No Layer Selected";
                //             currentSelectedLayer.prop('value','No Layer Selected');
                //             currentSelectedLayer.prop('disabled',true);
                //             previousL.prop('disabled',true);
                //             nextL.prop('disabled',true);
                //             // globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
                //         } else{
                //             previousL.prop('disabled',false);
                //             nextL.prop('disabled',true);
                //         }
                //     }
                // }

                //turn on/off wmsLayer
                for (var a = 0; a < layers.length; a++) {
                    $(':checkbox:checked').each(function () {
                        if (layers[a].displayName === $(this).val()) {
                            layers[a].enabled = true;
                        } else {
                            bob = $(this).val().split(",");
                            bob.forEach(function (eleValue) {
                                if (layers[a].displayName === eleValue) {
                                    layers[a].enabled = true;
                                }
                            });
                        }
                    });
                    $(':checkbox:not(:checked)').each(function () {
                        if (layers[a].displayName === $(this).val()) {
                            layers[a].enabled = false;
                        } else {
                            bob = $(this).val().split(",");
                            bob.forEach(function (ery) {
                                if (layers[a].displayName === ery) {
                                    layers[a].enabled = false;
                                }
                            });
                        }
                    })
                }
            });

            $('#previousL').click(function(){
                nextL.prop('disabled',false);
                if(j < 1){ //if there was only one switch was checked
                    previousL.prop('disabled',true) //
                }else{//if there was more than one switch was checked
                    j = j - 1;
                    // nextL.prop('disabled',false);
                    currentSelectedLayer.prop('value',arrMenu[j]); //value of currentSelectedLayer changes to the previous one
                    console.log(j);
                    if (j === 0){
                        previousL.prop('disabled',true);// if there is no previous layer ,then the button would be disabled
                    }
                }
            });

            $('#nextL').click(function(){
                // console.log(arrMenu.length);
                // console.log(j); //j = j - 1;
                if(j !== arrMenu.length - 1){ // if there is not only one switch was selected
                    // console.log(j);
                    if(j === arrMenu.length - 2){
                        nextL.prop('disabled',true);
                    }
                    j = j + 1;
                    previousL.prop('disabled',false);
                    currentSelectedLayer.prop('value',arrMenu[j]);
                }
                // else{
                //     nextL.disabled = true; //?
                // }
            });

            //if the opened layer was clicked, the layer shows
            $('#currentSelectedLayer').click(function(){
                console.log("hh");
                // $('.collapse').collapse('hide');
                // var a = document.getElementById("accordion").children; //eight layer menus

                var currentSelectedLayerData = "thirdlayer=" + arrMenu[j];
                $.ajax({
                    url: 'thirdL',
                    type: 'GET',
                    dataType: 'json',
                    data:currentSelectedLayerData,
                    async: false,
                    success: function (results) {
                        console.log(results);
                        var FirstLayerId = '#' + results[0].FirstLayer;
                        // console.log(FirstLayerId);
                        var SecondLayerId = '#' + results[0].FirstLayer + '-' + results[0].SecondLayer;
                        // console.log(SecondLayerId);
                        globe.goTo(new WorldWind.Position(results[0].Latitude, results[0].Longitude, results[0].Altitude * 1000));

                        $(FirstLayerId).collapse('show');
                        $(SecondLayerId).collapse('show');

                    }
                });
            });

            $('#globeOrigin').click(function(){
                globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
            });
        });
    });
