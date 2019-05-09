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

requirejs.config({
    waitSeconds: 0
});

requirejs(['./newGlobe',
    './layerMenuAll',
    './CS_placemarkLayer',
    './CS_wmsLayer',
    './USGS_WT',
    './USGS_MR'
], function (newGlobe, menuL) {

    "use strict";

    // console.log(newGlobe.layers);

    newGlobe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));

    let arrMenu = [];
    let firstTime = true;
    let layerSelected, Altitude;
    let j = 0;
    const nextL = $(".next");
    const previousL = $("#previousL");
    const currentSelectedLayer = $("#currentSelectedLayer");

    //All the event listeners
    $(document).ready(function () {

        //the beginning value of the button
        currentSelectedLayer.prop('value', 'No Layer Selected');
        nextL.prop('disabled', true);
        previousL.prop('disabled', true);

        $("#popover").popover({html: true, placement: "top", trigger: "hover"});

        //turn on/off layers
        $(menuL.arrType.toString()).click(function () {
            if (firstTime) {
                confirm("Some layers may take awhile to load. Please be patient.");
                firstTime = false; //alert (only appear at the first time)
            }

            let toggle = this;
            let arrToggle = toggle.value.split(",");

            arrToggle.forEach(function (value, i) {

                let selectedIndex = newGlobe.layers.findIndex(ele => ele.displayName === value);

                if (newGlobe.layers[selectedIndex] instanceof WorldWind.RenderableLayer) {
                    if (selectedIndex < 0 || !newGlobe.layers[selectedIndex].renderables.length) {

                        confirm("The layer you selected is tentatively not available. Please try it later.");
                        $(toggle).prop('checked', false);

                    } else {
                        newGlobe.layers[selectedIndex].enabled = toggle.checked;

                        if (toggle.checked && i === 0) {
                            let layerRequest = 'layername=' + value;
                            globePosition(layerRequest, toggle.checked);
                        }

                        if (newGlobe.layers[selectedIndex].layerType === 'USGSWT_PKLayer') {
                            barChange(value)
                        }
                    }
                } else {
                    if (selectedIndex < 0) {

                        confirm("The layer you selected is tentatively not available. Please try it later.");
                        $(toggle).prop('checked', false);

                    } else {
                        newGlobe.layers[selectedIndex].enabled = toggle.checked;

                        if (toggle.checked && i === 0) {
                            let layerRequest = 'layername=' + value;
                            globePosition(layerRequest, toggle.checked);
                        }

                        if (newGlobe.layers[selectedIndex].layerType === 'USGSWT_PKLayer') {
                            barChange(value)
                        }
                    }
                }
            });
        });

        $('#previousL').click(function () {
            nextL.prop('disabled', false);
            if (j < 1) { //if there was only one switch was checked
                previousL.prop('disabled', true) //
            } else {//if there was more than one switch was checked
                j = j - 1;
                currentSelectedLayer.prop('value', arrMenu[j]); //value of currentSelectedLayer changes to the previous one

                if (j === 0) {
                    previousL.prop('disabled', true);// if there is no previous layer ,then the button would be disabled
                }
            }
        });

        $('#nextL').click(function () {
            if (j !== arrMenu.length - 1) { // if there is not only one switch was selected
                if (j === arrMenu.length - 2) {
                    nextL.prop('disabled', true);
                }
                j = j + 1;
                previousL.prop('disabled', false);
                currentSelectedLayer.prop('value', arrMenu[j]);
            }
        });

        //if the opened layer was clicked, the layer shows
        $('#currentSelectedLayer').click(function () {

            let currentSelectedLayerData = "thirdlayer=" + arrMenu[j];
            $.ajax({
                url: '/currentLayer',
                type: 'GET',
                dataType: 'json',
                data: currentSelectedLayerData,
                async: false,
                success: function (results) {
                    let FirstLayerId = '#' + results[0].FirstLayer;
                    let SecondLayerId = '#' + results[0].FirstLayer + '-' + results[0].SecondLayer;

                    newGlobe.goTo(new WorldWind.Position(results[0].Latitude, results[0].Longitude, results[0].Altitude * 1000));

                    $(FirstLayerId).collapse('show');
                    $(SecondLayerId).collapse('show');

                }
            });
        });

        $('#globeOrigin').click(function () {
            newGlobe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
        });

        newGlobe.addEventListener("mousemove", handleMouseMove);

        newGlobe.addEventListener("click", handleMouseCLK);
    });

    function handleMouseCLK(e) {
        let x = e.clientX,
            y = e.clientY;
        let pickListCLK = newGlobe.pick(newGlobe.canvasCoordinates(x, y));

        pickListCLK.objects.forEach(function (value) {
            let pickedPM = value.userObject;
            if (pickedPM instanceof WorldWind.Placemark && pickedPM.userProperties.layerType === 'CS_PKLayer') {
                sitePopUp(pickedPM);
            }
        })
    }

    function sitePopUp(PM) {
        let popupBodyItem = $("#popupBody");
        popupBodyItem.children().remove();

        let popupBodyName = $('<p class="site-name"><h4>' + PM.userProperties.layerName + '</h4></p>');
        let popupBodyDesc = $('<p class="site-description">' + PM.userProperties.siteDesc + '</p><br>');
        let fillerImages = $('<img style="width:100%; height:110%;" src="../images/Pics/' + PM.userProperties.picLocation + '"/>');
        let imageLinks = $('<p class="site-link" <h6>Site Link: </h6></p><a href="' + PM.userProperties.url + '">Click here to navigate to the site&#8217;s website </a>');
        let copyrightStatus = $('<p  class="copyright" <h6>Copyright Status: </h6>' + PM.userProperties.copyright + '</p><br>');
        let coordinates = $('<p class="coordinate" <h6>Latitude and Longitude: </h6>' + PM.position.latitude + PM.position.longitude + '</p><br>');

        popupBodyItem.append(popupBodyName);
        popupBodyItem.append(popupBodyDesc);
        popupBodyItem.append(fillerImages);
        popupBodyItem.append(imageLinks);
        popupBodyItem.append(copyrightStatus);
        popupBodyItem.append(coordinates);

        let modal = document.getElementById('popupBox');
        let span = document.getElementById('closeIt');

        modal.style.display = "block";

        span.onclick = function () {
            modal.style.display = "none";
        };

        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }
    }

    function globePosition(request, toggleB) {
        $.ajax({
            url: '/position',
            type: 'GET',
            dataType: 'json',
            data: request, //send the most current value of the selected switch to server-side
            async: false,
            success: function (results) {
                layerSelected = results[0];
                Altitude = layerSelected.Altitude * 1000;
                newGlobe.goTo(new WorldWind.Position(layerSelected.Latitude, layerSelected.Longitude, Altitude));

                buttonControl(toggleB);
            }
        })
    }

    function buttonControl(toggleOn) {

        if (toggleOn) {
            // insert the current third layer onto button
            currentSelectedLayer.prop('value', layerSelected.ThirdLayer);

            //insert current ThirdLayer value to arrMenu
            arrMenu.push(layerSelected.ThirdLayer);

            j = arrMenu.length - 1; //count

            // reset next/previous status with disable/enable
            if (arrMenu.length === 1) { //if the length of arrMenu is equal to 1 /if user only checks one switch.
                nextL.prop('disabled', true);
                previousL.prop('disabled', true);
                currentSelectedLayer.prop('disabled', false);
            } else {//if user checks more than one switch
                previousL.prop('disabled', false);
                nextL.prop('disabled', true);
            }

        } else {

            // remove current display ThirdLayer from arrMenu
            arrMenu.splice(arrMenu.findIndex(elem => elem === layerSelected.ThirdLayer), 1);

            j = arrMenu.length - 1;

            // reset next/previous status with disable/enable
            if (arrMenu.length === 0) {
                currentSelectedLayer.prop('value', 'No Layer Selected');
                currentSelectedLayer.prop('disabled', true);
                previousL.prop('disabled', true);
                nextL.prop('disabled', true);
                newGlobe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
            } else {
                currentSelectedLayer.prop('value', arrMenu[arrMenu.length - 1]);
                if (arrMenu.length === 1) {
                    nextL.prop('disabled', true);
                    previousL.prop('disabled', true)
                } else {
                    previousL.prop('disabled', false);
                    nextL.prop('disabled', true);
                }
            }
        }
    }

    function handleMouseMove(o) {
        if ($("#popover").is(":visible")) {
            $("#popover").hide();
        }

        // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
        // the mouse or tap location.
        let x = o.clientX,
            y = o.clientY;

        // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
        // relative to the upper left corner of the canvas rather than the upper left corner of the page.

        let pickList = newGlobe.pick(newGlobe.canvasCoordinates(x, y));

        for (let q = 0; q < pickList.objects.length; q++) {
            let pickedPL = pickList.objects[q].userObject;

            if (pickedPL instanceof WorldWind.Placemark && !!pickedPL.userProperties.p_name) {

                let xOffset = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
                let yOffset = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                //
                let popover = document.getElementById('popover');
                popover.style.position = "absolute";
                popover.style.left = (x + xOffset - 3) + 'px';
                popover.style.top = (y + yOffset - 3) + 'px';

                let content = "<p><strong>Project Name:</strong> " + pickedPL.userProperties.p_name +
                    "<br>" + "<strong>Year Online:</strong> " + pickedPL.userProperties.p_year +
                    "<br>" + "<strong>Rated Capacity:</strong> " + pickedPL.userProperties.p_avgcap +
                    "<br>" + "<strong>Total Height:</strong> " + pickedPL.userProperties.t_ttlh + "</p>";

                $("#popover").attr('data-content', content);
                $("#popover").show();
            }
        }
    }

    function barChange(toggleV) {

        const left = $("#leftScale");
        const right = $("#rightScale");

        left.html(config[toggleV].Min);
        right.html(config[toggleV].Max);

    }
});
