const urlParams = new URLSearchParams(window.location.search);
const shop = urlParams.get('shop');
collectionUrl = shop+"/collections.json?limit=250"
let products = [];
let collectionsHtml = ``;
let collectionsFlag = true;
getAllCollections();
var collectionsInterval = setInterval(function(){
	if(!collectionsFlag){
		clearInterval(collectionsInterval);
		showCollections();
	}
},100);

function showCollections(){
	document.querySelector(".category_block").innerHTML = collectionsHtml;	
}
function getAllCollections(page = 1){
	ajax(collectionUrl+"&page="+page,(response) => {
		response = JSON.parse(response);
		if(!response.collections.length){
			collectionsFlag = false;
			return;
		}
		for(collection of response.collections){
			collectionsHtml+=`<li class="list-group-item"><a href="javascript:void(0)"id="${collection.handle}" class="collectionClass">${collection.title} (${collection.products_count} )</a></li>`;
		}
		getAllCollections(page+1)
	});
}

let productsHtml =``;
let productsFlag = true;
function getAllProducts(collection,page = 1){
	let collectionProductsUrl = `${shop}/collections/${collection}/products.json?limit=250&page=${page}`;
  	ajax(collectionProductsUrl,(response) => {
		response = JSON.parse(response);
		if(!response.products.length){
			productsFlag = false;
			return;
		}
		productsHtml += `<button class="btn btn-success exportCsv">Export</button><table class="table table-striped table-hovered">
						<thead>
							<tr>
								<th>Product Title</th>
								<th>Product Handle</th>
								<th>Product Image</th>
							</tr>
						</thead>
						<tbody>`;
		products = products.concat(response.products);
		for(product of response.products){
			let image = '';
			for(image of product.images){
				if(image.src){
					image = image.src;
					break;
				}
			}
			productsHtml+=`
				<tr>
					<td>${product.title}</td>
					<td>${product.handle}</td>
					<td><a target="_blank" href="${shop}/products/${product.handle}"><img style="height:50px;width:auto;" src="${image}" alt="Card image cap"></a></td>
                </tr>`;
		}
		productsHtml+=`</tbody></table>`;
		getAllProducts(collection,page+1)
		
	});
}
function showProducts(){
	document.querySelector(".productsRow").innerHTML = productsHtml;
}

