function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == '') {
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1) {
                objects.push(obj);
            }
        }
    }
    return objects;
}

function ChangeSelectList(countrylevel) {
    var cityList = document.getElementById("myListCity");
    while (cityList.options.length) {
        cityList.remove(0);
    }
    $.ajax({
        url: "http://10.11.4.249:9090/ChangeSelectList",
        dataType: 'json',
        success: function (results) {
            var option;
            for (var i = 0; i < results.length; i++) {
                if (countrylevel === results[i].Country) {
                    option = new Option(results[i].City, results[i].City);
                    cityList.add(option);
                    $('.Menu').hide();
                    document.getElementById("myListCity").disabled = false;
                    document.getElementById("myListCity").style.backgroundColor = "white";
                    if(countrylevel === "All Layer"){
                        $('.Menu').show();
                        document.getElementById("myListCity").disabled = true;
                        document.getElementById("myListCity").style.backgroundColor = "lightgray";
                     }
                }
            }
        },
        error: function (jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}

function ChangeLayerList(citylevel) {
    $.ajax({
        url: "http://10.11.4.249:9090/ChangeLayerList",
        dataType:"json",
        success: function (res) {
            var returnCityObj = getObjects(res,'CityName',citylevel);
            // console.log(returnCityObj);
            $('.Menu').hide();
            for(var j = 0; j < returnCityObj.length; j++) {
                var obj1 = returnCityObj[j].FirstLayer;
                var obj2 =returnCityObj[j].SecondLayer;
                var obj3 = returnCityObj[j].ClassName;
                var className1 = '.' + obj1;
                var className2 = '.' + obj2;
                var className3 = '.' + obj3;
                $(className1).show();
                $(className2).show();
                $(className3).show();
                // console.log(className3)
            }
        },
        error: function (jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });

    // var returnCityObj = getObjects(js,'option',citylevel);
    // var cityMenu = [];
    // cityMenu = cityMenu.concat(returnCityObj[0].level1).concat(returnCityObj[0].level2).concat(returnCityObj[0].level3);
    // console.log(cityMenu);
    // $('.panel').hide();
    // cityMenu.forEach(function (value) {
    //     var className = '.' + value;
    //     $(className).show();
    // })
}