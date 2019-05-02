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
    './CS_wmsLayer',
    './CS_placemarkLayer',
    './USGS_WT_placemarkLayer',
    './USGS_MR_heatmapLayer',
    ], function (newGlobe) {

    "use strict";

    // newGlobe.redraw;

    newGlobe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));

    // let layers = newGlobe.layers;
    // let bob = [];
    let checkBox = false;
    let checked = [];
    let arrMenu = [];
    let allCheckedArray = [];
    let alertVal = true;
    let layerSelected, Altitude;
    let checkedCount = 0;
    let j = 0;
    let nextL = $(".next");
    let previousL = $("#previousL");
    let currentSelectedLayer = $("#currentSelectedLayer");

    //All the event listeners
    $(document).ready(function () {

        //the beginning value of the button
        currentSelectedLayer.prop('value','No Layer Selected');
        nextL.prop('disabled',true);
        previousL.prop('disabled',true);

        $("#popover").popover({html: true, placement: "top", trigger: "hover"});

        //turn on/off layers
        $(".WmsLayer, .HeatmapLayer, .CS_PKLayer, .USGSWT_PKLayer, .USGSMD_PKLayer, .USGSMR_PKLayer").click(function () {
            let toggleVal = this.value; //the most current value of the selected switch
            let arrToggle = toggleVal.split(",");
            checkBox = this.checked;

            arrToggle.forEach(function (value, i) {
                if (i === 0) {
                    let layerRequest = 'layername=' + value;
                    globePosition(layerRequest);
                }

                let selectedIndex = newGlobe.layers.findIndex(ele => ele.displayName === value);
                newGlobe.layers[selectedIndex].enabled = !!(checkBox);
            });

            allCheckedArray = $(':checkbox:checked');

            buttonControl(allCheckedArray,toggleVal);

        });

        $('#previousL').click(function(){
            nextL.prop('disabled',false);
            if(j < 1){ //if there was only one switch was checked
                previousL.prop('disabled',true) //
            }else{//if there was more than one switch was checked
                j = j - 1;
                currentSelectedLayer.prop('value',arrMenu[j]); //value of currentSelectedLayer changes to the previous one

                if (j === 0){
                    previousL.prop('disabled',true);// if there is no previous layer ,then the button would be disabled
                }
            }
        });

        $('#nextL').click(function(){
            if(j !== arrMenu.length - 1){ // if there is not only one switch was selected
                if(j === arrMenu.length - 2){
                    nextL.prop('disabled',true);
                }
                j = j + 1;
                previousL.prop('disabled',false);
                currentSelectedLayer.prop('value',arrMenu[j]);
            }
        });

        //if the opened layer was clicked, the layer shows
        $('#currentSelectedLayer').click(function(){

            let currentSelectedLayerData = "thirdlayer=" + arrMenu[j];
            $.ajax({
                url: '/currentLayer',
                type: 'GET',
                dataType: 'json',
                data:currentSelectedLayerData,
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

        $('#globeOrigin').click(function(){
            newGlobe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
        });

        newGlobe.addEventListener("mousemove", handleMouseMove);
    });

    function globePosition (layerRequest){
        $.ajax({
            url: '/position',
            type: 'GET',
            dataType: 'json',
            data: layerRequest, //send the most current value of the selected switch to server-side
            async: false,
            success: function (results) {
                layerSelected = results[0];
                Altitude = layerSelected.Altitude * 1000;
                newGlobe.goTo(new WorldWind.Position(layerSelected.Latitude, layerSelected.Longitude, Altitude));
            }
        })
    }

    function buttonControl (allCheckedArray,toggleVal){
        if (alertVal){
            confirm("Some layers may take awhile to load. Please be patient.")
        }

        if (allCheckedArray.length > checkedCount){ //if there is new array was inserted into the allCheckedArray ( If user choose more than 1 switch)
            checked.push(toggleVal); //insert current value to "checked" array
            checkedCount = allCheckedArray.length; //checkedCount now equals to the numbers of arrays that were inserted to allCheckedArray
            alertVal = false; //alert (only appear at the first time)
            currentSelectedLayer.prop('value', layerSelected.ThirdLayer); //if there are new array was inserted into the allCheckedArray,the value of the opened layer button equals to the name of the switch that user selected
            arrMenu.push(layerSelected.ThirdLayer);

            //insert current ThirdLayer value to arrMenu
            j = arrMenu.length - 1; //count
            if(arrMenu.length === 1){ //if the length of arrMenu is equal to 1 /if user only checks one switch.
                nextL.prop('disabled',true);
                previousL.prop('disabled',true);
                currentSelectedLayer.prop('disabled',false);
            }else{//if user checks over 1 switch
                previousL.prop('disabled',false);
                nextL.prop('disabled',true);
            }
        } else { //if there is not new array was inserted into the allCheckedArray / If user un-checks a switch)
            for( let i = 0 ; i < checked.length; i++) {
                if (checked[i] === toggleVal) {
                    checked.splice(i,1); //remove current value from checked array
                    arrMenu.splice(i,1); //remove current ThirdLayer from the array
                }
            }

            checkedCount = allCheckedArray.length;
            alertVal = false;
            currentSelectedLayer.prop('value',arrMenu[arrMenu.length - 1]);
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
                    // newGlobe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
                } else{
                    previousL.prop('disabled',false);
                    nextL.prop('disabled',true);
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
        // console.log(pickList.objects);
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

});
