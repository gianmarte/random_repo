/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Kodella.EasyAsk.Facets.Browse.CategoryHeading.View.Ext'
,	[
		'Categories.Utils'
	,	'Facets.Browse.CategoryHeading.View'

	,	'Backbone'
    ,	'kodella_facets_browse_category_heading.tpl'

	]
,	function (
		CategoriesUtils
	,	FacetsBrowseCategoryHeadingView

	,	Backbone
	,	facetsBrowseCategoryHeadingTpl
	)
{
    'use strict';

    return FacetsBrowseCategoryHeadingView.extend({

		template: facetsBrowseCategoryHeadingTpl
	
	,	initialize: function(options)
		{
			console.log("options", options);
			this.ea_model = this.options.ea_model;
			this.translator = this.options.translator;
		}

    ,	getContext: function ()
		{
			//console.log("this.model", this.model);
			var hasItems = this.ea_model.get('items') && this.ea_model.get('items').length > 0;
			var additionalFields = CategoriesUtils.getAdditionalFields(this.model.attributes, 'categories.category.fields');
			console.log("this.model", this.model);
			console.log("additionalFields",additionalFields);

			return {
				// @property {String} name
                name: this.model.get('name')
				// @property {String} banner
            ,	banner: this.model.get('pagebannerurl')
				// @property {String} description
            ,	description: this.model.get('description')
				// @property {String} pageheading
			,	pageheading: this.model.get('pageheading') || this.model.get('name')
				// @property {Boolean} hasBanner
			,	hasBanner: !!this.model.get('pagebannerurl')
				// @property {Object} additionalFields
			,	additionalFields: additionalFields
			,	totalProducts: this.ea_model.get('itemDescription').totalItems
			,	pageCount: this.ea_model.get('itemDescription').pageCount
			,	showItems: hasItems
			,	isOneProduct: this.ea_model.get('itemDescription').totalItems == 1
			,	keyword: this.translator.getOptionValue('keywords')
			,	isSearch: !!(this.translator.getOptionValue('keywords'))
			};
        }
    });
});
