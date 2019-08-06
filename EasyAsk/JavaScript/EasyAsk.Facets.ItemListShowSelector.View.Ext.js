/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Kodella.EasyAsk.EasyAsk.Facets.ItemListShowSelector.View.Ext'
,	[
        'Facets.ItemListShowSelector.View'
	,	'kodella_facets_item_list_show_selector_ext.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
        FacetsItemListShowSelectorView
	,	kodella_facets_item_list_show_selector_ext_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Facets.ItemListShowSelector.View @extends Backbone.View
	return FacetsItemListShowSelectorView.extend({

		template: kodella_facets_item_list_show_selector_ext_tpl

		// @method getContext @returns {Facets.ItemListShowSelector.View.Context}
	,	getContext: function ()
		{
			var option_items = this.options.options
            ,	processed_option_items = [];

			_.each(option_items, function(option_item) {
				var processed_option_item = {
					configOptionUrl: ''
				,	isSelected: option_item.isDefault == true ? true : false
				,	name: option_item.items
				,	className: option_item.items
                };
                
				processed_option_items.push(processed_option_item);
			});

			// @class Facets.ItemListShowSelector.View.Context
			return {
				// @property {Array} options
				options: processed_option_items
			};
		}
	});
});