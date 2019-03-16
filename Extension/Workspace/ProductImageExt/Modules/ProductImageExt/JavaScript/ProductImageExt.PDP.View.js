// List View, it will create as child view a collection of Edit Views.

define('Kodella.ProductImageExt.ProductImageExt.PDP.View'
,	[
	'Product.Model'
,	'SC.Configuration'

,	'Utils'
,	'underscore'
]
,	function (
	ProductModel
,   Configuration

,   Utils
,	_
)
{
'use strict';

_.extend(ProductModel.prototype, {
	getImages: function getImages()
	{
		var item = this.get('item')
		,	item_image_url = item.get('custitemimage_1_url')
		,   item_image_2 = {altimagetext: item.get('_name'), url: item_image_url} || {};

		var image_filters = Configuration.get('productline.multiImageOption', [])
		,	images_container = this.filterImages(item_image_2, image_filters)
		,	result = Utils.imageFlatten(images_container);

		return result.length ? result : [{
			url: Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', Configuration.get('imageNotAvailable'))
		,	altimagetext: item.get('_name')
		}];
	}
});
});