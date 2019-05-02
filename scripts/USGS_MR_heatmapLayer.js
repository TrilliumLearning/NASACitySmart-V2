
requirejs([
        './newGlobe',
        '../config/mainconf'
    ],
    function (newGlobe) {
    
        "use strict";

        $.ajax({
            url: '/mrdsData',
            type: 'GET',
            dataType: 'json',
            async: false,
            success: function (resp) {
                if (!resp.error) {
                    let data = [];
                    for (let i = 0; i < resp.data.length; i++) {
                        data[i] = new WorldWind.MeasuredLocation(resp.data[i].latitude, resp.data[i].longitude, 1);
                        if (i === resp.data.length - 1) {
                            // console.log(data);
                            let heatmapLayer = new WorldWind.HeatMapLayer("USGS_MR_HeatMap", data);
                            heatmapLayer.scale = [
                                '#0071ff',
                                '#65d6ff',
                                '#74ff7c',
                                '#fffd55',
                                '#ffac5b',
                                '#ff7500',
                                '#FF3A33'
                            ];

                            heatmapLayer.radius = 6;
                            // heatmapLayer.gradient = [0, 0.3, 0.5, 0.7, 0.9];
                            heatmapLayer.incrementPerIntensity = 0.2;

                            heatmapLayer.enabled = false;

                            newGlobe.addLayer(heatmapLayer)
                        }
                    }
                }
            }
        })
    });