document.addEventListener('click',function(e){
    if(e.target && e.target.classList.contains('collectionClass')){
    	productsFlag = true;
    	productsHtml = ``;
    	products = [];
    	getAllProducts(e.target.id);
    	var productsInterval = setInterval(function(){
			if(!productsFlag){				
				clearInterval(productsInterval);
				showProducts();
			}
		},100);	
    }
});
document.addEventListener('click',function(e){
    if(e.target && e.target.classList.contains('exportCsv')){
    	JSON2CSV(products);
    }
});
function ajax(url,callback = undefined,selector = undefined,method="GET",data = {}){
	if(selector){
		addSpinner(selector)
	}
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	if(selector){
	    		removeSpinner(selector)
	    	}
	    	callback(this.responseText)
	    }
	};
	xhttp.open(method, url, true);
	xhttp.setRequestHeader('Content-Type', 'application/json')
	xhttp.send();
}
function addSpinner(selector){
	element = document.querySelector(selector);
	element.innerHTML = '<div class="loader"></div>';
}
function removeSpinner(selector, text = undefined){
	element = document.querySelector(selector);
	if(text){
		element.innerHTML = text;
	}else{
		element.innerHTML = '';
	}
}
function JSON2CSV(objArray) {
	var headArray = ['Handle','Title','Body (HTML)','Vendor','Type','Tags','Published','Option1 Name','Option1 Value','Option2 Name','Option2 Value','Option3 Name','Option3 Value','Variant SKU','Variant Grams','Variant Inventory Tracker','Variant Inventory Qty','Variant Inventory Policy','Variant Fulfillment Service','Variant Price','Variant Compare At Price','Variant Requires Shipping','Variant Taxable','Variant Barcode','Image Src','Image Alt Text','SEO Title','SEO Description','Variant Weight Unit'];
    var array = objArray;
    var str = '';
    var line = '';
    for (var index of headArray) {
        var value = index + "";
        line += '"' + value.replace(/"/g, '""') + '",';
    }
    line = line.slice(0, -1);
    str += line + '\r\n';
    for (var i = 0; i < array.length; i++) {
    	for (var j = 0; j < array[i].variants.length; j++) {
    		var line = '';
			if(j == 0){
				line += '"' + array[i]['handle'].replace(/"/g, '""') + '",';
				line += '"' + array[i]['title'].replace(/"/g, '""') + '",';
				line += '"' + array[i]['body_html'].replace(/"/g, '""') + '",';
				line += '"' + array[i]['vendor'].replace(/"/g, '""') + '",';
				line += '"' + array[i]['product_type'].replace(/"/g, '""') + '",';
				line += '"' + array[i]['tags'].join(',').replace(/"/g, '""') + '",';
				line += '"' + array[i]['published_at'].replace(/"/g, '""') + '",';
    		}else{
    			line += '"'  + '",' + '"'  + '",' + '"'  + '",' + '"'  + '",'+ '"'  + '",'+ '"'  + '",'+ '"'  + '",';
    		}
    		for(var k=1; k <= 3; k++){
    			if(array[i].options.hasOwnProperty(k-1)){
    				line += '"' + array[i].options[k-1]['name'].replace(/"/g, '""') + '",';
    				line += '"' + array[i].variants[j]['option'+k].replace(/"/g, '""') + '",';
    			}else{
    				line += '"' + '",'+ '"'  + '",';
    			}
    		}
    		line += '"' + array[i].variants[j]['sku'].replace(/"/g, '""') + '",';
    		if(array[i].variants[j].hasOwnProperty('grams')){
	    		line += '"' + String(array[i].variants[j]['grams']).replace(/"/g, '""') + '",';
    		}else{
				line += '"'  + '",';
    		}
    		line += '"'  + '",' + '"'  + '",';
    		if(array[i].variants[j].hasOwnProperty('inventory_management')){
	    		line += '"' + array[i].variants[j]['inventory_management'].replace(/"/g, '""') + '",';
    		}else{
    			line += '"' + '",';
    		}
    		if(array[i].variants[j].hasOwnProperty('fulfillment_service')){
	    		line += '"' + array[i].variants[j]['fulfillment_service'].replace(/"/g, '""') + '",';
    		}else{
    			line += '"' + '",';
    		}
    		line += '"' + array[i].variants[j]['price'].replace(/"/g, '""') + '",';
    		if(array[i].variants[j]['compare_at_price'] != null){
	    		line += '"' + array[i].variants[j]['compare_at_price'].replace(/"/g, '""') + '",';
    		}else{
    			line += '"' + '",';
    		}
    		line += '"' + String(array[i].variants[j]['requires_shipping']).replace(/"/g, '""') + '",';
    		line += '"' + String(array[i].variants[j]['taxable']).replace(/"/g, '""') + '",';
    		if(array[i].variants[j].hasOwnProperty('barcode')){
	    		line += '"' + array[i].variants[j]['barcode'].replace(/"/g, '""') + '",';
    		}else{
    			line += '"' + '",';
    		}
			if(array[i].variants[j]['featured_image'] != null){
				line += '"' + array[i].variants[j]['featured_image']['src'].replace(/"/g, '""') + '",';
				if(array[i].variants[j]['featured_image']['alt']){
					line += '"' + array[i].variants[j]['featured_image']['alt'].replace(/"/g, '""') + '",';

				}else{
					line += '"' + '",';
				}
			}else{
				line += '"' + '",' + '"' + '",';
			}
    		if(array[i].variants[j].hasOwnProperty('seo_title')){
	    		line += '"' + array[i].variants[j]['seo_title'].replace(/"/g, '""') + '",';
    		}else{
    			line += '"' + '",';
    		}    		if(array[i].variants[j].hasOwnProperty('seo_description')){
	    		line += '"' + array[i].variants[j]['seo_description'].replace(/"/g, '""') + '",';
    		}else{
    			line += '"' + '",';
    		}
    		if(array[i].variants[j]['weight_unit'] != null){
	    		line += '"' + array[i].variants[j]['weight_unit'].replace(/"/g, '""') + '",';
    		}else{
    			line += '"' + '",';
    		}
    		line = line.slice(0, -1);
        	str += line + '\r\n';
    	}
    }
    var downloadLink = document.createElement("a");
    downloadLink.href = 'data:text/csv;charset=utf-8,'+escape(str);
	downloadLink.setAttribute("download", "my_data.csv");
	document.body.appendChild(downloadLink);
	downloadLink.click();
}