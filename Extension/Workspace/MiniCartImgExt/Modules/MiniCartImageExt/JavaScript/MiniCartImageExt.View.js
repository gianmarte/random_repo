// List View, it will create as child view a collection of Edit Views.

define('Kodella.MiniCartImgExt.MiniCartImageExt.View'
,	[
		'Header.MiniCartItemCell.View'
	,	'Profile.Model'	

	,	'header_mini_cart_item_cell2.tpl'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function (
		MiniCartItemCell
	,	ProfileModel	

	,	header_mini_cart_item_cell_tpl2

	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	_.extend(MiniCartItemCell.prototype, {

		template: header_mini_cart_item_cell_tpl2

	,	getContext: function()
		{
			var item = this.model.get('item');
			// @class Header.MiniCart.View.Context
			return {
				line: this.model
				//@property {Number} itemId
			,	itemId: this.model.get('item').id
				//@property {String} itemType
			,	itemType: this.model.get('item').get('itemtype')
				//@property {String} linkAttributes
			,	linkAttributes: this.model.getFullLink({quantity:null,location:null,fulfillmentChoice:null})
				// @property {ImageContainer} thumbnail
			,	thumbnail: item.getThumbnail()
				// @property {Boolean} isPriceEnabled
			,	isPriceEnabled: !ProfileModel.getInstance().hidePrices()
				// @property {Boolean} isFreeGift
			,	isFreeGift: this.model.get('free_gift') === true 
			};
			// @class Header.MiniCart.View
		}
	});
});