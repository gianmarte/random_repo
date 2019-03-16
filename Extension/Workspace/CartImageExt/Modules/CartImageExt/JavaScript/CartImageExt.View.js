// List View, it will create as child view a collection of Edit Views.

define('Kodella.CartImageExt.CartImageExt.View'
,	[
		'Cart.Lines.View'
	,	'Kodella.ProductThumbnailExt.ProductThumbnailExt.View'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function (
		CartLineView
	,	ProductImgExt

	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	_.extend(CartLineView.prototype, {
		getContext : function()
		{
			var item = this.model.get('item');

			//@class Transaction.Line.Views.Actionable.View.Context
			return {
					//@property {OrderLine.Model|Transaction.Line.Model} line
					line: this.model
					//@property {String} lineId
				,	lineId: this.model.get('internalid')
					//@property {Item.Model} item
				,	item: item
					//@property {String} itemId
				,	itemId: item.get('internalid')
					//@property {String} linkAttributes
				,	linkAttributes: this.model.getFullLink({quantity:null,location:null,fulfillmentChoice:null})
					//@property {Boolean} isNavigable
				,	isNavigable: !!this.options.navigable && !!item.get('_isPurchasable')
					//@property {Boolean} showCustomAlert
				,	showCustomAlert: !!item.get('_cartCustomAlert')
					//@property {String} customAlertType
				,	customAlertType: item.get('_cartCustomAlertType') || 'info'
					//@property {Boolean} showActionsView
				,	showActionsView: !!this.options.ActionsView
					//@property {Boolean} showSummaryView
				,	showSummaryView: !!this.options.SummaryView
					//@property {Boolean} showAlert
				,	showAlert: !_.isUndefined(this.options.showAlert) ? !!this.options.showAlert : true
					//@property {Boolean} showGeneralClass
				,	showGeneralClass: !!this.options.generalClass
					//@property {String} generalClass
				,	generalClass: this.options.generalClass
					// @property {ImageContainer} thumbnail
				,	thumbnail: item.getThumbnail()
			};
		}
	});
});