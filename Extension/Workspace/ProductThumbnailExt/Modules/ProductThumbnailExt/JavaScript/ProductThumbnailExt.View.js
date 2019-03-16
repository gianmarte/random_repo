// List View, it will create as child view a collection of Edit Views.

define('Kodella.ProductThumbnailExt.ProductThumbnailExt.View'
,	[
		'Item.Model'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	,	'Utils'
	]
,	function (
		ItemModel

	,	Backbone
	,	jQuery
	,	_
	,	Utils
	)
{
	'use strict';

	_.extend(ItemModel.prototype, {
		getThumbnail: function getThumbnail()
		{
			var item_images_detail = {altimagetext: this.get("_name"), url: this.get('custitemimage_1_url')} || {};

				// If you generate a thumbnail position in the itemimages_detail it will be used
				if (item_images_detail.thumbnail)
				{
					if (_.isArray(item_images_detail.thumbnail.urls) && item_images_detail.thumbnail.urls.length)
					{
						return item_images_detail.thumbnail.urls[0];
					}

					return item_images_detail.thumbnail;
				}

				// otherwise it will try to use the storedisplaythumbnail
				if (SC.ENVIRONMENT.siteType && SC.ENVIRONMENT.siteType === 'STANDARD' && item.get('storedisplaythumbnail'))
				{
					return {
						url: this.get('storedisplaythumbnail')
					,	altimagetext: this.get('_name')
					};
				}
				// No images huh? carry on

				var parent_item = this.get('_matrixParent');
				// If the item is a matrix child, it will return the thumbnail of the parent
				if (parent_item && parent_item.get('internalid'))
				{
					return item_images_detail;
				}


				var images = Utils.imageFlatten(item_images_detail);

				// If you using the advance images features it will grab the 1st one
				if (images.length)
				{

					return images[0];
				}

				// still nothing? image the not available
				return {
					url:  Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', configuration.get('imageNotAvailable'))
				,	altimagetext: this.get('_name')
				};
		}
	});
});