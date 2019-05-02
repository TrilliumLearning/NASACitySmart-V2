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

requirejs([
        './newGlobe',
        '../config/mainconf'
        ], function (newGlobe) {

    "use strict";
    let infobox;

    //preload placemark
    $.ajax({
        url: '/csPK',
        dataType: 'json',
        success: function(result) {
            if (!result.err) {
                infobox = result.data;

                for (let k = 0; k < infobox.length; k++) {

                    let colorAttribute = infobox[k].Color;
                    let cAtwo = colorAttribute.split(" ");
                    let coLat = infobox[k].Latitude;
                    let coLong = infobox[k].Longitude;
                    let PK = infobox[k].PK;
                    let LayerName = infobox[k].LayerName;

                    Placemark_Creation(cAtwo, PK, coLat, coLong, LayerName);
                }
            }
        }
    });

    function Placemark_Creation (RGB,PKValue, coLat, coLong, LayerName) {
        let placemark;
        let highlightAttributes;
        let placemarkLayer = new WorldWind.RenderableLayer(LayerName);
        let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

        // Create the custom image for the placemark.
        let canvas = document.createElement("canvas"),
            ctx2d = canvas.getContext("2d"),
            size = 60, c = size / 2, innerRadius = 12, outerRadius = 20;

        canvas.width = size;
        canvas.height = size;
        //This is the color of the placeholder and appearance (Most likely)

        let gradient = ctx2d.createRadialGradient(c, c, innerRadius, c, c, outerRadius);
        gradient.addColorStop(0, RGB[0]);
        gradient.addColorStop(0.5, RGB[1]);
        gradient.addColorStop(1, RGB[2]);


        ctx2d.fillStyle = gradient;
        ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
        ctx2d.fill();

        // Set up the common placemark attributes.
        placemarkAttributes.imageScale = 0.75; //placemark size!
        placemarkAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 0.5);
        placemarkAttributes.imageColor = WorldWind.Color.WHITE;

        placemark = new WorldWind.Placemark(new WorldWind.Position(coLat, coLong, 1e2), true, null);

        // placemark.displayName = LayerName;

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

        // Add the placemark to the layer.
        placemarkLayer.addRenderable(placemark);
        placemarkLayer.enabled = false;
        newGlobe.addLayer(placemarkLayer);
    }

    function handleMouseCLK (a)   {
        let x = a.clientX,
            y = a.clientY;
        let pickListCLK = newGlobe.pick(newGlobe.canvasCoordinates(x, y));
        for (let m = 0; m < pickListCLK.objects.length; m++) {

            let pickedPM = pickListCLK.objects[m].userObject;
            if (pickedPM instanceof WorldWind.Placemark && !pickedPM.userProperties.p_name) {
                sitePopUp(pickedPM.primarykeyAttributes);
            }
        }
    }

    function sitePopUp (PKValue) {
        let popupBodyItem = $("#popupBody");

        for (let k = 0, lengths = infobox.length; k < lengths; k++) {
            if (infobox[k].PK === PKValue) {
                popupBodyItem.children().remove();

                let popupBodyName = $('<p class="site-name"><h4>' + infobox[k].LayerName + '</h4></p>');
                let popupBodyDesc = $('<p class="site-description">' + infobox[k].Site_Description + '</p><br>');
                let fillerImages = $('<img style="width:100%; height:110%;" src="../images/Pics/' + infobox[k].Picture_Location + '"/>');
                let imageLinks = $('<p class="site-link" <h6>Site Link: </h6></p><a href="' + infobox[k].Link_to_site_location + '">Click here to navigate to the site&#8217;s website </a>');
                let copyrightStatus = $('<p  class="copyright" <h6>Copyright Status: </h6>' + infobox[k].Copyright + '</p><br>');
                let coordinates = $('<p class="coordinate" <h6>Latitude and Longitude: </h6>'+ infobox[k].Latitude + infobox[k].Longitude + '</p><br>');

                popupBodyItem.append(popupBodyName);
                popupBodyItem.append(popupBodyDesc);
                popupBodyItem.append(fillerImages);
                popupBodyItem.append(imageLinks);
                popupBodyItem.append(copyrightStatus);
                popupBodyItem.append(coordinates);
                break
            }
        }

        let modal = document.getElementById('popupBox');
        let span = document.getElementById('closeIt');

        modal.style.display = "block";

        span.onclick = function () {
            modal.style.display = "none";

            window.onclick = function (event) {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            }
        }
    }

    $(document).ready(function() {
        newGlobe.addEventListener("click", handleMouseCLK);
    });
});
