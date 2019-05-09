define(['../src/WorldWind'], function (WorldWind) {

    let arrAll = [];
    let arrType = [];
    let arrWT = [];
    let arrMR = [];
    let arrCS = [];
    let categoryN = [];
    let arrColor = [];
    let category, index;

    $.ajax({
        url: '/allLayerMenu',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (resp) {
            if (!resp.error) {
                resp.data.forEach(function (ele) {

                    arrAll.push(ele);

                    if (!arrType.includes('.' + ele.LayerType)) {
                        arrType.push('.' + ele.LayerType);
                    }

                    if (ele.LayerType === 'USGSWT_PKLayer') {

                        category = ele.LayerName.split("_");
                        categoryN = category[2];

                        arrWT.push({cName: categoryN, wLayer: new WorldWind.RenderableLayer(ele.LayerName)});

                    } else if (ele.LayerType === 'USGSMR_PKLayer') {

                        category = ele.LayerName.split("_");
                        categoryN = category[2];

                        index = arrMR.findIndex(ele => ele.cName === categoryN);

                        if (index < 0) {
                            arrMR.push({cName: categoryN, plName: ele.LayerName, hlName: 'Null', wLayer: new WorldWind.RenderableLayer(ele.LayerName)});
                        } else {
                            arrMR[index].plName = ele.LayerName;
                            arrMR[index].wLayer = new WorldWind.RenderableLayer(ele.LayerName)
                        }
                    } else if (ele.LayerType === 'USGSMR_HMLayer') {

                        category = ele.LayerName.split("_");
                        categoryN = category[2];

                        index = arrMR.findIndex(ele => ele.cName === categoryN);

                        if (index < 0) {
                            arrMR.push({cName: categoryN, plName: 'Null', hlName: ele.LayerName, wLayer: 'Null'});
                        } else {
                            arrMR[index].hlName = ele.LayerName
                        }
                    } else if (ele.LayerType === 'CS_PKLayer') {

                        arrColor = ele.Color.split(" ");

                        arrCS.push({Row: ele, wLayer: new WorldWind.RenderableLayer(ele.LayerName), Color: arrColor});

                    }
                })
            } else {
                alert(resp.error)
            }
        }
    });

    return {arrAll, arrType, arrWT, arrMR, arrCS}
});