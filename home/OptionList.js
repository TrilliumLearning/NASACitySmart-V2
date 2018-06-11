$(document).ready(function () {
    var x = document.getElementById("myListCountry");
    var option = document.createElement("option");
    $.ajax({
        url: "http://localhost:9090/CountryList",
        dataType: 'json',
        success: function (results) {
            console.log(results);
            for (i = 0; i < results.length; i++) {
                option.text = results[i].CountryName;
                x.add(option);
            }
        }
    });
});

$(document).ready(function () {
    $("#myListCountry").change(function () {
        var val = $(this).val();
        // console.log(val);
        if (val == "AL"){
            $("#myListState").html("<option value='AL'> All Layer </option>");
            $("#myListCity").html("<option value= 'AL'> All Layer </option>");
        }else{
            $("#myListState").html("<option> -Select a State- </option>");
            $("#myListCity").html("<option> -Select a City- </option>");
        }
    })
});



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
    console.log(countrylevel);
    var stateList = document.getElementById("myListState");
    while (stateList.options.length) {
        stateList.remove(0);
    }
    $.ajax({
        url: "http://localhost:9090/StateList",
        dataType: 'json',
        success: function (results) {
            var Array = results;
            console.log(results);
            var option;
            for (var i = 0; i < Array.length; i++) {
                if (countrylevel === Array[i].CountryName) {
                    for(var j = 1; j < Array.length; j++) {
                        option = new Option(Array[j].StateName, Array[j].StateName);
                        stateList.add(option);
                        $('.Menu').hide();
                        document.getElementById("myListState").disabled = false;
                        document.getElementById("myListState").style.backgroundColor = "white";
                    }
                }
            }
        }
    });
    if (countrylevel === "AL") {
        $('.Menu').show();
        document.getElementById("myListState").disabled = true;
        document.getElementById("myListState").style.backgroundColor = "lightgray";
        document.getElementById("myListCity").disabled = true;
        document.getElementById("myListCity").style.backgroundColor = "lightgray";
    }
}

function ChangeStateList(statelevel) {
    console.log(statelevel);
    var cityList = document.getElementById("myListCity");
    while (cityList.options.length) {
        cityList.remove(0);
    }
    $.ajax({
        url: "http://localhost:9090/ChangeSelectList",
        dataType: 'json',
        success: function (results) {
            console.log(results);
            var option;
            for (var i = 0; i < results.length; i++) {
                if (statelevel === results[i].StateName) {
                        // console.log(j);
                        option = new Option(results[i].CityName, results[i].CityName);
                        cityList.add(option);
                        // $('.Menu').hide();
                        document.getElementById("myListCity").disabled = false;
                        document.getElementById("myListCity").style.backgroundColor = "white";
                }
            }
        }
    });
}

function ChangeLayerList(citylevel) {
    $.ajax({
        url: "http://localhost:9090/ChangeLayerList",
        dataType:"json",
        success: function (res) {
            var returnCityObj = getObjects(res,'CityName',citylevel);
            console.log(returnCityObj);
            $('.Menu').hide();
            for(var j = 0; j < returnCityObj.length; j++) {
                var obj1 = returnCityObj[j].FirstLayer;
                var obj2 =returnCityObj[j].SecondLayer;
                var obj3 = returnCityObj[j].CityName;
                var className1 = '.' + obj1;
                var className2 = '.' + obj2;
                var className3 = '.' + obj3;
                console.log(className3);
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

}