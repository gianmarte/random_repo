/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Kodella.EasyAsk.EasyAsk.Facets.ItemCell.View.Ext'
,	[
        'Facets.ItemCell.View'
	,	'ProductLine.Stock.View'
	,	'Product.Model'
	,	'GlobalViews.StarRating.View'
	,	'Cart.QuickAddToCart.View'
	,	'ProductViews.Option.View'
	,	'ProductLine.StockDescription.View'
	,	'SC.Configuration'
	,	'Utils'
	, 	'Item.Model'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'underscore'
	]
,	function (
        FacetsItemCellView
	,	ProductLineStockView
	,	ProductModel
	,	GlobalViewsStarRating
	,	CartQuickAddToCartView
	,	ProductViewsOptionView
	,	ProductLineStockDescriptionView
	,	Configuration
	,	Utils
	,	ItemModel

	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	_
	)
{
	'use strict';

	// @class Facets.ItemCell.View @extends Backbone.View
	return FacetsItemCellView.extend({

		//@method initialize Override default method to convert this View into Composite
		//@param {Facets.ItemCell.View.Initialize.Options} options
		//@return {Void}
		initialize: function ()
		{
			FacetsItemCellView.prototype.initialize.apply(this,arguments);
		}
	
	,	childViews: _.extend({}, FacetsItemCellView.prototype.childviews, {
			'ItemDetails.Options': function()
			{
				return ""; 
			}
		})

		// @method getContext @returns {Facets.ItemCell.View.Context}
	,	getContext: function ()
		{
			//@class Facets.ItemCell.View.Context

			return {
				// @property {String} itemId
				itemId: this.model.get('Product_Id')
				// @property {String} name
			,	name: this.model.get('Featured_Description')
				// @property {String} url
			,	url: this.model.get('Item_URL')
				//@property {String} sku
			,	sku: this.model.get('Model_Number')
				// @property {Boolean} isEnvironmentBrowser
			,	isEnvironmentBrowser: SC.ENVIRONMENT.jsEnvironment === 'browser' && !SC.ENVIRONMENT.isTouchEnabled
				// @property {ImageContainer} thumbnail
			,	thumbnail: this.model.get('Image_1_URL') //this.model.getThumbnail()
				// @property {Boolean} itemIsNavigable
			,	itemIsNavigable: !_.isUndefined(this.options.itemIsNavigable) ? !!this.options.itemIsNavigable : true
				//@property {Boolean} showRating
			,	showRating: SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled
				// @property {Number} rating
			,	rating: this.model.get('_rating')
				//@property {String} track_productlist_list
			,	track_productlist_list: this.model.get('track_productlist_list')
				//@property {String} track_productlist_position
			,	track_productlist_position: this.model.get('track_productlist_position')
				//@property {String} track_productlist_category
			,	track_productlist_category: this.model.get('track_productlist_category')
			};
			//@class Facets.ItemCell.View
		}
	});
});


//@class Facets.ItemCell.View.Initialize.Options
//@property {Item.Model} model
//@property {ApplicationSkeleton} application
//@property {Boolean?} itemIsNavigable
