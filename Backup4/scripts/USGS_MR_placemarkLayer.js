requirejs([
        './newGlobe',
        '../config/mainconf',
        ], function (newGlobe) {

    "use strict";
    console.log(newGlobe.layers);

    let createWTPK = function(color, element) {

        // wrap up placemark image source
        let circle = document.createElement("canvas"),
            ctx = circle.getContext('2d'),
            radius = 10,
            r2 = radius * 2;

        circle.width = circle.height = r2;

        let gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
        gradient.addColorStop(0, color);

        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);

        ctx.fillStyle = gradient;
        ctx.fill();
        // ctx.strokeStyle = "rgb(255, 255, 255)";
        // ctx.stroke();

        ctx.closePath();

        // wrap up World Wind Placemark object
        let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageSource = new WorldWind.ImageSource(circle);
        placemarkAttributes.imageScale = 0.5;

        let highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        highlightAttributes.imageScale = 2.0;

        let placemarkPosition = new WorldWind.Position(element.ylat, element.xlong, 0);

        this.pk = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
        this.pk.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        this.pk.highlightAttributes = highlightAttributes;
        this.pk.userProperties.site_name = element.site_name;
        this.pk.userProperties.dev_stat = element.dev_stat;
        this.pk.userProperties.commodity = element.commod1.split(",")[0];
    };

    //fetch the data from db and generate plackmarks and placemark layers
    $.ajax({
        url: '/mrdsData',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (resp) {
            console.log(resp.data);
            if (!resp.error) {

                // generate placemark layers
                let Gold = new WorldWind.RenderableLayer("USGS_MR_MR_Gold_Placemark");
                let Silver = new WorldWind.RenderableLayer("USGS_MR_Silver_Placemark");
                let Antimony = new WorldWind.RenderableLayer("USGS_MR_Antimony_Placemark");
                let Asbestos = new WorldWind.RenderableLayer("USGS_MR_Asbestos_Placemark");
                let Chromium = new WorldWind.RenderableLayer("USGS_MR_Chromium_Placemark");
                let Copper = new WorldWind.RenderableLayer("USGS_MR_Copper_Placemark");
                let Iron = new WorldWind.RenderableLayer("USGS_MR_Iron_Placemark");
                let Lead = new WorldWind.RenderableLayer("USGS_MR_Lead_Placemark");
                let Manganese = new WorldWind.RenderableLayer("USGS_MR_Manganese_Placemark");
                let Molybdenum = new WorldWind.RenderableLayer("Molybdenum_Placemark");
                let Nickel = new WorldWind.RenderableLayer("USGS_MR_Nickel_Placemark");
                let Tungsten = new WorldWind.RenderableLayer("USGS_MR_Tungsten_Placemark");
                let Uranium = new WorldWind.RenderableLayer("USGS_MR_Uranium_Placemark");
                let Zinc = new WorldWind.RenderableLayer("USGS_MR_Zinc_Placemark");
                let Other = new WorldWind.RenderableLayer("USGS_MR_Other_Placemark");

                Gold.enabled = Silver.enabled = Antimony.enabled = Asbestos.enabled = Chromium.enabled = Copper.enabled = Iron.enabled = Lead.enabled = Manganese.enabled = Molybdenum.enabled = Nickel.enabled = Tungsten.enabled = Uranium.enabled = Zinc.enabled = Other.enabled = false;

                resp.data.forEach (function (ele, i) {
                    let yearPK = new createWTPK(ele.p_year_color, ele);
                    let capPK = new createWTPK(ele.p_avgcap_color, ele);
                    let heightPK = new createWTPK(ele.t_ttlh_color, ele);
                    
                    yearPLayer.addRenderable(yearPK.pk);
                    capPLayer.addRenderable(capPK.pk);
                    heightPLayer.addRenderable(heightPK.pk);

                    // add placemark layers into WorldWind layers object
                    if (i === resp.data.length - 1) {
                        newGlobe.addLayer(yearPLayer);
                        newGlobe.addLayer(capPLayer);
                        newGlobe.addLayer(heightPLayer);
                    }
                });
            } else {
                alert(resp.error)
            }
        }
    });
});
