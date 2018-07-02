// var category = {};
// category['Energy'] = ['Energy_Distribution','Wind_Energy','Energy_Offices','Hydroelectric_Energy','Energy_Budgets'];
// category['Water'] = ['Canneries','Drainage_Systems','Water_Grids'];
// category['Agriculture'] = ['Soil_Testing'];
// category['Transportation'] = ['Rental_Cars','Roads','Airports','Piers','Harbors'];
// category['Economics'] = ['Property','Banks','Postal_Services'];
// category['Health_Services'] = ['Hospital_and_Clinics','Health_Centers','Veterinary_Services','Eye_Care'];
// category['Risk_Management']
// category['Education'] = ['Museums','Elementary_School','Academies','Higher_Education','UNESCO_WHS','High_School','Middle_School','Libraries','A_World_Bridge_Sites'];

$.ajax({
    url: "http://localhost:9086/MainCategory",
    dataType: 'json',
    success:function (results) {
        console.log(results);
    }
});